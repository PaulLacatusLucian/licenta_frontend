import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaArrowLeft, FaSyncAlt, FaFilter, FaInfoCircle } from "react-icons/fa";
import axios from "../../../axiosConfig";

const CreateAbsence = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: "",
    sessionId: "",
    justified: false
  });

  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  // Încarcă doar clasele inițial
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Încarcă doar clasele
        const classesResponse = await axios.get("/classes");
        setClasses(classesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMessage({
          type: "error",
          text: "Eroare la încărcarea datelor. Te rog încearcă din nou."
        });
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Încarcă elevii și sesiunile când se schimbă clasa selectată
  useEffect(() => {
    const fetchDataForClass = async () => {
      // Resetează valorile formularului când se schimbă clasa
      setFormData(prev => ({
        ...prev,
        studentId: "",
        sessionId: ""
      }));
      
      if (!selectedClass) {
        setFilteredStudents([]);
        setFilteredSessions([]);
        return;
      }
      
      try {
        // Încarcă elevii pentru clasa selectată
        setStudentsLoading(true);
        const studentsResponse = await axios.get(`/classes/${selectedClass}/students`);
        setStudents(studentsResponse.data);
        setFilteredStudents(studentsResponse.data);
        setStudentsLoading(false);
        
        // Încarcă sesiunile și filtrează pentru clasa selectată
        setSessionLoading(true);
        const sessionsResponse = await axios.get("/class-sessions");
        setSessions(sessionsResponse.data);
        
        // Obține detalii despre clasă
        const classDetails = await axios.get(`/classes/${selectedClass}`);
        const className = classDetails.data.name;
        
        // Filtrează sesiunile care includ clasa selectată
        const relevantSessions = sessionsResponse.data.filter(session => {
          if (!session.className) {
            return false;
          }
          
          // Verifică dacă numele clasei apare în className al sesiunii
          const classRegex = new RegExp(`\\b${className}\\b`);
          if (classRegex.test(session.className)) {
            return true;
          }
          
          // Alternativ, verifică dacă numele clasei este în lista de clase
          const classNames = session.className.split(/[-,\s]+/);
          if (classNames.includes(className)) {
            return true;
          }
          
          return false;
        });
        
        setFilteredSessions(relevantSessions);
        setSessionLoading(false);
        
      } catch (error) {
        console.error("Error fetching data for class:", error);
        setMessage({
          type: "error",
          text: "Eroare la încărcarea datelor pentru clasa selectată."
        });
        setStudentsLoading(false);
        setSessionLoading(false);
      }
    };

    fetchDataForClass();
  }, [selectedClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId || !formData.sessionId) {
      setMessage({
        type: "error", 
        text: "Selectează un elev și o sesiune."
      });
      return;
    }

    try {
      const requestData = {
        studentId: formData.studentId,
        classSessionId: formData.sessionId
      };
      
      const response = await axios.post(`/absences/session/${formData.sessionId}`, requestData);
      
      // If the absence should be justified, make a separate call
      if (formData.justified) {
        await axios.put(`/absences/${response.data.id}/justify`);
      }
      
      setMessage({
        type: "success",
        text: "Absența a fost adăugată cu succes!"
      });
      
      // Reset form
      setFormData({
        studentId: "",
        sessionId: "",
        justified: false
      });
      
      setTimeout(() => {
        navigate("/admin/absences");
      }, 1500);
    } catch (error) {
      console.error("Error creating absence:", error);
      
      // Check specific error messages from the API
      if (error.response && error.response.status === 409) {
        setMessage({
          type: "error",
          text: error.response.data || "Conflict: Elevul are deja o absență sau o notă pentru această sesiune."
        });
      } else {
        setMessage({
          type: "error",
          text: "Eroare la adăugarea absenței. Te rog încearcă din nou."
        });
      }
    }
  };

  const formatSessionLabel = (session) => {
    if (!session) return "";
    
    let label = session.subject || "Necunoscut";
    
    // Adaugă ziua săptămânii
    if (session.scheduleDay) {
      label = `${session.scheduleDay}, `;
    }
    
    // Adaugă numele clasei
    if (session.className) {
      label += `${session.className}, `;
    }
    
    // Adaugă orele de început și sfârșit
    if (session.startTime && session.endTime) {
      const startTime = session.startTime.substr(11, 5);
      const endTime = session.endTime.substr(11, 5);
      label += `${startTime}-${endTime}`;
    } else if (session.startTime) {
      // Dacă avem doar ora de început, adăugăm data
      const startTime = new Date(session.startTime);
      label += ` (${startTime.toLocaleDateString()})`;
    }
    
    // Adaugă materia dacă nu a fost adăugată la început
    if (!label.includes(session.subject) && session.subject) {
      label += ` - ${session.subject}`;
    }
    
    return label;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-gray-500">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin/absences")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Listă
          </button>
          <h2 className="text-lg font-semibold ml-auto">Adaugă Absență</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50/50 text-green-600 border border-green-200"
                  : "bg-red-50/50 text-red-600 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 flex items-center">
                <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
                Selectează Clasa
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                required
              >
                <option value="">-- Selectează o clasă --</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name} 
                    {classItem.specialization ? ` (${classItem.specialization})` : ''}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 flex items-start">
                <FaInfoCircle className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                <span>Selectarea clasei va încărca automat elevii și sesiunile disponibile.</span>
              </div>
            </div>

            {selectedClass && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 flex items-center">
                    <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
                    Elev
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {studentsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <FaSyncAlt className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500">Se încarcă elevii...</span>
                    </div>
                  ) : (
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      required
                      className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                    >
                      <option value="">-- Selectează Elevul --</option>
                      {filteredStudents.length === 0 ? (
                        <option disabled value="">Nu există elevi în această clasă</option>
                      ) : (
                        filteredStudents.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 flex items-center">
                    <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
                    Sesiune Curs
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {sessionLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <FaSyncAlt className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500">Se încarcă sesiunile...</span>
                    </div>
                  ) : (
                    <select
                      name="sessionId"
                      value={formData.sessionId}
                      onChange={(e) => setFormData({...formData, sessionId: e.target.value})}
                      required
                      className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                    >
                      <option value="">-- Selectează Sesiunea --</option>
                      {filteredSessions.length === 0 ? (
                        <option disabled value="">Nu există sesiuni pentru această clasă</option>
                      ) : (
                        filteredSessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {formatSessionLabel(session)}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="justified"
                      checked={formData.justified}
                      onChange={(e) => setFormData({...formData, justified: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <label htmlFor="justified" className="ml-2 block text-sm text-gray-900">
                      Absență motivată
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Dacă este bifat, absența va fi marcată automat ca motivată.
                  </p>
                </div>
              </>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/absences")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={!selectedClass || !formData.studentId || !formData.sessionId}
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <FaCalendar className="mr-2 h-4 w-4" />
                Adaugă
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAbsence;