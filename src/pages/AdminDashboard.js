import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import WeeklyAvailabilityForm from "./WeeklyAvailabilityForm";
const localizer = momentLocalizer(moment);

function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);

  const [showModal, setShowModal] = useState(false); // availability form modal
  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    date: "",
    startTime: "",
    duration: 30,
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const [successMessage, setSuccessMessage] = useState("");

  // NEW: toggle state (default ON => show booked)
  const [showBooked, setShowBooked] = useState(true);

  const navigate = useNavigate();

  const fetchAppointments = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const apptResponse = await fetch(
        "http://localhost:5001/admin/patient-appointments",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (apptResponse.status === 403) {
        navigate("/unauthorized");
        return;
      }
      if (!apptResponse.ok) throw new Error("Failed to fetch appointments");
      const apptData = await apptResponse.json();
      const events = apptData.appointments.map((appt) => ({
        id: appt.id || `${appt.patient_id}-${appt.date}-${appt.time}`,
        title: appt.booked ? `Booked` : `Available`,
        start: new Date(`${appt.date}T${appt.time}`),
        end: new Date(
          new Date(`${appt.date}T${appt.time}`).getTime() + 30 * 60000
        ),
        patient_id: appt.patient_id,
        booked: appt.booked,
      }));

      setAppointments(events);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        let decoded;
        try {
          decoded = jwtDecode(token);
        } catch {
          navigate("/login");
          return;
        }

        if (!decoded.role || decoded.role.toLowerCase().trim() !== "admin") {
          navigate("/unauthorized");
          return;
        }

        await fetchAppointments();

        const userCountResponse = await fetch(
          "http://localhost:5001/admin/user-count",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!userCountResponse.ok)
          throw new Error("Failed to fetch user count");
        const userCountData = await userCountResponse.json();
        setUserCount(userCountData.count);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleViewHistory = async (patientId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (patientId === "system" || patientId === "admin") {
        throw new Error("Can't view medical histories of these users");
      }
      const response = await fetch(
        `http://localhost:5001/medical-history/${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch medical history");

      const data = await response.json();
      setSelectedPatient(patientId);
      setMedicalHistory(data.medical_history || []);
    } catch (error) {
      console.error("Error fetching medical history:", error);
      setMedicalHistory(null);
    }
  };

  const handleSelectEvent = (event) => {
    handleViewHistory(event.patient_id);
  };

  // Availability modal handlers
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAvailability = async ({ weekStartDate, availability }) => {
    const token = localStorage.getItem("authToken");
    await fetchAppointments();
    if (!token) {
      navigate("/login");
      return;
    }

    const allSlots = [];

    for (const day of Object.keys(availability)) {
      const daySlots = availability[day];
      for (const slot of daySlots) {
        if (!slot.start_time || !slot.duration) continue;

        const dayIndex = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ].indexOf(day);
        if (dayIndex === -1) continue;

        const [hours, minutes] = slot.start_time.split(":");
        const startDate = moment(weekStartDate)
          .add(dayIndex, "days")
          .hour(parseInt(hours, 10))
          .minute(parseInt(minutes, 10))
          .second(0)
          .millisecond(0)
          .toDate();

        const endDate = moment(startDate)
          .add(slot.duration, "minutes")
          .toDate();

        allSlots.push({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
      }
    }

    for (const slot of allSlots) {
      const response = await fetch(
        "http://localhost:5001/admin/create-appointment-time",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(slot),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create appointment slot");
      }
    }

    setSuccessMessage("Availability saved successfully");
    setShowModal(false);
    setTimeout(() => setSuccessMessage(""), 2000);

    await fetchAppointments();
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Booked view: true bookings and not 'system'
  // Free view: unbooked OR 'system'
  const filteredAppointments = appointments.filter((appt) =>
    showBooked
      ? appt.booked === true && appt.patient_id !== "system"
      : !appt.booked || appt.patient_id === "system"
  );

  // Build a stable composite key for each appt (patient + local time to minute)
  const makeListKey = (a) =>
    `${a.patient_id || "unknown"}-${moment(a.start)
      .tz("America/New_York")
      .format("YYYY-MM-DD-HH:mm")}`;

  // Deduplicate by that key
  const dedupedAppointments = React.useMemo(() => {
    const seen = new Set();
    return filteredAppointments.filter((a) => {
      const k = makeListKey(a);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [filteredAppointments]);

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Dashboard</h1>

      {userCount !== null && (
        <div style={styles.userCountCard}>
          <h2>Registered Users</h2>
          <p style={styles.userCountNumber}>{userCount}</p>
        </div>
      )}

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        Upcoming Patient Appointments
      </h2>

      <Calendar
        localizer={localizer}
        events={appointments}
        view={currentView}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        onView={(view) => setCurrentView(view)}
        defaultView="month"
        defaultDate={new Date()}
        views={["month", "week", "day"]}
        step={30}
        selectable
        startAccessor="start"
        endAccessor="end"
        min={moment.tz("1970-02-01 08:00", "America/New_York").toDate()}
        max={moment.tz("1970-02-01 22:00", "America/New_York").toDate()}
        style={{ height: 500, margin: "20px 0" }}
      />

      {/* Create availability modal */}
      <button style={styles.createAppointmentButton} onClick={openModal}>
        Create Appointment
      </button>

      {/* Header row with toggle */}
      <div style={{ marginTop: "2rem" }}>
        <div style={styles.appointmentsHeader}>
          <h3 style={{ margin: 0 }}>Upcoming Appointments List</h3>

          {/* Toggle switch + label */}
          <div style={styles.toggleWrap}>
            <button
              type="button"
              role="switch"
              aria-checked={showBooked}
              onClick={() => setShowBooked((v) => !v)}
              style={{
                ...styles.switchTrack,
                backgroundColor: showBooked ? "#4CAF50" : "#bbb",
              }}
            >
              <span
                style={{
                  ...styles.switchKnob,
                  transform: showBooked
                    ? "translateX(22px)"
                    : "translateX(0px)",
                }}
              />
            </button>
            <span style={styles.toggleLabel}>
              {showBooked ? "Booked appointments" : "Free appointments"}
            </span>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <p>No appointments to display.</p>
        ) : (
          <div style={styles.appointmentsList}>
            {dedupedAppointments.map((appt) => {
              const listKey = makeListKey(appt);
              return (
                <div
                  key={listKey}
                  style={styles.appointmentCard}
                  onClick={() => {
                    if (appt.patient_id === "system") {
                      setSelectedEvent(appt);
                      setShowCancelModal(true);
                    }
                  }}
                >
                  <div>
                    <strong>Patient ID:</strong> {appt.patient_id ?? "—"}
                  </div>
                  <div>
                    <strong>Time:</strong>{" "}
                    {moment(appt.start)
                      .tz("America/New_York")
                      .format("YYYY-MM-DD HH:mm")}
                  </div>
                  {appt.booked &&
                    appt.patient_id &&
                    appt.patient_id !== "system" && (
                      <button
                        style={styles.viewHistoryButton}
                        onClick={(e) => {
                          e.stopPropagation(); // so clicking this button doesn't also trigger cancel modal
                          handleViewHistory(appt.patient_id);
                        }}
                      >
                        View Medical History
                      </button>
                    )}
                </div>
              );
            })}
            {!showBooked && filteredAppointments.length > 0 && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.85rem",
                  marginTop: "0.3rem",
                }}
              >
                Click on a free appointment card to delete the appointment.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cancel appointment modal */}
      {showCancelModal && selectedEvent && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Cancel Appointment</h2>
            <p>
              Are you sure you want to cancel the appointment for{" "}
              <strong>{selectedEvent.title}</strong> on{" "}
              <strong>{selectedEvent.start.toLocaleString()}</strong>?
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("authToken");
                    const response = await fetch(
                      `http://localhost:5001/admin/delete-appointment/system`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (!response.ok)
                      throw new Error("Failed to cancel appointment");

                    setAppointments((prev) =>
                      prev.filter((appt) => appt.id !== selectedEvent.id)
                    );

                    setShowCancelModal(false);
                    setSelectedEvent(null);
                  } catch (error) {
                    console.error("Error cancelling appointment:", error);
                    alert("Failed to cancel appointment.");
                  }
                }}
                style={{
                  ...styles.modalActionButton,
                  ...styles.modalActionCancel,
                }}
              >
                Confirm Cancel
              </button>

              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedEvent(null);
                }}
                style={{
                  ...styles.modalActionButton,
                  ...styles.modalActionClose,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            margin: "1rem 0",
            padding: "0.5rem 1rem",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: "4px",
            border: "1px solid #c3e6cb",
          }}
        >
          {successMessage}
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <WeeklyAvailabilityForm onSubmit={handleSubmitAvailability} />
            <button
              type="button"
              onClick={closeModal}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Medical History modal */}
      {selectedPatient && medicalHistory && (
        <div
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="medical-history-title"
        >
          <div style={styles.modalLarge}>
            <div style={styles.modalHeader}>
              <h2 id="medical-history-title" style={{ margin: 0 }}>
                Medical History for {selectedPatient}
              </h2>
              <button
                aria-label="Close"
                onClick={() => {
                  setSelectedPatient(null);
                  setMedicalHistory(null);
                }}
                style={styles.modalCloseX}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              {medicalHistory.length === 0 ? (
                <p>No medical history records found.</p>
              ) : (
                medicalHistory.map((record) => (
                  <div key={record.id} style={styles.historyRecord}>
                    <p>
                      <strong>Name:</strong> {record.first_name}{" "}
                      {record.last_name}
                    </p>
                    <p>
                      <strong>DOB:</strong> {record.birth_date}
                    </p>
                    <p>
                      <strong>Gender:</strong> {record.gender}
                    </p>
                    <p>
                      <strong>Allergies:</strong> {record.allergies}
                    </p>
                    <p>
                      <strong>Medications:</strong> {record.medications}
                    </p>
                    <p>
                      <strong>Conditions:</strong> {record.conditions}
                    </p>
                    <p>
                      <strong>Injuries:</strong> {record.injuries}
                    </p>
                    <p>
                      <strong>Cannabis Use:</strong>{" "}
                      {record.has_used_cannabis ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Reason for Visit:</strong>{" "}
                      {record.reason_for_visit}
                    </p>
                    <p>
                      <strong>Comments:</strong> {record.additional_comments}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.submitButton}
                onClick={() => {
                  setSelectedPatient(null);
                  setMedicalHistory(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  // Add this in styles:
  modalActionButton: {
    minWidth: "130px", // ensures same width
    padding: "0.6rem 1.2rem", // same padding for both
    fontSize: "1rem",
    fontWeight: "bold",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textAlign: "center",
  },

  // Keep the color variations:
  modalActionCancel: {
    backgroundColor: "#d9534f",
  },
  modalActionClose: {
    backgroundColor: "#4CAF50",
  },

  container: {
    padding: "2rem 1rem",
    maxWidth: "900px",
    margin: "0 auto",
    boxSizing: "border-box",
    minHeight: "100vh",
    paddingBottom: "80px",
    overflowX: "hidden",
  },
  header: { textAlign: "center", marginBottom: "1.5rem" },
  cancelButton: {
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  historyContainer: {
    marginTop: "2rem",
    backgroundColor: "#f0f0f0",
    padding: "1rem",
    borderRadius: "8px",
  },
  historyRecord: { marginBottom: "1rem" },
  userCountCard: {
    marginBottom: "1.5rem",
    padding: "1.5rem",
    backgroundColor: "#e0f7fa",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  userCountNumber: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "0.2rem 0",
  },
  createAppointmentButton: {
    marginTop: "1.5rem",
    padding: "0.6rem 1.2rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    display: "block",
    width: "fit-content",
  },
  appointmentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  appointmentCard: {
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  viewHistoryButton: {
    padding: "0.4rem 0.8rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    borderRadius: "4px",
    border: "1px solid #4CAF50",
    backgroundColor: "#4CAF50",
    color: "white",
    whiteSpace: "nowrap",
  },

  // Row for "Upcoming Appointments List" + toggle
  appointmentsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "0.75rem",
  },

  // Toggle UI
  toggleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  switchTrack: {
    position: "relative",
    width: "44px",
    height: "24px",
    borderRadius: "9999px",
    border: "none",
    cursor: "pointer",
    padding: 0,
    outline: "none",
    transition: "background-color 0.2s ease",
  },
  switchKnob: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease",
  },
  toggleLabel: {
    fontSize: "0.95rem",
    userSelect: "none",
  },

  /* Modal base */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
    boxSizing: "border-box",
  },
  modal: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  /* Larger modal for medical history */
  modalLarge: {
    backgroundColor: "white",
    borderRadius: "10px",
    width: "min(800px, 95vw)",
    maxHeight: "90vh",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    padding: "1rem 1rem 0.75rem",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.5rem 0.25rem 0.75rem",
    borderBottom: "1px solid #eee",
  },
  modalCloseX: {
    appearance: "none",
    background: "transparent",
    border: "none",
    fontSize: "1.75rem",
    lineHeight: 1,
    cursor: "pointer",
    padding: 0,
    margin: 0,
  },
  modalBody: {
    overflowY: "auto",
    padding: "1rem 0.25rem",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "0.5rem",
    padding: "0.75rem 0.25rem 1rem",
    borderTop: "1px solid #eee",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
};

export default AdminDashboard;
