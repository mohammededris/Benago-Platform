const serverless = require("serverless-http");

// ─── Lazy Express app loader ──────────────────────────────────────────────────
// We load the Express app on the first non-health request so that module-init
// work (Clerk client setup, mongoose schema registration, etc.) only runs once
// per warm container. Health check is handled natively below.
let _handler;
function getHandler() {
  if (!_handler) {
    const app = require("../src/app");
    _handler = serverless(app);
  }
  return _handler;
}

module.exports = async (req, res) => {
  // ── Fast-path health check ─────────────────────────────────────────────────
  // Respond BEFORE loading Express/Mongoose/Clerk so the health endpoint is
  // guaranteed to be instant regardless of DB or Clerk state.
  const url = (req.url || "").split("?")[0];
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

  // ── All other routes go through Express (Express 4 + serverless-http) ──────
  return getHandler()(req, res);
};
