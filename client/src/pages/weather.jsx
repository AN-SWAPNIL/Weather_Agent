// filepath: /mnt/AN_Swapnil_D/Codes/SocioFi/Weather_Agent/client/src/pages/weather.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { ToastContainer, useToast } from "../components/ui/toast";

// Newly created components
import ChatContainer from "../components/ChatContainer";
import ChatInput from "../components/ChatInput";
import AudioPlayer from "../components/AudioPlayer";
import LocationSetting from "../components/LocationSetting";
import SessionManager from "../components/SessionManager";

// Main component
export default function WeatherChatPage() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("");
  const [sessions, setSessions] = useState([]); // session list
  const [selectedSession, setSelectedSession] = useState(null); // session object
  const [messages, setMessages] = useState([]); // messages for selected session
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audioBase64, setAudioBase64] = useState(null);

  // Toast notifications
  const { toasts, addToast, removeToast } = useToast();

  // Load user data from local storage on initial render
  useEffect(() => {
    const userStr = window.localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUser(user);
      setLocation(user.location || "");
    }
  }, []);

  // Render function that uses the SessionManager
  const renderWithSessionAPI = (sessionApi) => {
    // Load sessions on component mount
    useEffect(() => {
      const loadInitialData = async () => {
        const sessions = await sessionApi.loadSessions();
        setSessions(sessions);

        // Auto-select the most recent session
        if (sessions.length > 0 && !selectedSession) {
          setSelectedSession(sessions[0]);
          const messages = await sessionApi.loadSessionMessages(
            sessions[0].sessionId
          );
          setMessages(messages);
        }
      };

      loadInitialData();
    }, []);

    // Load messages when selected session changes
    useEffect(() => {
      const loadMessages = async () => {
        if (selectedSession) {
          setLoading(true);
          const messages = await sessionApi.loadSessionMessages(
            selectedSession.sessionId
          );
          setMessages(messages);
          setLoading(false);
        } else {
          setMessages([]);
        }
      };

      loadMessages();
    }, [selectedSession]);

    // Send text message handler
    const handleSendMessage = async (query) => {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "user",
          content: query,
          timestamp: new Date().toISOString(),
        },
      ]);

      setLoading(true);
      const sessionId = selectedSession ? selectedSession.sessionId : undefined;

      const response = await sessionApi.sendTextQuery(query, sessionId);

      if (response.error) {
        setMessages((msgs) => [
          ...msgs,
          {
            role: "system",
            content: response.error,
            timestamp: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      // If new session, add to sessions and select it
      if (!sessionId && response.sessionId) {
        const newSession = {
          sessionId: response.sessionId,
          sessionName: response.sessionName,
          update_time: response.update_time,
        };
        setSessions((prev) => [newSession, ...prev]);
        setSelectedSession(newSession);

        // Load messages for new session
        const messages = await sessionApi.loadSessionMessages(
          response.sessionId
        );
        setMessages(messages);
      } else {
        // Reload messages for current session
        const messages = await sessionApi.loadSessionMessages(sessionId);
        setMessages(messages);
      }

      setLoading(false);
      // Refresh sessions list
      const updatedSessions = await sessionApi.loadSessions();
      setSessions(updatedSessions);
    };

    // Handle audio recording submission
    const handleAudioRecorded = async (audioBlob) => {
      setLoading(true);

      // Add a loading message to show typing indicator
      setMessages((msgs) => [
        ...msgs,
        {
          role: "user",
          content: "Recording audio...",
          timestamp: new Date().toISOString(),
          isAudioLoading: true,
        },
      ]);

      try {
        const sessionId = selectedSession
          ? selectedSession.sessionId
          : undefined;
        const data = await sessionApi.sendAudioQuery(audioBlob, sessionId);

        // Remove the loading message
        setMessages((msgs) => msgs.filter((msg) => !msg.isAudioLoading));

        // Add the transcribed query from the user
        setMessages((msgs) => [
          ...msgs,
          {
            role: "user",
            content: data.query,
            timestamp: new Date().toISOString(),
            location: data.location,
          },
        ]);

        // Add the response from the assistant
        setMessages((msgs) => [
          ...msgs,
          {
            role: "assistant",
            content: data.message,
            timestamp: new Date().toISOString(),
            location: data.location,
          },
        ]);

        // Play the audio response if available
        if (data.audio_reply) {
          setAudioBase64(data.audio_reply);
        }

        // If this is a new session, update the sessions list
        if (!selectedSession && data.sessionId) {
          const newSession = {
            sessionId: data.sessionId,
            sessionName: data.sessionName,
            update_time: data.update_time,
          };
          setSessions((prev) => [newSession, ...prev]);
          setSelectedSession(newSession);
        } else {
          // Refresh the sessions list
          const updatedSessions = await sessionApi.loadSessions();
          setSessions(updatedSessions);
        }
      } catch (error) {
        console.error("Error processing audio query:", error);

        // Remove the loading message
        setMessages((msgs) => msgs.filter((msg) => !msg.isAudioLoading));

        // Show error message
        setMessages((msgs) => [
          ...msgs,
          {
            role: "system",
            content:
              "Sorry, there was an error processing your voice query. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Save user's default location
    const handleSaveLocation = async () => {
      const success = await sessionApi.saveLocation(location);

      if (success) {
        setUser((prevUser) => ({ ...prevUser, location }));
        window.localStorage.setItem(
          "user",
          JSON.stringify({ ...user, location })
        );
        addToast({
          message: `Default location saved: ${location}`,
          type: "success",
        });
      } else {
        addToast({
          message: "Failed to save location.",
          type: "error",
        });
      }
    };

    // Handle selecting a session
    const handleSessionSelect = async (session) => {
      if (selectedSession && selectedSession.sessionId === session.sessionId)
        return; // Already selected

      setMessages([]);
      setSelectedSession(session);
      setLoading(true);

      const messages = await sessionApi.loadSessionMessages(session.sessionId);
      setMessages(messages);
      setLoading(false);
    };

    // Handle deleting a session
    const handleDeleteSession = async (sessionId) => {
      if (!window.confirm("Are you sure you want to delete this session?"))
        return;

      const success = await sessionApi.deleteSession(sessionId);

      if (success) {
        setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
        if (selectedSession && selectedSession.sessionId === sessionId) {
          setSelectedSession(null);
          setMessages([]);
        }
        addToast({
          message: "Session deleted successfully.",
          type: "success",
        });
      } else {
        addToast({
          message: "Failed to delete session.",
          type: "error",
        });
      }
    };

    // Create a new session
    const handleNewSession = () => {
      setSelectedSession(null);
      setMessages([]);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-green-100 flex flex-col pt-14">
        <Navbar
          user={user}
          tab={null}
          setTab={() => {}}
          onWeatherAIClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex w-full max-w-5xl mx-auto gap-6 flex-1 p-4">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            queries={sessions}
            onSessionSelect={handleSessionSelect}
            onDeleteSession={handleDeleteSession}
            onNewSession={handleNewSession}
          />

          {/* Main Chat */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col border border-blue-100">
              {/* Chat Message Container */}
              <ChatContainer
                messages={messages}
                loading={loading}
                selectedSession={selectedSession}
                user={user}
              />

              {/* Chat Input Form */}
              <ChatInput
                onSendMessage={handleSendMessage}
                onAudioRecorded={handleAudioRecorded}
                loading={loading}
                addToast={addToast}
              />

              {/* Location Settings */}
              <LocationSetting
                location={location}
                setLocation={setLocation}
                handleSaveLocation={handleSaveLocation}
              />
            </div>
          </div>
        </div>

        <footer
          id="scroll-target"
          className="mt-8 text-center text-gray-500 text-sm py-3 bg-white/50"
        >
          Powered by OpenWeatherMap, Google Gemini, and ElevenLabs
        </footer>

        {/* Audio Player Component (hidden) */}
        <AudioPlayer
          base64Audio={audioBase64}
          autoPlay={true}
          addToast={addToast}
        />

        {/* Toast container for notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  };

  return <SessionManager>{renderWithSessionAPI}</SessionManager>;
}
