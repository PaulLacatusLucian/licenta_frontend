import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaArrowLeft, FaPencilAlt, FaTrash, FaSearch, FaFilter, FaBars as Menu } from 'react-icons/fa';
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const ViewAbsences = () => {
  const [absences, setAbsences] = useState([]);
  const [allSessions, setAllSessions] = useState([]); // Adăugat pentru a stoca toate sesiunile
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [justifiedFilter, setJustifiedFilter] = useState("all");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        setLoading(true);
        
        // Încărcăm simultan absențele și sesiunile
        const [absencesResponse, sessionsResponse] = await Promise.all([
          axios.get("/absences"),
          axios.get("/class-sessions")
        ]);
        
        // Salvăm sesiunile pentru a le folosi la corelarea cu absențele
        const sessionsData = sessionsResponse.data;
        setAllSessions(sessionsData);
        
        // Procesăm absențele
        const absencesData = absencesResponse.data;
        console.log("Absences data received:", absencesData);
        
        // Îmbogățim datele despre absențe cu informații din sesiuni
        const enrichedAbsences = absencesData.map(absence => {
          // Găsim sesiunea asociată absenței folosind classSessionId
          const matchingSession = sessionsData.find(
            session => session.id === (absence.classSessionId || absence.classSession?.id)
          );
          
          // Dacă am găsit o sesiune asociată, îmbogățim absența cu datele din sesiune
          if (matchingSession) {
            return {
              ...absence,
              // Adăugăm sau suprasciem proprietățile legate de sesiune
              sessionDay: matchingSession.scheduleDay,
              sessionStartTime: matchingSession.startTime,
              sessionEndTime: matchingSession.endTime,
              sessionSubject: matchingSession.subject,
              sessionClassName: matchingSession.className,
              // Salvăm și obiectul clasă original dacă e nevoie să accesăm direct proprietățile
              fullSession: matchingSession
            };
          }
          
          return absence;
        });
        
        setAbsences(enrichedAbsences);
        
        // Extract unique subjects
        const uniqueSubjects = [...new Set([
          ...sessionsData.map(session => session.subject),
          ...absencesData.filter(absence => absence.subject).map(absence => absence.subject)
        ])].filter(Boolean);
        
        setSubjects(uniqueSubjects.sort());
        
        // Extract unique classes
        const uniqueClasses = [...new Set([
          ...sessionsData.filter(session => session.className).map(session => session.className),
          ...absencesData.filter(absence => absence.className).map(absence => absence.className),
          ...absencesData.filter(absence => absence.student?.className).map(absence => absence.student.className),
          ...absencesData.filter(absence => absence.student?.studentClass?.name).map(absence => absence.student.studentClass.name)
        ])].filter(Boolean);
        
        setClasses(uniqueClasses.sort());
        
        setError(null);
      } catch (err) {
        console.error("Error fetching absences:", err);
        setError("Failed to load absences. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAbsences();
  }, []);
  
  const filteredAbsences = absences.filter(absence =>
    (searchTerm === "" || 
      (absence.student?.name && absence.student.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (subjectFilter === "all" || 
      (absence.subject && absence.subject === subjectFilter) ||
      (absence.sessionSubject && absence.sessionSubject === subjectFilter) ||
      (absence.classSession?.subject && absence.classSession.subject === subjectFilter)) &&
    (classFilter === "all" || 
      (absence.className && absence.className === classFilter) ||
      (absence.sessionClassName && absence.sessionClassName === classFilter) ||
      (absence.student?.className && absence.student.className === classFilter) ||
      (absence.student?.studentClass?.name && absence.student.studentClass.name === classFilter)) &&
    (justifiedFilter === "all" || 
      (justifiedFilter === "justified" && absence.justified === true) ||
      (justifiedFilter === "unjustified" && (absence.justified === false || absence.justified === null)))
  );

  const toggleMobileMenu = (absenceId) => {
    setShowMobileMenu(showMobileMenu === absenceId ? null : absenceId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data necunoscută";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data invalidă";
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Funcție pentru a formata data cu ziua săptămânii din clasă - complet rescrisă
  const formatDateWithDay = (absence) => {
    // 1. Verificăm mai întâi câmpul sessionDay pe care l-am creat în useEffect
    if (absence?.sessionDay) {
      return absence.sessionDay;
    }
    
    // 2. Verificăm câmpul scheduleDay în classSession
    if (absence?.classSession?.scheduleDay) {
      return absence.classSession.scheduleDay;
    }
    
    // 3. Verifică direct câmpul scheduleDay
    if (absence?.scheduleDay) {
      return absence.scheduleDay;
    }
    
    // 4. Caută sesiunea în lista de sesiuni folosind classSessionId
    if (absence?.classSessionId && allSessions.length > 0) {
      const matchingSession = allSessions.find(s => s.id === (typeof absence.classSessionId === 'string' ? 
                                                              parseInt(absence.classSessionId) : 
                                                              absence.classSessionId));
      if (matchingSession && matchingSession.scheduleDay) {
        return matchingSession.scheduleDay;
      }
    }
    
    // 5. Verifică fullSession (salvat în useEffect)
    if (absence?.fullSession?.scheduleDay) {
      return absence.fullSession.scheduleDay;
    }
    
    // 6. Ca ultimă opțiune, folosește data absenței pentru a calcula ziua săptămânii
    if (absence?.date) {
      const date = new Date(absence.date);
      if (!isNaN(date.getTime())) {
        const daysOfWeek = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
        return daysOfWeek[date.getDay()];
      }
    }
    
    return "Data necunoscută";
  };

  // Funcție pentru a formata informațiile sesiunii
  const formatSessionInfo = (absence) => {
    if (!absence) return "Necunoscută";
    
    // Prioritate pentru câmpurile adăugate în useEffect
    let info = "";
    
    if (absence.sessionSubject) {
      info = absence.sessionSubject;
    } else if (absence.classSession?.subject) {
      info = absence.classSession.subject;
    } else if (absence.subject) {
      info = absence.subject;
    } else {
      info = "Materie necunoscută";
    }
    
    // Adaugă ora - mai întâi verifică câmpurile adăugate în useEffect
    if (absence.sessionStartTime && absence.sessionEndTime) {
      const startTime = formatTime(absence.sessionStartTime);
      const endTime = formatTime(absence.sessionEndTime);
      info += ` (${startTime}-${endTime})`;
    } 
    // Apoi verifică classSession
    else if (absence.classSession?.startTime && absence.classSession?.endTime) {
      const startTime = formatTime(absence.classSession.startTime);
      const endTime = formatTime(absence.classSession.endTime);
      info += ` (${startTime}-${endTime})`;
    }
    // Apoi verifică fullSession
    else if (absence.fullSession?.startTime && absence.fullSession?.endTime) {
      const startTime = formatTime(absence.fullSession.startTime);
      const endTime = formatTime(absence.fullSession.endTime);
      info += ` (${startTime}-${endTime})`;
    }
    // Apoi încearcă din sesiune direct
    else if (absence.startTime && absence.endTime) {
      const startTime = formatTime(absence.startTime);
      const endTime = formatTime(absence.endTime);
      info += ` (${startTime}-${endTime})`;
    }
    // Ca ultimă opțiune, folosește câmpul date
    else if (absence.date) {
      const time = formatTime(absence.date);
      if (time) {
        info += ` (${time})`;
      }
    }
    
    // Adaugă numele clasei
    if (absence.sessionClassName) {
      info += `, ${absence.sessionClassName}`;
    } else if (absence.classSession?.className) {
      info += `, ${absence.classSession.className}`;
    } else if (absence.className) {
      info += `, ${absence.className}`;
    } else if (absence.student?.className) {
      info += `, ${absence.student.className}`;
    } else if (absence.student?.studentClass?.name) {
      info += `, ${absence.student.studentClass.name}`;
    }
    
    return info;
  };

  const handleDeleteAbsence = async (absenceId) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți această absență?")) {
      try {
        await axios.delete(`/absences/${absenceId}`);
        setAbsences(absences.filter(absence => absence.id !== absenceId));
      } catch (err) {
        console.error("Error deleting absence:", err);
        setError("Failed to delete absence. Please try again.");
      }
    }
  };

  const handleJustifyAbsence = async (absenceId) => {
    try {
      // Folosim doar metoda PUT directă care funcționează (status 200)
      await axios.put(`/absences/${absenceId}`, { justified: true });
      
      // Actualizăm starea locală
      setAbsences(absences.map(absence => 
        absence.id === absenceId ? {...absence, justified: true} : absence
      ));
    } catch (err) {
      console.error("Error justifying absence:", err);
      setError("Failed to justify absence. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4">
      <div className="w-full mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-3 sm:p-6 pb-2 sm:pb-4 border-b flex items-center flex-wrap">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2 sm:mb-0"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          <h2 className="text-lg font-semibold ml-auto">Administrare Absențe</h2>
        </div>

        <div className="p-3 sm:p-6">
          {error && (
            <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm bg-red-50/50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Caută după nume elev..."
                className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 sm:w-1/4">
              <select
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">Toate materiile</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 sm:w-1/4">
              <select
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">Toate clasele</option>
                {classes.map((className, index) => (
                  <option key={index} value={className}>{className}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 sm:w-1/4">
              <select
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={justifiedFilter}
                onChange={(e) => setJustifiedFilter(e.target.value)}
              >
                <option value="all">Toate absențele</option>
                <option value="justified">Motivate</option>
                <option value="unjustified">Nemotivate</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on small screens */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Elev
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clasa
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sesiune
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ziua
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAbsences.map((absence) => (
                      <tr key={absence.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {absence.student?.name || "Necunoscut"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {absence.student?.className || absence.student?.studentClass?.name || absence.className || absence.sessionClassName || "Necunoscută"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatSessionInfo(absence)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateWithDay(absence)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                            absence.justified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {absence.justified ? "Motivată" : "Nemotivată"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/absences/edit/${absence.id}`)}
                            className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                          >
                            <FaPencilAlt className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAbsence(absence.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <FaTrash className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Shown only on small screens */}
              <div className="md:hidden">
                {filteredAbsences.map((absence) => (
                  <div key={absence.id} className="bg-white rounded-lg border mb-3 overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{absence.student?.name || "Necunoscut"}</h3>
                        <button
                          onClick={() => toggleMobileMenu(absence.id)}
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <Menu className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Clasa:</span>
                        <span className="text-gray-900">{absence.student?.className || absence.student?.studentClass?.name || absence.className || absence.sessionClassName || "Necunoscută"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sesiune:</span>
                        <span className="text-gray-900">{formatSessionInfo(absence)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ziua:</span>
                        <span className="text-gray-900">{formatDateWithDay(absence)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                          absence.justified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {absence.justified ? "Motivată" : "Nemotivată"}
                        </span>
                      </div>
                    </div>
                    
                    {showMobileMenu === absence.id && (
                      <div className="p-3 bg-gray-50 border-t flex justify-end space-x-3">
                        <button
                          onClick={() => navigate(`/admin/absences/edit/${absence.id}`)}
                          className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                        >
                          <FaPencilAlt className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAbsence(absence.id)}
                          className="bg-white text-red-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                        >
                          <FaTrash className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredAbsences.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  {searchTerm || subjectFilter !== "all" || classFilter !== "all" || justifiedFilter !== "all"
                    ? "Nu s-au găsit absențe care să îndeplinească criteriile de filtrare." 
                    : "Nu există absențe disponibile."}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigate("/admin/absences/create")}
                  className="inline-flex items-center bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <FaCalendar className="mr-2 h-4 w-4" />
                  Adaugă Absență
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAbsences;