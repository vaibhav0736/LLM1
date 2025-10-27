import express from "express";
import {
  createArticle,
  getArticles,
  deleteArticle,
  summarizeArticle,
  getArticleById,
} from "../controllers/articleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { summarizeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
router.use(protect);

router.post("/", protect, createArticle);
router.get("/", protect, getArticles);
router.get("/:id",getArticleById);
router.delete("/:id", protect, adminOnly, deleteArticle);
console.log(" articleRoutes loaded successfully");

router.post("/:id/summarize", (req, res, next) => {
  console.log(" Summarize route called, id:", req.params.id);
  next();
}, protect, summarizeLimiter, summarizeArticle);
export default router;
