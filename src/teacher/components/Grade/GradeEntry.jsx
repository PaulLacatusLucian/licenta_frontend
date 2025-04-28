import React, { useState, useEffect } from 'react';
import { FaBook, FaUserGraduate, FaStar, FaClipboardCheck, FaArrowLeft, FaSearch, 
  FaFilter, FaSortAlphaDown, FaHistory, FaArrowRight, FaHome, FaCalendarAlt, 
  FaSignOutAlt, FaBars, FaChartLine, FaClipboardList, FaVideo } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import Cookies from 'js-cookie';
import logo from "../../../assets/logo.png"

const GradeEntryPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [recentlyGraded, setRecentlyGraded] = useState([]);
  const [showRecentGrades, setShowRecentGrades] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("grades");

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sessionsResponse, studentsResponse, teacherResponse] = await Promise.all([
          axios.get(`/teachers/me/sessions`),
          axios.get(`/teachers/me/students`),
          axios.get(`/teachers/me`) // Added teacher data fetch
        ]);
        
        // Sort sessions by date (most recent first)
        const sortedSessions = sessionsResponse.data.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setSessions(sortedSessions);
        
        const studentData = studentsResponse.data;
        setStudents(studentData);
        setFilteredStudents(studentData);
        
        // Set teacher data
        setTeacherData(teacherResponse.data);
        
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
  }, [navigate]);

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

  // Helper function to format date as DD.MM.YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "Data necunoscută";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data invalidă";
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession || !selectedStudent || !gradeValue) {
      setMessageType("error");
      setMessage("Please select a session, student, and enter a grade.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      setMessage("");
      await axios.post(`/class-sessions/session/${selectedSession}/grades`, null, {
        params: {
          studentId: selectedStudent,
          gradeValue: parseFloat(gradeValue),
        },
      });
    
      // Find session and student names for the recently graded list
      const session = sessions.find(s => String(s.id) === String(selectedSession));
      const student = students.find(s => s.id === selectedStudent);

      const sessionDate = session?.date ? formatDate(session.date) : "Data necunoscută";
      const sessionStart = session?.startTime?.slice(0, 5) || "?";
      const sessionEnd = session?.endTime?.slice(0, 5) || "?";
    
      // Add to recently graded list
      setRecentlyGraded(prev => [
        {
          id: Date.now(),
          studentId: selectedStudent,
          studentName: student?.name || "Unknown",
          sessionName: `${session?.subject || "Materie necunoscută"} (${sessionDate})`,
          sessionTime: `${sessionStart} - ${sessionEnd}`,
          grade: gradeValue,
          timestamp: new Date()
        },
        ...prev.slice(0, 9)
      ]);
    
      setMessageType("success");
      setMessage(`Grade ${gradeValue} successfully submitted for ${student?.name}!`);
      
      // Reset form after successful submission
      setGradeValue("");
      setSelectedStudent("");
      setSelectedStudentName("");
    } catch (error) {
      console.error("Error submitting grade:", error);
    
      if (error.response?.status === 409) {
        // Student is absent
        setMessageType("error");
        setMessage(error.response.data || "This student is absent and cannot receive a grade.");
      } else {
        setMessageType("error");
        setMessage("Failed to submit grade. Please try again.");
      }
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
    setGradeValue("");
    setMessageType("");
    setMessage("");
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };
  
  // Match the navItems from TeacherDashboard
  const navItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/teacher" },
    { icon: FaUserGraduate, label: "Students", view: "students", path: "/teacher/students" },
    { icon: FaChartLine, label: "Grades", view: "grades", path: "/teacher/grades" },
    { icon: FaClipboardList, label: "Attendance", view: "attendance", path: "/teacher/attendance" },
    { icon: FaCalendarAlt, label: "Schedule", view: "schedule", path: "/teacher/schedule" },
    { icon: FaVideo, label: "Start Meeting", view: "meetings", path: "/teacher/meetings/new" }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-white">
          Enter Grades
        </h2>
      </div>

      {/* Sidebar - Matched styling from TeacherDashboard */}
      <div className={`
        fixed md:static w-72 bg-gradient-to-b from-primary to-secondary text-white p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto
      `}>
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <img 
              src={logo}
              alt="School Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Teacher Portal</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">{teacherData?.subject || 'Teacher'}</p>
          </div>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map(({ icon: Icon, label, view, path }) => (
              <li key={path}>
                <Link 
                  to={path} 
                  className={`flex items-center p-3 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200 ${
                    activeView === view ? "bg-white bg-opacity-20 text-white" : "text-white"
                  }`}
                  onClick={() => {
                    setActiveView(view);
                    setIsSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 text-xl" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="mt-auto pt-6 border-t border-white border-opacity-30">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-white hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-3 text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">Enter Grades</h2>
          <div className="flex items-center space-x-4">
          
            <button
              onClick={() => setShowRecentGrades(!showRecentGrades)}
              className="flex items-center text-dark hover:text-secondary transition font-medium"
            >
              <FaHistory className="mr-2" />
              {showRecentGrades ? "Hide Recent" : "Recent Grades"}
              {!showRecentGrades && <FaArrowRight className="ml-2" />}
            </button>
          </div>
        </header>

        {showRecentGrades && recentlyGraded.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 transition-all border border-gray-200">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
              <FaHistory className="mr-2 text-secondary" />
              Recently Graded Students
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary to-secondary text-white">
                    <th className="py-2 px-4 text-left rounded-l-lg">Student</th>
                    <th className="py-2 px-4 text-left">Session</th>
                    <th className="py-2 px-4 text-left">Grade</th>
                    <th className="py-2 px-4 text-left rounded-r-lg">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyGraded.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-primary hover:bg-opacity-5 transition-colors">
                      <td className="py-2 px-4 font-medium">{entry.studentName}</td>
                      <td className="py-2 px-4">
                        {entry.sessionName}
                        <br />
                        <span className="text-sm text-dark2">{entry.sessionTime}</span>
                      </td>
                      <td className="py-2 px-4 font-medium text-secondary">{entry.grade}</td>
                      <td className="py-2 px-4 text-dark2">{formatTimestamp(entry.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-2xl font-bold mb-2">
            Grade Entry System
          </h3>
          <p className="text-indigo-100 mb-4">Record student performance and track academic progress</p>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Students</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Sessions</p>
              <p className="text-3xl font-bold">{sessions.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Classes</p>
              <p className="text-3xl font-bold">{availableClasses.length}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Recent Grades</p>
              <p className="text-3xl font-bold">{recentlyGraded.length}</p>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px] bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">Loading data...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
              <FaClipboardCheck className="mr-3 text-secondary" />
              Enter New Grade
            </h2>

            {messageType === "error" && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              </div>
            )}

            {messageType === "success" && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-dark font-semibold mb-2 flex items-center">
                    <FaBook className="mr-2 text-primary" />
                    Select Session
                  </label>
                  <select
                    className="w-full p-3 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-primary bg-light"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(Number(e.target.value))}
                  >
                    <option value="">-- Select a class session --</option>
                    {sessions.length === 0 ? (
                      <option disabled>No sessions available</option>
                    ) : (
                      sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.subject} ({formatDate(session.date)}) ({session.startTime} - {session.endTime})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-dark font-semibold mb-2 flex items-center">
                    <FaStar className="mr-2 text-secondary" />
                    Grade Value
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      placeholder="Enter grade (1-10)"
                      className="flex-1 p-3 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
                      value={gradeValue}
                      onChange={(e) => setGradeValue(e.target.value)}
                    />
                    <div className="grid grid-cols-6 gap-1">
                      {[7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`p-2 border rounded-lg ${gradeValue == num ? 'bg-secondary text-white border-secondary' : 'hover:bg-primary hover:bg-opacity-10'}`}
                          onClick={() => setGradeValue(num.toString())}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="p-2 border rounded-lg hover:bg-primary hover:bg-opacity-10"
                        onClick={() => {
                          const currentValue = parseFloat(gradeValue) || 1;
                          const newValue = Math.max(1, currentValue - 0.5);
                          setGradeValue(newValue.toString());
                        }}
                      >
                        -0.5
                      </button>
                      <button
                        type="button"
                        className="p-2 border rounded-lg hover:bg-primary hover:bg-opacity-10"
                        onClick={() => {
                          const currentValue = parseFloat(gradeValue) || 0;
                          const newValue = Math.min(10, currentValue + 0.5);
                          setGradeValue(newValue.toString());
                        }}
                      >
                        +0.5
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-6 bg-light p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <label className="block text-dark font-semibold flex items-center mb-2 md:mb-0">
                    <FaUserGraduate className="mr-2 text-secondary" />
                    Find Student
                    {selectedStudentName && (
                      <span className="ml-2 bg-secondary text-white text-sm px-3 py-1 rounded-full">
                        Selected: {selectedStudentName}
                      </span>
                    )}
                  </label>
                  
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={sortStudentsByName}
                      className="flex items-center text-sm text-dark hover:text-secondary bg-white px-3 py-1 rounded border transition-colors"
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
                        className="text-sm text-dark hover:text-red-600 bg-white px-3 py-1 rounded border transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 text-dark2" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by student name"
                        className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/3">
                    <div className="relative">
                      <FaFilter className="absolute left-3 top-3 text-dark2" />
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                            selectedStudent === student.id ? 'bg-primary bg-opacity-10' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleStudentSelect(student)}
                        >
                          <div className={`w-4 h-4 mr-3 rounded-full border ${
                            selectedStudent === student.id ? 'bg-secondary border-secondary' : 'border-gray-400'
                          }`}>
                            {selectedStudent === student.id && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5 mx-auto"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-dark2">
                              {student.studentClass?.name || 'No class'}
                            </div>
                          </div>
                          {student.recentGrade && (
                            <div className={`text-sm px-2 py-1 rounded-lg ${
                              selectedStudent === student.id 
                                ? 'bg-white bg-opacity-20 text-secondary' 
                                : 'bg-primary bg-opacity-10 text-primary'
                            }`}>
                              Last grade: {student.recentGrade}
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
                  className="w-1/4 bg-primary text-dark font-medium py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center"
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
                      <FaClipboardCheck className="mr-2" />
                      Submit Grade
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeEntryPage;