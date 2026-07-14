const serverless = require("serverless-http");
const app = require("../src/app");
const connectDB = require("../src/lib/connectDB");

const handler = serverless(app);

// Pre-warm the DB connection on cold start so the first real request
// doesn't pay the full MongoDB handshake cost.
connectDB().catch((err) => {
  console.error("[cold-start] DB pre-warm failed:", err.message);
});

module.exports = async (req, res) => {
  return handler(req, res);
};
