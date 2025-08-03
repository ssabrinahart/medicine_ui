import React, { useState, useEffect } from 'react';

function EditAppointment() {
  const [time, setTime] = useState('');
  const [current, setCurrent] = useState({});
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  useEffect(() => {
    fetch(`http://localhost:5001/appointment/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.appointment) {
          setCurrent(data.appointment);
          setTime(data.appointment.time);
        }
      });
  }, []);

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:5001/book-appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        day: current.day,
        time,
        location: current.location,
        provider: current.provider
      })
    });

    const result = await response.json();
    alert(result.message);
    window.location.href = "/";
  };

  return (
    <div>
      <h2>Edit Appointment Time</h2>
      <p><strong>Current Day:</strong> {current.day}</p>
      <p><strong>Current Time:</strong> {current.time}</p>
      
      <label htmlFor="timeSelect"><strong>Select New Time:</strong></label>
      <select
        id="timeSelect"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      >
        <option value="">-- Select Time --</option>
        {timeSlots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>

      <br /><br />
      <button onClick={handleSubmit}>Save Time</button>
    </div>
  );
}

export default EditAppointment;
