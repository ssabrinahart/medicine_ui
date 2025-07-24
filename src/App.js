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
import AdminDashboard from "./pages/AdminDashboard";
import AdminHistory from "./pages/AdminHistory";
import Success from "./pages/Success";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole("");
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      const authToken = localStorage.getItem("authToken");
      const storedRole = localStorage.getItem("role");

      if (loggedInStatus || authToken) {
        setIsAuthenticated(true);
        setRole(storedRole);
        if (authToken && !loggedInStatus) {
          localStorage.setItem("isLoggedIn", "true");
        }
      } else {
        setIsAuthenticated(false);
        setRole("");
      }

      setLoading(false);
    };

    checkAuthStatus();

    window.addEventListener("storage", checkAuthStatus);
    window.addEventListener("logout", handleLogout); // ✅ use here

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("logout", handleLogout); // ✅ and here
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
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Register />
            }
          />
          <Route path="/success" element={<Success />} />

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
            path="/admin-history"
            element={
              <ProtectedRoute>
                <AdminHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/patient/:patientId" 
          element={<ProtectedRoute>
            < AdminHistory />
            </ProtectedRoute>
          } />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={
                  localStorage.getItem("role") === "admin"
                    ? "/admin-dashboard"
                    : "/home"
                } replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
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
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
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
