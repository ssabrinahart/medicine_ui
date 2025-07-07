import React, { useState } from 'react';
import './Scheduling.css';

const timeSlots = [
  '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '1:00-2:00', '2:00-3:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday'];

function Scheduling() {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSelect = (day, time) => {
    setSelectedSlot({ day, time });
  };

  const handleSubmit = () => {
    if (selectedSlot) {

      alert(`You booked: ${selectedSlot.day} at ${selectedSlot.time}
Location: Zoom
Provider: Hiba M.`);

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
