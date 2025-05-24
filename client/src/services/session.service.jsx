import React from "react";
import config from "../config/api.config";

/**
 * Service for managing all API-related session operations
 * This is not a UI component but a logic module that handles session management
 */
export default function SessionManager({ children }) {
  const API_URL = config.apiUrl;

  const loadSessions = async () => {
    const response = await fetch(`${API_URL}/api/history`, {
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    });
    if (response.ok) {
      const data = await response.json();
      // Sort by update_time in descending order (most recent first)
      return data.sort(
        (a, b) => new Date(b.update_time) - new Date(a.update_time)
      );
    }
    return [];
  };
  const loadSessionMessages = async (sessionId) => {
    const response = await fetch(`${API_URL}/api/history/${sessionId}`, {
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.messages || [];
    }
    return [];
  };
  const deleteSession = async (sessionId) => {
    const response = await fetch(`${API_URL}/api/history/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    });
    return response.ok;
  };
  const sendTextQuery = async (query, sessionId) => {
    const body = sessionId ? { sessionId, query } : { query };
    const response = await fetch(`${API_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message };
    }

    return await response.json();
  };

  const sendAudioQuery = async (audioBlob, sessionId) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    // Include session ID if one is selected
    if (sessionId) {
      formData.append("sessionId", sessionId);
    }
    try {
      const response = await fetch(`${API_URL}/audio/query`, {
        method: "POST",
        headers: {
          authorization: localStorage.getItem("token"),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process audio query");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending audio query:", error);
      throw error;
    }
  };
  const saveLocation = async (location) => {
    const response = await fetch(`${API_URL}/users/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ location }),
    });
    return response.ok;
  };

  // Expose these methods to the parent component
  const sessionApi = {
    loadSessions,
    loadSessionMessages,
    deleteSession,
    sendTextQuery,
    sendAudioQuery,
    saveLocation,
  };

  // This is a utility component that doesn't render anything
  // Instead, it provides its functionality through the render prop pattern
  return children(sessionApi);
}
