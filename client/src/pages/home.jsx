import { Link } from "react-router-dom";
import { CloudSun } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-green-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <CloudSun className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">
            Weather AI Assistant
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-xl">
            Your personal weather companion powered by AI. Get accurate
            forecasts, detailed weather updates, and conversational answers
            about any location across the globe.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
          <Link to="/login" className="flex-1">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-lg font-bold text-lg shadow-lg hover:from-blue-800 hover:to-blue-500 transition border-2 border-blue-700">
              Sign In
            </button>
          </Link>
          <Link to="/register" className="flex-1">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-lg font-bold text-lg shadow-lg hover:from-green-700 hover:to-green-500 transition border-2 border-green-600">
              Create Account
            </button>
          </Link>
        </div>
        <div className="mt-10 w-full flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Features</h2>
          <div className="bg-blue-50 p-4 rounded-lg w-full">
            <ul className="list-disc text-gray-700 pl-6 text-left max-w-xl">
              <li>Real-time weather updates for any location worldwide</li>
              <li>
                Detailed forecasts with temperature, precipitation, and wind
                data
              </li>
              <li>Personalized chat experience with conversation history</li>
              <li>Voice interaction for hands-free weather queries</li>
              <li>Save your default location for faster access</li>
            </ul>
          </div>
        </div>
        <footer className="mt-5 text-gray-500 text-sm text-center">
        <div className="mb-2">
          Developed by{" "} <strong>Ahmmad Nur Swapnil</strong>
        </div>
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com/AN-SWAPNIL"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/ahmmad-nur-swapnil-44599a227/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            LinkedIn
          </a>
          <a
            href="https://www.youtube.com/@an_swapnil9029"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            YouTube
          </a>
        </div>
      </footer>
      </div>
      
    </div>
  );
}
