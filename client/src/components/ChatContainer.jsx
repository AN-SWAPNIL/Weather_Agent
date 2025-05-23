import React, { useEffect } from "react";
import WeatherMessage from "./WeatherMessage";
import { CloudSun } from "lucide-react";

/**
 * Component for displaying chat messages and the header
 */
export default function ChatContainer({
  messages = [],
  loading = false,
  selectedSession = null,
  user = null,
}) {
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Try using scrollIntoView if it exists
      const scrollTarget = document.getElementById("scroll-target");
      if (scrollTarget && scrollTarget.scrollIntoView) {
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [messages, loading]);

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="bg-blue-50 p-4 rounded-lg text-gray-700 flex-1 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-lg">
            <CloudSun className="h-7 w-7 text-blue-600" /> Weather AI Assistant
          </div>
          {selectedSession ? (
            <div className="text-sm mt-1 text-blue-700">
              Current Session: {selectedSession.sessionName}
            </div>
          ) : (
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
              <li>"Will it rain today in New York?"</li>
              <li>"How hot will it be tomorrow in Tokyo?"</li>
              <li>"Was it sunny yesterday in London?"</li>
            </ul>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 rounded-lg bg-gray-50/50">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg, i) => (
          <WeatherMessage
            key={i}
            role={msg.role}
            content={msg.content}
            location={
              msg.location || (user && user.location) || "Not specified"
            }
            timestamp={msg.timestamp}
          />
        ))}
        {loading && (
          <div className="text-center text-blue-500 py-2">
            <div className="inline-block animate-pulse">Loading...</div>
          </div>
        )}
      </div>
    </>
  );
}
