import rateLimit from "express-rate-limit";

export const summarizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: "Too many summarize requests, please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false
});
