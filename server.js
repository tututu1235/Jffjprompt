const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

// ✅ Root check
app.get("/", (req, res) => {
  res.send("✅ Gemini Prompt API (Vision) is running!");
});

// 🚀 Main Gemini POST endpoint
app.post("/gemini", async (req, res) => {
  const { prompt, imageUrl } = req.body;

  if (!prompt && !imageUrl) {
    return res.status(400).json({ error: "❌ Prompt or image URL required." });
  }

  try {
    const parts = [];

    // 🔁 If image URL provided → fetch & convert to base64
    if (imageUrl) {
      try {
        const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const base64Image = Buffer.from(imageRes.data).toString("base64");

        parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        });
      } catch (err) {
        return res.status(500).json({ error: "❌ Failed to fetch or convert image." });
      }
    }

    // ⌨️ Add prompt
    parts.push({ text: prompt });

    const geminiRes = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          role: "user",
          parts
        }
      ]
    });

    const result = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) return res.status(500).json({ error: "❌ Gemini returned empty response." });

    res.json({ result: result.trim() });

  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    res.status(500).json({ error: "❌ Gemini request failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Gemini Prompt API (Vision) running on port", PORT);
});
