import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaCalendarTimes, FaSpinner, FaArrowLeft, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaBook, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StudentAbsences = () => {
  const [absences, setAbsences] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const response = await axios.get(`/absences/me`);
        setAbsences(response.data);
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

  const sortedAbsences = useMemo(() => {
    let sortableAbsences = [...absences];
    if (sortConfig.key !== null) {
      sortableAbsences.sort((a, b) => {
        // Handle nested properties for sorting
        const aValue = sortConfig.key.includes('.') 
          ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], a)
          : a[sortConfig.key];
        const bValue = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], b)
          : b[sortConfig.key];
          
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAbsences;
  }, [absences, sortConfig]);

  const subjectAbsences = useMemo(() => {
    const counts = absences.reduce((acc, absence) => {
      const subject = absence.student?.classTeacher?.subject || "Unknown Subject";
      if (!acc[subject]) {
        acc[subject] = 0;
      }
      acc[subject] += 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([subject, count]) => ({
      subject,
      count
    }));
  }, [absences]);

  const totalAbsences = useMemo(() => {
    return absences.length;
  }, [absences]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <FaSpinner className="animate-spin text-4xl text-primary" />
          <p className="text-dark2 font-medium">Loading absences...</p>
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
            <FaCalendarTimes className="text-3xl text-primary mr-3" />
            <h2 className="text-2xl font-bold text-dark">Your Absences</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-light p-6 rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark2 text-sm uppercase tracking-wide">Total Absences</p>
                  <p className="text-3xl font-bold text-primary mt-2">{totalAbsences}</p>
                </div>
                <FaExclamationTriangle className={`text-2xl ${totalAbsences > 10 ? "text-red-500" : "text-yellow-500"} opacity-70`} />
              </div>
            </div>
            <div className="bg-light p-6 rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark2 text-sm uppercase tracking-wide">Subjects Affected</p>
                  <p className="text-3xl font-bold text-primary mt-2">{subjectAbsences.length}</p>
                </div>
                <FaBook className="text-2xl text-primary opacity-50" />
              </div>
            </div>
            <div className="bg-light p-6 rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark2 text-sm uppercase tracking-wide">Attendance Status</p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {totalAbsences <= 5 ? "Excellent" : totalAbsences <= 15 ? "Good" : "At Risk"}
                  </p>
                </div>
                <div className="text-2xl">{totalAbsences <= 5 ? "🌟" : totalAbsences <= 15 ? "✅" : "⚠️"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Absences */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-dark mb-4">Absences by Subject</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectAbsences.map((subjectData) => (
              <div key={subjectData.subject} className="bg-light p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-dark">{subjectData.subject}</p>
                  </div>
                  <p className={`text-xl font-bold ${subjectData.count > 5 ? "text-red-600" : "text-yellow-600"}`}>
                    {subjectData.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Absences Table */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {message ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-4">{message}</div>
          ) : sortedAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark2">
              <FaCalendarTimes className="text-5xl mb-4 text-primary opacity-50" />
              <p className="text-xl">No absences found</p>
              <p className="text-sm mt-2">Great job maintaining perfect attendance!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-light">
                    <th className="p-4 text-left">
                      <button
                        className="flex items-center text-dark2 font-medium hover:text-primary"
                        onClick={() => requestSort('student.classTeacher.subject')}
                      >
                        <FaBook className="mr-2" />
                        <span>Subject</span>
                        {getSortIcon('student.classTeacher.subject')}
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
                        onClick={() => requestSort('date')}
                      >
                        <span>Date</span>
                        {getSortIcon('date')}
                      </button>
                    </th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAbsences.map((absence, index) => (
                    <tr 
                      key={absence.id || index} 
                      className={`border-t hover:bg-light transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-light bg-opacity-30" : ""
                      }`}
                    >
                      <td className="p-4 font-medium text-dark">
                        {absence.student?.classTeacher?.subject || "Unknown Subject"}
                      </td>
                      <td className="p-4 text-dark2">
                        {absence.student?.classTeacher?.name || "Unknown Teacher"}
                      </td>
                      <td className="p-4 text-center text-dark2">
                        {absence.date 
                          ? new Date(absence.date).toLocaleString("ro-RO", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric"
                            }) 
                          : "Unknown Date"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          absence.justified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {absence.justified ? "Justified" : "Unjustified"}
                        </span>
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

export default StudentAbsences;