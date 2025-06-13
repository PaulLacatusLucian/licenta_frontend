import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft, FaSearch, FaFilter, FaSyncAlt, FaInfoCircle } from "react-icons/fa";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const CreateGrade = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    studentId: "",
    sessionId: "",
    gradeValue: "",
    description: ""
  });

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const getTranslatedSpecialization = (specialization) => {
    if (specialization && t(`admin.classes.specializations.${specialization}`) !== `admin.classes.specializations.${specialization}`) {
      return t(`admin.classes.specializations.${specialization}`);
    }
    return specialization || '';
  };

  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        const classesResponse = await axios.get("/classes");
        
        setClasses(classesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setMessage({
          type: "error",
          text: t('admin.grades.create.errors.loadingClasses')
        });
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [t]);

  useEffect(() => {
    const fetchStudentsForClass = async () => {
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
        
        const response = await axios.get(`/classes/${selectedClass}/students`);
        
        setStudents(response.data);
        setFilteredStudents(response.data);
        
        fetchSessionsForClass(selectedClass);
      } catch (error) {
        console.error("Error getting students for class:", error);
        setMessage({
          type: "error",
          text: t('admin.grades.create.errors.loadingStudents')
        });
        setFilteredStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    const fetchSessionsForClass = async (classId) => {
      try {
        setSessionLoading(true);
        
        const response = await axios.get("/class-sessions");
        
        const classDetails = await axios.get(`/classes/${classId}`);
        const className = classDetails.data.name;
        
        const relevantSessions = response.data.filter(session => {
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
        
        setSessions(response.data);
        setFilteredSessions(relevantSessions);
      } catch (error) {
        console.error("Error getting sessions for class:", error);
        setMessage({
          type: "warning",
          text: t('admin.grades.create.errors.loadingSessions')
        });
        setFilteredSessions([]);
      } finally {
        setSessionLoading(false);
      }
    };

    if (selectedClass) {
      fetchStudentsForClass();
    }
  }, [selectedClass, t]);

  useEffect(() => {
    if (!studentSearch.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(studentSearch.toLowerCase())
    );
    
    setFilteredStudents(filtered);
  }, [studentSearch, students]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId || !formData.sessionId || !formData.gradeValue) {
      setMessage({
        type: "error",
        text: t('admin.grades.create.errors.requiredFields')
      });
      return;
    }

    try {
      await axios.post(
        `/class-sessions/session/${formData.sessionId}/grades`, 
        null,
        {
          params: {
            studentId: formData.studentId,
            gradeValue: parseFloat(formData.gradeValue)
          }
        }
      );
      
      setMessage({
        type: "success",
        text: t('admin.grades.create.success')
      });
      
      setFormData({
        studentId: "",
        sessionId: "",
        gradeValue: "",
        description: ""
      });
      
      setTimeout(() => {
        navigate("/admin/grades");
      }, 1500);
    } catch (error) {
      console.error("Error creating grade:", error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setMessage({
            type: "error",
            text: t('admin.grades.create.errors.studentAbsent') || error.response.data
          });
        } else if (error.response.status === 400) {
          setMessage({
            type: "error",
            text: t('admin.grades.create.errors.invalidGrade')
          });
        } else {
          setMessage({
            type: "error",
            text: error.response.data || t('admin.grades.create.errors.createGrade')
          });
        }
      } else {
        setMessage({
          type: "error",
          text: t('admin.grades.create.errors.networkError')
        });
      }
    }
  };

  const formatSessionLabel = (session) => {
    if (!session) return "";
    
    let label = getTranslatedSubject(session.subject) || t('admin.grades.list.unknown');
    
    if (session.startTime) {
      const startTime = new Date(session.startTime);
      const formattedDate = `${startTime.getDate().toString().padStart(2, '0')}.${(startTime.getMonth() + 1).toString().padStart(2, '0')}.${startTime.getFullYear()}`;
      const formattedTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
      
      label += ` (${formattedDate} ${formattedTime})`;
    }
    
    if (session.className) {
      label += ` - ${session.className}`;
    }
    
    return label;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
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
            onClick={() => navigate("/admin/grades")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToList')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.grades.create.title')}</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50/50 text-green-600 border border-green-200"
                  : message.type === "warning"
                  ? "bg-yellow-50/50 text-yellow-600 border border-yellow-200"
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
                {t('admin.grades.create.selectClass')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                required
              >
                <option value="">{t('admin.grades.create.selectClassPlaceholder')}</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name} 
                    {classItem.specialization ? ` (${getTranslatedSpecialization(classItem.specialization)})` : ''}
                  </option>
                ))}
              </select>
              
              <div className="text-xs text-gray-500 flex items-start">
                <FaInfoCircle className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                <span>{t('admin.grades.create.classSelectionInfo')}</span>
              </div>
            </div>

            {selectedClass && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 flex items-center">
                    <FaSearch className="mr-2 h-4 w-4 text-gray-500" />
                    {t('admin.grades.create.searchStudent')}
                  </label>
                  
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder={t('admin.grades.create.searchStudentPlaceholder')}
                    className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  />
                  
                  <div className="text-xs text-gray-500">
                    {t('admin.grades.create.showingStudents', { filtered: filteredStudents.length, total: students.length })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 flex items-center">
                    <FaStar className="mr-2 h-4 w-4 text-gray-500" />
                    {t('admin.grades.create.selectStudent')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {studentsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <FaSyncAlt className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500">{t('admin.grades.create.loadingStudents')}</span>
                    </div>
                  ) : (
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      required
                      className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                    >
                      <option value="">{t('admin.grades.create.selectStudentPlaceholder')}</option>
                      {filteredStudents.length === 0 ? (
                        <option disabled value="">{t('admin.grades.create.noStudentsInClass')}</option>
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
                    {t('admin.grades.create.selectSession')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  {sessionLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <FaSyncAlt className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500">{t('admin.grades.create.loadingSessions')}</span>
                    </div>
                  ) : (
                    <select
                      name="sessionId"
                      value={formData.sessionId}
                      onChange={(e) => setFormData({...formData, sessionId: e.target.value})}
                      required
                      className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                    >
                      <option value="">{t('admin.grades.create.selectSessionPlaceholder')}</option>
                      {filteredSessions.length === 0 ? (
                        <option disabled value="">{t('admin.grades.create.noSessionsForClass')}</option>
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
              </>
            )}

            {selectedClass && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center">
                  <FaStar className="mr-2 h-4 w-4 text-gray-500" />
                  {t('admin.grades.create.gradeValue')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  name="gradeValue"
                  value={formData.gradeValue}
                  onChange={(e) => setFormData({...formData, gradeValue: e.target.value})}
                  required
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                />
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`p-1 border rounded-md ${
                        Number(formData.gradeValue) === num 
                          ? 'bg-gray-900 text-white border-gray-900' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setFormData({...formData, gradeValue: num.toString()})}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedClass && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center">
                  <FaInfoCircle className="mr-2 h-4 w-4 text-gray-500" />
                  {t('admin.grades.create.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  rows="3"
                  placeholder={t('admin.grades.create.descriptionPlaceholder')}
                />
              </div>
            )}

            <div className="flex space-x-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/grades")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!selectedClass || !formData.studentId || !formData.sessionId || !formData.gradeValue}
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <FaStar className="mr-2 h-4 w-4" />
                {t('admin.grades.create.submitButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGrade;