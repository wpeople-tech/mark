"use server";

import OpenAI from "openai";
import { MARK_SYSTEM_PROMPT, OPPORTUNITIES_SYSTEM_PROMPT } from "@/lib/prompts";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status === 429) {
        const retryAfter = parseInt(err.headers?.["retry-after"] ?? "5");
        await new Promise((r) =>
          setTimeout(r, retryAfter * 1000 * (attempt + 1)),
        );
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function streamMarkFile(
  context: string,
  tags: string[],
  skills: string[],
) {
  return callWithRetry(() =>
    client.chat.completions.create({
      model: "poolside/laguna-m.1:free",
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: MARK_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Stack detected: ${tags.join(", ")}\nSelected skills: ${skills.join(", ")}\n\nManifest content:\n${context}`,
        },
      ],
      stream: true,
    }),
  );
}

export async function generateOpportunities(
  markFile: string,
  repoName: string,
  stack: string[],
): Promise<any[]> {
  try {
    console.log("generating opportunities...");
    const response = await callWithRetry(() =>
      client.chat.completions.create({
        model: "poolside/laguna-m.1:free",
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: OPPORTUNITIES_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Repo: ${repoName}\nStack: ${stack.join(", ")}\n\nMARK File:\n${markFile.slice(0, 3000)}`,
          },
        ],
      }),
    );
    console.log("opportunities generated...", response.choices[0]?.message?.content);

    const raw = response.choices[0]?.message?.content ?? "[]";
    return JSON.parse(raw.trim());
  } catch (err) {
    console.error("generateOpportunities:::ERROR:", err);
    return [];
  }
}
