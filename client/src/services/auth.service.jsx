import axios from "axios";

const AuthService = {
  login: async (data) => {
    try {
      const res = await axios.post("http://localhost:4000/users/login", data);

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
      const res = await axios.post("http://localhost:4000/users", data);
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
};

export default AuthService;
