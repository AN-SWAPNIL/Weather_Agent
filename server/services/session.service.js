import e from "express";
import Conversation from "../models/conversation.model.js";
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique session IDs

// Function to add a session to a user's conversation
export const addSessionToUser = async (user, sessionName) => {
  let conversation = await Conversation.findOne({ user_id: user._id });

  if (!conversation) {
    conversation = new Conversation({ user_id: user._id, sessions: [] });
  }

  // Create a new session
  const newSession = {
    session_id: uuidv4(), // Generate a unique session ID
    name: sessionName,
    location: user.location, // Assuming user has a location property
    messages: [],
  };

  // Add the session to the conversation
  conversation.sessions.push(newSession);

  // Save the conversation with the new session
  await conversation.save();
  console.log(`Session '${sessionName}' added to user ${user._id}`);

  return newSession.session_id; // Return the generated session ID
};

/*
await addMessageToSession(user._id, sessionId, [
        { role: "user", content: inputMessage },
        { role: "assistant", content: result },
    ]);
    */
// Function to add messages to a session
export const addMessageToSession = async (
  userId,
  sessionId,
  userState,
  assistantState
) => {
  const conversation = await Conversation.findOne({ user_id: userId });

  if (!conversation) {
    console.log("Conversation not found");
    return;
  }

  const session = conversation.sessions.find(
    (sess) => sess.session_id === sessionId
  );

  if (!session) {
    console.log("Session not found");
    return;
  }

  session.messages.push(userState);
  session.messages.push(assistantState);

  session.update_time = Date.now(); // Update the last update time

  await conversation.save();
  console.log(`Message added to session ${sessionId}`);
};

// Function to retrieve session messages
export const getSessionMessages = async (userId, sessionId) => {
  const conversation = await Conversation.findOne({ user_id: userId });

  if (!conversation) {
    console.log("Conversation not found");
    return [];
  }

  const session = conversation.sessions.find(
    (sess) => sess.session_id === sessionId
  );
  if (!session) {
    console.log("Session not found");
    return [];
  }

  return session;
};

export const getAllSessions = async (userId) => {
  const conversation = await Conversation.findOne({ user_id: userId });

  if (!conversation) {
    console.log("Conversation not found");
    return [];
  }

  return conversation.sessions;
}

export const deleteSession = async (userId, sessionId) => {
  const conversation = await Conversation.findOne({ user_id: userId });

  if (!conversation) {
    console.log("Conversation not found");
    return false;
  }

  const sessionIndex = conversation.sessions.findIndex(
    (sess) => sess.session_id === sessionId
  );

  if (sessionIndex === -1) {
    console.log("Session not found");
    return false;
  }

  // Remove the session from the array
  conversation.sessions.splice(sessionIndex, 1);

  await conversation.save();
  console.log(`Session ${sessionId} deleted`);
  return true;
}