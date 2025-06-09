import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaArrowLeft, FaSyncAlt, FaFilter, FaInfoCircle } from "react-icons/fa";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const CreateAbsence = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  // Funktion zur Übersetzung von Spezialisierungen
  const getTranslatedSpecialization = (specialization) => {
    if (specialization && t(`admin.classes.specializations.${specialization}`) !== `admin.classes.specializations.${specialization}`) {
      return t(`admin.classes.specializations.${specialization}`);
    }
    return specialization || '';
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
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        const classesResponse = await axios.get("/classes");
        setClasses(classesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMessage({
          type: "error",
          text: t('admin.absences.create.errors.loadingData')
        });
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [t]);

  useEffect(() => {
    const fetchDataForClass = async () => {
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
        setStudentsLoading(true);
        const studentsResponse = await axios.get(`/classes/${selectedClass}/students`);
        setStudents(studentsResponse.data);
        setFilteredStudents(studentsResponse.data);
        setStudentsLoading(false);
        
        setSessionLoading(true);
        const sessionsResponse = await axios.get("/class-sessions");
        setSessions(sessionsResponse.data);
        
        const classDetails = await axios.get(`/classes/${selectedClass}`);
        const className = classDetails.data.name;
        
        const relevantSessions = sessionsResponse.data.filter(session => {
          if (!session.className) {
            return false;
          }
          
          const classRegex = new RegExp(`\\b${className}\\b`);
          if (classRegex.test(session.className)) {
            return true;
          }
          
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
          text: t('admin.absences.create.errors.loadingClassData')
        });
        setStudentsLoading(false);
        setSessionLoading(false);
      }
    };

    fetchDataForClass();
  }, [selectedClass, t]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.studentId || !formData.sessionId) {
    setMessage({
      type: "error", 
      text: t('admin.absences.create.errors.requiredFields')
    });
    return;
  }

  try {
    // Folosește același endpoint ca profesorul pentru a crea și intrarea în catalog
    const response = await axios.post(
      `/class-sessions/session/${formData.sessionId}/absences`, 
      null,
      {
        params: {
          studentId: formData.studentId
        }
      }
    );
    
    // Dacă absența trebuie motivată, actualizează-o
    if (formData.justified && response.data && response.data.id) {
      await axios.put(`/absences/${response.data.id}/justify`);
    }
    
    setMessage({
      type: "success",
      text: t('admin.absences.create.success')
    });
    
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
    
    if (error.response && error.response.status === 409) {
      const errorMessage = error.response?.data || "";
      
      // Verifică pentru diferite tipuri de conflicte
      if (errorMessage.includes("notă") || 
          errorMessage.includes("grade") || 
          errorMessage.includes("Note")) {
        setMessage({
          type: "error",
          text: t('admin.absences.create.errors.hasGrade')
        });
      } else if (errorMessage.includes("absență") || 
                 errorMessage.includes("absence") || 
                 errorMessage.includes("Abwesenheit") ||
                 errorMessage.includes("Der Schüler hat bereits eine registrierte Abwesenheit")) {
        setMessage({
          type: "error",
          text: t('admin.absences.create.errors.alreadyAbsent')
        });
      } else {
        setMessage({
          type: "error",
          text: t('admin.absences.create.errors.conflict')
        });
      }
    } else {
      setMessage({
        type: "error",
        text: t('admin.absences.create.errors.createError')
      });
    }
  }
};

  const formatSessionLabel = (session) => {
    if (!session) return "";
    
    let label = getTranslatedSubject(session.subject) || t('admin.absences.list.unknown');
    
    if (session.scheduleDay) {
      label = `${getTranslatedDay(session.scheduleDay)}, ${label}`;
    }
    
    if (session.className) {
      label += `, ${session.className}`;
    }
    
    if (session.startTime && session.endTime) {
      const startTime = session.startTime.substr(11, 5);
      const endTime = session.endTime.substr(11, 5);
      label += `, ${startTime}-${endTime}`;
    } else if (session.startTime) {
      const startTime = new Date(session.startTime);
      label += ` (${startTime.toLocaleDateString()})`;
    }
    
    return label;
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
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin/absences")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToList')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.absences.create.title')}</h2>
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
                {t('admin.absences.create.selectClass')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                required
              >
                <option value="">{t('admin.absences.create.selectClassPlaceholder')}</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name} 
                    {classItem.specialization ? ` (${getTranslatedSpecialization(classItem.specialization)})` : ''}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 flex items-start">
                <FaInfoCircle className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                <span>{t('admin.absences.create.classSelectionInfo')}</span>
              </div>
            </div>

            {selectedClass && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 flex items-center">
                    <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
                    {t('admin.absences.create.student')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {studentsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <FaSyncAlt className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500">{t('admin.absences.create.loadingStudents')}</span>
                    </div>
                  ) : (
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      required
                      className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                    >
                      <option value="">{t('admin.absences.create.selectStudentPlaceholder')}</option>
                      {filteredStudents.length === 0 ? (
                        <option disabled value="">{t('admin.absences.create.noStudentsInClass')}</option>
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
                    {t('admin.absences.create.classSession')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {sessionLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <FaSyncAlt className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500">{t('admin.absences.create.loadingSessions')}</span>
                    </div>
                  ) : (
                    <select
                      name="sessionId"
                      value={formData.sessionId}
                      onChange={(e) => setFormData({...formData, sessionId: e.target.value})}
                      required
                      className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                    >
                      <option value="">{t('admin.absences.create.selectSessionPlaceholder')}</option>
                      {filteredSessions.length === 0 ? (
                        <option disabled value="">{t('admin.absences.create.noSessionsForClass')}</option>
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
                      {t('admin.absences.create.justifiedAbsence')}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('admin.absences.create.justifiedNote')}
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
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!selectedClass || !formData.studentId || !formData.sessionId}
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <FaCalendar className="mr-2 h-4 w-4" />
                {t('common.add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAbsence;