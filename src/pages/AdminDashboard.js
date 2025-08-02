import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

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

        const events = apptData.appointments.map((appt) => ({
          id: appt.id,
          title: `Patient: ${appt.patient_id}`,
          start: new Date(appt.start_date),
          end: new Date(appt.end_date),
          patient_id: appt.patient_id,
        }));
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

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Build start and end date-times
    const { date, startTime, duration } = newAppointment;
    if (!date || !startTime || !duration) {
      alert("Please fill in all fields");
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    try {
      const response = await fetch(
        "http://localhost:5001/admin/create-appointment-time",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: startDateTime.toISOString(),
            end_date: endDateTime.toISOString(),
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Appointment created successfully");
        setTimeout(() => setSuccessMessage(""), 2000);
      }

      if (!response.ok) throw new Error("Failed to create appointment");

      // Optionally, you can refetch appointments here or update state directly
      closeModal();
      // Refresh dashboard data to show new appointment
      setLoading(true);
      setAppointments([]);
      setSelectedPatient(null);
      setMedicalHistory(null);
      // Reload appointments & user count
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

          const apptResponse = await fetch(
            "http://localhost:5001/admin/patient-appointments",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!apptResponse.ok) throw new Error("Failed to fetch appointments");
          const apptData = await apptResponse.json();

          const events = apptData.appointments.map((appt) => ({
            id: appt.id,
            title: `Patient: ${appt.patient_id}`,
            start: new Date(appt.start_date),
            end: new Date(appt.end_date),
            patient_id: appt.patient_id,
          }));
          setAppointments(events);

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
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error creating appointment");
    }
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
      />

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
            <h2>Create New Appointment</h2>
            <form onSubmit={handleSubmitAppointment} style={styles.form}>
              <label>
                Date:
                <input
                  type="date"
                  name="date"
                  value={newAppointment.date}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </label>

              <label>
                Start Time:
                <input
                  type="time"
                  name="startTime"
                  value={newAppointment.startTime}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </label>

              <label>
                Duration (minutes):
                <input
                  type="number"
                  name="duration"
                  min="1"
                  value={newAppointment.duration}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </label>

              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitButton}>
                  Create
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
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
