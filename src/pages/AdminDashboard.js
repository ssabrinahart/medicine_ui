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
  const [showModal, setShowModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    date: "",
    startTime: "",
    duration: 30, // in minutes
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const [successMessage, setSuccessMessage] = useState("");

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
      end: new Date(new Date(`${appt.date}T${appt.time}`).getTime() + 30 * 60000),
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
        await fetchAppointments;

        // Fetch appointments
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

        console.log("time " + JSON.stringify(apptData.time));
        const events = apptData.appointments.map((appt) => ({
          id: appt.id || `${appt.patient_id}-${appt.date}-${appt.time}`,
          title: appt.booked ? `Booked` : `Available`,
          start: new Date(`${appt.date}T${appt.time}`),
          end: new Date(new Date(`${appt.date}T${appt.time}`).getTime() + 30 * 60000),
          patient_id: appt.patient_id,
          booked: appt.booked,
        }));

        console.log("appointments " + JSON.stringify(events));
        setAppointments(events);

        // Fetch user count
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

  // Modal handlers
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
  
        const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].indexOf(day);
        if (dayIndex === -1) continue;

        const [hours, minutes] = slot.start_time.split(":");
        const startDate = moment(weekStartDate)
          .add(dayIndex, "days")
          .hour(parseInt(hours, 10))
          .minute(parseInt(minutes, 10))
          .second(0)
          .millisecond(0)
          .toDate();
        
        const endDate = moment(startDate).add(slot.duration, "minutes").toDate();
        
        allSlots.push({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
      }
    }
  
    for (const slot of allSlots) {
      const response = await fetch("http://localhost:5001/admin/create-appointment-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(slot),
      });
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
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}

        date={currentDate}                     // controlled current date
        view={currentView}                     // controlled current view
        onNavigate={(date) => setCurrentDate(date)}
      />
      <div style={{ marginTop: "2rem" }}>
        <h3>Upcoming Appointments List</h3>
        {appointments.length === 0 ? (
          <p>No appointments scheduled.</p>
        ) : (
          <div style={styles.appointmentsList}>
            {appointments.map((appt) => (
              <div key={appt.id} style={styles.appointmentCard}>
                <div>
                  <strong>Patient ID:</strong> {appt.patient_id}
                </div>
                <div>
                  <strong>Time:</strong>{" "}
                  {moment(appt.start).tz("America/New_York").format("YYYY-MM-DD HH:mm")}
                </div>
                <button
                  style={styles.viewHistoryButton}
                  onClick={() => handleViewHistory(appt.patient_id)}
                >
                  View Medical History
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
                      `http://localhost:5001/admin/cancel-appointment/${selectedEvent.id}`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (!response.ok)
                      throw new Error("Failed to cancel appointment");

                    // Remove cancelled appointment from state without reloading everything
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
                style={styles.cancelButton}
              >
                Confirm Cancel
              </button>

              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedEvent(null);
                }}
                style={styles.submitButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <button style={styles.createAppointmentButton} onClick={openModal}>
        Create Appointment
      </button>

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

      {/* Modal */}
{showModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <WeeklyAvailabilityForm
        onSubmit={handleSubmitAvailability}
      />
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

      {selectedPatient && medicalHistory && (
        <div style={styles.historyContainer}>
          <button
            style={styles.cancelButton}
            onClick={() => {
              setSelectedPatient(null);
              setMedicalHistory(null);
            }}
          >
            Cancel
          </button>

          <h2>Medical History for {selectedPatient}</h2>
          {medicalHistory.length === 0 ? (
            <p>No medical history records found.</p>
          ) : (
            medicalHistory.map((record) => (
              <div key={record.id} style={styles.historyRecord}>
                <p>
                  <strong>Name:</strong> {record.first_name} {record.last_name}
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
                  <strong>Reason for Visit:</strong> {record.reason_for_visit}
                </p>
                <p>
                  <strong>Comments:</strong> {record.additional_comments}
                </p>
                <hr />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
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
    marginTop: "1rem",
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

  /* Modal styles */
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
  },
  modal: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
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
    justifyContent: "space-between",
    marginTop: "1rem",
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
