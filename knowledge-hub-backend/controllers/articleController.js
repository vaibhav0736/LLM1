import Article from "../models/Article.js";
import { summarizeWithLLM } from "../utils/llm.js";


export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const summary = await summarizeWithLLM(content);
    const article = await Article.create({
      title,
      content,
      summary,
      author: req.user.id,
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArticles = async (req, res) => {
  const articles = await Article.find().populate("author", "name email");
  res.json(articles);
};

export const deleteArticle = async (req, res) => {
  const { id } = req.params;
  await Article.findByIdAndDelete(id);
  res.json({ message: "Article deleted" });
};

export const summarizeArticle = async (req, res) => {
  console.log("🧠 summarizeArticle called for ID:", req.params.id);
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      console.log("❌ Article not found");
      return res.status(404).json({ message: "Article not found" });
    }

    console.log("📄 Article found, calling summarizeWithLLM...");
    const provider = req.query.provider || process.env.LLM_PROVIDER || "openai";
    const llmResult = await summarizeWithLLM(article.content, provider);

    article.summary = llmResult;
    await article.save();

    console.log("✅ Summarization successful");
    return res.json({ summary: llmResult, article });
  } catch (err) {
    console.error("🔥 Summarize error:", err);
    return res.status(500).json({ message: "Summarize failed", error: String(err) });
  }
};
