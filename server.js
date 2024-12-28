import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app.js";
import logger from "./src/config/logger.js";
import { initializeSocket } from "./socket.js";
import { connectRedis } from "./src/config/redis.js";

// handle uncaught exception.
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", { error: err });
  process.exit(1);
});

// mongoose connect.
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected!");
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Initialize Socket.IO
initializeSocket(server);

connectRedis();

process.on("unhandledRejection", (err) => {
  logger.error("unhandled rejection! server shut down...", { error: err });
  process.exit(1);
});
