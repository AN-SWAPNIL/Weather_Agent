import express from "express";
import { queryExecutor } from "../controllers/weather.controller.js";
import { getAllSessions, getSessionMessages, deleteSession } from "../services/session.service.js";
// import { saveQueryToHistory, getQueryHistory } from "../utils/database.js";
// import { processTextToSpeech } from "../audio/textToSpeech.js";
import UserMiddleware from "../middlewares/user.middleware.js";

const router = express.Router();

router.use(UserMiddleware);

router.post("/query", async (req, res) => {
  try {
    const { query, user, sessionId } = req.body;
    console.log(req.body);
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    if (!user) {
      return res.status(400).json({ error: "User information is required" });
    }
    // const { name, location } = user;

    // console.log(query, name, location);

    console.log(
      `Processing weather query: "${query}" for location: ${
        user.location || "default"
      }`
    );

    const response = await queryExecutor(user, sessionId, query);
    console.log("Query processed successfully:", response);

    // Save query to history
    // await saveQueryToHistory(query, response.text, location);

    return res.json(response);
  } catch (error) {
    console.error("Error processing query:", error);
    return res.status(500).json({
      error: "Failed to process your request",
      message: error.message,
    });
  }
});

// // Route to convert text to speech
// router.post("/speak", async (req, res) => {
//   try {
//     const { text } = req.body;

//     if (!text) {
//       return res.status(400).json({ error: "Text is required" });
//     }

//     console.log(
//       "Processing text-to-speech request for:",
//       text.substring(0, 50) + "..."
//     );

//     const audioUrl = await processTextToSpeech(text);
//     console.log("Text-to-speech processed successfully, audio URL:", audioUrl);

//     return res.json({ audioUrl });
//   } catch (error) {
//     console.error("Error processing text-to-speech:", error);
//     return res.status(500).json({
//       error: "Failed to convert text to speech",
//       message: error.message,
//     });
//   }
// });

// Route to get query history
router.get("/history", async (req, res) => {
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
});

router.get("/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await getSessionMessages(req.body.user._id, sessionId);
    return res.json(messages);
  } catch (error) {
    console.error("Error fetching session messages:", error);
    return res.status(500).json({ error: "Failed to fetch session messages" });
  }
});

router.delete("/history/:sessionId", async (req, res) => {
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
});

export default router;
