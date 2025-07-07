import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on component mount
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
  }, [window.location.pathname]); // Re-check on route change

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/login');
  };

    return (
    <header style={styles.header}>
      <h1>MediJane Consultation Services</h1>
      <ul id="primary-navigation">
        <li><NavLink to="/home" className="nav-link">Home</NavLink></li>
        <li><NavLink to="/history" className="nav-link">History</NavLink></li>
        <li><NavLink to="/scheduling" className="nav-link">Scheduling</NavLink></li>
        <li><NavLink to="/profile" className="nav-link">Profile</NavLink></li>
        {isLoggedIn ? (
          <li><button onClick={handleLogout} className="nav-link logout-button">Logout</button></li>
        ) : (
          <li><NavLink to="/login" className="login-button">Login</NavLink></li>
        )}
      </ul>
    </header>
  );
}


const styles = {
  header: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
  }
};


export default Header;
