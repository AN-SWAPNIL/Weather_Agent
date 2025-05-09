import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Weather from "./pages/weather";
import EditPassword from "./pages/edit-password";
import NotFound from "./pages/NotFound"; // Import the NotFound component

function PrivateRoute({ children }) {
  const user = window.localStorage.getItem("user");
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const user = window.localStorage.getItem("user");
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/weather" /> : <Home />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/weather" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/weather" /> : <Register />}
        />
        <Route
          path="/weather"
          element={
            <PrivateRoute>
              <Weather />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-password"
          element={
            <PrivateRoute>
              <EditPassword />
            </PrivateRoute>
          }
        />
        {/* Default 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}