import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import RecentQueries from "../components/RecentQueries";
import WeatherMessage from "../components/WeatherMessage";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Send, Mic, Save, CloudSun } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function WeatherChatPage() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [location, setLocation] = useState("");
  const [sessions, setSessions] = useState([]); // session list
  const [selectedSession, setSelectedSession] = useState(null); // session object
  const [messages, setMessages] = useState([]); // messages for selected session
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const userStr = window.localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUser(user);
      setLocation(user.location || "");
    }
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadSessionMessages(selectedSession.sessionId);
    } else {
      setMessages([]);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSessions = async () => {
    const response = await fetch("http://localhost:4000/api/history", {
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    });
    if (response.ok) {
      const data = await response.json();
      // Sort by update_time in descending order (most recent first)
      const sortedData = data.sort(
        (a, b) => new Date(b.update_time) - new Date(a.update_time)
      );
      setSessions(sortedData);
      // Auto-select the most recent session
      if (sortedData.length > 0 && !selectedSession) {
        setSelectedSession(sortedData[0]);
      }
    }
  };

  const loadSessionMessages = async (sessionId) => {
    setLoading(true);
    const response = await fetch(
      `http://localhost:4000/api/history/${sessionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      setMessages(data.messages || []);
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    let sessionId = selectedSession ? selectedSession.sessionId : undefined;
    const body = sessionId ? { sessionId, query } : { query };
    const response = await fetch("http://localhost:4000/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json();
      setMessages((msgs) => [
        ...msgs,
        {
          role: "system",
          content: errorData.message,
          timestamp: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }
    const data = await response.json();
    // If new session, add to sessions and select it
    if (!sessionId && data.sessionId) {
      const newSession = {
        sessionId: data.sessionId,
        sessionName: data.sessionName,
        update_time: data.update_time,
      };
      setSessions((prev) => [newSession, ...prev]);
      setSelectedSession(newSession);
      // Load messages for new session
      await loadSessionMessages(data.sessionId);
    } else {
      // Reload messages for current session
      await loadSessionMessages(sessionId);
    }
    setQuery("");
    setLoading(false);
    // Refresh sessions list
    loadSessions();
  };

  const toggleListening = () => {
    setListening(!listening);
    if (!listening) {
      setTimeout(() => setListening(false), 3000);
    }
  };

  const handleSaveLocation = async () => {
    const response = await fetch("http://localhost:4000/users/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ location }),
    });
    if (response.ok) {
      setUser((prevUser) => ({ ...prevUser, location }));
      window.localStorage.setItem(
        "user",
        JSON.stringify({ ...user, location })
      );
      alert(`Default location saved: ${location}`);
    } else {
      alert("Failed to save location.");
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    const response = await fetch(
      `http://localhost:4000/api/history/${sessionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
      }
    );
    if (response.ok) {
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      if (selectedSession && selectedSession.sessionId === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    } else {
      alert("Failed to delete session.");
    }
  };

  const handleNewSession = () => {
    setSelectedSession(null);
    setMessages([]);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-green-100 flex flex-col">
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
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-blue-50 p-4 rounded text-gray-700 flex-1">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <CloudSun className="h-7 w-7 text-blue-600" /> Weather AI
                  Assistant
                </div>
                {selectedSession==null?
                (<ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
                  <li>"Will it rain today in New York?"</li>
                  <li>"How hot will it be tomorrow in Tokyo?"</li>
                  <li>"Was it sunny yesterday in London?"</li>
                </ul>)
                : null}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4" ref={chatRef}>
              {loading && (
                <div className="text-center text-blue-500">Loading...</div>
              )}
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
                  location={msg.location || location}
                  timestamp={msg.timestamp}
                />
              ))}
            </div>
            <form
              className="flex items-center gap-2 mt-2"
              onSubmit={handleSend}
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about the weather..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="button" variant="ghost" onClick={toggleListening}>
                <Mic
                  className={listening ? "animate-pulse text-blue-500" : ""}
                />
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                <Send />
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Default Location:</span>
              <div className="flex gap-2">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-48 h-8 text-sm"
                />
                <Button size="sm" onClick={handleSaveLocation}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        Powered by OpenWeatherMap, Google Gemini, and ElevenLabs
      </footer>
    </div>
  );
}
