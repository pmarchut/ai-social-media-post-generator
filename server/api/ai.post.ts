import OpenAI from "openai";
import * as agents from "~~/agents"

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const client = new OpenAI({
    apiKey: config.HF_API_KEY,
    baseURL: "https://router.huggingface.co/v1",
  });

  if (!Object.keys(agents).includes(`${body.agent}Agent`)) {
    throw new Error(`${body.agent} Agent does not exist`)
  }

  const response = await client.chat.completions.create({
    model: "moonshotai/Kimi-K2-Instruct-0905",
    messages: [],
    temperature: body.temperature || 1,
    // @ts-expect-error checking above if agent exists
    ...agents[`${body.agent}Agent`](body)
  });

  return response;
});
