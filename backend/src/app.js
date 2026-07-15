require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { clerkMiddleware } = require("@clerk/express");

const clerkWebhookHandler = require("./api/webhooks/clerk");
const { syncStudent } = require("./api/students");
const { getCourse, updateCourse } = require("./api/course");
const { syncInstructor, updateInstructor } = require("./api/instructors");

const app = express();
app.set("trust proxy", 1);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowAll = allowedOrigins.includes("*");

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowAll) return true;
  const clean = origin.replace(/\/+$/, "");
  if (allowedOrigins.includes(clean)) return true;
  if (clean.startsWith("http://localhost:") || /\.vercel\.app$/.test(clean)) {
    return true;
  }
  return false;
};

// ─── Webhook (raw body BEFORE json parser) ───────────────────────────────────
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhookHandler,
);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, origin || true);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

// ─── Rate limiters ───────────────────────────────────────────────────────────
const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// ─── Diagnostic: BEFORE Clerk ─────────────────────────────────────────────────
// Hit GET /api/ping to confirm Express + serverless-http work independently of Clerk.
// If /api/ping times out → the issue is in Express or serverless-http.
// If /api/ping is fast → the issue is in clerkMiddleware or Clerk API calls.
app.get("/api/ping", (req, res) => {
  res.json({
    pong: true,
    timestamp: new Date().toISOString(),
    clerkSecretKeySet: !!process.env.CLERK_SECRET_KEY,
    clerkPublishableKeySet: !!process.env.CLERK_PUBLISHABLE_KEY,
    mongoUriSet: !!process.env.MONGODB_URI,
  });
});

// ─── Clerk auth middleware ────────────────────────────────────────────────────
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  }),
);

// ─── Diagnostic: AFTER Clerk ──────────────────────────────────────────────────
// If /api/ping works but /api/auth-ping times out → clerkMiddleware is the problem.
app.get("/api/auth-ping", (req, res) => {
  const { getAuth } = require("@clerk/express");
  const auth = getAuth(req);
  res.json({
    pong: true,
    authenticated: !!auth.userId,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.post("/api/students/sync", syncLimiter, syncStudent);
app.post("/api/instructors/sync", syncLimiter, syncInstructor);
app.put("/api/instructors/:id", apiLimiter, updateInstructor);
app.get("/api/courses/:courseId", apiLimiter, getCourse);
app.put("/api/courses/:courseId", apiLimiter, updateCourse);

// ─── 404 / Error handlers ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[express error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
