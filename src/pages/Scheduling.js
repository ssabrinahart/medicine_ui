import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Scheduling.css";
import { loadStripe } from "@stripe/stripe-js";

const localizer = momentLocalizer(moment);
const stripePromise = loadStripe(
  "pk_test_51RoSnM49gGgKNzjtMLEgS2QgadVZVAbvA1kPbeK5Iu76PEI9chyt1NGYCxhOmrT2dQux3mzQrTq3eptsarYN8sMA00NEhwM5IE"
);

function Scheduling() {
  const [appointments, setAppointments] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch all appointment times
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          "http://localhost:5001/get-appointment-times",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch appointments");

        const data = await response.json();

        const events = data.appointments.map((appt) => {
          const startDateTime = new Date(`${appt.date}T${appt.time}`);
          const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 min slots

          return {
            id: `${appt.date}-${appt.time}`,
            title: appt.patient_id !== "system" ? "BOOKED" : `Book`,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            booked: appt.patient_id !== "system",
          };
        });
        console.log("events " + JSON.stringify(events));
        setAppointments(events);
      } catch (error) {
        console.error("Error fetching appointments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleSelectSlot = (slotInfo) => {
    console.log("slot info " + JSON.stringify(slotInfo));
    const overlapping = appointments.some(
      (appt) =>
        slotInfo.start < appt.end && slotInfo.end > appt.start && appt.booked
    );
    if (overlapping) {
      alert("This time slot is already booked.");
      return;
    }
    setSelectedSlot({
      day: moment(slotInfo.start).format("YYYY-MM-DD"),
      time: moment(slotInfo.start).format("HH:mm"),
      start: slotInfo.start,
      end: slotInfo.end,
    });
  };

  // Check medical history for the current user
  const checkMedicalHistory = async () => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("authToken");
    if (!username) {
      // No username: force login or redirect to med history page
      alert("Please log in to book an appointment.");
      window.location.href = "/login";
      return false;
    }

    try {
      const resp = await fetch(
        `http://localhost:5001/medical-history/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resp.status === 200) {
        // Medical history exists
        return true;
      } else if (resp.status === 404) {
        // No medical history
        return false;
      } else {
        // other server error — treat as missing and redirect
        console.warn("Unexpected medical history response", resp.status);
        return false;
      }
    } catch (err) {
      console.error("Error checking medical history", err);
      return false;
    }
  };

  // open the modal (user clicked Book & Pay) — but first check medical history
  const openConfirmModal = async () => {
    if (!selectedSlot) {
      alert("Please select a time slot.");
      return;
    }

    const hasHistory = await checkMedicalHistory();
    if (!hasHistory) {
      alert(
        "You must complete your medical history before booking. Redirecting..."
      );
      // Redirect to your medical history page (adjust path if needed)
      window.location.href = "/history";
      return;
    }

    setShowModal(true);
  };

  // Called when user confirms in the modal
  const confirmAndStartPayment = async () => {
    if (!selectedSlot) return;
    setModalLoading(true);

    const appointment = {
      day: selectedSlot.day,
      time: selectedSlot.time,
      location: "Virtual",
      provider: "Admin",
      username: localStorage.getItem("username"),
    };

    try {
      const response = await fetch(
        "http://localhost:5001/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointment),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to create Stripe session");
      }

      const data = await response.json();
      if (data.url) {
        // save appointment so you can finalize booking after Stripe success
        localStorage.setItem("pendingAppointment", JSON.stringify(appointment));
        // redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      alert("Error initiating payment. Please try again.");
      setModalLoading(false);
      setShowModal(false);
    }
  };

  // close modal and stop any loading
  const closeModal = () => {
    setShowModal(false);
    setModalLoading(false);
  };

  if (loading) return <div>Loading available appointments...</div>;

  return (
    <div className="scheduling-container">
      <h2>Schedule Your Consultation</h2>
      <Calendar
        localizer={localizer}
        events={appointments}
        defaultView="month"
        defaultDate={new Date()}
        views={["month", "week", "day"]}
        step={30}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => {
          console.log("event selected", event);
          setSelectedSlot({
            day: moment(event.start).format("YYYY-MM-DD"),
            time: moment(event.start).format("HH:mm"),
            start: event.start,
            end: event.end,
          });
        }}
        startAccessor="start"
        endAccessor="end"
        min={new Date(1970, 1, 1, 8, 0)}
        max={new Date(1970, 1, 1, 22, 0)}
        style={{ height: 500, margin: "20px 0" }}
      />

      {selectedSlot && (
        <div>
          <p className="selected-slot">
            🗓️ Selected Slot: <br />
            <strong>
              {selectedSlot.day} at {selectedSlot.time}
            </strong>
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={openConfirmModal}>Book & Pay</button>
            <button onClick={() => setSelectedSlot(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3>Payment required</h3>
            <p>
              You must pay to confirm this booking. Click{" "}
              <strong>Confirm &amp; Pay</strong> to proceed to Stripe, or{" "}
              <strong>Cancel</strong> to choose another slot.
            </p>

            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button onClick={closeModal} disabled={modalLoading}>
                Cancel
              </button>
              <button onClick={confirmAndStartPayment} disabled={modalLoading}>
                {modalLoading ? "Redirecting..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduling;

/* minimal inline styles — you can move these to Scheduling.css */
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
};

