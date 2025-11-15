import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const PROMPT =
  "You transform website content into clean markdown format." as const;

export async function extractTextFromHtml(arrayBuffer: ArrayBuffer) {
  const text = new TextDecoder().decode(arrayBuffer);

  const result = await generateText({
    model: google.chat("gemini-2.0-flash"),
    system: PROMPT,
    messages: [
      {
        role: "user",
        content: text,
      },
    ],
  });

  return result.text;
}
