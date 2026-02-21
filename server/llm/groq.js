import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


export async function generateWithHF(prompt) {
  const res = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [{ role: "user", content: prompt }],
  temperature: 0,
    top_p: 1,
  max_tokens: 1200,
});


  return res.choices[0].message.content;
}

export async function streamWithHF(prompt) {
  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    top_p: 1,
    max_tokens: 2000,
    stream: true,
  });

  return stream;
}

