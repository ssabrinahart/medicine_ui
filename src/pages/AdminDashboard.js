import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Token from localStorage:", token);

        if (!token) {
          console.log("No token found, redirecting to login.");
          navigate("/login");
          return;
        }

        let decoded;
        try {
          decoded = jwtDecode(token);
          console.log("Decoded token:", decoded);
        } catch (e) {
          console.error("Error decoding token", e);
          navigate("/login");
          return;
        }

        // Check role with trim and toLowerCase just to be safe
        if (!decoded.role || decoded.role.toLowerCase().trim() !== "admin") {
          console.log("User is not admin, redirecting.");
          navigate("/unauthorized");
          return;
        }

        const response = await fetch("http://localhost:5001/admin/patient-appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 403) {
          console.log("Forbidden: Not authorized");
          navigate("/unauthorized");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Today’s Appointments</h1>
      <div style={styles.cardContainer}>
        {appointments.length === 0 ? (
          <p>No appointments found</p>
        ) : (
          appointments.map((appt, index) => (
            <div key={index} style={styles.card}>
              <Link to={`/admin/patient/${appt.patient_id}`}>
                <div className="appointment-card">
                  <p><strong>Date:</strong> {appt.date}</p>
                  <p><strong>Time:</strong> {appt.time}</p>
                  <p><strong>Patient:</strong> {appt.username}</p>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "600px", margin: "auto", fontFamily: "Arial, sans-serif" },
  header: { textAlign: "center", marginBottom: "2rem" },
  cardContainer: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: { backgroundColor: "#f7f7f7", border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
};

export default AdminDashboard;
