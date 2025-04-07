import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const StudentsOverview = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [sortBy, setSortBy] = useState("class");
  const [filterBy, setFilterBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/teachers/me/students`);
        setStudents(response.data);
        setFilteredStudents(response.data); // Setăm studenții filtrați inițial
        setError(null);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load students. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();

  }, []);

  // Sort students
  const handleSort = (criteria) => {
    setSortBy(criteria);
    const sorted = [...filteredStudents].sort((a, b) => {
      if (criteria === "class") {
        return a.studentClass?.name.localeCompare(b.studentClass?.name);
      } else if (criteria === "profile") {
        return a.studentClass?.specialization.localeCompare(b.studentClass?.specialization);
      }
      return 0;
    });
    setFilteredStudents(sorted);
  };

  // Filter students by class or profile
  const handleFilter = (value) => {
    setFilterBy(value);
    if (value) {
      const filtered = students.filter(
        (student) =>
          student.studentClass?.name.includes(value) ||
          student.studentClass?.specialization.includes(value)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students); // Resetăm la toți studenții
    }
  };

  return (
    <div className="p-6 bg-light min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-dark font-medium rounded-lg shadow-md hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
        >
          ⬅ Back
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-dark">Students Overview</h2>
      {isLoading && <p className="text-center text-green-600">Loading students...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!isLoading && !error && (
        <>
          {/* Controls for sorting and filtering */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <label className="mr-2 font-medium text-dark">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="border p-2 rounded-lg bg-yellow-100 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <option value="class">Class</option>
                  <option value="profile">Profile</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="mr-2 font-medium text-dark">Filter:</label>
                <input
                  type="text"
                  placeholder="Class or Profile"
                  value={filterBy}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="border p-2 rounded-lg bg-green-100 text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-dark">Students List</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="p-4 text-left font-medium text-dark">Name</th>
                    <th className="p-4 text-left font-medium text-dark">Class</th>
                    <th className="p-4 text-left font-medium text-dark">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b last:border-b-0">
                      <td className="p-4 text-dark">{student.name}</td>
                      <td className="p-4 text-dark">
                        {student.studentClass?.name || "N/A"}
                      </td>
                      <td className="p-4 text-dark">
                        {student.studentClass?.specialization || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentsOverview;
