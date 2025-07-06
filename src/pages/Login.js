import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    
        // adding hardcoded user for now
        const validUser = {
          username: 'admin',
          password: 'admin123',
        };
    
        if (username === validUser.username && password === validUser.password) {
          localStorage.setItem('isLoggedIn', 'true'); // artificial authentication flag
          navigate('/profile'); // Redirect to profile page
        } else {
          setError('Invalid username or password');
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
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Login</button>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
          </form>
        </div>
      );
}
    
export default Login;