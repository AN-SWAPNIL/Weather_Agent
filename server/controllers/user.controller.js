// filepath: d:\Codes\SocioFi\Weather_Agent\server\controllers\user.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Route handler functions
export const getAllUsers = async (req, res, next) => {
  try {
    let users = await UserController.getUsers();
    res.json(users);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const registerUser = async (req, res, next) => {
  try {
    await UserController.createUser(req.body, (user) => {
      return res.json(user);
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const loginUser = async (req, res, next) => {
  try {
    console.log("Processing login request");
    const { email, password } = req.body;
    await UserController.login({ email, password }, (response) => {
      if (response.error) {
        return res.status(400).json({ message: response.error });
      }
      return res.json(response);
    });
  } catch (e) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const updateUserLocation = async (req, res, next) => {
  try {
    const { location, user } = req.body;
    await UserController.updateLocation(user._id, location);
    return res.json({ message: "Location updated successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const changeUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, user } = req.body;
    await UserController.changePassword(user._id, oldPassword, newPassword);
    return res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Core business logic
const UserController = {
  getUsers: async () => {
    try {
      let users = await User.find({});
      return users;
    } catch (e) {
      throw Error(e);
    }
  },

  createUser: async (body, callback) => {
    let { email, name, password } = body;
    const user = await User.findOne({ email });
    if (user) throw Error("User Already exists");

    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) throw err;
        let newUser = await User.create({ name, email, password: hash });
        callback(newUser);
      });
    });
  },

  login: async (body, callback) => {
    let { email, password } = body;
    try {
      const user = await User.findOne({ email });

      if (!user) {
        callback({ error: "User does not exist" });
        return;
      }

      bcrypt.compare(password, user.password, async (err, correct) => {
        if (err) {
          callback({ error: "Authentication error" });
          return;
        }

        if (correct) {
          const payload = { id: user.id };
          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "30d" },
            (err, token) => {
              if (err) {
                callback({ error: "Failed to generate token" });
                return;
              }
              callback({ user, token });
            }
          );
        } else {
          callback({ error: "Wrong password" });
        }
      });
    } catch (e) {
      callback({ error: e.message || "Authentication failed" });
    }
  },

  updateLocation: async (userId, location) => {
    try {
      await User.findByIdAndUpdate(userId, { location });
    } catch (e) {
      throw Error(e);
    }
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw Error("User not found");
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw Error("Old password is incorrect");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    user.password = hash;
    await user.save();
  },
};

export default UserController;
