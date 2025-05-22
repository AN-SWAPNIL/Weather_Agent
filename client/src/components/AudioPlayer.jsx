import React, { useRef, useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

const WaveformAnimation = ({ audioElement }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!audioElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Create new audio context
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;

    // Create new source node
    const source = audioContext.createMediaElementSource(audioElement);
    sourceRef.current = source;

    // Connect nodes
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const draw = () => {
      if (!audioContextRef.current) return;

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArrayRef.current);

      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = dataArrayRef.current[i] / 2;
        ctx.fillStyle = `rgb(16, 185, 129)`;
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
        audioContextRef.current = null;
      }
      sourceRef.current = null;
    };
  }, [audioElement]);

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
 * Component for playing audio responses
 */
export default function AudioPlayer({
  base64Audio = null,
  autoPlay = true,
  addToast,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clean up audio URL when component unmounts or audio changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [audioUrl]);

  // Handle new audio data
  useEffect(() => {
    if (!base64Audio) return;

    const setupAudio = async () => {
      try {
        setIsLoading(true);

        // Clean up previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        // Convert base64 to blob
        const byteCharacters = atob(base64Audio);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "audio/wav" });

        // Create URL for blob
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Create new audio element
        const audio = new Audio();
        audio.src = url;

        // Wait for audio to be loaded
        await new Promise((resolve, reject) => {
          audio.addEventListener("canplaythrough", resolve, { once: true });
          audio.addEventListener("error", reject, { once: true });
        });

        audioRef.current = audio;

        if (autoPlay) {
          await audio.play();
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        if (addToast) {
          addToast({
            message: "Error processing audio response",
            type: "error",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    setupAudio();
  }, [base64Audio, autoPlay, addToast]);

  const togglePlayback = async () => {
    if (!audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      if (addToast) {
        addToast({
          message: "Error playing audio response",
          type: "error",
        });
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  if (!base64Audio) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlayback}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
          >
            <Volume2
              className={`h-5 w-5 ${
                isPlaying ? "text-green-500" : "text-gray-500"
              }`}
            />
          </button>
          <span className="text-sm text-gray-500">
            {isLoading
              ? "Loading..."
              : isPlaying
              ? "AI Speaking..."
              : "AI Response"}
          </span>
        </div>
        {isPlaying && audioRef.current && (
          <WaveformAnimation audioElement={audioRef.current} />
        )}
      </div>
    </div>
  );
}
