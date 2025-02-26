import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

let api;
let genAI;
let model;

async function fetchApiKey() {
  try {
    const response = await fetch('https://gemini-api-chi.vercel.app/api_gemini');
    const data = await response.json();
    api = data.apiKey;

    if (!api) throw new Error("API Key is missing");

    // Initialize GoogleGenerativeAI after fetching API key
    genAI = new GoogleGenerativeAI(api);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error("Error fetching API key:", error);
  }
}

fetchApiKey();

const systemPrompt = `
You are a software engineer proficient in JavaScript and Python.
Generate code in the requested language, or default to JavaScript or Python.
Respond only with clean code, without explanations or JSON formatting.
`;

const genAICall = async (userPrompt) => {
  if (!model) {
    return "❌ Error: Model not initialized. Try again later.";
  }

  try {
    const prompt = `${systemPrompt}\nUser Prompt: ${userPrompt}`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });

    // Extract AI response
    let textResponse = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!textResponse) {
      throw new Error("Empty response from AI.");
    }

    // Remove unnecessary JSON or markdown formatting
    textResponse = textResponse.replace(/^```[a-zA-Z]*\s*|```|```$/g, "").trim();

    return textResponse;
  } catch (error) {
    console.error("API Call Error:", error);
    return `❌ Error: ${error.message}`;
  }
};

document.getElementById("generate").onclick = async () => {
  const userPrompt = document.getElementById("prompInput").value;
  const resElement = document.getElementById("response");

  resElement.textContent = "⏳ Generating response...";

  try {
    const response = await genAICall(userPrompt);
    resElement.textContent = response;
  } catch (error) {
    resElement.textContent = `❌ Error: ${error.message}`;
  }
};

