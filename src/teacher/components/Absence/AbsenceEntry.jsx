import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaUserAlt, FaExclamationCircle, FaHistory, FaArrowLeft, 
  FaSearch, FaFilter, FaSortAlphaDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../axiosConfig";
import logo from "../../../assets/logo.png"
import Cookies from 'js-cookie';
import TeacherNavbar from '../TeacherNavbar';
import { useTranslation } from 'react-i18next';

const AbsenceEntry = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error", "success", or "warning"
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [recentAbsences, setRecentAbsences] = useState([]);
  const [showRecentAbsences, setShowRecentAbsences] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("attendance");

  // Funktion zur Sortierung der Sessions nach Wochentag
  const sortSessionsByDay = (sessions) => {
    const dayOrder = {
      "Luni": 1,
      "Marți": 2, 
      "Miercuri": 3,
      "Joi": 4,
      "Vineri": 5
    };
    
    return [...sessions].sort((a, b) => {
      // Position der Tage in der Wochenreihenfolge erhalten
      const dayA = dayOrder[a.scheduleDay || "Necunoscut"] || 6;
      const dayB = dayOrder[b.scheduleDay || "Necunoscut"] || 6;
      
      // Tage vergleichen
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // Wenn die Tage gleich sind, nach Startzeit sortieren
      const timeA = a.startTime ? a.startTime.substr(11, 5) : "00:00";
      const timeB = b.startTime ? b.startTime.substr(11, 5) : "00:00";
      
      return timeA.localeCompare(timeB);
    });
  };

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
          axios.get(`/teachers/me`)
        ]);
        
        // Erhalte Sessions und stelle sicher, dass jede Lehrerinformationen hat
        let sessions = sessionsResponse.data;
        
        // Fix: Sicherstellen, dass jede Session Lehrerinformationen hat
        if (teacherResponse.data && sessions.length > 0) {
          sessions.forEach(session => {
            if (!session.teacher) {
              session.teacher = {
                id: teacherResponse.data.id,
                name: teacherResponse.data.name,
                subject: teacherResponse.data.subject
              };
            }
          });
        }
        
        // Nur Sessions von Montag bis Freitag filtern
        sessions = sessions.filter(session => {
          return ["Luni", "Marți", "Miercuri", "Joi", "Vineri"].includes(session.scheduleDay);
        });
        
        // Sessions nach Tag und Zeit sortieren
        const sortedSessions = sortSessionsByDay(sessions);
        
        setSessions(sortedSessions);
        console.log("Sessions with teacher data:", sortedSessions);
        
        const studentData = studentsResponse.data;
        setStudents(studentData);
        setFilteredStudents(studentData);
        
        // Lehrerdaten setzen
        setTeacherData(teacherResponse.data);
        
        // Eindeutige Klassennamen extrahieren
        const classes = [...new Set(studentData
          .filter(student => student.studentClass?.name)
          .map(student => student.studentClass.name))];
        setAvailableClasses(classes.sort());
        
        setMessageType("");
        setMessage("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessageType("error");
        setMessage(t('teacher.absence.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  useEffect(() => {
    // Sessions protokollieren, wenn sie geladen werden
    console.log("All sessions:", sessions);
    
    if (selectedSession) {
      const fetchStudentsForSession = async () => {
        try {
          setIsLoading(true);
          setMessageType("");
          setMessage("");
          console.log("Fetching students for session ID:", selectedSession);
          
          // Ausgewähltes Session-Objekt für besseres Debugging erhalten
          const sessionObj = sessions.find(s => s.id === Number(selectedSession));
          if (!sessionObj) {
            console.error("Selected session not found in sessions array");
            setMessageType("error");
            setMessage(t('teacher.absence.sessionNotFound'));
            setIsLoading(false);
            return;
          }
          
          // Klasse für diese Session mit Klassennamen erhalten
          const className = sessionObj.className || "Unknown";
  
          console.log("Selected session details:", {
            id: sessionObj.id,
            subject: sessionObj.subject,
            teacherId: sessionObj.teacher?.id,
            startTime: sessionObj.startTime,
            endTime: sessionObj.endTime,
            className: className
          });
  
          // Überprüfen, ob wir den Klassennamen haben
          if (!className || className === "Unknown") {
            console.error("Class name is missing for this session");
            setMessageType("error");
            setMessage(t('teacher.absence.classMissing'));
            setIsLoading(false);
            return;
          }
  
          // Zuerst die vollständige Klassenliste erhalten, um die ID zu finden
          try {
            // Alle Klassen erhalten
            const classesResponse = await axios.get('/classes');
            
            // Klasse nach Namen suchen
            const classObj = classesResponse.data.find(cls => cls.name === className);
            
            if (!classObj || !classObj.id) {
              console.error(`Class with name ${className} not found`);
              setMessageType("error");
              setMessage(t('teacher.absence.classNotFound', { className }));
              setIsLoading(false);
              return;
            }
            
            const classId = classObj.id;
            console.log(`Found class ID ${classId} for class name ${className}`);
            
            // Jetzt den implementierten Endpunkt mit der Klassen-ID verwenden
            const studentsResponse = await axios.get(`/classes/${classId}/students`, {
              timeout: 15000
            });
            
            // Leere oder ungültige Antworten behandeln
            if (!studentsResponse.data) {
              console.error("Response has no data");
              setMessageType("error");
              setMessage(t('teacher.absence.noStudentData'));
              setFilteredStudents([]);
              setStudents([]);
              setIsLoading(false);
              return;
            }
            
            console.log("Students for class (raw):", studentsResponse.data);
            
            // API-Ergebnis direkt ohne Änderungen verwenden
            const studentsData = studentsResponse.data;
            
            // Wenn keine Schüler gefunden wurden, Nachricht anzeigen
            if (studentsData.length === 0) {
              setMessageType("warning");
              setMessage(t('teacher.absence.noStudentsInClass', { subject: sessionObj.subject, className }));
            } else {
              // Erfolgsmeldung mit Anzahl anzeigen
              setMessageType("success");
              setMessage(t('teacher.absence.studentsFound', { count: studentsData.length, className }));
            }
            
            // Schülerstatus direkt mit API-Daten aktualisieren
            setFilteredStudents(studentsData);
            setStudents(studentsData);
            
            // Auch verfügbare Klassen für Filterung aktualisieren
            const classes = [...new Set(studentsData
              .filter(student => student.studentClass?.name)
              .map(student => student.studentClass.name))];
            setAvailableClasses(classes.sort());
            
          } catch (error) {
            console.error("Error fetching data:", error);
            
            // Erweiterte Fehlerbehandlung
            if (error.response) {
              console.error("Error data:", error.response.data);
              console.error("Error status:", error.response.status);
              
              if (error.response.status === 404) {
                setMessageType("error");
                setMessage(t('teacher.absence.classDeleted'));
              } else if (error.response.status === 403) {
                setMessageType("error");
                setMessage(t('teacher.absence.noPermission'));
              } else {
                setMessageType("error");
                setMessage(t('teacher.absence.serverError', { 
                  status: error.response.status, 
                  message: error.response.data || t('common.unknownError') 
                }));
              }
            } else if (error.request) {
              console.error("No response received:", error.request);
              setMessageType("error");
              setMessage(t('teacher.absence.noResponse'));
            } else {
              console.error("Error message:", error.message);
              setMessageType("error");
              setMessage(t('teacher.absence.error', { message: error.message }));
            }
            
            // Schülerlisten bei Fehler löschen
            setFilteredStudents([]);
            setStudents([]);
          }
        } catch (error) {
          console.error("Error fetching students for session:", error);
          
          // Erweiterte Fehlerbehandlung
          if (error.response) {
            console.error("Error data:", error.response.data);
            console.error("Error status:", error.response.status);
            
            if (error.response.status === 404) {
              setMessageType("error");
              setMessage(t('teacher.absence.sessionDeleted'));
            } else {
              setMessageType("error");
              setMessage(t('teacher.absence.serverError', { 
                status: error.response.status, 
                message: error.response.data || t('common.unknownError') 
              }));
            }
          } else if (error.request) {
            console.error("No response received:", error.request);
            setMessageType("error");
            setMessage(t('teacher.absence.noResponse'));
          } else {
            console.error("Error message:", error.message);
            setMessageType("error");
            setMessage(t('teacher.absence.error', { message: error.message }));
          }
          
          // Schülerlisten bei Fehler löschen
          setFilteredStudents([]);
          setStudents([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchStudentsForSession();
    } else {
      // Wenn keine Session ausgewählt ist, Schülerlisten löschen
      setFilteredStudents([]);
      setStudents([]);
    }
  }, [selectedSession, sessions, t]);
  
  useEffect(() => {
    // Schüler basierend auf Suche und Klassenfilter filtern
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

  const formatSessionLabel = (session) => {
    try {
      if (!session.startTime || !session.endTime) {
        return `${session.subject} (${t('teacher.absence.unknownTime')})`;
      }
      
      const startTime = session.startTime.substr(11, 5);
      const endTime = session.endTime.substr(11, 5);
      
      const dayName = session.scheduleDay || "Necunoscut";
      
      const className = session.className || "Necunoscut";
      
      return `${dayName}, ${className}, ${startTime}-${endTime}`;
    } catch (error) {
      console.error("Error formatting session:", error, session);
      return session.subject || t('teacher.absence.unknownSession');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedSession || !selectedStudent) {
      setMessageType("error");
      setMessage(t('teacher.absence.selectSessionAndStudent'));
      return;
    }
  
    try {
      setIsSubmitting(true);
      setMessage("");
      
      await axios.post(`/class-sessions/session/${selectedSession}/absences`, null, {
        params: {
          studentId: selectedStudent,
        },
      });
  
      // Rest des Codes für Erfolgsbehandlung bleibt unverändert
      const session = sessions.find(s => s.id === Number(selectedSession));
      const student = students.find(s => s.id === selectedStudent);
      
      // Klassennamen erhalten
      let className = session?.className || t('teacher.absence.unknownClass');
      
      if (className === t('teacher.absence.unknownClass')) {
        const studentData = filteredStudents.find(s => s.id === selectedStudent);
        if (studentData?.studentClass?.name) {
          className = studentData.studentClass.name;
        }
      }
  
      setRecentAbsences(prev => [
        {
          id: Date.now(),
          studentId: selectedStudent,
          studentName: student?.name || t('common.unknown'),
          sessionName: session?.subject || t('common.unknown'),
          date: session?.date || new Date().toISOString(),
          timestamp: new Date(),
          className: className
        },
        ...prev.slice(0, 9)
      ]);
  
      setMessageType("success");
      setMessage(t('teacher.absence.successMessage', { name: student?.name }));
  
      setSelectedStudent("");
      setSelectedStudentName("");
    } catch (error) {
      console.error("Error submitting absence:", error);
  
      // Alle möglichen Fehlerquellen überprüfen
      const errorMessage = 
        error.response?.data || 
        error.message || 
        t('common.unknownError');
      
      // Verifică pentru diferite scenarii de eroare
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data || "";
        
        // Verifică pentru conflict de notă în mai multe limbi
        if (errorMessage.includes("notă") || 
            errorMessage.includes("grade") || 
            errorMessage.includes("Note")) {
          // Este un conflict de notă
          setMessageType("error");
          setMessage(t('teacher.absence.hasGradeError'));
        } 
        // Verifică pentru conflict de absență în mai multe limbi
        else if (errorMessage.includes("absență") || 
                 errorMessage.includes("absence") || 
                 errorMessage.includes("Abwesenheit")) {
          // Este un conflict de absență
          setMessageType("warning");
          setMessage(t('teacher.absence.alreadyRecorded'));
        }
        else {
          // Pentru alte conflicte, folosește doar mesajul tradus fără cel de la server
          setMessageType("error");
          setMessage(t('teacher.absence.genericConflictError'));
        }
      } else {
        // Pentru alte erori
        setMessageType("error");
        setMessage(t('teacher.absence.genericError'));
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
    setMessageType("");
    setMessage("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('teacher.absence.unknownDate');
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('teacher.absence.invalidDate');
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* TeacherNavbar Komponente verwenden */}
      <TeacherNavbar 
        teacherData={teacherData}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logo={logo}
      />

      {/* Hauptinhaltsbereich */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate("/teacher")}
            className="mr-3 text-primary hover:text-secondary"
          >
              <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">{t('teacher.absence.title')}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowRecentAbsences(!showRecentAbsences)}
              className="flex items-center text-dark hover:text-secondary transition font-medium"
            >
              <FaHistory className="mr-2" />
              {showRecentAbsences ? t('teacher.absence.hideRecent') : t('teacher.absence.recentAbsences')}
            </button>
          </div>
        </header>

        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-2xl font-bold mb-2">
            {t('teacher.absence.attendanceManagement')}
          </h3>
          <p className="text-indigo-100 mb-4">{t('teacher.absence.subtitle')}</p>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.absence.stats.students')}</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.absence.stats.sessions')}</p>
              <p className="text-3xl font-bold">{sessions.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.absence.stats.classes')}</p>
              <p className="text-3xl font-bold">{availableClasses.length}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('teacher.absence.stats.recentAbsences')}</p>
              <p className="text-3xl font-bold">{recentAbsences.length}</p>
            </div>
          </div>
        </div>

        {showRecentAbsences && recentAbsences.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 transition-all border border-gray-200">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
              <FaHistory className="mr-2 text-secondary" />
              {t('teacher.absence.recentlyRecorded')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary to-secondary text-white">
                    <th className="py-2 px-4 text-left rounded-l-lg">{t('teacher.absence.table.student')}</th>
                    <th className="py-2 px-4 text-left">{t('teacher.absence.table.class')}</th>
                    <th className="py-2 px-4 text-left">{t('teacher.absence.table.session')}</th>
                    <th className="py-2 px-4 text-left">{t('teacher.absence.table.date')}</th>
                    <th className="py-2 px-4 text-left rounded-r-lg">{t('teacher.absence.table.time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAbsences.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-primary hover:bg-opacity-5 transition-colors">
                      <td className="py-2 px-4 font-medium">{entry.studentName}</td>
                      <td className="py-2 px-4">{entry.className || t('common.notAvailable')}</td>
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

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px] bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">{t('teacher.absence.loading')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
              <FaExclamationCircle className="mr-3 text-secondary" />
              {t('teacher.absence.recordAbsence')}
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

            {messageType === "warning" && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-dark font-semibold mb-2 flex items-center">
                  <FaCalendarAlt className="mr-2 text-primary" />
                  {t('teacher.absence.selectSession')}
                </label>
                  <select
                    className="w-full p-3 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-primary bg-light"
                    value={selectedSession}
                    onChange={(e) => {
                      setSelectedSession(e.target.value);
                      setSelectedStudent("");
                      setSelectedStudentName("");
                    }}
                  >
                    <option value="">-- {t('teacher.absence.selectClassSession')} --</option>
                    {sessions.length === 0 ? (
                      <option disabled>{t('teacher.absence.noSessionsAvailable')}</option>
                    ) : (
                      sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {formatSessionLabel(session)}
                        </option>
                      ))
                    )}
                  </select>
              </div>

              <div className="my-6 bg-light p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
                    <label className="block text-dark font-semibold flex items-center">
                      <FaUserAlt className="mr-2 text-secondary" />
                      {t('teacher.absence.selectStudent')}
                      {selectedStudentName && (
                        <span className="ml-2 bg-secondary text-white text-sm px-3 py-1 rounded-full">
                          {t('teacher.absence.selected')}: {selectedStudentName}
                        </span>
                      )}
                    </label>
                    
                    <button 
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="md:hidden text-sm text-dark hover:text-secondary bg-white px-3 py-1 rounded border transition-colors"
                    >
                      {showFilters ? t('teacher.absence.hideFilters') : t('teacher.absence.showFilters')}
                    </button>
                  </div>
                  
                  <div className={`flex gap-2 ${showFilters ? 'block' : 'hidden'} md:flex`}>
                    <button 
                      type="button"
                      onClick={sortStudentsByName}
                      className="flex items-center text-sm text-dark hover:text-secondary bg-white px-3 py-1 rounded border transition-colors"
                    >
                      <FaSortAlphaDown className="mr-1" />
                      {t('teacher.absence.sortByName')}
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
                        {t('teacher.absence.clearFilters')}
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
                        placeholder={t('teacher.absence.searchByName')}
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
                        <option value="all">{t('teacher.absence.allClasses')}</option>
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
                      {t('teacher.absence.noStudentsFound')}
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
                          </div>
                          {student.absenceCount > 0 && (
                            <div className="text-sm bg-red-50 px-2 py-1 rounded-lg text-red-800">
                              {student.absenceCount} {student.absenceCount === 1 ? t('teacher.absence.absence') : t('teacher.absence.absences')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-dark2 flex justify-between">
                  <span>{t('teacher.absence.showing', { filtered: filteredStudents.length, total: students.length })}</span>
                  {selectedStudentName && (
                    <span className="text-secondary font-medium">{t('teacher.absence.clickToChange')}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-1/4 bg-primary text-dark font-medium py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center"
                >
                  {t('teacher.absence.clear')}
                </button>
                
                <button
                  type="submit"
                  className="w-3/4 bg-secondary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                      {t('teacher.absence.submitting')}
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="mr-2" />
                      {t('teacher.absence.recordAbsenceButton')}
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

export default AbsenceEntry;