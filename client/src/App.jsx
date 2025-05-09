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
        <PrivateRoute>
          <Route
            path="/weather"
            element={<Weather />}
          />
          <Route 
            path="/edit-password" 
            element={<EditPassword />} 
          />
        </PrivateRoute>
      </Routes>
    </Router>
  );
}
