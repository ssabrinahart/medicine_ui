import React, { useState } from "react";

function WeeklyAvailabilityForm({ onSubmit }) {
  const [weekStartDate, setWeekStartDate] = useState("");
  const [availability, setAvailability] = useState({});

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Add a new slot for the selected day
  const handleAddSlot = (day) => {
    const newSlot = { start_time: "", duration: 60 };
    setAvailability((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newSlot],
    }));
  };

  // Update the slot field value (start_time or duration)
  const handleSlotChange = (day, index, field, value) => {
    setAvailability((prev) => {
      const slots = [...(prev[day] || [])];
      // For duration ensure it's a number, but allow empty string for clearing input
      const updatedValue = field === "duration" ? (value === "" ? "" : Number(value)) : value;
      slots[index] = { ...slots[index], [field]: updatedValue };
      return { ...prev, [day]: slots };
    });
  };

  // Handle form submission: call parent onSubmit with current data
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate weekStartDate is set
    if (!weekStartDate) {
      alert("Please select the week start date (Monday).");
      return;
    }

    // Optionally: Validate slots have start_time filled
    for (const day of weekdays) {
      const slots = availability[day] || [];
      for (const slot of slots) {
        if (!slot.start_time) {
          alert(`Please fill the start time for all slots in ${day}.`);
          return;
        }
        if (!slot.duration || slot.duration <= 0) {
          alert(`Please enter a valid duration for all slots in ${day}.`);
          return;
        }
      }
    }

    onSubmit({ weekStartDate, availability });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Set Weekly Availability
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Week start date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="weekStartDate">
            Week Start Date (Monday)
          </label>
          <input
            id="weekStartDate"
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Availability by day */}
        {weekdays.map((day) => (
          <div key={day} className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">{day}</h3>
              <button
                type="button"
                onClick={() => handleAddSlot(day)}
                className="bg-blue-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-600"
              >
                + Add Slot
              </button>
            </div>

            <div className="space-y-3">
              {(availability[day] || []).map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                >
                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) =>
                      handleSlotChange(day, index, "start_time", e.target.value)
                    }
                    className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    value={slot.duration}
                    onChange={(e) =>
                      handleSlotChange(day, index, "duration", e.target.value)
                    }
                    className="w-24 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    aria-label="Duration in minutes"
                  />
                  <span className="text-gray-500 text-sm">min</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-green-600"
        >
          Save Availability
        </button>
      </form>
    </div>
  );
}

export default WeeklyAvailabilityForm;
