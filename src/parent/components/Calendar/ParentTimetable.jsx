import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaCalendarAlt,
  FaClock,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaBook,
  FaUserCircle
} from "react-icons/fa";
import { useTranslation } from 'react-i18next';

import ParentNavbar from "../ParentNavbar";

const ParentCalendar = () => {
  const { t } = useTranslation();
  const [classSchedule, setClassSchedule] = useState([]);
  const [studentClassName, setStudentClassName] = useState("");
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("calendar");
  const [studentData, setStudentData] = useState(null);
  const [parentData, setParentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Lade Eltern-, Kind- und Stundenplandaten parallel
        const [parentResponse, childResponse, scheduleResponse] = await Promise.all([
          axios.get('/parents/me'),
          axios.get('/parents/me/child'),
          axios.get('/parents/me/child/class-schedule')
        ]);
        
        setParentData(parentResponse.data);
        setStudentData(childResponse.data);
        
        // Behandle die verschachtelte Struktur der Antwort
        if (scheduleResponse.data && scheduleResponse.data.schedule) {
          setClassSchedule(scheduleResponse.data.schedule);
          
          // Wenn className von der API zurückgegeben wird, verwende es
          if (scheduleResponse.data.className) {
            setStudentClassName(scheduleResponse.data.className);
          } else if (childResponse.data?.studentClass?.name) {
            // Fallback auf Klassenname aus Schülerdaten
            setStudentClassName(childResponse.data.studentClass.name);
          }
        } else {
          setError(t('parent.calendar.noScheduleFound'));
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError(t('parent.calendar.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const weekdays = [
    t('parent.calendar.weekdays.monday'),
    t('parent.calendar.weekdays.tuesday'),
    t('parent.calendar.weekdays.wednesday'),
    t('parent.calendar.weekdays.thursday'),
    t('parent.calendar.weekdays.friday')
  ];

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  // Map Romanian weekday to index for translation
  const mapWeekdayToTranslated = (romanianDay) => {
    const dayMap = {
      'Luni': 0,
      'Marți': 1,
      'Miercuri': 2,
      'Joi': 3,
      'Vineri': 4
    };
    const index = dayMap[romanianDay];
    return index !== undefined ? weekdays[index] : romanianDay;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">{t('parent.calendar.loading')}</p>
        </div>
      </div>
    );
  }

  const renderScheduleContent = () => {
    return (
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-6">
            <FaCalendarAlt className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">{t('parent.calendar.title')}</h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white mr-4">
                {studentData?.profileImage ? (
                  <img
                    src={`http://localhost:8080${studentData.profileImage}`}
                    alt={t('parent.calendar.childProfileAlt')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-4xl text-gray-300 bg-gray-100 w-full h-full p-2" />
                )}
              </div>
              <div>
                <p className="text-xs text-indigo-100">{t('parent.calendar.student')}</p>
                <p className="text-xl font-bold">{studentData?.name || t('parent.calendar.yourChild')}</p>
              </div>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('parent.calendar.class')}</p>
              <p className="text-2xl font-bold">{studentClassName || t('common.notAvailable')}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('parent.calendar.schedule')}</p>
              <p className="text-2xl font-bold">{t('parent.calendar.weekly')}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('parent.calendar.days')}</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center">
            {error}
          </div>
        )}

        {/* Weekly Schedule Grid */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
            <FaLayerGroup className="text-primary mr-3" />
            {t('parent.calendar.weeklyTimetable')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {weekdays.map((day, dayIndex) => {
              // Map translated day back to Romanian for filtering
              const romanianDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
              const romanianDay = romanianDays[dayIndex];
              
              return (
                <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-secondary text-white p-3 text-center">
                    <h3 className="text-lg font-bold">{day}</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {Array.isArray(classSchedule) ? (
                      classSchedule
                        .filter((schedule) => schedule.scheduleDay === romanianDay)
                        .map((schedule, index) => (
                          <div
                            key={index}
                            className="bg-light rounded-lg p-4 border border-gray-200 transition-all duration-300 hover:shadow-md"
                          >
                            <h4 className="font-semibold text-dark mb-2 flex items-center">
                              <FaBook className="text-primary mr-2 text-sm" />
                              {schedule.subjects?.map(subject => getTranslatedSubject(subject)).join(", ") || t('parent.calendar.subject')}
                            </h4>
                            <div className="text-sm text-gray-700 flex items-center mb-1">
                              <FaClock className="text-primary mr-2 text-sm" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="text-sm text-gray-700 flex items-center">
                              <FaChalkboardTeacher className="text-primary mr-2 text-sm" />
                              {schedule.teacher?.name || t('parent.calendar.unknownTeacher')}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-gray-500 text-center p-4">
                        {t('parent.calendar.noDataAvailable')}
                      </div>
                    )}
                    
                    {Array.isArray(classSchedule) && 
                      classSchedule.filter((schedule) => schedule.scheduleDay === romanianDay).length === 0 && (
                      <div className="text-gray-500 text-center p-4">
                        {t('parent.calendar.noClassesScheduled')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Use the ParentNavbar component */}
      <ParentNavbar 
        activeView={activeView} 
        childName={studentData?.name}
        onToggleSidebar={setIsSidebarOpen}
      />

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate("/parent")}
            className="mr-3 text-primary hover:text-secondary"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">{t('parent.calendar.title')}</h2>
          <div className="flex items-center">
          </div>
        </header>
        
        {renderScheduleContent()}
      </div>
    </div>
  );
};

export default ParentCalendar;