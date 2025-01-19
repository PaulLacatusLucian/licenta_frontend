import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        // Obține ID-ul utilizatorului din cookies
        const userId = Cookies.get("userId");
        if (!userId) {
          setMessage("User ID not found. Please log in.");
          return;
        }

        // Trimite cererea pentru toate notele
        const response = await axios.get(`/grades`);

        // Filtrează notele pentru studentul curent
        const filteredGrades = response.data.filter(
          (grade) => grade.student.id === parseInt(userId)
        );

        setGrades(filteredGrades);
        setMessage("");
      } catch (error) {
        console.error("Error fetching grades:", error);
        setMessage("Failed to fetch grades. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (isLoading) {
    return <div>Loading grades...</div>;
  }

  if (message) {
    return <div className="text-red-500">{message}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Grades</h2>
      {grades.length === 0 ? (
        <p>No grades found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Subject</th>
              <th className="border border-gray-300 p-2">Teacher</th>
              <th className="border border-gray-300 p-2">Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td className="border border-gray-300 p-2">{grade.teacher.subject}</td>
                <td className="border border-gray-300 p-2">{grade.teacher.name}</td>
                <td className="border border-gray-300 p-2 text-center">{grade.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentGrades;
