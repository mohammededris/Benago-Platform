const mongoose = require("mongoose");

const CONNECTION_TIMEOUT_MS = 10000;

let cached = global.__benagoMongoCache;
if (!cached) {
  cached = global.__benagoMongoCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
        connectTimeoutMS: CONNECTION_TIMEOUT_MS,
        socketTimeoutMS: CONNECTION_TIMEOUT_MS,
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
