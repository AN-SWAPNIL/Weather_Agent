import express from "express";
import UserMiddleware from "../middlewares/user.middleware.js";
const router = express.Router();

import UserController from "../controllers/user.controller.js";

router.get("/", async (req, res, next) => {
  try {
    let users = await UserController.getUsers();
    res.json(users);
  } catch (e) {
    res.statusCode = 400;
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await UserController.createUser(req.body, (user) => {
      return res.json(user);
    });
  } catch (e) {
    res.statusCode = 400;
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    console.log("hello");

    const { email, password } = req.body;
    await UserController.login({ email, password }, (userWithToken) => {
      return res.json(userWithToken);
    });
  } catch (e) {
    res.statusCode = 400;
    next(e);
  }
});

router.post("/location", UserMiddleware, async (req, res, next) => {
  try {
    const { location, user } = req.body;
    // update user location by user._id
    await UserController.updateLocation(user._id, location);
    return res.json({ message: "Location updated successfully" });
  } catch (e) {
    res.statusCode = 400;
    next(e);
  }
});

router.post("/password", UserMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword, user } = req.body;
    await UserController.changePassword(user._id, oldPassword, newPassword);
    return res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.statusCode = 400;
    next(e);
  }
});

export default router;
