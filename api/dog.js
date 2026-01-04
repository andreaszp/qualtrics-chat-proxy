import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const {
      history = [],
      system,
      model = "gpt-4o-mini",
      temperature = 0.7,
      max_tokens = 300
    } = req.body;

    const messages = [];

    if (system) {
      messages.push({ role: "system", content: system });
    }

    if (Array.isArray(history)) {
      messages.push(...history);
    }

    const response = await client.responses.create({
      model,
      input: messages,
      temperature,
      max_output_tokens: max_tokens
    });

    res.status(200).json({
      text: response.output_text
    });

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    res.status(500).json({
      error: "OpenAI failed",
      details: err.message
    });
  }
}
