import React, { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Volume2, X } from "lucide-react";

/**
 * A modal component for voice interaction with the AI assistant
 */
export default function VoiceInteractionModal({
  isOpen,
  onClose,
  isRecording,
  onToggleRecording,
  transcribedText,
  audioBase64,
  waitingForResponse,
  isPlaying,
  setIsPlaying,
  setWaitingForResponse,
}) {
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  // Handle new audio data
  useEffect(() => {
    if (!audioBase64 || !isOpen) return;

    try {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      // Create new audio element with data URI
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      
      // Set up event handlers
      audio.onplay = () => {
        setIsPlaying(true);
        setAudioError(false);
      };
      
      audio.onpause = () => {
        setIsPlaying(false);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setWaitingForResponse(false);
      };
      
      audio.onerror = () => {
        console.error("Audio playback error:", audio.error);
        setIsPlaying(false);
        setAudioError(true);
        setWaitingForResponse(false);
      };

      audioRef.current = audio;

      // Auto play the audio
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        setAudioError(true);
      });

    } catch (error) {
      console.error("Error setting up audio:", error);
      setAudioError(true);
      setWaitingForResponse(false);
    }
  }, [audioBase64, isOpen]);

  // Toggle audio playback
  const togglePlayback = () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      setAudioError(true);
    }
  };

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl relative">
        {" "}
        {/* Close button */}
        {/*fix the button please*/ }
        <Button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          variant="ghost"
          onClick={onClose}
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
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                ${
                  isRecording
                    ? "bg-red-100 recording-pulse"
                    : isPlaying
                    ? "bg-green-100 animate-pulse"
                    : "bg-blue-100"
                }`}
              >
                <Button
                  onClick={isPlaying ? togglePlayback : onToggleRecording}
                  className={`rounded-full p-4 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : isPlaying
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  disabled={isRecording && isPlaying}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8" />
                  ) : isPlaying ? (
                    <Volume2 className="h-8 w-8 animate-speaker" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>
            </div>

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
                    onClick={togglePlayback}
                  >
                    <Volume2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <span className="text-green-600 font-medium mt-2">
                  AI Speaking
                </span>
              </div>
            )}

            {/* Manual Play Button (shows only when audio failed to play automatically) */}
            {audioError && audioRef.current && !isPlaying && (
              <div className="flex flex-col items-center ml-2">
                <Button
                  onClick={togglePlayback}
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
                <span className="text-sm text-green-600 mt-2">Tap to play</span>
              </div>
            )}

            {/* Recording Animation */}
            {isRecording && (
              <div className="flex items-center h-20 gap-2 ml-2 bg-red-50 p-3 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">Recording...</span>
              </div>
            )}
          </div>
          {/* Transcribed Text */}{" "}
          <div className="w-full min-h-[100px] max-h-[200px] overflow-y-auto bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 text-center">
              {transcribedText ||
                (isPlaying
                  ? "Weather AI is speaking..."
                  : isRecording
                  ? "Listening to you..."
                  : "Click the microphone to start speaking...")}
            </p>
          </div>
          {/* Debug Player - removed as it's not defined */}
        </div>
      </div>
    </div>
  );
}
