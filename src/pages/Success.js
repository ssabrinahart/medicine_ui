import { useEffect, useRef } from 'react';

function Success() {
    const sentRef = useRef(false);
  
    useEffect(() => {
      const appointment = JSON.parse(localStorage.getItem('pendingAppointment'));
      if (!appointment || sentRef.current) return;
      sentRef.current = true;
  
      fetch('http://localhost:5001/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      })
        .then(res => res.json())
        .then(() => {
          localStorage.removeItem('pendingAppointment');
          alert('Appointment booked successfully!');
        })
        .catch(err => {
          console.error(err);
          alert('Something went wrong…');
        });
    }, []);
  
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Payment Successful</h2>
        <p>Your appointment has been booked! Check your email for confirmation.</p>
      </div>
    );
  }
  
  

export default Success;