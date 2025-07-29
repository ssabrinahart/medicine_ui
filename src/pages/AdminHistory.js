import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function AdminHistory() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await fetch(`/api/admin/patient/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setPatient(data);
      } catch (error) {
        console.error("Failed to fetch patient history", error);
      }
    };

    fetchHistory();
  }, [patientId]);

  if (!patient) return <p>Loading patient history...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Medical History: {patient.name}</h2>
      <p><strong>Date:</strong> {patient.appointment_date}</p>
      <p><strong>Time:</strong> {patient.appointment_time}</p>
      <p><strong>Age:</strong> {patient.age}</p>
      <p><strong>Height:</strong> {patient.height}</p>
      <p><strong>Weight:</strong> {patient.weight}</p>
      <p><strong>Allergies:</strong> {patient.allergies}</p>
      <p><strong>Conditions:</strong> {patient.conditions}</p>
      <p><strong>Medications:</strong> {patient.medications}</p>
      <p><strong>Comments:</strong> {patient.comments}</p>
    </div>
  );
}

export default AdminHistory;
