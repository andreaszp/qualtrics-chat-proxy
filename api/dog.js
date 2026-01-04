import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ CORS : TOUTES les requêtes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ OPTIONS preflight (Qualtrics l'envoie avant POST)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ton code original
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, system, history, model, temperature, max_tokens } = req.body;

    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    if (Array.isArray(history)) messages.push(...history);
    else if (prompt) messages.push({ role: "user", content: prompt });

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: messages,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens ?? 300,
    });

    const text = completion.choices[0].message.content;
    res.status(200).json({ text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI request failed", details: error.message });
  }
}
