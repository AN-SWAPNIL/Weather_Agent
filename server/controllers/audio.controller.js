// filepath: /mnt/AN_Swapnil_D/Codes/SocioFi/Weather_Agent/server/controllers/audio.controller.js
import { transcribe, textToSpeech } from "../services/audio.service.js";
import { queryExecutor } from "../controllers/weather.controller.js";
import { StatusCodes } from "http-status-codes";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv";
config(); // Load environment variables from .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Controller for speech-to-text functionality
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const transcript = await transcribe(req.file);

    // Delete the temporary file after transcription
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to transcribe audio",
      error: error.message,
    });
  }
};

/**
 * Controller for text-to-speech functionality
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const synthesizeSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Text is required for speech synthesis",
      });
    }

    // Generate a unique filename
    const outputFilename = `tts-${Date.now()}.wav`;
    const outputPath = path.join(
      __dirname,
      "../data/downloads",
      outputFilename
    );

    // Ensure the directory exists
    await fs.ensureDir(path.dirname(outputPath)); // Save audio to file
    const result = await textToSpeech(text, outputPath);

    // After file is saved, send it to the client with optimized settings
    const stat = fs.statSync(outputPath);

    // Set appropriate MIME type and headers for better browser compatibility
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Cache-Control", "no-cache, no-store");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${outputFilename}`
    );

    // Create read stream from the saved file and pipe to response
    const readStream = fs.createReadStream(outputPath);
    readStream.pipe(res);
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    if (!res.headersSent) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to synthesize speech",
        error: error.message,
      });
    }
  }
};

/**
 * Controller for handling audio weather queries with file upload
 * This function combines transcription, weather query processing, and speech synthesis
 * Uses multipart/form-data with an "audio" field containing the audio file
 *
 * @param {Object} req - Express request object with file from multer
 * @param {Object} res - Express response object
 */
export const queryAudioFile = async (req, res) => {
  try {
    const sessionId = req.body.sessionId;

    // Access user from req.user set by UserMiddleware
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log(
      `Processing file upload audio query with sessionId: ${sessionId || "No sessionId provided"}`
    );
    // if (Object.keys(additionalParams).length > 0) {
    //   console.log("Additional parameters:", additionalParams);
    // }

    // Check if audio file is provided
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Audio file is required for this endpoint",
      });
    }

    let transcriptionResult;
    try {
      transcriptionResult = await transcribe(req.file);
    } catch (error) {
      console.error("Error in transcription:", error);
      transcriptionResult = undefined;
    }

    // if (!transcriptionResult.success) {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     success: false,
    //     message: "Failed to transcribe audio",
    //   });
    // }

    const query = transcriptionResult?.transcript;
    // const query = "What is the weather today?";

    console.log(
      `Processing weather query: "${query}" for user: ${req.user._id}`
    );

    // Delete the temporary audio file after transcription
    // fs.unlink(req.file.path, (err) => {
    //   if (err) console.error("Error deleting temporary file:", err);
    // });

    let weatherResponse;
    if (query) {
      try {
        weatherResponse = await queryExecutor(req.user, sessionId, query);
        console.log("Query processed successfully:", weatherResponse);
      } catch (error) {
        console.error("Error processing weather query:", error);
        // Provide a fallback response when the weather query fails
        weatherResponse = {
          sessionId: sessionId || null,
          sessionName: "Voice Query",
          update_time: new Date().toISOString(),
          location: req.user.location || "Unknown",
          message:
            "I'm sorry, I couldn't process your request at this moment. Please try again later.",
        };
      }
    } else {
      console.error("Transcription failed or returned empty string");
      weatherResponse = {
        sessionId: sessionId || null,
        sessionName: "Voice Query",
        update_time: new Date().toISOString(),
        location: req.user.location || "Unknown",
        message: "Sorry, I didn't hear that. Please try again.",
      };
    }

    const timestamp = Date.now();
    const outputFilename = `tts-${timestamp}.wav`;

    // Save in the server's data directory
    const audioFilePath = path.join(
      __dirname,
      "../data/downloads",
      outputFilename
    );

    // Ensure the directory exists
    await fs.ensureDir(path.dirname(audioFilePath));

    try {
      const result = await textToSpeech(weatherResponse.message, audioFilePath);

      // Verify the file exists and has content
      if (!fs.existsSync(audioFilePath)) {
        throw new Error("Audio file was not created");
      }

      const stats = fs.statSync(audioFilePath);
      if (stats.size === 0) {
        throw new Error("Audio file is empty");
      }

      // Step 4: Read the generated audio file and convert to base64
      // Read the generated audio file and convert to base64
      const audioData = fs.readFileSync(audioFilePath);
      console.log(
        `Audio file read successfully: ${audioFilePath}, size: ${audioData.length} bytes`
      );

      const base64Audio = audioData.toString("base64");

      if (base64Audio.length === 0) {
        throw new Error("Base64 conversion resulted in empty string");
      }
      console.log(
        `Base64 conversion successful, length: ${base64Audio.length}`
      );

      // fs.unlink(audioFilePath, (err) => {
      //   if (err) console.error("Error deleting audio file:", err);
      // });

      // Include full data URI for better browser compatibility
      // Use explicit content type to ensure browsers handle it correctly
      weatherResponse.audio_reply = `data:audio/wav;base64,${base64Audio}`;
      // Also provide the direct URL for clients that prefer to stream rather than decode base64
      weatherResponse.audio_url = `/api/audio/${outputFilename}`;
      weatherResponse.audio_format = "wav";
      weatherResponse.audio_size = audioData.length; // Adding file size for client-side validation
    } catch (error) {
      console.error("Error processing audio:", error);
      // Use a fallback file if the current one fails
      const fallbackPath = path.join(__dirname, "../data/try_again.wav");

      if (fs.existsSync(fallbackPath)) {
        console.log("Using fallback audio file");
        const audioData = fs.readFileSync(fallbackPath);
        weatherResponse.audio_reply = `data:audio/wav;base64,${audioData.toString("base64")}`;
        weatherResponse.message =
          process.env.TRY_AGAIN_MESSAGE ||
          "Sorry, I didn't get that or there was an error. Please try again!!";
        weatherResponse.audio_url = `/api/audio/try_again.wav`; // URL for direct access
        weatherResponse.audio_format = "wav"; // Explicitly specify WAV format
      } else {
        console.error("Both primary and fallback audio files failed");
        weatherResponse.audio_reply = null;
      }
    }

    // Include both the text and audio responses, along with any additional parameters
    const response = {
      ...weatherResponse,
      query: query,
    };

    // Return the combined response
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    console.log("Error in file upload audio query:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process audio file query",
      error: error.message,
    });
  }
};

// export const queryAudioFile = async (req, res) => {
//   try {
//     const sessionId = req.body.sessionId;

//     let weatherResponse = {
//       sessionId: sessionId || null,
//       sessionName: "Voice Query",
//       update_time: new Date().toISOString(),
//       location: req.user.location || "Unknown",
//       message:
//         "I'm sorry, I couldn't process your request at this moment. Please try again later.",
//     };
//     const fallbackPath = path.join(__dirname, "../data/record.wav");
//     const audioData = fs.readFileSync(fallbackPath);
//     weatherResponse.audio_reply = `data:audio/wav;base64,${audioData.toString("base64")}`;
//     weatherResponse.audio_url = `/api/audio/data/record.wav`; // URL for direct access
//     weatherResponse.audio_format = "wav"; // Explicitly specify WAV format
//     const query = "What is the weather today?";

//     const response = {
//       ...weatherResponse,
//       query: query,
//     };

//     // Return the combined response
//     return res.status(StatusCodes.OK).json(response);
//   } catch (error) {
//     console.log("Error in file upload audio query:", error);
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Failed to process audio file query",
//       error: error.message,
//     });
//   }
// };
