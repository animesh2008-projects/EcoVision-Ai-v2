// netlify/functions/ai-assistant.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

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
    const { question, issues } = JSON.parse(event.body);

    if (!question || !issues) {
      return { statusCode: 400, body: JSON.stringify({ error: "Question and issues context are required." }) };
    }

    // Format issues list for concise prompt context
    const formattedIssues = issues.map(i => 
      `Issue ID: ${i.id}, Category: ${i.category}, Subcategory: ${i.subcategory}, Status: ${i.status}, Priority: ${i.priorityLevel}, Location: ${i.location}, SLA countdown: ${i.slaDeadline}`
    ).join("\n");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      You are the EcoVision Sustainability Assistant, a helpful AI operating on a college campus. 
      You will answer questions based strictly on the current campus environmental reports.
      
      Campus Environmental Reports Context:
      ${formattedIssues}

      Guidelines:
      1. Answer the user's question using only this data. 
      2. If you cannot answer it from the data, say "I don't have that specific record on file, but I can assist with general campus report queries."
      3. Be concise and friendly (max 60 words).
      4. Refer to the data as "our active campus reports" rather than "JSON list".
      5. Output plain text (or simple inline formatting).
    `;

    const result = await model.generateContent([systemPrompt, question]);
    const answer = result.response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answer: answer.trim() })
    };
  } catch (error) {
    console.error("AI Assistant Function Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message || "Failed to process question with Gemini." })
    };
  }
};
