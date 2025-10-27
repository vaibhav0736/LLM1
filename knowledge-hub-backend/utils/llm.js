import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
const OPENAI_MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS || 300);

let openaiClient = null;
if (OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
}

export const summarizeWithLLM = async (content, provider = process.env.LLM_PROVIDER || "openai") => {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Content is required and must be a non-empty string');
  }

  console.log('📝 Original content length:', content.length, 'characters');
  
  const prompt = `Create a concise summary of the following text. Follow these rules STRICTLY:
1. The summary MUST be 2-3 sentences maximum
2. Focus ONLY on the main ideas and key information
3. Do NOT include any direct quotes or verbatim text from the original
4. Use different wording than the original text
5. Keep it clear and to the point
6. The summary MUST be significantly shorter than the original

Original text:
${content}

Summary (2-3 sentences):`;

  if (provider === "openai") {
    if (!openaiClient) throw new Error("OpenAI key not configured (OPENAI_API_KEY)");

    try {
      const resp = await openaiClient.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise, high-quality summaries. You always rewrite the content in your own words and never copy text directly from the source."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,  // Limit the response length
        temperature: 0.3,  // Lower temperature for more focused output
        top_p: 0.9,
        frequency_penalty: 0.8,  // Discourage repetition
        presence_penalty: 0.8,   // Encourage new content
      });

      const text = resp?.choices?.[0]?.message?.content?.trim();
      console.log('📝 Generated summary:', text);
      
      if (!text) {
        throw new Error("No summary was generated");
      }
      
      // Verify the summary is actually a summary
      if (text.length >= content.length * 0.8) {
        throw new Error("Generated summary is too similar in length to the original content");
      }
      
      return text;
    } catch (error) {
      console.error('❌ Summarization error:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  if (provider === "mock") {
    const snippet = content.replace(/\s+/g, " ").slice(0, 300);
    const twoSentence = snippet.split(".").slice(0, 2).join(".") + (snippet.length > 300 ? "..." : "");
    const bullets = snippet.split(".").slice(0, 3).map(s => s.trim()).filter(Boolean).map(s => "- " + s).join("\n");
    return `${twoSentence}\n\nKey points:\n${bullets}`;
  }

  throw new Error(`Unknown provider: ${provider}`);
};
