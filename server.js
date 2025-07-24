const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

// ⛳ Base check
app.get("/", (req, res) => {
  res.send("✅ Gemini Pro Vision API is running!");
});

// 🚀 Main AI handler
app.post("/gemini", async (req, res) => {
  const { prompt, imageUrl } = req.body;

  if (!prompt && !imageUrl) {
    return res.status(400).json({ error: "❌ Prompt or image URL required." });
  }

  try {
    const parts = [];

    // If image given, fetch + convert to base64
    if (imageUrl) {
      const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const base64Image = Buffer.from(imageRes.data).toString("base64");

      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Image
        }
      });
    }

    // Add the prompt text
    parts.push({ text: prompt });

    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          role: "user",
          parts
        }
      ]
    });

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) return res.status(500).json({ error: "❌ No response from Gemini." });

    res.json({ result: result.trim() });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Gemini Vision server running on port ${PORT}`);
});
