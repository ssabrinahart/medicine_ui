import React, { useEffect, useState } from 'react';
import './Profile.css';

function Profile() {
  const [medicalData, setMedicalData] = useState(null);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const storedMedical = localStorage.getItem('medicalHistory');
    if (storedMedical) setMedicalData(JSON.parse(storedMedical));

    const storedAppointment = localStorage.getItem('appointment');
    if (storedAppointment) setAppointment(JSON.parse(storedAppointment));
  }, []);

  return (
    <div className="profile-container">
      <h2>Patient Profile</h2>

      <section className="profile-section">
        <h3>Basic Info</h3>
        {medicalData ? (
          <ul>
            <li><strong>Name:</strong> {medicalData.firstName} {medicalData.lastName}</li>
            <li><strong>DOB:</strong> {medicalData.dob}</li>
            <li><strong>Gender:</strong> {medicalData.gender}</li>
          </ul>
        ) : <p>No medical info found.</p>}
      </section>

      <section className="profile-section">
        <h3>Medical History</h3>
        {medicalData ? (
          <ul>
            <li><strong>Height:</strong> {medicalData.height}</li>
            <li><strong>Weight:</strong> {medicalData.weight}</li>
            <li><strong>Allergies:</strong> {medicalData.allergies}</li>
            <li><strong>Medications:</strong> {medicalData.medications}</li>
            <li><strong>Conditions:</strong> {medicalData.conditions}</li>
            <li><strong>Injuries:</strong> {medicalData.injuries}</li>
            <li><strong>Cannabis Use:</strong> {medicalData.cannabisUse}</li>
            <li><strong>Reason for Visit:</strong> {medicalData.reason}</li>
            <li><strong>Comments:</strong> {medicalData.comments}</li>
          </ul>
        ) : <p>No medical history submitted.</p>}
      </section>

      <section className="profile-section">
        <h3>Upcoming Appointment</h3>
        {appointment ? (
          <ul>
            <li><strong>Day:</strong> {appointment.day}</li>
            <li><strong>Time:</strong> {appointment.time}</li>
            <li><strong>Location:</strong> {appointment.location}</li>
            <li><strong>Provider:</strong> {appointment.provider}</li>
          </ul>
        ) : <p>No upcoming appointments.</p>}
      </section>

      <section className="profile-section">
        <h3>Account Settings</h3>
        <button className="setting-btn">Change Password</button>
        <button className="setting-btn">Update Contact Info</button>
        <button className="setting-btn delete">Delete Account</button>
      </section>
    </div>
  );
}

export default Profile;
