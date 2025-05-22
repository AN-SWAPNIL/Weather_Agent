import React, { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";

// Waveform animation component
const WaveformAnimation = ({ isActive, stream }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!isActive || !stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArrayRef.current);

      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = dataArrayRef.current[i] / 2;
        ctx.fillStyle = `rgb(59, 130, 246)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, stream]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={50}
      className="w-full h-12 bg-white rounded-lg"
    />
  );
};

/**
 * Component for recording audio using the microphone
 */
export default function AudioRecorder({
  onAudioRecorded,
  disabled = false,
  addToast,
}) {
  const [listening, setListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Start recording audio when mic button is clicked
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Get supported MIME type
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
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Create WAV file
          const wavBlob = await convertToWav(audioBuffer);

          // Pass WAV blob up to parent
          onAudioRecorded(wavBlob);

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

      // Show toast notification
      if (addToast) {
        addToast({
          message: "Recording... Speak now!",
          type: "info",
          duration: 10000,
        });
      }

      // Automatically stop recording after 10 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (addToast) {
        addToast({
          message:
            "Could not access your microphone. Please check your permissions.",
          type: "error",
          duration: 5000,
        });
      }
      setListening(false);
    }
  };

  // Convert AudioBuffer to WAV format
  const convertToWav = async (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioBuffer.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, "RIFF");
    // RIFF chunk length
    view.setUint32(4, 36 + dataSize, true);
    // RIFF type
    writeString(view, 8, "WAVE");
    // format chunk identifier
    writeString(view, 12, "fmt ");
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, byteRate, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(view, 36, "data");
    // data chunk length
    view.setUint32(40, dataSize, true);

    // Write the PCM samples
    const offset = 44;
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }

    let pos = 0;
    while (pos < audioBuffer.length) {
      for (let i = 0; i < numChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i][pos]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(
          offset + pos * blockAlign + i * bytesPerSample,
          value,
          true
        );
      }
      pos++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  // Helper function to write strings to DataView
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Stop recording and process the audio
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      if (addToast) {
        addToast({
          message: "Processing your query...",
          type: "info",
        });
      }
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

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="primary"
        onClick={toggleListening}
        className={`${
          listening
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white shadow-sm`}
        disabled={disabled}
        title={listening ? "Stop recording" : "Start voice recording"}
      >
        <Mic className={`h-5 w-5 ${listening ? "animate-pulse" : ""}`} />
      </Button>
      {listening && (
        <WaveformAnimation isActive={listening} stream={streamRef.current} />
      )}
    </div>
  );
}
