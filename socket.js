import { Server } from "socket.io";
import logger from "./src/config/logger.js";
let ioInstance;

const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
  });

  // Handle connection events
  ioInstance.on("connection", (socket) => {
    logger.info("New client connected", { socketId: socket.id });
    handleJoinBlog(socket);
    handleDisconnect(socket);
  });

  return ioInstance;
};

const getSocketInstance = () => {
  if (!ioInstance) {
    throw new Error("Socket.io instance not available");
  }
  return ioInstance;
};

// event handler.
const handleJoinBlog = (socket) => {
  socket.on("joinBlog", (blogId) => {
    socket.join(`blog-${blogId}`);
    logger.info(`Socket ${socket.id} joined room: blog-${blogId}`);
  });

  socket.on("leaveBlog", (blogId) => {
    socket.leave(`blog-${blogId}`);
    logger.info(`Socket ${socket.id} left room: blog-${blogId}`);
  });
};

const handleDisconnect = (socket) => {
  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
};

export { initializeSocket, getSocketInstance };
