import dotenv from "dotenv";
import fs from "fs-extra";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import path from "path";

dotenv.config();

/**
 * Transcribe audio file using Azure Speech-to-Text service
 * @param {Object} file - Uploaded file object from multer
 * @returns {Object} - Transcription result
 */
export const transcribe = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      // Create the speech configuration
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.AZURE_SPEECH_KEY,
        process.env.AZURE_SPEECH_REGION
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      // Create audio configuration using the file path
      // Azure's SDK can handle various input formats including WAV and MP3
      const audioConfig = sdk.AudioConfig.fromWavFileInput(
        fs.readFileSync(file.path)
      );

      // Create speech recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Start recognition
      let startTime = Date.now();

      recognizer.recognizeOnceAsync(
        (result) => {
          const duration = (Date.now() - startTime) / 1000; // in seconds

          // Clean up
          recognizer.close();

          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve({
              success: true,
              transcript: result.text,
              language: "en",
              audio_duration: duration,
              confidence: 0.9, // Azure doesn't provide confidence in the same way
            });
          } else {
            reject(new Error(`Speech recognition failed: ${result.reason}`));
          }
        },
        (err) => {
          recognizer.close();
          reject(new Error(`Error in Azure speech recognition: ${err}`));
        }
      );
    } catch (error) {
      console.error("Error in Azure transcription service:", error);
      reject(error);
    }
  });
};

/**
 * Convert text to speech using Azure Text-to-Speech service
 * @param {String} text - Text to convert to speech
 * @param {String} outputPath - Path to save the audio file
 * @returns {Promise<Object>} - Result with file path
 */
export const textToSpeech = async (text, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Create the speech configuration
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.AZURE_SPEECH_KEY,
        process.env.AZURE_SPEECH_REGION
      );

      // Set output format to MP3 for browser compatibility
      speechConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3; // MP3 format

      // Create audio configuration for output
      const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);

      // Set the voice name - using newer neural voice for better quality
      speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

      // Create the speech synthesizer
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

      console.log(
        `Starting speech synthesis for text (length: ${text.length})`
      );

      // Start the synthesis
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // Synthesis completed successfully
            console.log("Speech synthesis completed successfully");

            // Close and clear the synthesizer
            synthesizer.close();

            // Verify the file exists and has content
            if (fs.existsSync(outputPath)) {
              const stats = fs.statSync(outputPath);
              console.log(`Generated audio file size: ${stats.size} bytes`);

              if (stats.size > 0) {
                resolve({ success: true, filePath: outputPath });
              } else {
                reject(new Error("Audio file was generated but is empty"));
              }
            } else {
              reject(new Error("Audio file was not created"));
            }
          } else {
            console.log(
              `Speech synthesis failed with reason: ${result.reason}`
            );
            synthesizer.close();
            reject(new Error(`Speech synthesis failed: ${result.reason}`));
          }
        },
        (error) => {
          console.error("Error during speech synthesis:", error);
          synthesizer.close();
          reject(new Error(`Error in speech synthesis: ${error}`));
        }
      );
    } catch (error) {
      console.error("Error in Azure TTS service:", error);
      reject(error);
    }
  });
};
