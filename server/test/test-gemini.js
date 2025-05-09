// Test script for Google Gemini API
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

async function testModel(modelName) {
  console.log(`\n=== Testing model: ${modelName} ===`);
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // Try library method first
    console.log("Using Google Generative AI library...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = "What's the weather like in a tropical climate?";
    console.log(`Sending prompt: "${prompt}"`);

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("\nResponse:");
    console.log("=========");
    console.log(response);
    console.log(`\n✅ SUCCESS with model ${modelName} using library method!`);
    return true;
  } catch (error) {
    console.error(`\n❌ FAILED with library method: ${error.message}`);

    // Try direct API call
    try {
      console.log("\nTrying direct API call with beta endpoint...");
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: "What's the weather like in a tropical climate?" },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("\nResponse from direct API call:");
      console.log("==============================");
      console.log(
        JSON.stringify(
          response.data.candidates[0].content.parts[0].text,
          null,
          2
        )
      );
      console.log(
        `\n✅ SUCCESS with model ${modelName} using direct API call!`
      );
      return true;
    } catch (fallbackError) {
      console.error(
        `\n❌ FAILED with direct API call: ${fallbackError.message}`
      );
      if (fallbackError.response?.data) {
        console.error(
          "Error details:",
          JSON.stringify(fallbackError.response.data, null, 2)
        );
      }
      return false;
    }
  }
}

async function testGeminiAPI() {
  console.log("Testing Gemini API connection...");

  // Models to test from your screenshot
  const models = [
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ];

  // Also try v1 compatible models
  const v1Models = ["gemini-pro", "gemini-pro-vision"];

  let anySuccess = false;

  // Test all models from the screenshot
  for (const model of models) {
    const success = await testModel(model);
    if (success) {
      anySuccess = true;
      console.log(`\n✅ Found working model: ${model}`);
    //   break; // Stop after first success
    }
  }

  // If no models from the screenshot worked, try the v1 models
  if (!anySuccess) {
    console.log("\nTrying v1 compatible models...");
    for (const model of v1Models) {
      const success = await testModel(model);
      if (success) {
        anySuccess = true;
        console.log(`\n✅ Found working model: ${model}`);
        break; // Stop after first success
      }
    }
  }

  if (!anySuccess) {
    console.error(
      "\n❌ No models were successful. Please check your API key and permissions."
    );
    console.log("\nTroubleshooting tips:");
    console.log(
      "1. Verify your API key is correctly copied from Google AI Studio"
    );
    console.log(
      "2. Make sure you have enabled the Gemini API in your Google Cloud project"
    );
    console.log(
      "3. Check if your account has the necessary permissions and quotas"
    );
  }
}

// Run the test
testGeminiAPI();
