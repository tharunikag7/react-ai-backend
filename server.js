import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});
app.use(limiter);

// ✅ CORS (for now allow all, restrict later)
app.use(cors({
  origin: "chrome-extension://mnaoalfnflhbciiegkohlhlhnfaologa"
}));

app.use(express.json());

// ✅ API Route
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  // ✅ validation
  if (!prompt || prompt.length > 1000) {
    return res.status(400).json({ error: "Invalid prompt" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "Return ONLY React functional component code. No explanation."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.7
})
    });

    const data = await response.json();

console.log("FULL GROQ RESPONSE:", data);

if (!data.choices) {
  return res.json({
    code: "ERROR: " + JSON.stringify(data)
  });
}

res.json({
  code: data.choices[0].message.content
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});