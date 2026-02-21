import OpenAI from "openai";

// register all training files here
export * from "./customerSupportAgent";
export * from "./twitterAgent";
export * from "./facebookAgent";

// and register types here
export type Agent = "facebook" | "twitter" | "customerSupport";

// util function for creating trainings with proper typing
export default function createAgent(
  training: (
    context: Record<string, any>
  ) => Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming>
) {
  return training;
}
