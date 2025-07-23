import React, { useEffect, useState } from "react";
import "./Profile.css";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [medicalData, setMedicalData] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [showContactForm, setShowContactForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username");

    if (username) {
      // Fetch medical history
      fetch(`http://localhost:5001/medical-history/${username}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch medical history");
          }
          return response.json();
        })
        .then((data) => {
          const latest = data.medical_history?.[0];
          if (latest) {
            setMedicalData({
              firstName: latest.first_name,
              lastName: latest.last_name,
              dob: latest.birth_date,
              gender: latest.gender,
              height: latest.height,
              weight: latest.weight,
              allergies: latest.allergies,
              medications: latest.medications,
              conditions: latest.conditions,
              injuries: latest.injuries,
              cannabisUse: latest.has_used_cannabis ? "Yes" : "No",
              reason: latest.reason_for_visit,
              comments: latest.additional_comments,
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching medical history:", err);
        });

      // Fetch appointment
      fetch(`http://localhost:5001/appointment/${username}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch appointment");
          }
          return response.json();
        })
        .then((data) => {
          if (data.appointment) {
            setAppointment(data.appointment);
          }
        })
        .catch((err) => {
          console.error("Error fetching appointment:", err);
        });
    }
  }, []);

  const handleContactUpdate = () => {
    const username = localStorage.getItem("username");

    fetch(`http://localhost:5001/update-contact-info/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: newEmail, phone: newPhone }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setAlertMessage("Contact info updated!");
          setShowContactForm(false);
          setNewEmail("");
          setNewPhone("");
        } else {
          setAlertMessage(data.message || "Failed to update contact info.");
        }
      })
      .catch((err) => {
        console.error("Update error:", err);
        setAlertMessage("Error updating contact info.");
      });
  };

  const handleEditClick = () => {
    setEditedData(medicalData); // populate form with current data
    setIsEditing(true);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    const username = localStorage.getItem("username");

    fetch(`http://localhost:5001/medical-history/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update medical history");
        return res.json();
      })
      .then((updated) => {
        setMedicalData(editedData);
        setIsEditing(false);
        setAlertMessage("Medical history updated successfully!");
      })
      .catch((err) => {
        console.error(err);
        setAlertMessage("Error updating medical history.");
      });
  };
  const handleDeleteAccount = () => {
    const username = localStorage.getItem("username");

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    fetch(`http://localhost:5001/delete-account/${username}`, {
      method: "DELETE",
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          alert("Your account has been deleted.");
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          // Redirect using React Router navigation
          navigate("/logout"); // or '/' or wherever your app redirects non-logged-in users
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => {
        console.error("Error deleting account:", err);
        alert("An error occurred. Please try again later.");
      });
  };

  const handlePasswordChange = () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    fetch("http://localhost:5001/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // required!
        Authorization: `Bearer ${token}`, // required if using jwt_required
      },
      body: JSON.stringify({ newPassword, username }), // must match backend key
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setAlertMessage("Successfully changed password!");
        if (ok) {
          setNewPassword("");
          setShowPasswordForm(false);
          setAlertMessage("Successfully changed password!");
        }
      })
      .catch((err) => {
        console.error("Error changing password:", err);
        setStatusMsg("Something went wrong.");
        setAlertMessage("Error Changing Password, try again later!");
      });
  };

  return (
    <div className="profile-container">
      <h2>Patient Profile</h2>

      <section className="profile-section">
        <h3>Basic Info</h3>
        {medicalData ? (
          <ul>
            <li>
              <strong>Name:</strong> {medicalData.firstName}{" "}
              {medicalData.lastName}
            </li>
            <li>
              <strong>DOB:</strong> {medicalData.dob}
            </li>
            <li>
              <strong>Gender:</strong> {medicalData.gender}
            </li>
          </ul>
        ) : (
          <p>No medical info found.</p>
        )}
      </section>

      <section className="profile-section">
        <h3>Medical History</h3>

        {isEditing ? (
          <div className="medical-edit-form">
            <label>
              Height:{" "}
              <input
                name="height"
                value={editedData.height || ""}
                onChange={handleFieldChange}
              />
            </label>
            <label>
              Weight:{" "}
              <input
                name="weight"
                value={editedData.weight || ""}
                onChange={handleFieldChange}
              />
            </label>
            <label>
              Allergies:{" "}
              <input
                name="allergies"
                value={editedData.allergies || ""}
                onChange={handleFieldChange}
              />
            </label>
            <label>
              Medications:{" "}
              <input
                name="medications"
                value={editedData.medications || ""}
                onChange={handleFieldChange}
              />
            </label>
            <label>
              Conditions:{" "}
              <input
                name="conditions"
                value={editedData.conditions || ""}
                onChange={handleFieldChange}
              />
            </label>
            <label>
              Injuries:{" "}
              <input
                name="injuries"
                value={editedData.injuries || ""}
                onChange={handleFieldChange}
              />
            </label>
            <label>
              Cannabis Use:
              <select
                name="cannabisUse"
                value={editedData.cannabisUse || ""}
                onChange={handleFieldChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <label>
              Reason for Visit:{" "}
              <input
                name="reason"
                value={editedData.reason || ""}
                onChange={handleFieldChange}
              />
            </label>
            <label>
              Comments:{" "}
              <textarea
                name="comments"
                value={editedData.comments || ""}
                onChange={handleFieldChange}
              />
            </label>
            <button onClick={handleSaveClick} className="button-save">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="button-cancel"
            >
              Cancel
            </button>
          </div>
        ) : medicalData ? (
          <>
            <ul>
              <li>
                <strong>Height:</strong> {medicalData.height}
              </li>
              <li>
                <strong>Weight:</strong> {medicalData.weight}
              </li>
              <li>
                <strong>Allergies:</strong> {medicalData.allergies}
              </li>
              <li>
                <strong>Medications:</strong> {medicalData.medications}
              </li>
              <li>
                <strong>Conditions:</strong> {medicalData.conditions}
              </li>
              <li>
                <strong>Injuries:</strong> {medicalData.injuries}
              </li>
              <li>
                <strong>Cannabis Use:</strong> {medicalData.cannabisUse}
              </li>
              <li>
                <strong>Reason for Visit:</strong> {medicalData.reason}
              </li>
              <li>
                <strong>Comments:</strong> {medicalData.comments}
              </li>
            </ul>
            <button onClick={handleEditClick}>Edit</button>
          </>
        ) : (
          <p>No medical history submitted.</p>
        )}
      </section>

      <section className="profile-section">
        <h3>Upcoming Appointment</h3>
        {appointment ? (
          <ul>
            <li>
              <strong>Day:</strong> {appointment.day}
            </li>
            <li>
              <strong>Time:</strong> {appointment.time}
            </li>
            <li>
              <strong>Location:</strong> {appointment.location}
            </li>
            <li>
              <strong>Provider:</strong> {appointment.provider}
            </li>
          </ul>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </section>

      <section className="profile-section">
        <h3>Account Settings</h3>
        <button
          className="setting-btn"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          Change Password
        </button>
        {showPasswordForm && (
          <div className="password-form">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handlePasswordChange}>Submit</button>
            <p>{statusMsg}</p>
          </div>
        )}
        <button
          className="setting-btn"
          onClick={() => setShowContactForm(!showContactForm)}
        >
          Update Contact Info
        </button>
        {showContactForm && (
          <div className="contact-form">
            <input
              type="email"
              placeholder="New Email (Optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="New Phone (Optional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <button onClick={handleContactUpdate}>Submit</button>
          </div>
        )}{" "}
        <button className="setting-btn delete" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </section>
      <Modal message={alertMessage} onClose={() => setAlertMessage("")} />
    </div>
  );
}

export default Profile;
