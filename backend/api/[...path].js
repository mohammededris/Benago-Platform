const serverless = require("serverless-http");
const app = require("../src/app");

// ─── IMPORTANT ────────────────────────────────────────────────────────────────
// Do NOT call connectDB() here at module init time.
// A fire-and-forget connectDB() on the top level held the event loop open
// indefinitely when Atlas was unreachable, causing every request—including
// the lightweight /api/health check—to hit the 60-second function timeout.
//
// DB connections are now established lazily inside each route handler that
// actually needs one (see src/lib/connectDB.js for the cached-connection logic).
// ──────────────────────────────────────────────────────────────────────────────

const handler = serverless(app);

module.exports = async (req, res) => {
  return handler(req, res);
};
