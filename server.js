const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Secure API Key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Gemini 2.5 Pro API is Running!");
});

// 🎯 Main prompt route
app.post("/gemini", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "❌ Prompt missing" });

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response.";
    res.json({ result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Server run
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is live on port ${PORT}`);
});
