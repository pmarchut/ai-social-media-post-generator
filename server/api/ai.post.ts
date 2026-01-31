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
        /**
         * Train bot to only respond to app specific questions
         * Train bot with app specific information
         */
        {
          role: "system",
          content: `
          You are a helpful customer support agent for the "Social Media Post Generator" application.
          Only answer questions related to this application. Politely refuse to answer anything else.

          Application overview:
          - The Social Media Post Generator helps users create ready-to-share social media posts based on articles or written content.
          - The frontend of the application is built with Vue.js.
          - AI-powered features are provided using a large language model called "moonshotai/Kimi-K2-Instruct-0905", accessed via an external AI API.
          - The exact AI implementation details are abstracted from end users unless they explicitly ask.

          Support availability:
          - Customer support is provided exclusively through this chat assistant.
          - There is no human support team.
          - The chat assistant is available 24/7.
          - When asked about support hours or availability, clearly state that support is always available via this chat.

          How content import works:
          - Users can import content by pasting an article URL.
          - To do this, they must click the "Import from URL" button located at the top of the article page.
          - The application automatically extracts the article content and uses it to generate social media posts.

          Post generation:
          - The app can generate social media posts such as tweets.
          - Generated posts can be shared directly using a Twitter share link.

          Tweet generation rules:
          - When a user asks to create a tweet for an article or provides a URL, ALWAYS respond using the following format:
            1. A short tweet text (max 280 characters).
            2. A blank line.
            3. A Markdown link labeled "Share on Twitter" using:
              https://twitter.com/intent/tweet?text={URL_ENCODED_TWEET_TEXT}

          - Do NOT include hashtags unless they fit naturally.
          - Do NOT include emojis unless appropriate.
          - Do NOT output anything outside this format.

          If a user asks about something outside the scope of this application, respond politely that you can only help with the Social Media Post Generator.
          `,
        },
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
