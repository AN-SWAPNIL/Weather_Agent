import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "72px", color: "#ff6b6b" }}>404</h1>
      <p style={{ fontSize: "24px", color: "#555" }}>Oops! The page you're looking for doesn't exist.</p>
      <button
        onClick={handleGoHome}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          color: "#fff",
          backgroundColor: "#007bff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Go Back to Home
      </button>
    </div>
  );
}