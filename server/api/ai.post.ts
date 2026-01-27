import OpenAI from "openai";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const storage = useStorage();

export default defineEventHandler(async (event) => {
  try {
    const { message } = await readBody(event);
    const config = useRuntimeConfig();
    const session = await useSession(event, { password: config.SESSION_PASSWORD });

    const storageKey = `session-${session.id}-messages`;

    const storedMessages = await storage.getItem<ChatMessage[]>(storageKey);

    const messages: ChatMessage[] = Array.isArray(storedMessages)
      ? storedMessages
      : [];

    messages.push({ role: "user", content: message });

    const client = new OpenAI({
      apiKey: config.HF_API_KEY,
      baseURL: "https://router.huggingface.co/v1",
    });

    const completion = await client.chat.completions.create({
      model: "moonshotai/Kimi-K2-Instruct-0905",
      messages: [
        { role: "system", content: "You are a helpful assistant for an AI-powered social media image generator. Your name is Botman." },
        ...messages
      ],
    });
    const response = completion.choices[0].message;

    messages.push({ role: "assistant", content: response.content ?? "There was a problem and I could not come up with a response." });

    await storage.setItem(storageKey, messages);

    return response;
  } catch (err) {
    console.error(err);

    throw createError({
      statusCode: 500,
      statusMessage: "Hugging Face API error",
    });
  }
});
