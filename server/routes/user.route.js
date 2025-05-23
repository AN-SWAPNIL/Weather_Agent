// filepath: d:\Codes\SocioFi\Weather_Agent\server\routes\user.route.js
import express from "express";
import UserMiddleware from "../middlewares/user.middleware.js";
import {
  getAllUsers,
  registerUser,
  loginUser,
  updateUserLocation,
  changeUserPassword
} from "../controllers/user.controller.js";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Register a new user
router.post("/", registerUser);

// Login user
router.post("/login", loginUser);

// Update user location
router.post("/location", UserMiddleware, updateUserLocation);

// Change user password
router.post("/password", UserMiddleware, changeUserPassword);

export default router;
