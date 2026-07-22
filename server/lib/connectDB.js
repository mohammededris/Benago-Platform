const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const configuredPoolSize = Number.parseInt(process.env.MONGO_MAX_POOL_SIZE, 10);
    const maxPoolSize = Number.isFinite(configuredPoolSize) && configuredPoolSize > 0
      ? Math.min(configuredPoolSize, 100)
      : 10;

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 9000,
      connectTimeoutMS: 9000,
      socketTimeoutMS: 30000,
      maxPoolSize,
      minPoolSize: 0,
      bufferCommands: false,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
