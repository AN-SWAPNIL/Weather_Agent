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
  const [listening, setListening] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [audioResponse, setAudioResponse] = useState(null);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

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

          setWaitingForResponse(true);

          // Create WAV file
          const wavBlob = await convertToWav(audioBuffer);

          // Pass WAV blob up to parent
          const response = await onAudioRecorded(wavBlob);

          // Update transcribed text and audio response
          if (response) {
            setTranscribedText(response.query || "");
            if (response.audio_reply) {
              // Debug log the audio data
              console.log("Received audio response", {
                length: response.audio_reply?.length,
                format: response.audio_reply?.startsWith("data:")
                  ? "data URI"
                  : "base64",
                sample: response.audio_reply?.substring(0, 50) + "...",
              });

              // Clear any previous audio response first
              setAudioResponse(null);

              // Small delay to ensure state update before setting new audio
              setTimeout(() => {
                // Pass audio data directly - our improved VoiceInteractionModal can handle both data URI and raw base64
                setAudioResponse(response.audio_reply);
                setWaitingForResponse(false);
                setIsPlaying(true);

                console.log("Setting audio response directly", {
                  length: response.audio_reply?.length,
                  sample: response.audio_reply?.substring(0, 50) + "...",
                });
              }, 100);
            } else {
              console.warn("Response had no audio_reply property", response);
            }
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
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setListening(true);

      // // Show toast notification
      // if (addToast) {
      //   addToast({
      //     message: "Recording... Speak now!",
      //     type: "info",
      //     duration: 10000,
      //   });
      // }

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
      setListening(false);
    }
  };

  // Stop recording and process the audio
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      // if (addToast) {
      //   addToast({
      //     message: "Processing your query...",
      //     type: "info",
      //   });
      // }
    }
    setListening(false);
  };

  // Toggle recording state
  const toggleListening = () => {
    if (listening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle opening the voice interaction modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle closing the voice interaction modal
  const handleCloseModal = () => {
    if (!listening) {
      setIsModalOpen(false);
      setTranscribedText("");
      setAudioResponse(null);
      setIsPlaying(false);
      setWaitingForResponse(false);
    }
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
      </Button>

      <VoiceInteractionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isRecording={listening}
        onToggleRecording={toggleListening}
        transcribedText={transcribedText}
        audioBase64={audioResponse}
        waitingForResponse={waitingForResponse}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setWaitingForResponse={setWaitingForResponse}
      />
    </>
  );
}
