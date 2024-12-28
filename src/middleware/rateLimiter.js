import rateLimit from "express-rate-limit";

const reservationRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // Limit each IP to 2 reservation attempts per windowMs
  message:
    "Too many reservation attempts from this IP, please try again after 24 hours.",
  keyGenerator: (req) => req.user._id.toString(), // Use user ID as the key
});

export { reservationRateLimiter };
