import React, { useState } from "react";
import axios from "axios";
import "./AttendancePage.css"; // External CSS file for styles

const AttendancePage = () => {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState(null);
  const [message, setMessage] = useState("");
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });  // e.g., "2024-12-16"
  const time = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Manila" });  // e.g., "14:30:00"
  const [lastScannedId, setLastScannedId] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(null);

  // Handle input change
  const handleInputChange = (e) => {
    setStudentId(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId) {
      setMessage("Please enter a student ID.");
      return;
    }

    const currentTime = Date.now(); // Get the current timestamp

    // Check if the student ID was scanned recently
    if (lastScannedId === studentId && lastScanTime && currentTime - lastScanTime < 5000) {
        setMessage("This student ID was scanned recently. Please wait a few seconds.");
        return;
    }

    // Update the last scanned ID and time
    setLastScannedId(studentId);
    setLastScanTime(currentTime);


    try {
      console.log(date, time, studentId);
      // Fetch student name and log attendance
      const response = await axios.post(`http://localhost:3001/attendance`, { studentId, date, time }, { headers: { "Content-Type": "application/json" }});
      console.log(response.message)
      if (response.data.success) {
        setStudentName(response.data.studentName);
        setMessage("Attendance logged successfully.");
        console.log(response.message)
        setStudentId("")
      } else {
        setStudentName(null);
        console.log(response.message)
        setMessage(response.data.message || "Unable to log attendance.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while processing the request.");
    }
  };

  return (
    <div className="attendance-container">
      <div className="header">
        <h1 className="logbook-title">Logbook</h1>
      </div>
      <div className="content">
        <div className="search-bar">
          <form onSubmit={handleSubmit} className="form-inline">
            <input
              type="text"
              className="form-input"
              id="studentId"
              value={studentId}
              onChange={handleInputChange}
              placeholder="Enter Student ID or Name"
            />
            <button type="submit" className="search-button">
              Enter
            </button>
          </form>
        </div>
        <div className="results">
          {studentName && (
            <div className="student-info">
              <h2 className="welcome-message">Welcome, {studentName}!</h2>
            </div>
          )}

          {message && (
            <div className="message">
              <p className="status-message">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
