import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import logger from "./src/config/logger.js";
import { initializeSocket } from "./socket.js";
import { connectRedis } from "./src/config/redis.js";

dotenv.config();

// handle uncaught exception
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", { error: err });
  process.exit(1);
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("MongoDB connected successfully!");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  await connectRedis();

  const port = process.env.PORT || 3000;

  const server = app.listen(port, "0.0.0.0", () => {
    logger.info(`Server is running on port ${port}`);
  });

  // Initialize Socket.IO
  initializeSocket(server);

  server.on("error", (error) => {
    logger.error("Server error:", error);
  });

  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled rejection! Shutting down...", { error: err });
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
