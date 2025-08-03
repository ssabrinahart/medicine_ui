import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      const authToken = localStorage.getItem("authToken");
      const storedRole = localStorage.getItem("role");

      const isAuthenticated = loggedInStatus || authToken;
      setIsLoggedIn(isAuthenticated);
      setRole(storedRole || "");
    };

    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    const authToken = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");

    const isAuthenticated = loggedInStatus || authToken;
    setIsLoggedIn(isAuthenticated);
    setRole(storedRole || "");
  }, [window.location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole("");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header style={styles.header}>
      <img src="/logo.jpg" alt="LeafRX Logo" className="header-logo" />
      <h1>LeafRX Consultation Services</h1>
      <ul id="primary-navigation">
        {isLoggedIn ? (
          <>
            {role === "admin" ? (
              <>
                <li>
                  <NavLink to="/admin-dashboard" className="nav-link">
                    Dashboard
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink to="/admin--" className="nav-link">
                    Medical Histories
                  </NavLink>
                </li> */}
                {/* <li>
                  <NavLink to="/scheduling" className="nav-link">
                    Manage Patients
                  </NavLink>
                </li> */}
                <li>
                  <NavLink to="/profile" className="nav-link">
                    Profile
                  </NavLink>
                </li>
              </>
            ) : (
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
              </>
            )}
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
