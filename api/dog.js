import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  // =========================
  // CORS — TOUJOURS EN PREMIER
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      prompt,
      system,
      history,
      model = "gpt-4o-mini",
      temperature = 0.7,
      max_tokens = 300
    } = req.body || {};

    const messages = [];

    if (system) {
      messages.push({ role: "system", content: system });
    }

    if (Array.isArray(history)) {
      messages.push(...history);
    } else if (prompt) {
      messages.push({ role: "user", content: prompt });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens
    });

    res.status(200).json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
}
