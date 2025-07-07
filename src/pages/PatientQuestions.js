import React, { useState } from 'react';

function PatientQuestions() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      weight: '',
      height: '',
      allergies: '',
      medications: '',
      conditions: '',
      injuries: '',
      cannabisUse: '',
      reason: '',
      comments: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
    
      const nextStep = () => setStep((prev) => prev + 1);
      const handleSubmit = () => {
        setSubmitted(true);
      };
    
      const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      };
    
      if (submitted) {
        const fullName = `${formData.firstName} ${formData.lastName}`;
        const age = calculateAge(formData.dob);
        return (
          <div className="form-container">
            <h2>Medical History Has Been Submitted</h2>
            <p><strong>Patient:</strong> {fullName}</p>
            <p><strong>Gender:</strong>{formData.gender}</p>
            <p><strong>Age:</strong> {age}</p>
            <p><strong>Height:</strong> {formData.height}</p>
            <p><strong>Weight:</strong> {formData.weight}</p>
          </div>
        );
      }
    
      return (
        <div className="form-container">
          <h2>Patient Medical History</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && (
              <>
                <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                <select name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <button onClick={nextStep}>Next</button>
              </>
            )}
    
            {step === 2 && (
              <>
                <input name="weight" placeholder="Weight (lbs)" value={formData.weight} onChange={handleChange} required />
                <input name="height" placeholder="Height (e.g., 5 feet 6 inches)" value={formData.height} onChange={handleChange} required />
                <input name="allergies" placeholder="Allergies" value={formData.allergies} onChange={handleChange} />
                <textarea name="medications" placeholder="Medications" value={formData.medications} onChange={handleChange}></textarea>
                <button onClick={nextStep}>Next</button>
              </>
            )}
    
            {step === 3 && (
              <>
                <textarea name="conditions" placeholder="Conditions" value={formData.conditions} onChange={handleChange}></textarea>
                <textarea name="injuries" placeholder="Injuries" value={formData.injuries} onChange={handleChange}></textarea>
                <select name="cannabisUse" value={formData.cannabisUse} onChange={handleChange} required>
                  <option value="">Previously Used Cannabis?</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <textarea name="reason" placeholder="Reason for Visit" value={formData.reason} onChange={handleChange}></textarea>
                <button onClick={nextStep}>Next</button>
              </>
            )}
    
            {step === 4 && (
              <>
                <textarea id = "additional-comments" name="comments" placeholder="Additional Comments" value={formData.comments} onChange={handleChange}></textarea>
                <button onClick={handleSubmit}>Book</button>
              </>
            )}
          </form>
        </div>
      );
    }
    
    export default PatientQuestions;