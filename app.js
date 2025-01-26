import { Sentry } from "./instrument.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";
import session from "express-session";
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
import categoryRouter from "./src/routes/categoryRoute.js";
import swaggerSpec from "./src/swaggerOption.js";
import configPassport from "./src/utils/passportConfig.js";
const app = express();
Sentry.setupExpressErrorHandler(app);
// enable trust proxy to get the client IP address.
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// Session middleware for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app;
// rate limiter.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, origin);
    },
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

app.use(passport.initialize());
app.use(passport.session());
configPassport(passport);
// Mounting routes.
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/categories", categoryRouter);
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
