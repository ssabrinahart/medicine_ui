import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+{}\[\]:;"'|\\<>,.?/~`-]/.test(password);
    const isLongEnough = password.length >= 8;

    return (
      hasLowercase &&
      hasUppercase &&
      hasNumber &&
      hasSpecial &&
      isLongEnough
    );
  };

  const closeModal = () => {
    setShowModal(false);
    navigate("/login");
  };


  const validateEmail = email => {
    if (!email) return true // allow empty if optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = phone => {
    if (!phone) return true // allow empty if optional
    const phoneRegex = /^\+?[1-9]\d{1,14}$/ // basic E.164 international format
    return phoneRegex.test(phone)
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validatePassword(password)) {
      setError("Password Invalid");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    if (!validatePhone(phonenumber)) {
      setError("Invalid phone number format");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          phone: phonenumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(true);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="regText">Username</div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div className="regText">Phone Number</div>
        <PhoneInput
          defaultCountry="US"
          placeholder="Enter phone number"
          value={phonenumber}
          onChange={setPhoneNumber}
          required
        />

        <div className="regText">Email</div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="regText">Password</div>
        <div className="passText">
          Password must be at least 8 characters and include an uppercase letter,
          lowercase letter, number, and special character.
        </div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        {error && (
          <p className="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>

      {/* Inline Modal */}
      {showModal && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3>🎉 Registration Successful</h3>
            <p>Your account has been created. You may now log in.</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;

// Inline styles 
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalBox = {
  width: 400,
  padding: 20,
  background: "white",
  borderRadius: 10,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  textAlign: "center",
};
