const { MemoryStore } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");

function createRateLimitStore() {
  const memoryStore = new MemoryStore();
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("[rate-limit] REDIS_URL is not set; using per-instance memory storage");
    return memoryStore;
  }

  const redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 250, 5000),
    },
  });
  let redisReady = false;
  let redisWarningLogged = false;

  redisClient.on("ready", () => {
    redisReady = true;
    console.log("[rate-limit] Redis store connected");
  });
  redisClient.on("end", () => {
    redisReady = false;
  });
  redisClient.on("error", (error) => {
    redisReady = false;
    if (!redisWarningLogged) {
      redisWarningLogged = true;
      console.error("[rate-limit] Redis unavailable; using memory fallback:", error.message);
    }
  });

  redisClient.connect().catch((error) => {
    redisReady = false;
    if (!redisWarningLogged) {
      redisWarningLogged = true;
      console.error("[rate-limit] Redis connection failed; using memory fallback:", error.message);
    }
  });

  const redisStore = new RedisStore({
    sendCommand: (...command) => redisClient.sendCommand(command),
    prefix: "benago:rate-limit:",
  });

  return {
    init(options) {
      memoryStore.init(options);
      redisStore.init(options);
    },
    async increment(key) {
      if (redisReady) {
        try {
          return await redisStore.increment(key);
        } catch (error) {
          redisReady = false;
          console.error("[rate-limit] Redis increment failed; using memory fallback:", error.message);
        }
      }
      return memoryStore.increment(key);
    },
    async decrement(key) {
      if (redisReady) {
        try {
          return await redisStore.decrement(key);
        } catch (error) {
          redisReady = false;
          console.error("[rate-limit] Redis decrement failed; using memory fallback:", error.message);
        }
      }
      return memoryStore.decrement(key);
    },
    async resetKey(key) {
      if (redisReady) {
        try {
          return await redisStore.resetKey(key);
        } catch (error) {
          redisReady = false;
          console.error("[rate-limit] Redis reset failed; using memory fallback:", error.message);
        }
      }
      return memoryStore.resetKey(key);
    },
    async get(key) {
      if (redisReady) {
        try {
          return await redisStore.get(key);
        } catch (error) {
          redisReady = false;
          console.error("[rate-limit] Redis read failed; using memory fallback:", error.message);
        }
      }
      return memoryStore.get(key);
    },
    async resetAll() {
      if (redisReady && redisStore.resetAll) {
        await redisStore.resetAll();
      }
      return memoryStore.resetAll();
    },
  };
}

module.exports = { createRateLimitStore };
