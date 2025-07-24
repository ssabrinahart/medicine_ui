import React, { useState } from 'react';
import './Scheduling.css';
import { loadStripe} from '@stripe/stripe-js';

export const stripePromise = loadStripe('pk_test_51RoSnM49gGgKNzjtMLEgS2QgadVZVAbvA1kPbeK5Iu76PEI9chyt1NGYCxhOmrT2dQux3mzQrTq3eptsarYN8sMA00NEhwM5IE'); // <-- Add your publishable key here


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

  const handlePaymentAndBooking = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot.');
      return;
    }

    const appointment = {
      day: selectedSlot.day,
      time: selectedSlot.time,
      location: 'Zoom',
      provider: 'Hiba M.',
      username: localStorage.getItem('username'),
    };

    try {
      const response = await fetch('http://localhost:5001/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });

      const data = await response.json();

      if (data.url) {
        // Store appointment info temporarily before redirecting to Stripe
        localStorage.setItem('pendingAppointment', JSON.stringify(appointment));
        window.location.href = data.url;
      } else {
        alert('Failed to create Stripe session');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      alert('Error initiating payment. Please try again.');
    }
  };

  return (
    <div className="scheduling-container">
      <h2>Schedule Your Consultation</h2>

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
        <button className="submit-button" onClick={handlePaymentAndBooking}>
          Book & Pay
        </button>
      </div>
    </div>
  );
}

export default Scheduling;
