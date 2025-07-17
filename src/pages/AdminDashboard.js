import { Link } from "react-router-dom";

const appointments = [
    { patient_id: 1, date: "July 1, 2025", time: "11pm", name: "Jane Doe" },
    { patient_id: 2, date: "July 1, 2025", time: "12pm", name: "John Smith" },
    { patient_id: 3, date: "July 1, 2025", time: "1pm", name: "Joe Mama" },
    { patient_id: 4, date: "July 1, 2025", time: "2pm", name: "Jack Robertson" },
    { patient_id: 5, date: "July 1, 2025", time: "3pm", name: "Michael Johnson" },
    { patient_id: 6, date: "July 1, 2025", time: "4pm", name: "Clark Kent" },
    ];
  
  function AdminDashboard() {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Today’s Appointments</h1>
        <div style={styles.cardContainer}>
          {appointments.map((appt, index) => (
            <div key={index} style={styles.card}>
            <Link to={`/admin/patient/${appt.patient_id}`}>
            <div className="appointment-card">
                <p><strong>Date:</strong> {appt.date}</p>
                <p><strong>Time:</strong> {appt.time}</p>
                <p><strong>Patient:</strong> {appt.name}</p>
            </div>
            </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const styles = {
    container: {
      padding: "2rem",
      maxWidth: "600px",
      margin: "auto",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
    },
    cardContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    card: {
      backgroundColor: "#f7f7f7",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "1rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
  };
  
  export default AdminDashboard;