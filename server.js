import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: "15mb" }));

app.post("/analyze-plant", async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64 || !imageBase64.startsWith("data:image")) {
    return res.status(400).json({ error: "Imagine invalidă sau lipsă." });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: imageBase64 }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HuggingFace API Error: ${errText}`);
    }

    const data = await response.json();
    console.log("✅ HuggingFace response:", data);

    const label = data[0]?.label?.toLowerCase() || "necunoscut";
    const confidence = Math.round((data[0]?.score || 0) * 100);

    let friendlyMessage = "";

    // Cazuri speciale
    if (confidence < 20) {
      friendlyMessage = "⚠️ Imagine neclară sau planta nu a fost recunoscută cu suficientă încredere. Încearcă o altă poză.";
    } else if (label.includes("healthy")) {
      friendlyMessage = "🌿 Planta pare sănătoasă. Continuă să o îngrijești așa!";
    } else if (label.includes("blight")) {
      friendlyMessage = `⚠️ Posibilă boală de tip „blight” („${label}”). Evită udarea excesivă și asigură o bună ventilație.`;
    } else if (label.includes("bacterial")) {
      friendlyMessage = `⚠️ Semne de infecție bacteriană („${label}”). Îndepărtează frunzele afectate și păstrează zona curată.`;
    } else if (label.includes("rot")) {
      friendlyMessage = `⚠️ Posibilă putrezire („${label}”). Redu udarea și îmbunătățește drenajul.`;
    } else if (label.includes("mold")) {
      friendlyMessage = `⚠️ Posibil mucegai („${label}”). Evită umezeala stagnantă și ventilează zona.`;
    } else if (label.includes("spot")) {
      friendlyMessage = `⚠️ Pete suspecte („${label}”). Verifică dacă planta are nevoie de tratament antifungic.`;
    } else if (label.includes("flowerpot") || label.includes("pot")) {
      friendlyMessage = "🪴 Este detectat un ghiveci, dar nu suficient pentru a analiza sănătatea plantei.";
    } else {
      // Default: orice altceva
      friendlyMessage = `🔍 Imagine detectată ca: „${label}” (${confidence}% încredere).`;
    }

    res.json({ message: friendlyMessage });
  } catch (error) {
    console.error("❌ Eroare Hugging Face:", error.message);
    res.status(500).json({ error: "Eroare la procesarea imaginii." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API HuggingFace pornit la http://localhost:${PORT}`);
});
