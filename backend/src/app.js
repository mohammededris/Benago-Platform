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

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

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
      // Allow non-browser requests or missing origin headers
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.some(
          (allowed) => allowed === cleanOrigin || allowed === "*",
        )
      ) {
        return callback(null, cleanOrigin);
      }
      return callback(
        new Error(`CORS origin violation: ${origin} not in allowed origins`),
      );
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    authorizedParties: allowedOrigins,
  }),
);

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
