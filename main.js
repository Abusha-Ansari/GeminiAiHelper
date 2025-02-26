// Use ES Module (ESM) syntax for browser compatibility
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { apiKey } from "./apiKey.js";

const api = apiKey;
const genAI = new GoogleGenerativeAI(api);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const systemPrompt = `
Remember that you are a software engineer proficient in JavaScript and Python. 
When the user asks to generate any code, you can generate it in any language. 
If the user mentions it explicitly, generate the code in that language. 
Otherwise, generate code in either JavaScript or Python.

Your response should be a **valid JSON object** with two attributes:
1️⃣ **question** - The user prompt.
2️⃣ **answer** - The generated code in JavaScript and/or Python or any other language user asked for.

If you cannot generate code, return an error message.

⚠️ **IMPORTANT**: Do NOT include extra explanations, only return the JSON object.
`;

const genAICall = async (userPrompt) => {
  try {
    const prompt = `${systemPrompt}\nHere is the user prompt: ${userPrompt}`;

    const result = await model.generateContent(prompt);
    let textResponse = result.response.candidates[0].content.parts[0].text;

    textResponse = textResponse.replace(/^```[a-zA-Z]*\s*|```$/g, "").trim();

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response.");
    }

    const data = JSON.parse(jsonMatch[0]);

    let answer = "❌ Error: Could not generate code for the user prompt";

    if (data.answer) {
      if (typeof data.answer === "string") {
        answer = data.answer;
      } else if (data.answer.python && Array.isArray(data.answer.python) && data.answer.python.length > 0) {
        answer = data.answer.python[0].content || answer;
      }
    }

    return answer.replace(/^```[a-zA-Z]*\s*|```$/g, "").trim();
  } catch (error) {
    return `❌ Error: ${error.message}`;
  }
};




document.getElementById("generate").onclick = async () => {
  const userPrompt = document.getElementById("prompInput").value;
  const resElement = document.getElementById("response");

  resElement.textContent = "⏳ Generating response...";

  try {
    const response = await genAICall(userPrompt);
    
    if (typeof response === "string") {
      resElement.textContent = response; 
    } else {
      resElement.textContent = JSON.stringify(response, null, 2); 
    }
  } catch (error) {
    resElement.textContent = `❌ Error: ${error.message}`;
  }
};