// filepath: d:\Codes\SocioFi\Weather_Agent\server\routes\weather.route.js
import express from "express";
import {
  handleWeatherQuery,
  getAllSessionHistory,
  getSessionHistoryById,
  deleteSessionById
} from "../controllers/weather.controller.js";
import UserMiddleware from "../middlewares/user.middleware.js";

const router = express.Router();

router.use(UserMiddleware);

// Process weather query
router.post("/query", handleWeatherQuery);

// Get all sessions for the user
router.get("/history", getAllSessionHistory);

// Get messages for a specific session
router.get("/history/:sessionId", getSessionHistoryById);

// Delete a specific session
router.delete("/history/:sessionId", deleteSessionById);

export default router;
