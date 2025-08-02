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

  // ✅ Fetch all appointment times
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
          const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // ✅ 30 min slots

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

  // ✅ Handle booking + Stripe payment
  const handlePaymentAndBooking = async () => {
    console.log("payment");
    if (!selectedSlot) {
      alert("Please select a time slot.");
      return;
    }

    const appointment = {
      day: selectedSlot.day,
      time: selectedSlot.time,
      location: "Zoom",
      provider: "Hiba M.",
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

      const data = await response.json();
      if (data.url) {
        localStorage.setItem("pendingAppointment", JSON.stringify(appointment));
        window.location.href = data.url;
      } else {
        alert("Failed to create Stripe session");
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      alert("Error initiating payment. Please try again.");
    }
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
          <button onClick={handlePaymentAndBooking}>Book & Pay</button>
          <button onClick={() => setSelectedSlot(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Scheduling;
