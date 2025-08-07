import React from "react";
import "./Modal.css";

const Modal = ({ message, onClose, children }) => {
  if (!message) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <p>{message}</p>
        {children ? (
          <div className="modal-actions">{children}</div> // render passed buttons
        ) : (
          <button onClick={onClose}>OK</button> // fallback for info modals
        )}
      </div>
    </div>
  );
};

export default Modal;