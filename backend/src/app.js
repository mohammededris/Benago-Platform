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
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// If CLIENT_ORIGIN contains "*", allow every origin.
const allowAll = allowedOrigins.includes("*");

const isAllowedOrigin = (origin) => {
  if (!origin) return true;       // same-origin / server-to-server
  if (allowAll) return true;      // CLIENT_ORIGIN=*
  const clean = origin.replace(/\/+$/, "");

  if (allowedOrigins.includes(clean)) return true;

  // Always allow local dev and any *.vercel.app preview URL (no DNS lookup)
  if (clean.startsWith("http://localhost:") || /\.vercel\.app$/.test(clean)) {
    return true;
  }

  return false;
};

// Clerk webhook must receive the raw body before JSON parsing happens.
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhookHandler,
);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, origin || true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

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

// Health check is placed BEFORE clerkMiddleware so it never blocks
// on Clerk's JWKS network call during cold starts.
// Does NOT call connectDB — just reports whatever mongoose state is cached.
app.get("/api/health", (req, res) => {
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

app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  }),
);

app.post("/api/students/sync", syncLimiter, syncStudent);
app.post("/api/instructors/sync", syncLimiter, syncInstructor);
app.put("/api/instructors/:id", apiLimiter, updateInstructor);
app.get("/api/courses/:courseId", apiLimiter, getCourse);
app.put("/api/courses/:courseId", apiLimiter, updateCourse);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
