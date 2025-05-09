import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // Import uuid library

// Define the schema for messages within a session
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  location: { type: String, default: "Dhaka, Bangladesh" }, // Location of the session (e.g., "New York", "London")
  timestamp: { type: Date, default: Date.now },
});

// Define the schema for each session
const sessionSchema = new mongoose.Schema({
  session_id: { type: String, required: true, unique: true, default: uuidv4 }, // Auto-generate session ID
  update_time: { type: Date, default: Date.now }, // Timestamp of the last update
  name: { type: String, required: true }, // Name of the session (e.g., "Weather", "Booking")
  messages: [messageSchema], // Embed messages within each session
});

// Define the schema for storing conversation history
const conversationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
  sessions: [sessionSchema], // Embed session documents as an array
});

// Create the models
const Conversation = mongoose.model("Conversation", conversationSchema);
const Session = mongoose.model("Session", sessionSchema);

export default Conversation;
