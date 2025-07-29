import React, { useState } from "react";
import Modal from "../components/Modal";
import {useEffect} from "react";
import { useLocation } from "react-router-dom";


function PatientQuestions() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const location = useLocation();
  const editModeFromNav = location.state?.editMode || false;
  const [isEditing, setIsEditing] = useState(editModeFromNav);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    weight: "",
    height: "",
    allergies: "",
    medications: "",
    conditions: "",
    injuries: "",
    cannabisUse: "",
    reason: "",
    comments: "",
  });

  useEffect(() => {
    const checkMedicalHistory = async () => {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("authToken");
  
      if (!username || !token) return;
  
      try {
        const response = await fetch(`http://localhost:5001/medical-history/${username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const result = await response.json();
          const latest = result.medical_history?.[0];
  
        
          if (latest) {
            setSubmitted(!editModeFromNav); // only show summary if NOT editing
            setIsEditing(true);
            setFormData({
              firstName: latest.first_name || "",
              lastName: latest.last_name || "",
              dob: latest.birth_date || "",
              gender: latest.gender || "",
              weight: latest.weight || "",
              height: latest.height || "",
              allergies: latest.allergies || "",
              medications: latest.medications || "",
              conditions: latest.conditions || "",
              injuries: latest.injuries || "",
              cannabisUse: latest.has_used_cannabis ? "Yes" : "No",
              reason: latest.reason_for_visit || "",
              comments: latest.additional_comments || "",
            });
          }
          
        }
      } catch (error) {
        console.error("Failed to check medical history", error);
      }
    };
  
    checkMedicalHistory();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const handleSubmit = async () => {
    const authToken = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
  
    if (!username) {
      alert("You must be logged in to submit the form.");
      return;
    }
  
    const fullData = { ...formData, username };
  
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://localhost:5001/medical-history/${username}`
        : "http://localhost:5001/medical-history";
  
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(fullData),
      });
  
      if (response.ok) {
        setSubmitted(true);
        setAlertMessage(
          isEditing
            ? "Successfully updated patient history!"
            : "Successfully submitted patient history!"
        );
        setTimeout(() => setAlertMessage(""), 1500);
      } else {
        const err = await response.json();
        alert(err.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Network error. Please try again.");
    }
  };
  

  const calculateAge = (dob) => {
    if (!dob) return "";
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
        <p><strong>Gender:</strong> {formData.gender}</p>
        <p><strong>Age:</strong> {age}</p>
        <p><strong>Height:</strong> {formData.height}</p>
        <p><strong>Weight:</strong> {formData.weight}</p>
        <button onClick={() => {
      setSubmitted(false);
      setStep(1);
    }}>Edit Medical History</button>
      </div>
      
    );
  }

  const validateStep = () => {
    if (step === 1) {
      return (
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.dob &&
        formData.gender
      );
    }
  
    if (step === 2) {
      return (
        formData.weight.trim() &&
        formData.height.trim()

      );
    }
  
    if (step === 3) {
      return formData.cannabisUse;
    }
  
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      nextStep();
    } else {
      setAlertMessage("Please fill in all required fields before continuing.");
    }
  };
  
  return (
    <div className="form-container">
      <h2>Patient Medical History</h2>
      
      <form onSubmit={(e) => e.preventDefault()}>
        {step === 1 && (
          <>
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            <select
              name="gender"
              placeholder="Gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button type="button" onClick={handleNext}>Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              name="weight"
              placeholder="Weight (lbs)"
              value={formData.weight}
              onChange={handleChange}
              required
            />
              <input
                name="height"
                placeholder="Height"
                value={formData.height}
                onChange={handleChange}
                required
                style={{ width: "60px", marginRight: "8px" }}
              />
            <input
              name="allergies"
              placeholder="Allergies"
              value={formData.allergies}
              onChange={handleChange}
            />
            <textarea
              name="medications"
              placeholder="Medications"
              value={formData.medications}
              onChange={handleChange}
            ></textarea>
            <button type="button" onClick={handleNext}>Next</button>
          </>
        )}

        {step === 3 && (
          <>
            <textarea
              name="conditions"
              placeholder="Conditions"
              value={formData.conditions}
              onChange={handleChange}
            ></textarea>
            <textarea
              name="injuries"
              placeholder="Injuries"
              value={formData.injuries}
              onChange={handleChange}
            ></textarea>
            <select
              name="cannabisUse"
              value={formData.cannabisUse}
              onChange={handleChange}
              required
            >
              <option value="">Previously Used Cannabis?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <textarea
              name="reason"
              placeholder="Reason for Visit"
              value={formData.reason}
              onChange={handleChange}
            ></textarea>
            <button type="button" onClick={handleNext}>Next</button>
          </>
        )}

        {step === 4 && (
          <>
            <textarea
              id="additional-comments"
              name="comments"
              placeholder="Additional Comments"
              value={formData.comments}
              onChange={handleChange}
            ></textarea>
            <button type="button" onClick={handleNext}>Next</button>
          </>
        )}

        {step === 5 && (
          <div className="confirmation-summary">
            <h3>Confirm Your Information</h3>
            <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
            <p><strong>Date of Birth:</strong> {formData.dob}</p>
            <p><strong>Gender:</strong> {formData.gender}</p>
            <p><strong>Weight:</strong> {formData.weight} lbs</p>
            <p><strong>Height:</strong> {formData.height}</p>
            <p><strong>Allergies:</strong> {formData.allergies || "None"}</p>
            <p><strong>Medications:</strong> {formData.medications || "None"}</p>
            <p><strong>Conditions:</strong> {formData.conditions || "None"}</p>
            <p><strong>Injuries:</strong> {formData.injuries || "None"}</p>
            <p><strong>Used Cannabis Before?:</strong> {formData.cannabisUse}</p>
            <p><strong>Reason for Visit:</strong> {formData.reason || "None"}</p>
            <p><strong>Additional Comments:</strong> {formData.comments || "None"}</p>

            <button type="button" onClick={() => setStep(4)}>Back</button>
            <button type="button" onClick={handleSubmit}>Book</button>
          </div>
        )}
      </form>
      <Modal message={alertMessage} onClose={() => setAlertMessage("")} />
    </div>
  );
}

export default PatientQuestions;
