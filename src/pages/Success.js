import { useEffect, useRef, useState } from "react";

function Success() {
  const sentRef = useRef(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success"); // 'success' or 'error'

  useEffect(() => {
    const appointment = JSON.parse(localStorage.getItem("pendingAppointment"));
    if (!appointment || sentRef.current) return;
    sentRef.current = true;

    fetch("http://localhost:5001/book-appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    })
      .then((res) => res.json())
      .then(() => {
        localStorage.removeItem("pendingAppointment");
        setModalType("success");
        setModalMessage("Appointment booked successfully!");
      })
      .catch((err) => {
        console.error(err);
        setModalType("error");
        setModalMessage("Something went wrong while booking the appointment.");
      });
  }, []);

  const closeModal = () => {
    setModalMessage("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Payment Successful</h2>
      <p>Your appointment has been booked! Check your email for confirmation.</p>

      {/* Inline Modal */}
      {modalMessage && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3>{modalType === "success" ? "Success!" : "Error..."}</h3>
            <p>{modalMessage}</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Success;

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
