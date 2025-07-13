import React, { useEffect, useState } from 'react';
import './Home.css';

function Home() {
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('appointment');
    if (saved) {
      setAppointment(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="home-container">
      <div className="section">
        <h2>UPCOMING</h2>
        {appointment ? (
          <div className="appointment-card">
            <p><strong>Day:</strong> {appointment.day}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            <p><strong>Location:</strong> {appointment.location}</p>
            <p><strong>Provider:</strong> {appointment.provider}</p>

            <div className="action-buttons">
              <button
                className="edit-btn"
                onClick={() => window.location.href = "/scheduling"}
              >
                Edit
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  localStorage.removeItem('appointment');
                  setAppointment(null);
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
