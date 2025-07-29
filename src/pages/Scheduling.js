import React, { useState } from 'react';
import './Scheduling.css';

const timeSlots = [
  '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '1:00-2:00', '2:00-3:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function Scheduling() {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSelect = (day, time) => {
    setSelectedSlot({ day, time });
  };

  const handleSubmit = () => {
  if (selectedSlot) {
    const appointment = {
      day: selectedSlot.day,
      time: selectedSlot.time,
      location: 'Zoom',
      provider: 'Dr. Smith',
      username: localStorage.getItem('username'),
    };
    fetch('http://localhost:5001/book-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointment)
    })
    .then(response => response.json())
    .then(data => {
      alert(`You booked: ${selectedSlot.day} at ${selectedSlot.time}\nLocation: Zoom\nProvider: Hiba M.`);
    })
    .catch(error => {
      alert('Booking failed. Please try again.');
      console.error(error);
    });
  } else {
    alert('Please select a time slot.');
  }
};

  return (
    <div className="scheduling-container">
      <h2>Scheduling</h2>

      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className="day-column">
            <h3>{day}</h3>
            {timeSlots.map((time) => (
              <button
                key={`${day}-${time}`}
                className={`time-slot ${
                  selectedSlot?.day === day && selectedSlot?.time === time ? 'selected' : ''
                }`}
                onClick={() => handleSelect(day, time)}
              >
                {time}
              </button>
            ))}
          </div>
        ))}
      </div>

      
      <div className="submit-container">
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default Scheduling;
