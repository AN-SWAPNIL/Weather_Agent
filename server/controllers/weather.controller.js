import {
  getSessionMessages,
  addMessageToSession,
  addSessionToUser,
} from "../services/session.service.js";
import { runAgent } from "../services/weather.service.js";

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

    // Add the new user message to the conversation history
    // formattedMessages.push({ role: "user", content: inputMessage });

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
