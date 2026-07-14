const mongoose = require("mongoose");

const CONNECTION_TIMEOUT_MS = 5000;

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
    const connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
      connectTimeoutMS: CONNECTION_TIMEOUT_MS,
      socketTimeoutMS: CONNECTION_TIMEOUT_MS,
    });

    cached.promise = Promise.race([
      connectionPromise,
      new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                `MongoDB connection timed out after ${CONNECTION_TIMEOUT_MS}ms`,
              ),
            ),
          CONNECTION_TIMEOUT_MS,
        );
      }),
    ]).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
