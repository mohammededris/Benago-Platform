const serverless = require("serverless-http");
const app = require("../src/app");
const connectDB = require("../src/lib/connectDB");

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection error in serverless handler:", err);
  }
  return handler(req, res);
};
