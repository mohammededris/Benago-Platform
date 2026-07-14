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

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const clean = origin.replace(/\/+$/, "");

  if (allowedOrigins.length > 0) {
    if (allowedOrigins.includes(clean) || allowedOrigins.includes("*")) {
      return true;
    }
  }

  // Default allowed origins for local dev and Vercel deployments
  if (clean.startsWith("http://localhost:") || clean.endsWith(".vercel.app")) {
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
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
  } catch (_) {
    // ignore connection errors — just report the state below
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
