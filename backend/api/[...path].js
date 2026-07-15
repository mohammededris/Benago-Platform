// ─── Lazy Express app loader ───────────────────────────────────────────────────
// Load the Express app on the first non-trivial request so initialization
// (Clerk JWKS prefetch, mongoose schema registration) only runs once per
// warm container and doesn't block fast-path routes.
let _app;
function getApp() {
  if (!_app) {
    _app = require("../src/app");
  }
  return _app;
}

module.exports = async (req, res) => {
  // Route all requests to Express 4
  return getApp()(req, res);
};
