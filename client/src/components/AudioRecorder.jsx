import React, { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";
import VoiceInteractionModal from "./VoiceInteractionModal";
import { convertToWav } from "../services/audio.service";

/**
 * Component for recording audio using the microphone
 */
export default function AudioRecorder({
  onAudioRecorded,
  disabled = false,
  toasts,
  addToast,
  removeToast,
}) {
  const AudioRecorderState = {
    IDLE: "IDLE",
    RECORDING: "RECORDING",
    PROCESSING: "PROCESSING",
    PLAYING: "PLAYING",
  };
  const [state, setState] = useState(AudioRecorderState.IDLE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [query, setQuery] = useState("");
  const [audioResponse, setAudioResponse] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  // Start recording audio when mic button is clicked
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      // Create MediaRecorder with supported format
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          // Create audio blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });

          // Convert to WAV using AudioContext
          const audioContext = new window.AudioContext();
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Change state to PROCESSING
          setState(AudioRecorderState.PROCESSING);

          // Create WAV file
          const wavBlob = await convertToWav(audioBuffer);

          // Pass WAV blob up to parent
          const response = await onAudioRecorded(wavBlob);

          // Update transcribed text and audio response
          if (response) {
            setResponse(response.message || "");
            setQuery(response.query || "");
            if (response.audio_reply) {
              // Debug log the audio data
              console.log("Received audio response", {
                length: response.audio_reply?.length,
                format: response.audio_reply?.startsWith("data:")
                  ? "data URI"
                  : "base64",
                sample: response.audio_reply?.substring(0, 50) + "...",
              });

              // Clear any previous audio reference and response
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeAttribute("src");
                audioRef.current.load();
                audioRef.current = null;
              }
              setAudioResponse(null);

              // Verify we have valid audio data before proceeding
              if (!response.audio_reply || response.audio_reply.trim() === "") {
                console.warn("Received empty audio data");
                setState(AudioRecorderState.IDLE);
                return;
              }

              // Small delay to ensure state update before setting new audio
              setTimeout(() => {
                // Pass audio data directly - our improved VoiceInteractionModal can handle both data URI and raw base64
                setAudioResponse(response.audio_reply);
                // Change state to PLAYING
                setState(AudioRecorderState.PLAYING);

                console.log("Setting audio response directly", {
                  length: response.audio_reply?.length,
                  sample: response.audio_reply?.substring(0, 50) + "...",
                });
              }, 200);
            } else {
              console.warn("Response had no audio_reply property", response);
              setState(AudioRecorderState.IDLE);
            }
          } else {
            setState(AudioRecorderState.IDLE);
          }

          // Release microphone access
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          if (addToast) {
            addToast({
              message: "Error processing audio. Please try again.",
              type: "error",
              duration: 5000,
            });
          }
          setState(AudioRecorderState.IDLE);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState(AudioRecorderState.RECORDING);

      // Automatically stop recording after 10 seconds
      setTimeout(() => {
        stopRecording();
      }, 10000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (addToast) {
        // Remove any existing toasts first
        if (removeToast) {
          toasts?.forEach((toast) => removeToast(toast.id));
        }
        addToast({
          message: "Could not access your microphone",
          type: "error",
          duration: 5000,
        });
      }
      setState(AudioRecorderState.IDLE);
    }
  };

  // Stop recording and process the audio
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    // Don't set state here as the onstop handler will handle state changes
  }; // Toggle recording state
  const toggleRecording = () => {
    if (state === AudioRecorderState.RECORDING) {
      stopRecording();
    } else if (
      state === AudioRecorderState.IDLE ||
      state === AudioRecorderState.PLAYING
    ) {
      // If we're playing, stop that first before starting recording
      if (state === AudioRecorderState.PLAYING) {
        // Reset audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
      startRecording();
    }
  }; // Playback control
  
  const togglePlayback = () => {
    if (state === AudioRecorderState.PLAYING) {
      // When stopping playback, go to IDLE state
      setState(AudioRecorderState.IDLE);

      // Pause but don't reset src here as we might want to play it again
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else if (state === AudioRecorderState.IDLE && audioResponse) {
      // Make sure we have valid audio response before trying to play
      if (!audioResponse || audioResponse.trim() === "") {
        console.warn("Attempted to play empty audio response");
        return;
      }

      setState(AudioRecorderState.PLAYING);
    }
  };

  // Handle opening the voice interaction modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  }; // Handle closing the voice interaction modal
  const handleCloseModal = () => {
    if (state !== AudioRecorderState.RECORDING) {
      // Clean up audio resources
      if (audioRef.current) {
        // Full cleanup of audio element
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load(); // Important to apply the src change
        audioRef.current = null;
      }

      setIsModalOpen(false);
      setResponse("");
      setQuery(""); // Clear the query as well
      setAudioResponse(null);
      setState(AudioRecorderState.IDLE);

      // Explicitly reset the error state in VoiceInteractionModal when closing
      // This will be handled through props in the VoiceInteractionModal
    }
  };

  // Handle audio playback completion
  const handlePlaybackComplete = () => {
    setState(AudioRecorderState.IDLE);
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={handleOpenModal}
        className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
        disabled={disabled}
        title="Start voice recording"
      >
        <Mic className="h-5 w-5" />
      </Button>{" "}
      <VoiceInteractionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        state={state}
        setState={setState}
        AudioRecorderState={AudioRecorderState}
        onToggleRecording={toggleRecording}
        onTogglePlayback={togglePlayback}
        onPlaybackComplete={handlePlaybackComplete}
        response={response}
        query={query}
        audioBase64={audioResponse}
        audioRef={audioRef}
      />
    </>
  );
}
