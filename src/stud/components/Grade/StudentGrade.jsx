import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaBook, FaUserTie, FaGraduationCap, FaSpinner, FaArrowLeft, FaCalendarAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const userId = Cookies.get("userId");
        if (!userId) {
          setMessage("User ID not found. Please log in.");
          return;
        }
    
        const response = await axios.get(`/grades/${userId}`);
        setGrades(response.data);
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

  const sortedGrades = useMemo(() => {
    let sortableGrades = [...grades];
    if (sortConfig.key !== null) {
      sortableGrades.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableGrades;
  }, [grades, sortConfig]);

  const subjectAverages = useMemo(() => {
    const averages = grades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = { total: 0, count: 0 };
      }
      acc[grade.subject].total += grade.grade;
      acc[grade.subject].count += 1;
      return acc;
    }, {});

    return Object.entries(averages).map(([subject, data]) => ({
      subject,
      average: (data.total / data.count).toFixed(2),
      count: data.count
    }));
  }, [grades]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return <FaSort className="ml-2" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-2" /> : <FaSortDown className="ml-2" />;
  };

  const calculateGPA = (grades) => {
    if (!grades.length) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  const getGradeColor = (grade) => {
    if (grade >= 9) return "text-green-600";
    if (grade >= 7) return "text-blue-600";
    if (grade >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeEmoji = (grade) => {
    if (grade >= 9) return "🌟";
    if (grade >= 7) return "✨";
    if (grade >= 5) return "📚";
    return "💪";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <FaSpinner className="animate-spin text-4xl text-primary" />
          <p className="text-dark2 font-medium">Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-light min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-dark2 hover:text-primary transition-colors duration-200"
      >
        <FaArrowLeft className="mr-2" />
        <span>Back to Dashboard</span>
      </button>

      <div className="grid gap-6 mb-6">
        {/* Main Stats */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-6">
            <FaGraduationCap className="text-3xl text-primary mr-3" />
            <h2 className="text-2xl font-bold text-dark">Your Academic Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-light p-6 rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark2 text-sm uppercase tracking-wide">Total Subjects</p>
                  <p className="text-3xl font-bold text-primary mt-2">{subjectAverages.length}</p>
                </div>
                <FaBook className="text-2xl text-primary opacity-50" />
              </div>
            </div>
            <div className="bg-light p-6 rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark2 text-sm uppercase tracking-wide">Overall Average</p>
                  <p className="text-3xl font-bold text-primary mt-2">{calculateGPA(grades)}</p>
                </div>
                <div className="text-2xl">{getGradeEmoji(calculateGPA(grades))}</div>
              </div>
            </div>
            <div className="bg-light p-6 rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark2 text-sm uppercase tracking-wide">Academic Standing</p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {calculateGPA(grades) >= 7 ? "Good" : "Improving"}
                  </p>
                </div>
                <div className="text-2xl">{calculateGPA(grades) >= 7 ? "🏆" : "📈"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Averages */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-dark mb-4">Subject Averages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectAverages.map((subjectData) => (
              <div key={subjectData.subject} className="bg-light p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-dark">{subjectData.subject}</p>
                    <p className="text-sm text-dark2">{subjectData.count} grades</p>
                  </div>
                  <p className={`text-xl font-bold ${getGradeColor(parseFloat(subjectData.average))}`}>
                    {subjectData.average}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {message ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-4">{message}</div>
          ) : sortedGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark2">
              <FaBook className="text-5xl mb-4 text-primary opacity-50" />
              <p className="text-xl">No grades found yet</p>
              <p className="text-sm mt-2">Grades will appear here once they're added</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-light">
                    <th className="p-4 text-left">
                      <button
                        className="flex items-center text-dark2 font-medium hover:text-primary"
                        onClick={() => requestSort('subject')}
                      >
                        <FaBook className="mr-2" />
                        <span>Subject</span>
                        {getSortIcon('subject')}
                      </button>
                    </th>
                    <th className="p-4 text-left">
                      <div className="flex items-center">
                        <FaUserTie className="text-primary mr-2" />
                        <span className="text-dark2 font-medium">Teacher</span>
                      </div>
                    </th>
                    <th className="p-4 text-center">
                      <button
                        className="flex items-center justify-center text-dark2 font-medium hover:text-primary mx-auto"
                        onClick={() => requestSort('grade')}
                      >
                        <span>Grade</span>
                        {getSortIcon('grade')}
                      </button>
                    </th>
                    <th className="p-4 text-center">
                      <button
                        className="flex items-center justify-center text-dark2 font-medium hover:text-primary mx-auto"
                        onClick={() => requestSort('dateReceived')}
                      >
                        <FaCalendarAlt className="mr-2" />
                        <span>Date</span>
                        {getSortIcon('dateReceived')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGrades.map((grade, index) => (
                    <tr 
                      key={index} 
                      className={`border-t hover:bg-light transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-light bg-opacity-30" : ""
                      }`}
                    >
                      <td className="p-4 font-medium text-dark">{grade.subject || "N/A"}</td>
                      <td className="p-4 text-dark2">{grade.teacherName || "N/A"}</td>
                      <td className={`p-4 text-center font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade} {getGradeEmoji(grade.grade)}
                      </td>
                      <td className="p-4 text-center text-dark2">
                        {grade.dateReceived 
                          ? new Date(grade.dateReceived).toLocaleString("ro-RO", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric", 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            }) 
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;