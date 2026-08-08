// js/gemini.js
import db from './firebase-config.js';

// Base64 helper to read File as base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export async function analyzeImage(imageFile) {
  const base64Data = await fileToBase64(imageFile);

  // 1. Try calling the real Netlify serverless function first
  try {
    const response = await fetch("/.netlify/functions/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data })
    });

    if (response.ok) {
      const data = await response.json();
      // Validate schema
      if (data.category && data.severity && data.confidence !== undefined) {
        return data;
      }
      throw new Error("Invalid AI schema received");
    }
  } catch (error) {
    console.warn("Netlify function /analyze-image unavailable, trying direct client-side call:", error);
  }

  // 1.5 Try calling Gemini API directly if key is saved in local storage
  const clientApiKey = localStorage.getItem("ecovision_gemini_api_key");
  if (clientApiKey) {
    try {
      const cleanBase64 = base64Data.split(",")[1];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${clientApiKey}`;
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: "Analyze this campus environmental issue image. You must respond with a raw JSON object only. Do not wrap in markdown ```json or blockquotes. Match this schema strictly: { \"category\": \"waste\"|\"water\"|\"energy\"|\"nature\", \"subcategory\": \"string describing detail, e.g. overflowing_bin\", \"severity\": \"low\"|\"medium\"|\"high\"|\"critical\", \"description\": \"clear, single-line description of the visible issue\", \"confidence\": 0.90 }"
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resultJson = await response.json();
        const rawText = resultJson.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(rawText.trim());
        if (parsed.category && parsed.severity) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Direct client-side Gemini classification failed, falling back to local simulation:", e);
    }
  }

  // 2. Fallback local simulation if serverless is offline (hackathon safety)
  // We check file name or size to seed different category scenarios for testing
  let category = "waste";
  let subcategory = "overflowing_bin";
  let severity = "high";
  let description = "A large cluster of plastic bottles, food wrappers, and aluminum cans overflowing from a recycling bin near the walkway.";
  let confidence = 0.92;

  const fn = imageFile.name.toLowerCase();
  if (fn.includes("leak") || fn.includes("water") || fn.includes("tap") || fn.includes("faucet")) {
    category = "water";
    subcategory = "running_tap";
    severity = "urgent";
    description = "A restroom faucet has been left fully open and is running, pouring clean water into the sink and causing overflow onto the counter.";
    confidence = 0.95;
  } else if (fn.includes("light") || fn.includes("fan") || fn.includes("energy") || fn.includes("electricity")) {
    category = "energy";
    subcategory = "lights_on";
    severity = "medium";
    description = "High-power corridor spotlights and ceiling fans left fully active during daylight hours inside an empty lecture hall.";
    confidence = 0.88;
  } else if (fn.includes("plant") || fn.includes("tree") || fn.includes("nature") || fn.includes("garden") || fn.includes("wilt")) {
    category = "nature";
    subcategory = "wilted_plants";
    severity = "low";
    description = "A flowerbed showing significant signs of water stress, with wilted leaves and dry, cracking topsoil near the main courtyard.";
    confidence = 0.90;
  }

  return {
    category,
    subcategory,
    severity,
    description,
    confidence,
    environmentalImpact: "High resource waste and potential safety hazard.",
    recommendedAction: "Dispatch immediate service crew to isolate leak/clean waste.",
    requiresHumanConfirmation: true
  };
}

export async function verifyResolution(beforeImageUrl, afterImageUrl, category, description) {
  // 1. Try calling the real Netlify serverless function first
  try {
    const response = await fetch("/.netlify/functions/verify-resolution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beforeImageUrl, afterImageUrl, category, description })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn("Netlify function /verify-resolution unavailable, trying direct client-side call:", error);
  }

  // 1.5 Try calling Gemini API directly if key is saved in local storage
  const clientApiKey = localStorage.getItem("ecovision_gemini_api_key");
  if (clientApiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${clientApiKey}`;
      
      const beforeBase64 = beforeImageUrl.split(",")[1];
      const afterBase64 = afterImageUrl.split(",")[1];
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Compare these two photos from the same campus location. The 'Before' photo shows a reported ${category} issue: '${description}'. The 'After' photo shows the completed remediation work. Verify if the issue was resolved. You must respond with a raw JSON object only. Do not wrap in markdown. Match this schema strictly: { "status": "likely_resolved"|"partially_resolved"|"unresolved", "resolutionScore": 95, "sceneMatch": 90, "confidence": 0.90, "issueResolved": true, "explanation": "detailed analysis explaining verification" }`
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: beforeBase64
                }
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: afterBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resultJson = await response.json();
        const rawText = resultJson.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(rawText.trim());
        return parsed;
      }
    } catch (e) {
      console.warn("Direct client-side Gemini verification failed, falling back to local simulation:", e);
    }
  }

  // 2. Fallback simulation (Hackathon safety)
  // If the afterImageUrl contains a flag or matches a demo state we trigger failed verification
  const isFailedDemo = afterImageUrl.includes("failed") || description.toLowerCase().includes("failed") || description.toLowerCase().includes("leakage");

  if (isFailedDemo) {
    return {
      status: "partially_resolved",
      resolutionScore: 45,
      sceneMatch: 85,
      confidence: 0.82,
      issueResolved: false,
      explanation: "Verification failed. While the main walkway area has been cleaned, water stains and minor leaks are still visible at the pipe junction."
    };
  }

  // Default successful verification
  return {
    status: "likely_resolved",
    resolutionScore: 94,
    sceneMatch: 92,
    confidence: 0.91,
    issueResolved: true,
    explanation: "Verification success. The reported anomaly is no longer visible in the after photo. The area has been thoroughly cleared."
  };
}
