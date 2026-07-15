const mongoose = require("mongoose");

// Keep these well under Vercel's 60-second function timeout so a failed
// Atlas connection surfaces as a clean 500 error instead of a 504 timeout.
const CONNECTION_TIMEOUT_MS = 8000;

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
        // Serverless: keep the pool small; each function instance only needs
        // one or two concurrent connections.
        maxPoolSize: 5,
        minPoolSize: 0,
        // Do NOT buffer mongoose operations while the connection is being
        // established — fail immediately so callers get a clean error.
        bufferCommands: false,
      })
      .catch((err) => {
        // Reset so the next request can retry the connection.
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
