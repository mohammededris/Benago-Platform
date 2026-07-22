require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { ipKeyGenerator, rateLimit } = require("express-rate-limit");
const { clerkMiddleware, getAuth } = require("@clerk/express");
const connectDB = require("./lib/connectDB");
const { createRateLimitStore } = require("./lib/rateLimit");

const clerkWebhookHandler = require("./api/webhooks/clerk");
const { syncStudent } = require("./api/students");
const { getCourse, getCourseStudents, updateCourse } = require("./api/course");
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
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// If CLIENT_ORIGIN contains "*", allow every origin.
const allowAll = allowedOrigins.includes("*");

const isAllowedOrigin = (origin) => {
  if (!origin) return true;       // same-origin / server-to-server
  if (allowAll) return true;      // CLIENT_ORIGIN=*
  const clean = origin.replace(/\/+$/, "");
  if (allowedOrigins.includes(clean)) return true;
  // Always permit local dev and any *.vercel.app preview URL
  if (clean.startsWith("http://localhost:") || clean.endsWith(".vercel.app")) {
    return true;
  }
  return false;
};

// ─── 2. Global Middleware ────────────────────────────────────────────────────
app.use(helmet());  // Security headers (X-Content-Type-Options, HSTS, etc.)
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, origin || true);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));  // Cap request body size

// ─── 2b. Rate Limiters ──────────────────────────────────────────────────────
const rateLimitKeyGenerator = (req) => {
  try {
    const { userId } = getAuth(req);
    if (userId) return `user:${userId}`;
  } catch (_) {
    // Fall back to the proxy-aware IP key for unauthenticated requests.
  }
  return `ip:${ipKeyGenerator(req.ip)}`;
};

// Strict limiter for sync endpoints (hit Clerk API on every call)
const syncLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,               // 5 requests per minute per IP
  keyGenerator: rateLimitKeyGenerator,
  store: createRateLimitStore(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// General limiter for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,              // 60 requests per minute per IP
  keyGenerator: rateLimitKeyGenerator,
  store: createRateLimitStore(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// ─── 3b. Health ─────────────────────────────────────────────────────────────
// Placed BEFORE clerkMiddleware so it never blocks on Clerk's JWKS fetch.
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
  } catch (_) {
    // ignore — just report the state below
  }
  const state = mongoose.connection.readyState;
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.status(state === 1 ? 200 : 503).json({
    status: state === 1 ? "ok" : "error",
    db: stateMap[state] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// clerkMiddleware is placed AFTER the health route intentionally.
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  }),
);

// ─── 3. API Routes ───────────────────────────────────────────────────────────
app.post("/api/students/sync", syncLimiter, syncStudent);
app.post("/api/instructors/sync", syncLimiter, syncInstructor);
app.put("/api/instructors/:id", apiLimiter, updateInstructor);
app.get("/api/courses/:courseId", apiLimiter, getCourse);
app.get("/api/courses/:courseId/students", apiLimiter, getCourseStudents);
app.put("/api/courses/:courseId", apiLimiter, updateCourse);

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
