import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { CloudSun } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      const res = await AuthService.login(data);
      let user = JSON.stringify(res.user);
      window.localStorage.setItem("user", user);
      let token = res.token;
      window.localStorage.setItem("token", token);
      window.location.href = "/weather"; // Redirect to weather page after login
    } catch (e) {
      console.error("Login error:", e);
      setErrorMessage(e.message || "Failed to log in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-green-100 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <CloudSun className="h-12 w-12 text-blue-600 mb-4" />
          <div className="text-2xl font-bold text-gray-900">Log In</div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900"
              {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">Invalid email</span>
            )}
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900"
              {...register("password", { required: true, minLength: 6 })}
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                Password should include at least 6 characters
              </span>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-5 py-2 mt-4 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-lg font-bold shadow-lg hover:from-blue-800 hover:to-blue-500 transition border-2 border-blue-700"
          >
            Log In
          </button>

          {errorMessage && (
            <div className="mt-3 text-red-600 text-sm font-medium p-2 bg-red-50 rounded-md border border-red-200">
              {errorMessage}
            </div>
          )}
        </form>
        <button
          type="button"
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          onClick={() => navigate("/register")}
        >
          Don't have an account? Register
        </button>
      </div>
      {/* <footer className="mt-8 text-gray-500 text-sm text-center">
        Powered by OpenWeatherMap, Google Gemini, and ElevenLabs
      </footer> */}
    </div>
  );
}
