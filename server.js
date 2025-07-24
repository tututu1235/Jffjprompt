const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL = "gemini-1.5-flash-latest"; // Gemini 2.5 Flash
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

app.get("/", (req, res) => {
  res.send("✅ Gemini 2.5 Flash API is running!");
});

app.post("/gemini", async (req, res) => {
  const { prompt, imageUrl } = req.body;

  if (!prompt && !imageUrl) {
    return res.status(400).json({ error: "❌ Prompt or image required." });
  }

  try {
    const parts = [];

    // 🖼 Handle image if present
    if (imageUrl) {
      try {
        const imageRes = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });
        const base64Image = Buffer.from(imageRes.data).toString("base64");

        parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        });
      } catch (error) {
        console.error("❌ Image fetch error:", error.message);
        return res.status(500).json({ error: "❌ Failed to fetch image." });
      }
    }

    parts.push({ text: prompt });

    const response = await axios.post(GEMINI_URL, {
      contents: [{ role: "user", parts }]
    });

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) {
      return res.status(500).json({ error: "❌ Gemini returned no result." });
    }

    res.json({ result: result.trim() });

  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    res.status(500).json({ error: "❌ Gemini request failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Gemini 2.5 Flash server running on port ${PORT}`);
});
