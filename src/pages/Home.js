import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">

      <div className="section">
        <h2>UPCOMING</h2>
        <div className="appointment-card">
          <p><strong>Date:</strong> July 1, 2025</p>
          <p><strong>Time:</strong> 2:00 PM</p>
          <p><strong>Location:</strong> Zoom</p>
          <p><strong>Provider:</strong> Hiba M.</p>
        </div>
        <div className="action-buttons">
        <button className="edit-btn">Edit</button>
        <button className="cancel-btn">Cancel</button>
      </div>
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
