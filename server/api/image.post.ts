import OpenAI from "openai";
import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const client = new OpenAI({
    apiKey: config.HF_API_KEY,
    baseURL: "https://router.huggingface.co/v1",
  });

  const { choices } = await client.chat.completions.create({
    model: "moonshotai/Kimi-K2-Instruct-0905",
    messages: [
      { role: "system", content: "You are prompt engineer creating @cf/lykon/dreamshaper-8-lcm prompts" },
      { role: "user", content: `Provide 2 realisitc physical objects based on this article: ${body.url}` },
    ],
    temperature: body.temperature || 1,
  });

  if (!choices[0]?.message?.content) {
    throw new Error('No message returned from AI');
  }

  const prompt = choices[0].message.content;

  const response = await $fetch<Blob>(
    `https://api.cloudflare.com/client/v4/accounts/${config.CF_ACCOUNT_ID}/ai/run/@cf/lykon/dreamshaper-8-lcm`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: {
        prompt,
      },
    }
  );

  // Blob → ArrayBuffer
  const buffer = await response.arrayBuffer();

  // ArrayBuffer → base64
  const base64 = Buffer.from(buffer).toString("base64");

  return `data:image/png;base64,${base64}`;
});
