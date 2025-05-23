// filepath: d:\Codes\SocioFi\Weather_Agent\server\controllers\weather.controller.js
import {
  getSessionMessages,
  addMessageToSession,
  addSessionToUser,
  getAllSessions,
  deleteSession
} from "../services/session.service.js";
import { runAgent } from "../services/weather.service.js";

// Route handler functions
export const handleWeatherQuery = async (req, res) => {
  try {
    const { query, user, sessionId } = req.body;
    console.log(req.body);
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    if (!user) {
      return res.status(400).json({ error: "User information is required" });
    }

    console.log(
      `Processing weather query: "${query}" for location: ${
        user.location || "default"
      }`
    );

    const response = await queryExecutor(user, sessionId, query);
    console.log("Query processed successfully:", response);

    return res.json(response);
  } catch (error) {
    console.error("Error processing query:", error);
    return res.status(500).json({
      error: "Failed to process your request",
      message: error.message,
    });
  }
};

export const getAllSessionHistory = async (req, res) => {
  try {
    const history = await getAllSessions(req.body.user._id);
    const id_names = history.map((item) => {
      return {
        sessionId: item.session_id,
        sessionName: item.name,
        update_time: item.update_time,
      };
    });
    return res.json(id_names);
  } catch (error) {
    console.error("Error fetching query history:", error);
    return res.status(500).json({ error: "Failed to fetch query history" });
  }
};

export const getSessionHistoryById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await getSessionMessages(req.body.user._id, sessionId);
    return res.json(messages);
  } catch (error) {
    console.error("Error fetching session messages:", error);
    return res.status(500).json({ error: "Failed to fetch session messages" });
  }
};

export const deleteSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await deleteSession(req.body.user._id, sessionId);
    if (result) {
      return res.json({ message: "Session deleted successfully" });
    } else {
      return res.status(404).json({ error: "Session not found" });
    }
  } catch (error) {
    console.error("Error deleting session:", error);
    return res.status(500).json({ error: "Failed to delete session" });
  }
};

// Core business logic
export const queryExecutor = async (user, sessionId, inputMessage) => {
  try {
    if (!user) {
      throw new Error("User not found");
    }

    if (!sessionId) {
      // If no sessionId is provided, create a new session
      sessionId = await addSessionToUser(user, inputMessage);
    }
    // Retrieve the conversation history for the specified session
    const session = await getSessionMessages(user._id, sessionId);
    console.log(session);

    // Check if session exists and has messages
    const previousMessages = session?.messages || [];

    // Format the messages to pass into the model
    const formattedMessages = previousMessages.map((msg) => ({
      role: msg.role,
      content: `User: ${user.name}, Home Location: ${msg.location}, Current Time: ${msg.timestamp}\nQuery: ${msg.content}`,
    }));

    // Use the LLM model to generate a response
    let result = await runAgent(user, inputMessage, formattedMessages);

    if (!result) {
      result =
        "Sorry, Weather AI is unavailable at the moment. Please try again later.";
    }

    // Save the assistant's response to the session
    await addMessageToSession(
      user._id,
      sessionId,
      { role: "user", content: inputMessage, location: user.location },
      { role: "assistant", content: result, location: user.location }
    );

    return {
      sessionId: session.session_id,
      sessionName: session.name,
      update_time: session.update_time,
      location: user.location,
      query: inputMessage,
      message: result,
    };
  } catch (error) {
    console.error("Error in queryExecute:", error);
    throw new Error(
      "An error occurred while processing your request. Please try again later."
    );
  }
};
