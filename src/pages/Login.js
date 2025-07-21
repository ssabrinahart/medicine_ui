import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Modal from "../components/Modal";
import {jwtDecode} from "jwt-decode";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const token = data.token;
        const decoded = jwtDecode(token);
        const role = decoded.role; 

      
        localStorage.setItem("authToken", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", decoded.role);
      
        setAlertMessage("Login successful! Redirecting...");
      
        onLoginSuccess(); // Call this immediately
        console.log("Decoded JWT:", decoded);

        setTimeout(() => {
          setAlertMessage("");
          if (role === "admin") {
            console.log("Navigating to admin dashboard...");

            navigate("/admin-dashboard");
          } else {
            console.log("Navigating to profile dashboard...");

            navigate("/profile");
          }
        }, 1500);
      }
      else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
      <Modal message={alertMessage} onClose={() => setAlertMessage("")} />
    </div>
  );
}

export default Login;
