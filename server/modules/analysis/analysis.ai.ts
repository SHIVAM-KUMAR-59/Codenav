import groq from "../../common/config/groq.config";
import { QueryResponse, QueryType } from "./analysis.types";
import { logger } from "../../common/config/logger.config";

const SYSTEM_PROMPT = `You are a codebase expert. You are given a dependency graph extracted from a real repository.
Your job is to explain how the codebase works based ONLY on the provided file structure and dependencies.
Always reference specific file paths from the context. Never invent files or functions that aren't listed.
Be concise, structured, and developer-friendly.
Always respond with valid JSON only — no markdown, no backticks, no preamble.`;

export async function queryWithAI(
  context: string,
  question: string,
  queryType: QueryType
): Promise<QueryResponse> {
  const userPrompt = `${context}

Based on the files and dependencies above, answer this question: "${question}"

Respond with this exact JSON structure:
{
  "explanation": "A clear, structured explanation referencing specific file paths",
  "files": [
    { "path": "exact/file/path.ts", "role": "What this file does in relation to the question" }
  ],
  "readingOrder": ["file1.ts", "file2.ts", "file3.ts"]
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(content) as QueryResponse;
    return { ...parsed, queryType };
  } catch {
    logger.error(`Failed to parse AI response: ${content}`);
    return {
      explanation: content,
      files: [],
      readingOrder: [],
      queryType,
    };
  }
}
