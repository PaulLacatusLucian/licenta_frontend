import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const GradeEntryPage = () => {
  const [teacherId, setTeacherId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = Cookies.get("userId");
    if (userId) {
      setTeacherId(userId);
    } else {
      setMessage("Teacher ID not found in cookies.");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;

      try {
        const [sessionsResponse, studentsResponse] = await Promise.all([
          axios.get(`/teachers/${teacherId}/sessions`),
          axios.get(`/teachers/${teacherId}/students`),
        ]);
        setSessions(sessionsResponse.data);
        setStudents(studentsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession || !selectedStudent || !gradeValue) {
      setMessage("Please select a session, student, and enter a grade.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      await axios.post(`/api/class-sessions/session/${selectedSession}`, null, {
        params: {
          studentId: selectedStudent,
          gradeValue: parseFloat(gradeValue), // Ensure grade is a number
        },
      });
      setMessage("Grade submitted successfully!");
    } catch (error) {
      console.error("Error submitting grade:", error);
      setMessage("Failed to submit grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!teacherId) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Enter Grades</h2>
        <p className="text-center text-dark">Teacher ID is missing. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Enter Grades</h2>
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

        <input
          type="number"
          placeholder="Enter Grade"
          className="w-full p-2 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          value={gradeValue}
          onChange={(e) => setGradeValue(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-secondary text-white font-semibold p-2 rounded-lg hover:opacity-90 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Grade"}
        </button>

        {message && <p className="text-center text-dark mt-4">{message}</p>}
      </form>
    </div>
  );
};

export default GradeEntryPage;
