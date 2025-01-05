import { Sentry } from "./instrument.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoute from "./src/routes/authRoute.js";
import userRoute from "./src/routes/userRoute.js";
import blogRoute from "./src/routes/blogRoute.js";
import bookingRoute from "./src/routes/bookingRoute.js";
import commentRouter from "./src/routes/commentRoute.js";
import eventRouter from "./src/routes/eventRoute.js";
import likeRouter from "./src/routes/likeRoute.js";
import serviceRouter from "./src/routes/serviceRoute.js";
import planRouter from "./src/routes/planRoute.js";
import rbacRouter from "./src/routes/rbacRoute.js";
import uploadRouter from "./src/routes/upload.js";
import galleryRouter from "./src/routes/imageRoute.js";
import { errorMiddleware } from "./src/utils/globalErrorHandler.js";
import reserverRoute from "./src/routes/reserveSpotRoute.js";
import swaggerSpec from "./src/swaggerOption.js";
const app = express();
Sentry.setupExpressErrorHandler(app);
// enable trust proxy to get the client IP address.
app.set("trust proxy", 1);
app.use(helmet());
// rate limiter.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);
app.use(
  cors({
    origin: [
      "*",
      "https://afro-coworking-space.vercel.app",
      "https://afro-coworking-space.vercel.app/",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
// Mounting routes.
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/blog", blogRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/comments", commentRouter);
app.use("/api/like", likeRouter);
app.use("/api/service", serviceRouter);
app.use("/api/event", eventRouter);
app.use("/api/plan", planRouter);
app.use("/api/admin", rbacRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/reserveSpot", reserverRoute);
app.use(errorMiddleware);

export default app;
