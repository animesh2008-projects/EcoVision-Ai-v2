// netlify/functions/verify-resolution.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function toGenerativePart(input) {
  if (input.startsWith("data:image")) {
    const data = input.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = input.match(/:(.*?);/)[1] || "image/jpeg";
    return { inlineData: { data, mimeType } };
  } else if (input.startsWith("http")) {
    // Node.js 18+ has built-in global fetch
    const res = await fetch(input);
    const buffer = await res.arrayBuffer();
    const data = Buffer.from(buffer).toString("base64");
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    return { inlineData: { data, mimeType } };
  } else {
    return { inlineData: { data: input, mimeType: "image/jpeg" } };
  }
}

exports.handler = async (event, context) => {
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
      body: JSON.stringify({ error: "Gemini API key is not configured." })
    };
  }

  try {
    const { beforeImageUrl, afterImageUrl, category, description } = JSON.parse(event.body);

    if (!beforeImageUrl || !afterImageUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: "Both Before and After images are required." }) };
    }

    const beforePart = await toGenerativePart(beforeImageUrl);
    const afterPart = await toGenerativePart(afterImageUrl);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert environmental operations inspector. You are comparing two images of a campus site to verify whether a reported environmental issue has been successfully resolved.
      
      Reported Category: ${category}
      Reported Issue Description: ${description}

      Compare the 'Before' image and the 'After' image. Check for:
      1. Scene consistency: Are these two photos representing the exact same physical location? (e.g. same brick patterns, same walls, same angles).
      2. Remediated status: Has the issue described (e.g., trash, leakage) been cleaned or resolved?
      
      Respond ONLY with a structured JSON object containing these exact fields:
      {
        "status": "must be one of: 'likely_resolved', 'partially_resolved', 'not_resolved', 'uncertain'",
        "resolutionScore": 85, // integer score between 0 and 100 on how complete the clean up is
        "sceneMatch": 94, // integer score between 0 and 100 on how consistent the physical background is
        "confidence": 0.91, // float confidence score between 0.0 and 1.0
        "issueResolved": true, // boolean representing if status is likely_resolved
        "explanation": "a short paragraph (max 40 words) detailing your observations regarding the resolution."
      }

      Do not include any explanation markdown tags outside the JSON object.
    `;

    const result = await model.generateContent([prompt, beforePart, afterPart]);
    const responseText = result.response.text();
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
    console.error("AI Verification Function Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message || "Failed to compare images with Gemini API." })
    };
  }
};
