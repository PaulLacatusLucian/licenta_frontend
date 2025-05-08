import React, { useState, useEffect } from "react";
import { FaUserAlt, FaExclamationCircle, FaCheckCircle, FaArrowLeft, 
  FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../../../axiosConfig";
import logo from "../../../assets/logo.png"
import Cookies from 'js-cookie';
import TeacherNavbar from '../TeacherNavbar';

const JustifyAbsences = () => {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [teacherData, setTeacherData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("justify");
  const [justifyingAbsence, setJustifyingAbsence] = useState(null);
  const [isHomeroom, setIsHomeroom] = useState(false);
  const [className, setClassName] = useState("N/A");

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch teacher data
        const teacherResponse = await axios.get(`/teachers/me`);
        setTeacherData(teacherResponse.data);
        
        // Verifică dacă profesorul este diriginte
        const hasClass = teacherResponse.data.hasClassAssigned;
        setIsHomeroom(hasClass);
        
        if (!hasClass) {
          setMessageType("error");
          setMessage("You don't have homeroom teacher privileges to justify absences.");
          setIsLoading(false);
          return;
        }
        
        // Fetch unjustified absences
        const absencesResponse = await axios.get('/absences/class/unjustified');
        const absencesData = absencesResponse.data;
        
        setAbsences(absencesData);
        setFilteredAbsences(absencesData);
        
        // Extrage numele clasei din prima absență (dacă există)
        if (absencesData.length > 0 && absencesData[0].student?.className) {
          setClassName(absencesData[0].student.className);
        }
        
        // Modificăm extragerea de subiecte pentru a gestiona și cazul când classSession.subject este null
        const subjects = [...new Set(absencesData
          .filter(absence => 
            absence.classSession && 
            absence.classSession.subject && 
            absence.classSession.subject.trim() !== ""
          )
          .map(absence => absence.classSession.subject))];
        
        // Dacă nu găsim subiecte direct, încercăm să extragem din teacherWhoMarkedAbsence.subject
        if (subjects.length === 0) {
          const subjectsFromTeacher = [...new Set(absencesData
            .filter(absence => 
              absence.teacherWhoMarkedAbsence && 
              absence.teacherWhoMarkedAbsence.subject && 
              absence.teacherWhoMarkedAbsence.subject.trim() !== ""
            )
            .map(absence => absence.teacherWhoMarkedAbsence.subject))];
          
          setAvailableSubjects(subjectsFromTeacher.sort());
        } else {
          setAvailableSubjects(subjects.sort());
        }
        
        setMessageType("");
        setMessage("");
      } catch (error) {
        setMessageType("error");
        if (error.response?.status === 403) {
          setMessage("You don't have permission to access this page.");
        } else {
          setMessage("Failed to load data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);
  
  useEffect(() => {
    // Filter absences based on search and subject filter
    let result = [...absences];
    
    if (searchQuery) {
      result = result.filter(absence => 
        absence.student?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (subjectFilter !== "all") {
      result = result.filter(absence => {
        // Check subject from multiple sources
        const sessionSubject = absence.classSession?.subject;
        const teacherSubject = absence.teacherWhoMarkedAbsence?.subject;
        
        return sessionSubject === subjectFilter || teacherSubject === subjectFilter;
      });
    }
    
    setFilteredAbsences(result);
  }, [searchQuery, subjectFilter, absences]);

  const handleJustifyAbsence = async (absenceId) => {
    try {
      setJustifyingAbsence(absenceId);
      
      await axios.put(`/absences/${absenceId}/justify`);
      
      // Remove the absence from the list after justification
      setAbsences(prev => prev.filter(absence => absence.id !== absenceId));
      
      setMessageType("success");
      setMessage("Absence successfully justified!");
    } catch (error) {
      setMessageType("error");
      setMessage("Failed to justify absence. Please try again.");
    } finally {
      setJustifyingAbsence(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    
    // Try to extract time part from ISO string
    if (typeof timeString === 'string' && timeString.includes('T')) {
      return timeString.split('T')[1].substring(0, 5);
    }
    
    // Fallback for other formats
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().substring(0, 5);
      }
    } catch (e) {
      return "";
    }
    
    return "";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Folosim componenta TeacherNavbar */}
      <TeacherNavbar 
        teacherData={teacherData}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logo={logo}
      />

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate("/teacher")}
            className="mr-3 text-primary hover:text-secondary"
          >
              <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">Justify Student Absences</h2>
          <div></div> {/* Empty div for flex spacing */}
        </header>

        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-2xl font-bold mb-2">
            Absences Management
          </h3>
          <p className="text-indigo-100 mb-4">Review and justify absences for your class students</p>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Unjustified Absences</p>
              <p className="text-3xl font-bold">{absences.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Subjects</p>
              <p className="text-3xl font-bold">{availableSubjects.length}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Class</p>
              <p className="text-3xl font-bold">{className}</p>
            </div>
          </div>
        </div>

        {!isHomeroom ? (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-center text-center py-8">
              <div className="max-w-md">
                <FaExclamationCircle className="mx-auto text-5xl text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
                <p className="text-gray-600 mb-4">
                  You need to be a homeroom teacher to access this page. 
                  Only homeroom teachers can justify absences for their class.
                </p>
                <button
                  onClick={() => navigate("/teacher")}
                  className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-secondary transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center min-h-[300px] bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">Loading absences data...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
              <FaCheckCircle className="mr-3 text-secondary" />
              Unjustified Absences
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

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-dark2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name"
                    className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  />
                </div>
              </div>
              <div className="md:w-1/3">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-3 text-dark2" />
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="all">All Subjects</option>
                    {availableSubjects.map((subject, index) => (
                      <option key={index} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredAbsences.length === 0 ? (
              <div className="bg-light rounded-lg p-8 text-center">
                <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Unjustified Absences</h3>
                <p className="text-dark2">All absences for your class students have been justified!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary to-secondary text-white">
                      <th className="py-3 px-4 text-left rounded-l-lg">Student</th>
                      <th className="py-3 px-4 text-left">Class</th>
                      <th className="py-3 px-4 text-left">Subject</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAbsences.map(absence => {
                      // Extract information with fallbacks for missing data
                      const studentName = absence.student?.name || "Unknown Student";
                      const className = absence.student?.className || "N/A";
                      
                      // Try to get subject from multiple sources
                      let subject = "N/A";
                      if (absence.classSession?.subject) {
                        subject = absence.classSession.subject;
                      } else if (absence.teacherWhoMarkedAbsence?.subject) {
                        subject = absence.teacherWhoMarkedAbsence.subject;
                      }
                      
                      // Get the date
                      let displayDate = "Unknown date";
                      let displayTime = "";
                      if (absence.sessionDate) {
                        displayDate = formatDate(absence.sessionDate);
                        displayTime = formatTime(absence.sessionDate);
                      } else if (absence.classSession?.startTime) {
                        displayDate = formatDate(absence.classSession.startTime);
                        displayTime = formatTime(absence.classSession.startTime);
                      }
                      
                      return (
                        <tr key={absence.id} className="border-b border-gray-100 hover:bg-primary hover:bg-opacity-5 transition-colors">
                          <td className="py-3 px-4 font-medium">{studentName}</td>
                          <td className="py-3 px-4">{className}</td>
                          <td className="py-3 px-4">{subject}</td>
                          <td className="py-3 px-4">
                            {displayDate}
                            {displayTime && (
                              <span className="text-dark2 ml-2">
                                {displayTime}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleJustifyAbsence(absence.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center"
                              disabled={justifyingAbsence === absence.id}
                            >
                              {justifyingAbsence === absence.id ? (
                                <>
                                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                  Justifying...
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle className="mr-2" />
                                  Justify
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JustifyAbsences;