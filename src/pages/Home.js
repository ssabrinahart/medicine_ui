import React, { useEffect, useState } from "react";
import Modal from "../components/Modal"; // make sure path is correct
import "./Home.css";

function Home() {
  const [appointment, setAppointment] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

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
    console.log("Cancel clicked!");

    fetch(`http://localhost:5001/cancel-appointment/${username}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setModalMessage(data.message);
        if (ok) {
          setAppointment(null);
        }
      })
      .catch((err) => {
        console.error("Error cancelling appointment:", err);
        setModalMessage("Error cancelling appointment.");
      })
      .finally(() => {
        setShowConfirmCancel(false);
      });
  };

  return (
    <div className="home-container">
      <div className="home-grid">
        {/* LEFT: service/goal info */}
        <section className="left-panel section info-card">
          <h2>About LeafRX</h2>
          <p>
            LeafRX connects patients with licensed providers for secure,
            streamlined virtual cannabis consultations.
          </p>
          <ul className="feature-list">
            <li>Book, edit, or cancel appointments in minutes</li>
            <li>Complete medical history securely</li>
            <li>Transparent pricing and reminders</li>
          </ul>
  
          <h3>Our Goal</h3>
          <p>
            Make medical cannabis access simple, safe, and compliant—so you can
            focus on feeling better.
          </p>
        </section>
  
        {/* RIGHT: appointments */}
        <section className="right-panel section info-card">
          <h2>UPCOMING</h2>
          <div className="appointment-card">
            {appointment ? (
              <>
                <p><strong>Day:</strong> {appointment.day}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
                <p><strong>Location:</strong> {appointment.location}</p>
                <p><strong>Provider:</strong> {appointment.provider}</p>

                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => (window.location.href = "/edit-appointment")}
                  >
                    Edit
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowConfirmCancel(true)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p>No appointment scheduled yet.</p>
            )}
          </div>

          <div className="section">
            <h3>Reminder:</h3>
            <ul className="feature-list">
            {!appointment && <li>Fill Out Medical History</li>}
              <li>Pay before appointment</li>
              <li>Arrive 10 minutes early</li>
            </ul>
          </div>
        </section>

      </div>
  
      {/* Confirmation Modal */}
      {showConfirmCancel && (
        <Modal
          message="Are you sure you want to cancel your appointment?"
          onClose={() => setShowConfirmCancel(false)}
        >
          <button className="confirm-btn" onClick={handleCancelAppointment}>
            Yes, Cancel
          </button>
        </Modal>
      )}
  
      {/* Info Modal */}
      {modalMessage && (
        <Modal message={modalMessage} onClose={() => setModalMessage("")} />
      )}
    </div>
  );
  
}

export default Home;
