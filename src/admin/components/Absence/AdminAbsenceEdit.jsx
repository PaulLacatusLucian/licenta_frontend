import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaArrowLeft, FaCheck, FaTimes, FaCalendarCheck, FaBan } from "react-icons/fa";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const AdminAbsenceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [wasInitiallyJustified, setWasInitiallyJustified] = useState(false);

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  // Funktion zur Übersetzung von Wochentagen
  const getTranslatedDay = (day) => {
    const dayKey = `common.days.${day.toLowerCase()}`;
    if (t(dayKey) !== dayKey) {
      return t(dayKey);
    }
    return day;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [absenceRes, studentsRes, sessionsRes] = await Promise.all([
          axios.get(`/absences/${id}`),
          axios.get('/students'),
          axios.get('/class-sessions')
        ]);
        
        const absenceData = absenceRes.data;
        
        setWasInitiallyJustified(absenceData.justified || false);
        
        const sessionsData = sessionsRes.data;
        
        console.log("Absence data received:", absenceData);
        console.log("Initial justified status:", absenceData.justified);
        console.log("Sessions data:", sessionsData);
        
        const sessionId = absenceData.classSessionId || absenceData.classSession?.id;
        const matchingSession = sessionId ? sessionsData.find(s => s.id === parseInt(sessionId)) : null;
        
        console.log("Matching session found:", matchingSession);
        
        const enrichedAbsence = {
          ...absenceData,
          sessionInfo: matchingSession ? {
            day: matchingSession.scheduleDay,
            startTime: matchingSession.startTime,
            endTime: matchingSession.endTime,
            subject: matchingSession.subject,
            className: matchingSession.className
          } : null,
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
          text: t('admin.absences.edit.errors.loadingData')
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, t]);

  useEffect(() => {
    console.log("Justified changed:", formData.justified, "Initial state:", wasInitiallyJustified);
  }, [formData.justified, wasInitiallyJustified]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "justified" && type === "checkbox") {
      console.log("Justified checkbox changed:", checked);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('admin.absences.list.unknownDate');
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('admin.absences.list.invalidDate');
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  const getDayOfWeek = (session) => {
    if (!session) return "";
    
    if (session.scheduleDay) {
      return getTranslatedDay(session.scheduleDay);
    }
    
    if (session.startTime) {
      const date = new Date(session.startTime);
      if (isNaN(date.getTime())) return "";
      
      const daysOfWeek = [
        t('common.days.sunday'),
        t('common.days.monday'),
        t('common.days.tuesday'),
        t('common.days.wednesday'),
        t('common.days.thursday'),
        t('common.days.friday'),
        t('common.days.saturday')
      ];
      return daysOfWeek[date.getDay()];
    }
    
    return "";
  };

  const formatSessionLabel = (session) => {
    if (!session) return "";
    
    let label = getTranslatedSubject(session.subject) || t('admin.absences.list.unknown');
    
    const dayOfWeek = getDayOfWeek(session);
    if (dayOfWeek) {
      label = `${dayOfWeek}, ${label}`;
    }
    
    if (session.startTime && session.endTime) {
      const startTime = formatTime(session.startTime);
      const endTime = formatTime(session.endTime); 
      label += ` (${startTime}-${endTime})`;
    } else if (session.startTime) {
      const startTime = formatTime(session.startTime);
      label += ` (${startTime})`;
    }
    
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
      if (!formData.studentId || !formData.classSessionId) {
        setMessage({
          type: "error",
          text: t('admin.absences.edit.errors.requiredFields')
        });
        setIsSubmitting(false);
        return;
      }

      const requestData = {
        studentId: formData.studentId,
        classSessionId: formData.classSessionId,
        justified: formData.justified
      };

      console.log("Sending update request with data:", requestData);

      const response = await axios.put(`/absences/${id}`, requestData);
      
      setAbsence({
        ...absence,
        student: { id: formData.studentId },
        classSessionId: formData.classSessionId,
        justified: formData.justified
      });
      
      setWasInitiallyJustified(formData.justified);
      
      if (formData.justified !== absence.justified) {
        if (formData.justified) {
          setMessage({
            type: "success",
            text: t('admin.absences.edit.successJustified')
          });
        } else {
          setMessage({
            type: "success",
            text: t('admin.absences.edit.successUnjustified')
          });
        }
      } else {
        setMessage({
          type: "success",
          text: t('admin.absences.edit.success')
        });
      }
      
      setTimeout(() => {
        navigate("/admin/absences");
      }, 1500);
      
    } catch (error) {
      console.error("Error updating absence:", error);
      
      let errorMessage = t('admin.absences.edit.errors.updateError');
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

  const handleUnjustify = async () => {
    try {
      setIsSubmitting(true);
      setMessage(null);
      setJustifyError(null);
      
      const requestData = {
        studentId: formData.studentId,
        classSessionId: formData.classSessionId,
        justified: false
      };
      
      console.log("Sending unjustify request with data:", requestData);
      
      const response = await axios.put(`/absences/${id}`, requestData);
      
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
        text: t('admin.absences.edit.successUnjustified')
      });
    } catch (error) {
      console.error("Error unjustifying absence:", error);
      setJustifyError(t('admin.absences.edit.errors.unjustifyError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJustify = async () => {
    try {
      setIsSubmitting(true);
      setMessage(null);
      setJustifyError(null);
      
      try {
        const requestData = {
          studentId: formData.studentId,
          classSessionId: formData.classSessionId,
          justified: true
        };
        
        console.log("Sending justify request with data:", requestData);
        
        const response = await axios.put(`/absences/${id}`, requestData);
        
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
          text: t('admin.absences.edit.successJustified')
        });
      } catch (error) {
        console.error("Error updating absence:", error);
        
        try {
          const justifyResponse = await axios.put(`/absences/${id}/justify`);
          
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
            text: t('admin.absences.edit.successJustified')
          });
        } catch (secondError) {
          console.error("Error justifying absence:", secondError);
          setJustifyError(t('admin.absences.edit.errors.justifyError'));
        }
      }
    } catch (error) {
      console.error("Error justifying absence:", error);
      setJustifyError(t('admin.absences.edit.errors.justifyError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
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
            {t('common.backToList')}
          </button>
          <h2 className="text-lg font-semibold">{t('admin.absences.edit.title')}</h2>
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
                      {t('admin.absences.list.justified')}
                    </>
                  ) : (
                    <>
                      <FaTimes className="mr-1 h-3 w-3" />
                      {t('admin.absences.list.unjustified')}
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
                    {t('admin.absences.edit.unjustify')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleJustify}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-md bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <FaCalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                    {t('admin.absences.edit.justify')}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('admin.absences.create.student')}:
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">{t('admin.absences.create.selectStudentPlaceholder')}</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.className && `(${student.className})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('admin.absences.create.classSession')}:
              </label>
              <select
                name="classSessionId"
                value={formData.classSessionId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">{t('admin.absences.create.selectSessionPlaceholder')}</option>
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
                  {t('admin.absences.create.justifiedAbsence')}
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {t('admin.absences.edit.justifiedNote')}
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/absences")}
                className="w-1/2 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {t('common.cancel')}
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
                    {t('common.processing')}
                  </span>
                ) : (
                  <>
                    <FaSave className="mr-2 h-4 w-4" />
                    {t('common.save')}
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