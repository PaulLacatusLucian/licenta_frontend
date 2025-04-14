import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import { FaCalendarAlt, FaUserAlt, FaExclamationCircle, FaHistory, FaArrowLeft, FaSearch, FaFilter, FaSortAlphaDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AbsenceEntry = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [recentAbsences, setRecentAbsences] = useState([]);
  const [showRecentAbsences, setShowRecentAbsences] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sessionsResponse, studentsResponse] = await Promise.all([
          axios.get(`/teachers/me/sessions`),
          axios.get(`/teachers/me/students`),
        ]);
        
        // Sort sessions by date (most recent first)
        const sortedSessions = sessionsResponse.data.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setSessions(sortedSessions);
        
        const studentData = studentsResponse.data;
        setStudents(studentData);
        setFilteredStudents(studentData);
        
        // Extract unique class names
        const classes = [...new Set(studentData
          .filter(student => student.studentClass?.name)
          .map(student => student.studentClass.name))];
        setAvailableClasses(classes.sort());
        
        setMessageType("");
        setMessage("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessageType("error");
        setMessage("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter students based on search and class filter
    let result = [...students];
    
    if (studentSearch) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    
    if (classFilter !== "all") {
      result = result.filter(student => 
        student.studentClass?.name === classFilter
      );
    }
    
    setFilteredStudents(result);
  }, [studentSearch, classFilter, students]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedSession || !selectedStudent) {
      setMessageType("error");
      setMessage("Please select a session and a student.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      setMessage("");
      // Send absence to API
      await axios.post(`/class-sessions/session/${selectedSession}/absences`, null, {
        params: {
          studentId: selectedStudent,
        },
      });
      
      // Find session and student names for the recently absences list
      const session = sessions.find(s => s.id === selectedSession);
      const student = students.find(s => s.id === selectedStudent);
      
      // Add to recently absences list
      setRecentAbsences(prev => [
        {
          id: Date.now(),
          studentId: selectedStudent,
          studentName: student?.name || "Unknown",
          sessionName: session?.subject || "Unknown",
          date: session?.date || new Date().toISOString(),
          timestamp: new Date()
        },
        ...prev.slice(0, 9) // Keep only the 10 most recent
      ]);
      
      setMessageType("success");
      setMessage(`Absence successfully recorded for ${student?.name}!`);
      
      // Reset student selection after successful submission
      setSelectedStudent("");
      setSelectedStudentName("");
    } catch (error) {
      console.error("Error submitting absence:", error);
      setMessageType("error");
      setMessage("Failed to submit absence. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortStudentsByName = () => {
    const sorted = [...filteredStudents].sort((a, b) => a.name.localeCompare(b.name));
    setFilteredStudents(sorted);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student.id);
    setSelectedStudentName(student.name);
  };

  const clearForm = () => {
    setSelectedSession("");
    setSelectedStudent("");
    setSelectedStudentName("");
    setMessageType("");
    setMessage("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="bg-light min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/teacher')}
            className="flex items-center text-dark hover:text-secondary transition font-medium"
            aria-label="Back to Dashboard"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => setShowRecentAbsences(!showRecentAbsences)}
            className="flex items-center text-dark hover:text-secondary transition font-medium"
          >
            <FaHistory className="mr-2" />
            {showRecentAbsences ? "Hide Recent" : "Recent Absences"}
          </button>
        </div>

        {showRecentAbsences && recentAbsences.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 transition-all">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
              <FaHistory className="mr-2 text-secondary" />
              Recently Recorded Absences
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-yellow-50">
                    <th className="py-2 px-4 text-left">Student</th>
                    <th className="py-2 px-4 text-left">Session</th>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAbsences.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-yellow-50">
                      <td className="py-2 px-4">{entry.studentName}</td>
                      <td className="py-2 px-4">{entry.sessionName}</td>
                      <td className="py-2 px-4">{formatDate(entry.date)}</td>
                      <td className="py-2 px-4 text-dark2">{formatTime(entry.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
            <FaExclamationCircle className="mr-3 text-secondary" />
            Record Absence
          </h2>

          {messageType === "error" && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            </div>
          )}

          {messageType === "success" && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block p-3 bg-primary rounded-full">
                <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-dark2">Loading data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-dark font-semibold mb-2 flex items-center">
                  <FaCalendarAlt className="mr-2 text-yellow-500" />
                  Select Session
                </label>
                <select
                  className="w-full p-3 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  <option value="">-- Select a class session --</option>
                  {sessions.length === 0 ? (
                    <option disabled>No sessions available</option>
                  ) : (
                    sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.subject} ({session.date?.split('T')[0] || 'Unknown date'}) ({session.startTime} - {session.endTime})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
                    <label className="block text-dark font-semibold flex items-center">
                      <FaUserAlt className="mr-2 text-yellow-500" />
                      Select Student
                      {selectedStudentName && (
                        <span className="ml-2 bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
                          Selected: {selectedStudentName}
                        </span>
                      )}
                    </label>
                    
                    <button 
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="md:hidden text-sm text-dark hover:text-yellow-600 bg-white px-3 py-1 rounded border"
                    >
                      {showFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                  </div>
                  
                  <div className={`flex gap-2 ${showFilters ? 'block' : 'hidden'} md:flex`}>
                    <button 
                      type="button"
                      onClick={sortStudentsByName}
                      className="flex items-center text-sm text-dark hover:text-yellow-600 bg-white px-3 py-1 rounded border"
                    >
                      <FaSortAlphaDown className="mr-1" />
                      Sort by name
                    </button>
                    
                    {(selectedStudentName || studentSearch || classFilter !== "all") && (
                      <button 
                        type="button"
                        onClick={() => {
                          setStudentSearch("");
                          setClassFilter("all");
                          setSelectedStudent("");
                          setSelectedStudentName("");
                        }}
                        className="text-sm text-dark hover:text-red-600 bg-white px-3 py-1 rounded border"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={`flex flex-col md:flex-row gap-4 mb-4 ${showFilters ? 'block' : 'hidden'} md:flex`}>
                  <div className="flex-1">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 text-dark2" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by student name"
                        className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/3">
                    <div className="relative">
                      <FaFilter className="absolute left-3 top-3 text-dark2" />
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="all">All Classes</option>
                        {availableClasses.map((className, index) => (
                          <option key={index} value={className}>{className}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded-lg bg-white">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-dark2">
                      No students found matching your criteria
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredStudents.map((student) => (
                        <div 
                          key={student.id}
                          className={`p-3 flex items-center cursor-pointer transition ${
                            selectedStudent === student.id ? 'bg-yellow-100' : 'hover:bg-yellow-50'
                          }`}
                          onClick={() => handleStudentSelect(student)}
                        >
                          <div className={`w-4 h-4 mr-3 rounded-full border ${
                            selectedStudent === student.id ? 'bg-yellow-500 border-yellow-600' : 'border-gray-400'
                          }`}>
                            {selectedStudent === student.id && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5 mx-auto"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-dark2">{student.studentClass?.name || 'No class'}</div>
                          </div>
                          {student.absenceCount > 0 && (
                            <div className="text-sm bg-red-50 px-2 py-1 rounded-lg text-red-800">
                              {student.absenceCount} {student.absenceCount === 1 ? 'absence' : 'absences'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-dark2 flex justify-between">
                  <span>Showing {filteredStudents.length} of {students.length} students</span>
                  {selectedStudentName && (
                    <span className="text-secondary font-medium">Click on another student to change selection</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-1/4 bg-gray-100 text-dark font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition"
                >
                  Clear
                </button>
                
                <button
                  type="submit"
                  className="w-3/4 bg-secondary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="mr-2" />
                      Record Absence
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbsenceEntry;