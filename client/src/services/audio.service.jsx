// Helper function to write strings to DataView
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Convert AudioBuffer to WAV format
export const convertToWav = async (audioBuffer) => {
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

// Enhanced function to process and convert the audio data to a playable format
export const createAudioBlobFromBase64 = (audioBase64) => {
  try {
    // Handle data URI format if present
    let audioData = audioBase64;
    if (audioBase64.startsWith("data:")) {
      audioData = audioBase64.split(";base64,")[1];
    }

    // Create byte arrays for more efficient processing
    const byteCharacters = atob(audioData);
    const byteArrays = [];

    // Process in chunks for memory efficiency
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    // Create a WAV blob with proper MIME type
    return new Blob(byteArrays, { type: "audio/wav" });
  } catch (error) {
    console.error("Error creating audio blob:", error);
    throw new Error("Failed to process audio data");
  }
};

// Enhanced function to setup audio playback with proper state management
export const setupAudioPlayback = (audioBase64, options = {}) => {
  const {
    onPlay = () => {},
    onEnded = () => {},
    onError = () => {},
    autoPlay = false,
  } = options;

  try {
    // Create audio blob from base64 data
    const audioBlob = createAudioBlobFromBase64(audioBase64);
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create new audio element
    const audio = new Audio();

    // Set up audio properties for better playback control
    audio.preload = "auto";
    audio.controls = false;

    // Event handlers
    const handlePlay = () => {
      console.log("Audio playback started");
      onPlay();
    };

    const handleEnded = () => {
      console.log("Audio playback completed");
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(audio.src);
      onEnded();
    };

    const handleError = (error) => {
      console.error("Audio playback error:", error);
      // Clean up the object URL on error
      URL.revokeObjectURL(audio.src);
      onError(error);
    };

    const handleCanPlayThrough = () => {
      console.log("Audio can play through without interruption");
      // Only auto-play if requested and audio is ready
      if (autoPlay) {
        audio.play().catch(handleError);
      }
    };

    // Add event listeners
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);

    // Set the audio source
    audio.src = audioUrl;

    // Load the audio data
    audio.load();

    // Add cleanup method to the audio element
    audio.cleanup = () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);

      if (audio.src) {
        URL.revokeObjectURL(audio.src);
        audio.src = "";
      }

      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };

    return audio;
  } catch (error) {
    console.error("Error setting up audio playback:", error);
    onError(error);
    return null;
  }
};
