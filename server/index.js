require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { clerkMiddleware } = require("@clerk/express");
const connectDB = require("./lib/connectDB");

const clerkWebhookHandler = require("./api/webhooks/clerk");
const { syncStudent } = require("./api/students");
const { getCourse, updateCourse } = require("./api/course");
const { syncInstructor, updateInstructor } = require("./api/instructors");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── 1. Clerk Webhook ────────────────────────────────────────────────────────
// Must be registered BEFORE express.json() so svix receives the raw body.
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhookHandler,
);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// ─── 2. Global Middleware ────────────────────────────────────────────────────
app.use(helmet());  // Security headers (X-Content-Type-Options, HSTS, etc.)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));  // Cap request body size
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    authorizedParties: allowedOrigins,
  }),
);

// ─── 2b. Rate Limiters ──────────────────────────────────────────────────────
// Strict limiter for sync endpoints (hit Clerk API on every call)
const syncLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,               // 5 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// General limiter for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,              // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// POST /api/students/sync — lazy fallback role sync
// Auth is checked inside the handler via getAuth(req)
app.post("/api/students/sync", syncLimiter, syncStudent);

// POST /api/instructors/sync — lazy fallback for instructors
// Auth is checked inside the handler via getAuth(req)
app.post("/api/instructors/sync", syncLimiter, syncInstructor);

// PUT /api/instructors/:id — admin updates instructor courseIds (pushes to Clerk)
// Auth is checked inside the handler via getAuth(req)
app.put("/api/instructors/:id", apiLimiter, updateInstructor);

// GET /api/courses/:courseId — fetch course details
// Auth is checked inside the handler via getAuth(req)
app.get("/api/courses/:courseId", apiLimiter, getCourse);

// PUT /api/courses/:courseId — update course details & curriculum
// Auth is checked inside the handler via getAuth(req)
app.put("/api/courses/:courseId", apiLimiter, updateCourse);

// ─── 3b. Health ───────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const state = mongoose.connection.readyState;
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  let dbError = null;
  if (state !== 1) {
    try {
      await connectDB();
    } catch (err) {
      dbError = err.message;
    }
  }

  const finalState = mongoose.connection.readyState;
  const finalStatus =
    finalState === 1 ? "ok" : finalState === 2 ? "connecting" : "error";

  res.status(finalState === 1 ? 200 : 503).json({
    status: finalStatus,
    db: stateMap[finalState] || "unknown",
    timestamp: new Date().toISOString(),
    ...(dbError ? { error: dbError } : {}),
  });
});

// ─── 4. 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── 5. Global Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ─── 6. Start ────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
