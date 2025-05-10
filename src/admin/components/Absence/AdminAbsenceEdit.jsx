import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaArrowLeft, FaCheck, FaTimes, FaCalendarCheck, FaBan } from "react-icons/fa";
import axios from "../../../axiosConfig";

const AdminAbsenceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [absence, setAbsence] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    classSessionId: "",
    justified: false
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justifyError, setJustifyError] = useState(null);
  const [wasInitiallyJustified, setWasInitiallyJustified] = useState(false); // Adăugat pentru a ține evidența stării inițiale

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [absenceRes, studentsRes, sessionsRes] = await Promise.all([
          axios.get(`/absences/${id}`),
          axios.get('/students'),
          axios.get('/class-sessions')
        ]);
        
        // Obținem detaliile absenței
        const absenceData = absenceRes.data;
        
        // Salvăm starea inițială a absenței pentru a verifica dacă s-a schimbat
        setWasInitiallyJustified(absenceData.justified || false);
        
        // Obținem lista de sesiuni
        const sessionsData = sessionsRes.data;
        
        // Logăm datele primite despre absență pentru debugging
        console.log("Absence data received:", absenceData);
        console.log("Initial justified status:", absenceData.justified);
        console.log("Sessions data:", sessionsData);
        
        // Găsim sesiunea asociată absenței pentru a avea toate datele necesare
        const sessionId = absenceData.classSessionId || absenceData.classSession?.id;
        const matchingSession = sessionId ? sessionsData.find(s => s.id === parseInt(sessionId)) : null;
        
        console.log("Matching session found:", matchingSession);
        
        // Îmbogățim absența cu datele din sesiune
        const enrichedAbsence = {
          ...absenceData,
          // Adăugăm proprietăți suplimentare dacă am găsit sesiunea
          sessionInfo: matchingSession ? {
            day: matchingSession.scheduleDay,
            startTime: matchingSession.startTime,
            endTime: matchingSession.endTime,
            subject: matchingSession.subject,
            className: matchingSession.className
          } : null,
          // Salvăm referința la sesiunea întreagă
          fullSession: matchingSession
        };
        
        setAbsence(enrichedAbsence);
        setStudents(studentsRes.data);
        setSessions(sessionsData);
        
        setFormData({
          studentId: absenceData.student?.id || "",
          classSessionId: sessionId || "",
          justified: absenceData.justified || false
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({
          type: "error",
          text: "Eroare la încărcarea datelor. Te rog încearcă din nou."
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Adăugat un efect pentru a monitoriza schimbările în starea justified
  useEffect(() => {
    console.log("Justified changed:", formData.justified, "Initial state:", wasInitiallyJustified);
  }, [formData.justified, wasInitiallyJustified]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Dacă este checkbox-ul justified, verificăm dacă valoarea se schimbă
    if (name === "justified" && type === "checkbox") {
      console.log("Justified checkbox changed:", checked);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data necunoscută";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data invalidă";
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Formatează ora din timestamp
  const formatTime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Funcție pentru a obține ziua săptămânii din sesiune
  const getDayOfWeek = (session) => {
    if (!session) return "";
    
    // Preferăm să folosim direct scheduleDay dacă există
    if (session.scheduleDay) {
      return session.scheduleDay;
    }
    
    // Ca rezervă, calculăm din dată
    if (session.startTime) {
      const date = new Date(session.startTime);
      if (isNaN(date.getTime())) return "";
      
      const daysOfWeek = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
      return daysOfWeek[date.getDay()];
    }
    
    return "";
  };

  // Format pentru afișarea sesiunii în select
  const formatSessionLabel = (session) => {
    if (!session) return "";
    
    let label = session.subject || "Necunoscut";
    
    // Adaugă ziua săptămânii - PRIORITATE PENTRU scheduleDay
    const dayOfWeek = getDayOfWeek(session);
    if (dayOfWeek) {
      label = `${dayOfWeek}, ${label}`;
    }
    
    // Adaugă ora
    if (session.startTime && session.endTime) {
      const startTime = formatTime(session.startTime);
      const endTime = formatTime(session.endTime); 
      label += ` (${startTime}-${endTime})`;
    } else if (session.startTime) {
      const startTime = formatTime(session.startTime);
      label += ` (${startTime})`;
    }
    
    // Adaugă clasa
    if (session.className) {
      label += `, ${session.className}`;
    }
    
    return label;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Verificăm dacă avem toate câmpurile necesare
      if (!formData.studentId || !formData.classSessionId) {
        setMessage({
          type: "error",
          text: "Te rog completează toate câmpurile obligatorii."
        });
        setIsSubmitting(false);
        return;
      }

      // Construim obiectul pentru request
      const requestData = {
        studentId: formData.studentId,
        classSessionId: formData.classSessionId,
        justified: formData.justified // Includem explicit starea de justified
      };

      console.log("Sending update request with data:", requestData);

      // Facem call pentru actualizarea absenței
      const response = await axios.put(`/absences/${id}`, requestData);
      
      // Actualizăm starea locală
      setAbsence({
        ...absence,
        student: { id: formData.studentId },
        classSessionId: formData.classSessionId,
        justified: formData.justified
      });
      
      // Actualizăm și starea inițială pentru următoarele comparații
      setWasInitiallyJustified(formData.justified);
      
      // Afișăm mesajul corespunzător
      if (formData.justified !== absence.justified) {
        if (formData.justified) {
          setMessage({
            type: "success",
            text: "Absența a fost motivată și actualizată cu succes!"
          });
        } else {
          setMessage({
            type: "success",
            text: "Absența a fost demotivată și actualizată cu succes!"
          });
        }
      } else {
        setMessage({
          type: "success",
          text: "Absența a fost actualizată cu succes!"
        });
      }
      
      // Redirecționare după câteva secunde
      setTimeout(() => {
        navigate("/admin/absences");
      }, 1500);
      
    } catch (error) {
      console.error("Error updating absence:", error);
      
      let errorMessage = "Eroare la actualizarea absenței. Te rog încearcă din nou.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data;
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funcție pentru demotivarea absenței
  const handleUnjustify = async () => {
    try {
      setIsSubmitting(true);
      setMessage(null);
      setJustifyError(null);
      
      // Construim obiectul pentru request cu flag-ul justified=false
      const requestData = {
        studentId: formData.studentId,
        classSessionId: formData.classSessionId,
        justified: false
      };
      
      console.log("Sending unjustify request with data:", requestData);
      
      // Facem call către server
      const response = await axios.put(`/absences/${id}`, requestData);
      
      // Actualizăm starea locală
      setAbsence(prev => ({
        ...prev,
        justified: false
      }));
      
      setFormData(prev => ({
        ...prev,
        justified: false
      }));
      
      setWasInitiallyJustified(false);
      
      setMessage({
        type: "success",
        text: "Absența a fost demotivată cu succes!"
      });
    } catch (error) {
      console.error("Error unjustifying absence:", error);
      setJustifyError("Nu s-a putut demotiva absența. Te rog încearcă din nou sau contactează administratorul.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJustify = async () => {
    try {
      setIsSubmitting(true);
      setMessage(null);
      setJustifyError(null);
      
      // Metoda alternativă: Actualizăm direct absența cu flag-ul justified=true
      try {
        // Construim obiectul pentru request cu toate datele existente + justified=true
        const requestData = {
          studentId: formData.studentId,
          classSessionId: formData.classSessionId,
          justified: true
        };
        
        console.log("Sending justify request with data:", requestData);
        
        const response = await axios.put(`/absences/${id}`, requestData);
        
        // Actualizăm starea locală pentru a reflecta schimbarea
        setAbsence(prev => ({
          ...prev,
          justified: true
        }));
        
        setFormData(prev => ({
          ...prev,
          justified: true
        }));
        
        setWasInitiallyJustified(true);
        
        setMessage({
          type: "success",
          text: "Absența a fost motivată cu succes!"
        });
      } catch (error) {
        console.error("Error updating absence:", error);
        
        // Încercăm metoda standard, dar doar ca rezervă
        try {
          const justifyResponse = await axios.put(`/absences/${id}/justify`);
          
          // Actualizăm starea locală
          setAbsence(prev => ({
            ...prev,
            justified: true
          }));
          
          setFormData(prev => ({
            ...prev,
            justified: true
          }));
          
          setWasInitiallyJustified(true);
          
          setMessage({
            type: "success",
            text: "Absența a fost motivată cu succes!"
          });
        } catch (secondError) {
          console.error("Error justifying absence:", secondError);
          setJustifyError("Nu s-a putut motiva absența. Te rog încearcă din nou sau contactează administratorul.");
        }
      }
    } catch (error) {
      console.error("Error justifying absence:", error);
      setJustifyError("Nu s-a putut motiva absența. Te rog încearcă din nou sau contactează administratorul.");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="w-full max-w-lg bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/absences")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Listă
          </button>
          <h2 className="text-lg font-semibold">Editare Absență</h2>
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
          
          {justifyError && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-yellow-50/50 text-yellow-600 border border-yellow-200">
              {justifyError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b mb-4">
              <div className="flex items-center">
                <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                  absence?.justified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {absence?.justified ? (
                    <>
                      <FaCheck className="mr-1 h-3 w-3" />
                      Motivată
                    </>
                  ) : (
                    <>
                      <FaTimes className="mr-1 h-3 w-3" />
                      Nemotivată
                    </>
                  )}
                </span>
              </div>
              <div className="flex space-x-2">
                {absence?.justified ? (
                  <button
                    type="button"
                    onClick={handleUnjustify}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <FaBan className="mr-1.5 h-3.5 w-3.5" />
                    Demotivează
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleJustify}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-md bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <FaCalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                    Motivează
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Elev:
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">-- Selectează un elev --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.className && `(${student.className})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sesiune Curs:
              </label>
              <select
                name="classSessionId"
                value={formData.classSessionId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">-- Selectează o sesiune --</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {formatSessionLabel(session)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="justified"
                  name="justified"
                  checked={formData.justified}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <label htmlFor="justified" className="ml-2 block text-sm text-gray-900">
                  Absență motivată
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Marchează această opțiune dacă absența este motivată, sau debifează pentru a o demotiva.
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/absences")}
                className="w-1/2 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se procesează...
                  </span>
                ) : (
                  <>
                    <FaSave className="mr-2 h-4 w-4" />
                    Salvează
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAbsenceEdit;