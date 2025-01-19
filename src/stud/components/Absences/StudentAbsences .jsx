import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const StudentAbsences = () => {
  const [absences, setAbsences] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        // Obține ID-ul utilizatorului din cookies
        const userId = Cookies.get("userId");
        if (!userId) {
          setMessage("User ID not found. Please log in.");
          return;
        }

        // Trimite cererea pentru toate absențele
        const response = await axios.get(`/absences`);

        // Filtrează absențele pentru studentul curent
        const filteredAbsences = response.data.filter(
          (absence) => absence.student.id === parseInt(userId)
        );

        setAbsences(filteredAbsences);
        setMessage("");
      } catch (error) {
        console.error("Error fetching absences:", error);
        setMessage("Failed to fetch absences. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAbsences();
  }, []);

  if (isLoading) {
    return <div>Loading absences...</div>;
  }

  if (message) {
    return <div className="text-red-500">{message}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Absences</h2>
      {absences.length === 0 ? (
        <p>No absences found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Subject</th>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Teacher</th>
            </tr>
          </thead>
          <tbody>
  {absences.map((absence) => (
    <tr key={absence.id}>
      <td className="border border-gray-300 p-2">
        {absence.subject || "Unknown Subject"}
      </td>
      <td className="border border-gray-300 p-2">
        {absence.date ? new Date(absence.date).toLocaleDateString() : "Unknown Date"}
      </td>
      <td className="border border-gray-300 p-2">
        {absence.classSession?.teacher?.name || "Unknown Teacher"}
      </td>
    </tr>
  ))}
</tbody>

        </table>
      )}
    </div>
  );
};

export default StudentAbsences;
