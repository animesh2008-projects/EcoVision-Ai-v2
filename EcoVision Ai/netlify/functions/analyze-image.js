// netlify/functions/analyze-image.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

exports.handler = async (event, context) => {
  // Allow CORS options preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gemini API key is not configured in environment variables." })
    };
  }

  try {
    const { image } = JSON.parse(event.body);
    if (!image) {
      return { statusCode: 400, body: JSON.stringify({ error: "Image data is required" }) };
    }

    // Clean base64 headers
    const base64Clean = image.replace(/^data:image\/\w+;base64,/, "");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Act as an expert campus environmental intelligence analyzer. Analyze the provided image for anomalies or issues in these categories: waste, water, energy, nature.
      
      Respond ONLY with a structured JSON object containing these exact fields:
      {
        "category": "must be one of: 'waste', 'water', 'energy', 'nature', 'other'",
        "subcategory": "a short snake_case subcategory name describing the specific issue, e.g. 'overflowing_bin', 'leaking_pipe', 'lights_on', 'wilted_plants'",
        "severity": "must be one of: 'normal', 'low', 'medium', 'high', 'urgent'",
        "description": "a short single-sentence description of the issue visible, max 15 words",
        "locationHint": "suggested general location name, e.g. 'canteen', 'science_block', 'library', 'hostel', 'other'",
        "confidence": 0.95, // float confidence score between 0.0 and 1.0
        "environmentalImpact": "brief description of environmental impact",
        "recommendedAction": "brief description of action required to remediate"
      }

      Do not include any explanation markdown tags outside the JSON object.
    `;

    const imagePart = {
      inlineData: {
        data: base64Clean,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Parse to ensure it is valid JSON before sending
    const parsedData = JSON.parse(responseText.trim());

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsedData)
    };
  } catch (error) {
    console.error("AI Analysis Function Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message || "Failed to analyze image with Gemini API." })
    };
  }
};
