import { google } from "@ai-sdk/google";

import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import { z } from "zod";
import rag from "@/ai/rag";
import { supportAgent } from "@/ai/support";
import { SEARCH_INTERPRETER_PROMPT } from "@/lib/prompts";
import { internal } from "../../_generated/api";

export const search = createTool({
  description:
    "Search the knowledge base for relevant information to help answer user questions.",
  args: z.object({
    query: z.string().describe("The search query to find relevant information"),
  }),
  handler: async (ctx, { query }) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.conversation.getByThreadId,
      {
        threadId: ctx.threadId,
      }
    );

    if (!conversation) {
      return "Conversation not found.";
    }

    const organizationId = conversation.organizationId;

    const searchResult = await rag.search(ctx, {
      namespace: organizationId,
      limit: 5,
      query,
    });

    const contextText = `Found results in ${searchResult.entries
      .map((entry) => entry.title ?? "*No title found*")
      .filter((entry) => entry !== null)
      .join(", ")}. Here is the context: \n\n${searchResult.text}`;

    const response = await generateText({
      model: google.chat("gemini-2.0-flash"),
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${query}" \n\nSearch results: ${contextText}`,
        },
      ],
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: response.text,
      },
    });

    return response.text;
  },
});
