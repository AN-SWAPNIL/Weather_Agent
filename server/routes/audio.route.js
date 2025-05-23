import express from "express";
import {
  handleTranscribeAudio,
  handleSynthesizeSpeech,
  handleAudioQuery,
} from "../controllers/audio.controller.js";
import UserMiddleware from "../middlewares/user.middleware.js";

const router = express.Router();

router.use(UserMiddleware);

// Azure Speech to Text route
router.post("/transcribe", handleTranscribeAudio);

// Azure Text to Speech route
router.post("/synthesize", handleSynthesizeSpeech);

// File upload audio query route
router.post("/query", handleAudioQuery);

export default router;
