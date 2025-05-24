import axios from "axios";
import config from "../config/api.config";

const API_URL = config.apiUrl;

const AuthService = {
  login: async (data) => {
    try {
      const res = await axios.post(`${API_URL}/users/login`, data);

      // If there's an error message in the response
      if (res.data && res.data.error) {
        throw new Error(res.data.error);
      }

      if (res.data && res.data.message) {
        throw new Error(res.data.message);
      }

      return res.data;
    } catch (e) {
      console.log(e);
      // Throw the error with more details
      if (e.response) {
        // Server responded with an error status
        throw new Error(
          e.response.data.message ||
            "Authentication failed. Please check your credentials."
        );
      } else if (e.request) {
        // Request was made but no response
        throw new Error("Server unavailable. Please try again later.");
      } else {
        // Something else caused the error or it's already an Error object
        throw e.message ? e : new Error("Login failed. Please try again.");
      }
    }
  },

  register: async (data) => {
    try {
      console.log(data);
      const res = await axios.post(`${API_URL}/users`, data);
      return res.data;
    } catch (e) {
      console.log(e);
      // Throw the error with more details
      if (e.response) {
        // Server responded with an error
        throw new Error(
          e.response.data.message || "Registration failed. Please try again."
        );
      } else if (e.request) {
        // Request was made but no response
        throw new Error("Server unavailable. Please try again later.");
      } else {
        // Something else caused the error
        throw new Error("Registration failed. Please try again.");
      }
    }
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `${API_URL}/users/password`,
        { oldPassword, newPassword },
        {
          headers: { "Content-Type": "application/json", authorization: token },
        }
      );
      // Handle potential error message in response
      if (res.data && res.data.error) {
        throw new Error(res.data.error);
      }
      return res.data;
    } catch (e) {
      console.log(e);
      if (e.response) {
        // Server responded with an error
        throw new Error(
          e.response.data.message || "Failed to update password."
        );
      } else if (e.request) {
        // Request was made but no response
        throw new Error("Server unavailable. Please try again later.");
      } else {
        // Something else caused the error
        throw e.message
          ? e
          : new Error("Password update failed. Please try again.");
      }
    }
  },
};

export default AuthService;
