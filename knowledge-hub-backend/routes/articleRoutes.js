import express from "express";
import {
  createArticle,
  getArticles,
  deleteArticle,
  summarizeArticle,
  getArticleById,
  updateArticle, 
} from "../controllers/articleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { summarizeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect);
router.post("/", createArticle);
router.get("/", getArticles);
router.get("/:id", getArticleById);
router.put("/:id", updateArticle);
router.delete("/:id", adminOnly, deleteArticle);
router.post("/:id/summarize", summarizeLimiter, summarizeArticle);


export default router;
