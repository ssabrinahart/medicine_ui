import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      const authToken = localStorage.getItem("authToken");

      // User is logged in if either flag exists
      const isAuthenticated = loggedInStatus || authToken;
      setIsLoggedIn(isAuthenticated);
    };

    checkAuthStatus();

    // Listen for storage changes (useful for logout in other tabs)
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  // Re-check auth status when location changes
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    const authToken = localStorage.getItem("authToken");
    const isAuthenticated = loggedInStatus || authToken;
    setIsLoggedIn(isAuthenticated);
  }, [window.location.pathname]);

  const handleLogout = () => {
    // Remove both authentication tokens
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");

    // Update local state
    setIsLoggedIn(false);

    // Navigate to login page
    navigate("/login");

    // Force a page refresh to ensure all components re-render with new auth state
    window.location.reload();
  };

  return (
    <header style={styles.header}>
      <h1>MediJane Consultation Services</h1>
      <ul id="primary-navigation">
        {isLoggedIn ? (
          <>
            <li>
              <NavLink to="/home" className="nav-link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/history" className="nav-link">
                History
              </NavLink>
            </li>
            <li>
              <NavLink to="/scheduling" className="nav-link">
                Scheduling
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className="nav-link">
                Profile
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-link logout-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login" className="login-button">
              Login
            </NavLink>
          </li>
        )}
      </ul>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "20px",
    textAlign: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
};

export default Header;
