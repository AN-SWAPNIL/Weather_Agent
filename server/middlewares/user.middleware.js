import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

async function UserMiddleware(req, res, next) {
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: "User is blocked" });
    }
    // console.log("User found:", user);

    if (!req.body) {
      req.body = {};
    }
    req.body.user = user;
    return next();
  } catch (e) {
    console.error("Error in UserMiddleware:", e.message);
    if (!req.body) {
      req.body = {};
    }
    req.body.user = null;
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export default UserMiddleware;
