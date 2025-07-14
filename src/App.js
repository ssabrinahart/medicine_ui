import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Scheduling from "./pages/Scheduling";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import PatientQuestions from "./pages/PatientQuestions";
import Register from "./pages/Register";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check both the header's flag and the auth token
      const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      const authToken = localStorage.getItem("authToken");

      if (loggedInStatus || authToken) {
        setIsAuthenticated(true);
        // Sync the two localStorage values
        if (authToken && !loggedInStatus) {
          localStorage.setItem("isLoggedIn", "true");
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuthStatus();

    // Listen for storage changes to handle logout from header
    window.addEventListener("storage", checkAuthStatus);

    // Custom event listener for logout
    const handleLogout = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  // Function to handle login success
  const handleLoginSuccess = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsAuthenticated(true);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Header />
      <main style={{ padding: "20px", paddingBottom: "60px" }}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Register />
            }
          />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <PatientQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scheduling"
            element={
              <ProtectedRoute>
                <Scheduling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
