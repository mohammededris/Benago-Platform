const serverless = require("serverless-http");

// ─── Lazy Express app loader ───────────────────────────────────────────────────
// Load the Express app on the first non-trivial request so initialization
// (Clerk JWKS prefetch, mongoose schema registration) only runs once per
// warm container and doesn't block fast-path routes.
let _handler;
function getHandler() {
  if (!_handler) {
    const app = require("../src/app");
    _handler = serverless(app);
  }
  return _handler;
}

module.exports = async (req, res) => {
  const url = (req.url || "").split("?")[0];

  // ── 1. Instant health check (no Express, no DB, no Clerk) ──────────────────
  if (url === "/api/health" || url === "/health") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        region: process.env.VERCEL_REGION || "unknown",
      }),
    );
    return;
  }

  // ── 2. DB connectivity diagnostic (no Clerk auth required) ─────────────────
  // Hit GET /api/debug to see if MongoDB Atlas is reachable from this region.
  if (url === "/api/debug" && req.method === "GET") {
    const connectDB = require("../src/lib/connectDB");
    const start = Date.now();
    try {
      await connectDB();
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          db: "connected",
          latencyMs: Date.now() - start,
          mongoUri: process.env.MONGODB_URI
            ? `${process.env.MONGODB_URI.slice(0, 20)}…` // show just the prefix
            : "NOT SET",
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 503;
      res.end(
        JSON.stringify({
          db: "unreachable",
          error: err.message,
          latencyMs: Date.now() - start,
          mongoUri: process.env.MONGODB_URI
            ? `${process.env.MONGODB_URI.slice(0, 20)}…`
            : "NOT SET",
          hint: "Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0 to the IP whitelist.",
          timestamp: new Date().toISOString(),
        }),
      );
    }
    return;
  }

  // ── 3. All other routes → Express 4 + serverless-http ─────────────────────
  return getHandler()(req, res);
};
