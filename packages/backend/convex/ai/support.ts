import { google } from "@ai-sdk/google";
import { Agent } from "@convex-dev/agent";
import { SUPPORT_AGENT_PROMPT } from "@/lib/prompts";
import { components } from "../_generated/api";

const googleModel = google("gemini-2.0-flash");

export const supportAgent = new Agent(components.agent, {
  name: "Support Agent",
  languageModel: googleModel,
  instructions: SUPPORT_AGENT_PROMPT,
});
