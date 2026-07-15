const mongoose = require("mongoose");

// How long to wait for the initial Atlas TCP handshake + server selection.
// This MUST be enforced via Promise.race (not just driver options) because when
// a firewall silently drops the TCP SYN packet, the OS retransmit schedule can
// keep the socket "alive" far longer than the driver-level timeout.
const HARD_TIMEOUT_MS = 9000;

let cached = global.__benagoMongoCache;
if (!cached) {
  cached = global.__benagoMongoCache = { conn: null, promise: null };
}

async function connectDB() {
  // Re-use an existing live connection.
  if (cached.conn) {
    // Verify the connection is still open before returning it.
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    // Connection dropped — reset and reconnect.
    cached.conn = null;
    cached.promise = null;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    const connectPromise = mongoose.connect(uri, {
      // Driver-level timeouts (belt)
      serverSelectionTimeoutMS: HARD_TIMEOUT_MS,
      connectTimeoutMS: HARD_TIMEOUT_MS,
      socketTimeoutMS: HARD_TIMEOUT_MS,
      // Serverless-friendly pool
      maxPoolSize: 5,
      minPoolSize: 0,
      // Fail immediately rather than queuing ops while connecting
      bufferCommands: false,
    });

    // Suspenders: a raw setTimeout that fires regardless of TCP state.
    // If a firewall silently drops the SYN packet, the driver timeout may not
    // fire — but this Promise.race always will.
    const timeoutPromise = new Promise((_, reject) => {
      const t = setTimeout(() => {
        reject(
          new Error(
            `MongoDB connection timed out after ${HARD_TIMEOUT_MS}ms. ` +
              "Check Atlas IP Access List (add 0.0.0.0/0) and Vercel env vars.",
          ),
        );
      }, HARD_TIMEOUT_MS);
      // Allow Node.js to exit if this is the only remaining handle
      if (t.unref) t.unref();
    });

    cached.promise = Promise.race([connectPromise, timeoutPromise]).catch(
      (err) => {
        // Reset so the next request can retry
        cached.promise = null;
        throw err;
      },
    );
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
