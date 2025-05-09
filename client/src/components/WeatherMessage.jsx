import React from "react";

export default function WeatherMessage({ role, content, location, timestamp }) {
  const isAssistant = role === "assistant";
  const isUser = role === "user";
  const isSystem = role === "system";
  // Color consistency: blue for assistant, green for user, gray for system
  const left = isAssistant || isSystem;
  return (
    <div className={`flex mb-4 ${left ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-lg shadow px-4 py-3 relative
          ${isAssistant ? "bg-blue-50 border border-blue-200" : ""}
          ${isUser ? "bg-green-50 border border-green-200" : ""}
          ${isSystem ? "bg-gray-100 border border-gray-200" : ""}
        `}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={`font-semibold text-xs ${
              isAssistant
                ? "text-blue-700"
                : isUser
                ? "text-green-700"
                : "text-gray-500"
            }`}
          >
            {isAssistant ? "WeatherAI" : isUser ? "You" : "System"}
          </span>
          <span className="text-xs text-gray-400 ml-2">{location}</span>
        </div>
        <div className="text-gray-800 whitespace-pre-line">{content}</div>
        {timestamp && (
          <div className="text-right text-xs text-gray-400 mt-1">
            {new Date(timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
