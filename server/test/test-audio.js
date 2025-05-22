// Test script for the audio processing functionality
// Run this with Node.js to test the audio processing

import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample WAV file for testing
const testAudioPath = path.join(__dirname, "data", "record.wav");

// Authentication token (replace with a valid token)
const token = "YOUR_AUTH_TOKEN_HERE";

async function testAudioQuery() {
  try {
    // Create a form with the audio file
    const form = new FormData();
    form.append(
      "audio",
      fs.createReadStream(testAudioPath),
      "test-recording.wav"
    );

    // Optional: Add a sessionId if you want to test with an existing session
    // form.append('sessionId', 'YOUR_SESSION_ID');

    console.log("Sending audio file to server...");

    // Send the request to the server
    const response = await fetch("http://localhost:4000/audio/query", {
      method: "POST",
      headers: {
        authorization: token,
      },
      body: form,
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Success! Server response:");
      console.log("Query:", result.query);
      console.log("Message:", result.message);
      console.log("Session ID:", result.sessionId);

      // Check if audio reply was received
      if (result.audio_reply) {
        console.log("Audio reply received, length:", result.audio_reply.length);

        // Optionally save the audio to a file
        /*
        const base64Data = result.audio_reply.split('base64,')[1];
        fs.writeFileSync(path.join(__dirname, 'test-output.wav'), Buffer.from(base64Data, 'base64'));
        console.log('Saved audio response to test-output.wav');
        */
      } else {
        console.log("No audio reply in the response");
      }
    } else {
      console.error("Error:", result);
    }
  } catch (error) {
    console.error("Error testing audio query:", error);
  }
}

testAudioQuery();
