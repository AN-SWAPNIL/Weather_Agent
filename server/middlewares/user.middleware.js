import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

async function UserMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error("No authorization header provided");
    return res.status(401).json({ error: "Authorization header is required" });
  }

  // Extract token from "Bearer token" format if needed
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

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
    req.body = { ...req.body, user: user };

    // Also set req.user for standard middleware pattern
    req.user = user;

    console.log("Request updated with user information");

    return next();
  } catch (e) {
    console.error("Error in UserMiddleware:", e.message);
    if (!req.body) {
      req.body = {};
    }
    req.body = { ...req.body, user: null };
    req.user = null;
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export default UserMiddleware;
