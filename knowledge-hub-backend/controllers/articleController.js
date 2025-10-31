import Article from "../models/Article.js";
import { summarizeWithLLM } from "../utils/summarizeWithLLM.js";

export const createArticle = async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const summary = await summarizeWithLLM(title, content);
    const article = await Article.create({
      title,
      content,
      tags,
      summary,
      createdBy: req.user._id,
    });
    res.status(201).json(article);
  } catch (error) {
    console.error("❌ Error creating article:", error);
    res.status(500).json({ message: "Server error while creating article" });
  }
};

export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error("❌ Error fetching articles:", err);
    res.status(500).json({ message: "Server error while fetching articles" });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    console.error("❌ Error fetching article:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags = [] } = req.body;
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    if (article.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this article" });
    }
    article.title = title || article.title;
    article.content = content || article.content;
    article.tags = tags.length ? tags : article.tags;
    if (content) {
      article.summary = await summarizeWithLLM(title || article.title, content);
    }
    await article.save();
    res.json(article);
  } catch (err) {
    console.error("❌ Error updating article:", err);
    res.status(500).json({ message: "Server error while updating article" });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete articles" });
    }
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    await article.deleteOne();
    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting article:", err);
    res.status(500).json({ message: "Server error while deleting article" });
  }
};

export const summarizeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Summarize called for article ID:", id);
    if (!id) return res.status(400).json({ message: "Article ID required" });
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    console.log("Article found →", article.title);
    const provider = req.query.provider || process.env.LLM_PROVIDER || "gemini";
    console.log("Using provider:", provider);
    const summary = await summarizeWithLLM(article.title, article.content, provider);
    article.summary = summary;
    await article.save();
    console.log("Summarization successful!");
    res.json({ message: "Summarization successful", summary, article });
  } catch (err) {
    console.error("Summarization Controller Error:", err);
    res.status(500).json({ message: "Summarization failed", error: err.message });
  }
};
