import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Volume2, X, Loader2, Pause } from "lucide-react";
import { setupAudioPlayback } from "../services/audio.service";

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

  // Update local state when parent state changes
  useEffect(() => {
    setIsRecording(state === AudioRecorderState.RECORDING);
    setIsPlaying(state === AudioRecorderState.PLAYING);
    setIsProcessing(state === AudioRecorderState.PROCESSING);
  }, [state, AudioRecorderState]);
  // Handle audio setup when audio data is available
  useEffect(() => {
    if (!audioBase64 || !isOpen) return;

    // Clean up any previous audio properly
    if (audioRef.current) {
      if (audioRef.current.cleanup) {
        audioRef.current.cleanup();
      } else {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }
      audioRef.current = null;
    }

    // Setup new audio with our unified service
    audioRef.current = setupAudioPlayback(audioBase64, {
      onPlay: () => setAudioError(false),
      onEnded: () => {
        if (onPlaybackComplete) onPlaybackComplete();
      },
      onError: (error) => {
        console.error("Audio playback error:", error);
        setAudioError(true);
        if (onPlaybackComplete) onPlaybackComplete();
      },
      autoPlay: false, // Never auto-play, we'll control it manually
    });
  }, [audioBase64, isOpen, onPlaybackComplete]); // Removed isPlaying from dependencies to prevent recreation
  // Control audio playback when isPlaying state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Only start playing if audio is not already playing
      if (audioRef.current.paused) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio on state change:", error);
          setAudioError(true);
          if (onPlaybackComplete) onPlaybackComplete();
        });
      }
    } else {
      // Pause audio if playing
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, onPlaybackComplete]);

  // Reset error state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAudioError(false);
      // Clean up audio when modal closes
      if (audioRef.current) {
        if (audioRef.current.cleanup) {
          audioRef.current.cleanup();
        } else {
          audioRef.current.pause();
          if (audioRef.current.src) {
            URL.revokeObjectURL(audioRef.current.src);
          }
        }
        audioRef.current = null;
      }
    }
  }, [isOpen]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Helper to render sound wave bars for playing state
  const renderSoundWave = () => {
    if (!isPlaying) return null;

    return (
      <div className="flex items-center justify-center gap-1 mt-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`bg-green-500 rounded-full w-1.5 animate-sound-wave-${
              i + 1
            }`}
            style={{ height: `${6 + Math.random() * 14}px` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="relative flex items-center justify-center py-4 border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-800">Voice Assistant</h2>
          <Button
            className="absolute right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100"
            variant="ghost"
            onClick={onClose}
            disabled={isRecording}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Main Control - Simplified and Centered */}
          <div className="relative mb-12 select-none">
            {/* Outer Ring - Changes color based on state */}
            <div
              className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isRecording
                  ? "bg-red-50 shadow-red-200"
                  : isPlaying
                  ? "bg-green-50 shadow-green-200"
                  : isProcessing
                  ? "bg-yellow-50 shadow-yellow-200"
                  : "bg-blue-50 shadow-blue-200"
              }`}
            >
              {/* Inner Circle */}
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? "bg-red-100 recording-pulse"
                    : isPlaying
                    ? "bg-green-100"
                    : isProcessing
                    ? "bg-yellow-100"
                    : "bg-blue-100"
                }`}
              >
                {/* Button */}
                <Button
                  onClick={isPlaying ? onTogglePlayback : onToggleRecording}
                  className={`rounded-full p-6 text-white shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                      : isPlaying
                      ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                      : isProcessing
                      ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
                      : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
                  }`}
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

              {/* Ripple effect for playing state */}
              {isPlaying && (
                <>
                  <div
                    className="absolute inset-0 rounded-full opacity-0 bg-green-300"
                    style={{
                      animation: "ripple 2.5s ease-out infinite",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full opacity-0 bg-green-300"
                    style={{
                      animation: "ripple 2.5s ease-out infinite 0.8s",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full opacity-0 bg-green-300"
                    style={{
                      animation: "ripple 2.5s ease-out infinite 1.6s",
                    }}
                  />
                </>
              )}
            </div>{" "}
            {/* Status Label */}
            <div
              className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-sm font-medium py-1.5 px-6 rounded-full shadow-sm transition-all duration-300 ${
                isRecording
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : isPlaying
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : isProcessing
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {isRecording
                ? "Recording..."
                : isPlaying
                ? "Playing"
                : isProcessing
                ? "Processing..."
                : "Tap_to_Speak"}
            </div>
          </div>

          {/* Sound Wave Visualization (only shown when playing) */}
          {renderSoundWave()}

          {/* Conversation Display */}
          <div className="w-full mt-8 bg-gray-50 rounded-xl p-4 max-h-[250px] overflow-y-auto border border-gray-100 shadow-inner">
            {(query || response) && !isProcessing && !isRecording ? (
              <div className="flex flex-col gap-3">
                {query && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                      You
                    </p>
                    <p className="text-gray-800">{query}</p>
                  </div>
                )}
                {response && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-1 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                      Weather Assistant
                    </p>
                    <p className="text-gray-800">{response}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center italic py-6">
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
