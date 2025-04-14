import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaArrowLeft, FaSearch, FaSortAmountDown, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';

const StudentsOverview = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [sortBy, setSortBy] = useState("class");
  const [filterBy, setFilterBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/teachers/me/students');
        setStudents(response.data);
        setFilteredStudents(response.data);
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
          student.studentClass?.name.toLowerCase().includes(value.toLowerCase()) ||
          student.studentClass?.specialization.toLowerCase().includes(value.toLowerCase()) ||
          student.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

  return (
    <div className="bg-light min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/teacher')}
            className="flex items-center text-dark hover:text-secondary transition"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
            <FaGraduationCap className="mr-3 text-secondary" />
            Students Overview
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-dark font-semibold mb-2">Filter Students</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-dark2" />
                  <input
                    type="text"
                    placeholder="Search by name, class or profile"
                    value={filterBy}
                    onChange={(e) => handleFilter(e.target.value)}
                    className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="block text-dark font-semibold mb-2">Sort By</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleSort("class")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center ${
                      sortBy === "class" ? "bg-secondary text-white" : "bg-primary text-dark"
                    }`}
                  >
                    <FaChalkboardTeacher className="mr-2" />
                    Class
                  </button>
                  <button 
                    onClick={() => handleSort("profile")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center ${
                      sortBy === "profile" ? "bg-secondary text-white" : "bg-primary text-dark"
                    }`}
                  >
                    <FaSortAmountDown className="mr-2" />
                    Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block p-3 bg-primary rounded-full">
                <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-dark2">Loading students data...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-primary">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-dark">Name</th>
                      <th className="py-3 px-4 text-left font-semibold text-dark">Class</th>
                      <th className="py-3 px-4 text-left font-semibold text-dark">Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-6 text-center text-dark2">
                          No students found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-dark flex items-center">
                            <FaUserCircle className="mr-2 text-secondary" />
                            {student.name}
                          </td>
                          <td className="py-3 px-4 text-dark">
                            {student.studentClass?.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-dark">
                            {student.studentClass?.specialization || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-sm text-dark2">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsOverview;