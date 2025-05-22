import React, { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Volume2, X, Loader2, Pause } from "lucide-react";
import { createAudioBlobFromBase64 } from "../services/audio.service";

/**
 * A modal component for voice interaction with the AI assistant
 */
export default function VoiceInteractionModal({
  isOpen,
  onClose,
  state,
  setState,
  AudioRecorderState,
  onToggleRecording,
  onTogglePlayback,
  onPlaybackComplete,
  query,
  response,
  audioBase64,
  audioRef,
}) {
  const [audioError, setAudioError] = useState(false);
  // Computed properties from state
  const [isRecording, setIsRecording] = useState(
    state === AudioRecorderState.RECORDING
  );
  const [isPlaying, setIsPlaying] = useState(
    state === AudioRecorderState.PLAYING
  );
  const [isProcessing, setIsProcessing] = useState(
    state === AudioRecorderState.PROCESSING
  );
  // Ref to store the audio element

  useEffect(() => {
    setIsRecording(state === AudioRecorderState.RECORDING);
    setIsPlaying(state === AudioRecorderState.PLAYING);
    setIsProcessing(state === AudioRecorderState.PROCESSING);
  }, [state, AudioRecorderState]);
  useEffect(() => {
    if (!audioBase64 || !isOpen) return;

    try {
      // Clean up previous audio
      if (audioRef.current) {
        // Properly cleanup existing audio element
        audioRef.current.pause();
        audioRef.current.removeAttribute("src"); // Better than setting to empty string
        audioRef.current.load(); // Reset and reload the audio element
      }

      // Create new audio element with data URI
      console.log("Audio Base64:", audioBase64?.substring(0, 50) + "...");

      let audioData = audioBase64;
      // Make sure we have a valid base64 string without data URI prefix
      if (audioBase64.startsWith("data:")) {
        audioData =
          audioBase64.split(",")[1] || audioBase64.split(";base64,")[1];
      }

      // Validate we have actual content
      if (!audioData || audioData.trim() === "") {
        console.error("Empty audio data received");
        setAudioError(false); // Reset error state since there's no audio
        return;
      }
      // Create a blob URL instead of using data URI directly
      try {
        // Use our improved audio service function to handle the conversion
        const blob = createAudioBlobFromBase64(audioData);
        const url = URL.createObjectURL(blob);

        console.log("Created blob URL for audio with MIME type: audio/wav");

        const audio = new Audio();

        // Monitor all audio events for better debugging
        audio.addEventListener("loadstart", () =>
          console.log("Audio loadstart event fired")
        );
        audio.addEventListener("durationchange", () =>
          console.log("Audio duration changed to:", audio.duration)
        );
        audio.addEventListener("loadedmetadata", () =>
          console.log("Audio metadata loaded")
        );
        audio.addEventListener("loadeddata", () =>
          console.log("Audio data loaded")
        );

        // Add a canplay event to ensure the audio is loaded before playing
        audio.addEventListener("canplay", () => {
          console.log("Audio can now be played safely - canplay event fired");
          // Automatically try to play when canplay is triggered
          if (isPlaying && !audio.played.length) {
            audio.play().catch((err) => {
              console.warn("Could not autoplay even after canplay event:", err);
            });
          }
        });

        // Set up event handlers
        audio.onplay = () => {
          console.log("Audio playing successfully");
          setAudioError(false);
        };

        audio.onended = () => {
          console.log("Audio playback ended");
          if (onPlaybackComplete) {
            onPlaybackComplete();
          }
          URL.revokeObjectURL(audio.src); // Clean up Blob URL
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e, audio.error);
          setAudioError(true);
          URL.revokeObjectURL(audio.src);

          // Fallback to data URI playback
          const fallbackAudio = new Audio(`data:audio/wav;base64,${audioData}`);
          fallbackAudio.onplay = () => setAudioError(false);
          fallbackAudio.onended = () => {
            if (onPlaybackComplete) onPlaybackComplete();
            URL.revokeObjectURL(fallbackAudio.src);
          };
          fallbackAudio.onerror = (err) => {
            console.error("Fallback audio playback failed:", err);
            setAudioError(true);
            if (onPlaybackComplete) onPlaybackComplete();
          };

          audioRef.current = fallbackAudio;
          if (isPlaying) {
            fallbackAudio.play().catch((err) => {
              console.error("Error playing fallback audio:", err);
              setAudioError(true);
            });
          }
        };

        audio.src = url;
        audioRef.current = audio;

        // Auto play the audio only if we're in PLAYING state
        if (isPlaying) {
          audio.load(); // Important: load before playing
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing audio:", error);
              setAudioError(true);
            });
          }
        }
      } catch (blobError) {
        console.error("Error creating blob:", blobError);
        // Fallback to data URI method - last resort
        try {
          // Try with explicit data URI format
          const audio = new Audio(`data:audio/wav;base64,${audioData}`);

          audio.addEventListener("canplay", () => {
            console.log("Fallback audio can now be played");
          });

          audio.onplay = () => {
            console.log("Fallback audio playing successfully");
            setAudioError(false);
          };

          audio.onended = () => {
            console.log("Fallback audio playback ended");
            if (onPlaybackComplete) onPlaybackComplete();
          };

          audio.onerror = (e) => {
            console.error("Data URI fallback error:", e);
            console.error("Audio error details:", audio.error);
            setAudioError(true);
            if (onPlaybackComplete) onPlaybackComplete();
          };

          audioRef.current = audio;

          if (isPlaying) {
            audio.load(); // Important: load before playing
            audio.play().catch((error) => {
              console.error("Error playing fallback audio:", error);
              setAudioError(true);
            });
          }
        } catch (fallbackError) {
          console.error("All audio playback approaches failed:", fallbackError);
          setAudioError(true);
          if (onPlaybackComplete) {
            onPlaybackComplete();
          }
        }
      }
    } catch (error) {
      console.error("Error setting up audio:", error);
      setAudioError(true);
      if (onPlaybackComplete) {
        onPlaybackComplete();
      }
    }
  }, [audioBase64, isOpen, isPlaying, onPlaybackComplete]);
  useEffect(() => {
    // Early return if we don't have an audio reference
    if (!audioRef.current) return;

    // Check for valid source - very important to prevent "Empty src attribute" errors
    const hasValidSource = audioRef.current.src && audioRef.current.src !== "";

    if (isPlaying && hasValidSource) {
      if (audioRef.current.readyState >= 2) {
        // HAVE_CURRENT_DATA or better
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio on state change:", error);
            setAudioError(true);
          });
        }
      } else {
        console.log("Audio not ready yet, setting oncanplaythrough handler");
        const canPlayHandler = () => {
          audioRef.current.play().catch((err) => {
            console.error("Error in canplaythrough handler:", err);
            setAudioError(true);
          });
          audioRef.current.removeEventListener(
            "canplaythrough",
            canPlayHandler
          );
        };
        audioRef.current.addEventListener("canplaythrough", canPlayHandler);
      }
    } else {
      // Not playing, so pause the audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Reset error state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAudioError(false);
    }
  }, [isOpen]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl relative">
        {/* Close button */}
        <Button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          variant="ghost"
          onClick={onClose}
          disabled={isRecording}
        >
          <X className="h-6 w-6 text-gray-700" />
        </Button>
        <div className="flex flex-col items-center gap-4 mt-4">
          {/* Header */}
          <h2 className="text-xl font-semibold text-blue-600">Voice Mode</h2>
          {/* Voice Animation and Controls */}
          <div className="flex items-center justify-center gap-6 w-full">
            {/* Mic Button with Animation */}
            <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center">
              {" "}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                ${
                  isRecording
                    ? "bg-red-100 recording-pulse"
                    : isPlaying
                    ? "bg-green-100 animate-pulse"
                    : isProcessing
                    ? "bg-yellow-100"
                    : "bg-blue-100"
                }`}
              >
                <Button
                  onClick={isPlaying ? onTogglePlayback : onToggleRecording}
                  className={`rounded-full p-4 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : isPlaying
                      ? "bg-green-500 hover:bg-green-600"
                      : isProcessing
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  disabled={isProcessing}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8" />
                  ) : isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : isProcessing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>
            </div>{" "}
            {/* Audio Player Animation */}
            {isPlaying && (
              <div className="flex flex-col items-center ml-2">
                {/* Ripple Effect Container */}
                <div className="relative h-20 w-20 flex items-center justify-center">
                  {/* Ripple Circles */}
                  <div className="absolute inset-0 bg-green-200 rounded-full opacity-30 animate-ripple"></div>
                  <div
                    className="absolute inset-0 bg-green-200 rounded-full opacity-30 animate-ripple"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute inset-0 bg-green-200 rounded-full opacity-30 animate-ripple"
                    style={{ animationDelay: "1s" }}
                  ></div>

                  {/* Speaker Icon */}
                  <div
                    className="bg-green-500 rounded-full p-3 z-10 cursor-pointer hover:bg-green-600 transition-colors"
                    onClick={onTogglePlayback}
                  >
                    <Volume2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                {/* <span className="text-green-600 font-medium mt-2">
                  AI Speaking
                </span> */}
              </div>
            )}
            {/* Processing Animation */}
            {isProcessing && (
              <div className="flex items-center h-20 gap-2 ml-2 bg-yellow-50 p-3 rounded-lg">
                {" "}
                <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                <span className="text-yellow-600 font-medium">
                  Processing...
                </span>{" "}
              </div>
            )}
            {/* Idle State Prompt - shown when not recording, processing, or playing */}
            {/* {!isRecording && !isProcessing && !isPlaying && !audioError && (
              <div className="flex items-center h-20 gap-2 ml-2 bg-blue-50 p-3 rounded-lg">
                <Mic className="h-5 w-5 text-blue-500" />
                <span className="text-blue-600 font-medium">Tap to record</span>
              </div>
            )} */}
            {/* Recording Animation */}
            {isRecording && (
              <div className="flex items-center h-20 gap-2 ml-2 bg-red-50 p-3 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">Recording...</span>
              </div>
            )}
          </div>{" "}
          {/* Transcribed Text and Response Section */}
          <div className="w-full min-h-[100px] max-h-[200px] overflow-y-auto bg-gray-50 rounded-lg p-4">
            {(query || response) && !isProcessing && !isRecording ? (
              <div className="flex flex-col gap-2">
                {query && (
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-1">
                      Your question:
                    </p>
                    <p className="text-gray-700">{query}</p>
                  </div>
                )}
                {response && (
                  <div className="bg-green-50 p-2 rounded-lg mt-2">
                    <p className="text-sm text-green-700 font-medium mb-1">
                      Weather response:
                    </p>
                    <p className="text-gray-700">{response}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700 text-center">
                {isRecording
                  ? "Listening to you..."
                  : isProcessing
                  ? "Processing your request..."
                  : "Tap the microphone to start recording..."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
