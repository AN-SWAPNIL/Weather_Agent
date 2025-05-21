import express from "express";
import {
  transcribeAudio,
  synthesizeSpeech,
  queryAudioFile,
} from "../controllers/audio.controller.js";
import { upload } from "../controllers/upload.controller.js";
import UserMiddleware from "../middlewares/user.middleware.js";

const router = express.Router();

router.use(UserMiddleware);

// Azure Speech to Text route
router.post("/transcribe", upload.single("audio"), transcribeAudio);

// Azure Text to Speech route
router.post("/synthesize", synthesizeSpeech);

// File upload audio query route (multipart/form-data)
router.post("/query", upload.single("audio"), queryAudioFile);

export default router;
