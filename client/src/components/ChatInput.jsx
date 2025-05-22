import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import AudioRecorder from "./AudioRecorder";

/**
 * Component for the chat input form
 */
export default function ChatInput({
  onSendMessage,
  onAudioRecorded,
  loading = false,
  toasts,
  addToast,
  removeToast,
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSendMessage(query);
    setQuery("");
  };

  return (
    <form className="flex items-center gap-2 mt-2" onSubmit={handleSubmit}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about the weather..."
        className="flex-1 shadow-sm"
        disabled={loading}
      />

      <AudioRecorder
        onAudioRecorded={onAudioRecorded}
        disabled={loading}
        toasts={toasts}
        addToast={addToast}
        removeToast={removeToast}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={loading || !query.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
