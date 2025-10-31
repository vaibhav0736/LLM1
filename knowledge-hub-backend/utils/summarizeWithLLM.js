import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const summarizeWithLLM = async (title, content, provider = "gemini") => {
  try {
    if (provider === "gemini") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Summarize the following article into 2 crisp lines:\n\nTitle: ${title}\n\nContent:\n${content}`;
      const result = await model.generateContent(prompt);

      const summary = result.response.text();
      return summary.trim();
    }

    throw new Error(`Unsupported provider: ${provider}`);
  } catch (err) {
    console.error("Gemini Summarization Error:", err);
    throw new Error("Failed to summarize article");
  }
};
