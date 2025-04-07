import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const AbsenceEntry = () => {
  const [teacherId, setTeacherId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsResponse, studentsResponse] = await Promise.all([
          axios.get(`/teachers/me/sessions`),
          axios.get(`/teachers/me/students`),
        ]);
        setSessions(sessionsResponse.data);
        setStudents(studentsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load data. Please try again.");
      }
    };

    fetchData();
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedSession || !selectedStudent) {
      setMessage("Please select a session and a student.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      setMessage("");
      // Trimite absența către API
      await axios.post(`/class-sessions/session/${selectedSession}/absences`, null, {
        params: {
          studentId: selectedStudent,
        },
      });
      setMessage("Absence submitted successfully!");
    } catch (error) {
      console.error("Error submitting absence:", error);
      setMessage("Failed to submit absence. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Record Absence</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full p-2 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
        >
          <option value="">Select Session</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.subject} ({session.startTime} - {session.endTime})
            </option>
          ))}
        </select>

        <select
          className="w-full p-2 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} - {student.studentClass?.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-secondary text-white font-semibold p-2 rounded-lg hover:opacity-90 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Absence"}
        </button>

        {message && <p className="text-center text-dark mt-4">{message}</p>}
      </form>
    </div>
  );
};

export default AbsenceEntry;
