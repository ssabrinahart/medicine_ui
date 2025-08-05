import React, { useEffect, useState } from "react";
import "./Home.css";

function Home() {
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (username) {
      fetch(`http://localhost:5001/appointment/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (ok && data.appointment) {
            setAppointment(data.appointment);
          } else {
            console.warn(data.message || "No appointment found");
          }
        })
        .catch((err) => {
          console.error("Error fetching appointment:", err);
        });
    }
  }, []);

  const handleCancelAppointment = () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    fetch("http://localhost:5001/cancel-appointment", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }), 
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        alert(data.message);
        if (ok) setAppointment(null);
      })
      .catch((err) => {
        console.error("Error canceling appointment:", err);
      });
  };

  return (
    <div className="home-container">
      <div className="section">
        <h2>UPCOMING</h2>
        {appointment ? (
          <div className="appointment-card">
            <p>
              <strong>Day:</strong> {appointment.day}
            </p>
            <p>
              <strong>Time:</strong> {appointment.time}
            </p>
            <p>
              <strong>Location:</strong> {appointment.location}
            </p>
            <p>
              <strong>Provider:</strong> {appointment.provider}
            </p>

            <div className="action-buttons">
              <button
                className="edit-btn"
                onClick={() => (window.location.href = "/edit-appointment")}
              >
                Edit
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  handleCancelAppointment();
                  // setAppointment(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>No appointment scheduled yet.</p>
        )}
      </div>

      <div className="section">
        <h3>Reminder:</h3>
        <ul className="reminder-list">
          <li>Fill Out Medical History</li>
          <li>Pay before appointment</li>
          <li>Arrive 10 minutes early</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
