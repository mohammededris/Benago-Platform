const serverless = require("serverless-http");
const app = require("../src/app");
const connectDB = require("../src/lib/connectDB");

connectDB();

module.exports = serverless(app);
