import React from "react";
import "./Modal";


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
  width: 420,
  padding: 20,
  background: "white",
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const Modal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={modalBackdrop}>
      <div style={modalBox}>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Modal;

