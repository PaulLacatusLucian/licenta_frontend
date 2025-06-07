import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import { 
  FaArrowLeft, 
  FaCalendarAlt,
  FaClock,
  FaChalkboardTeacher,
  FaLayerGroup
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../StudentNavbar";
import { useTranslation } from 'react-i18next';

const WeeklySchedule = () => {
  const { t } = useTranslation();
  const [classSchedule, setClassSchedule] = useState([]);
  const [studentClassName, setStudentClassName] = useState("");
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("calendar");
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Lade Schülerdaten und Stundenplan parallel
        const [studentResponse, scheduleResponse] = await Promise.all([
          axios.get('/students/me'),
          axios.get('/schedules/me/weekly')
        ]);
        
        setStudentData(studentResponse.data);
        const scheduleData = scheduleResponse.data;

        if (!scheduleData || scheduleData.length === 0) {
          setError(t('student.calendar.noScheduleFound'));
        } else {
          setClassSchedule(scheduleData);
          if (studentResponse.data?.studentClass?.name) {
            setStudentClassName(studentResponse.data.studentClass.name);
          }
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError(t('student.calendar.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const weekdays = [
    t('common.days.monday'),
    t('common.days.tuesday'),
    t('common.days.wednesday'),
    t('common.days.thursday'),
    t('common.days.friday')
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">{t('student.calendar.loadingSchedule')}</p>
        </div>
      </div>
    );
  }

  // Map weekday names for schedule filtering
  const getDayName = (day) => {
    const dayMap = {
      'Luni': 'monday',
      'Marți': 'tuesday',
      'Miercuri': 'wednesday',
      'Joi': 'thursday',
      'Vineri': 'friday'
    };
    return dayMap[day] || day;
  };

  const renderScheduleContent = () => {
    return (
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-6">
            <FaCalendarAlt className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">{t('student.calendar.weeklySchedule')}</h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('student.calendar.stats.class')}</p>
              <p className="text-2xl font-bold">{studentData?.className || t('common.notAvailable')}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('student.calendar.stats.schedule')}</p>
              <p className="text-2xl font-bold">{t('student.calendar.stats.weekly')}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('student.calendar.stats.days')}</p>
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
            {t('student.calendar.weeklyTimetable')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {weekdays.map((day, index) => {
              const originalDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
              const scheduleDay = originalDays[index];
              
              return (
                <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-secondary text-white p-3 text-center">
                    <h3 className="text-lg font-bold">{day}</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {classSchedule
                      .filter((schedule) => schedule.scheduleDay === scheduleDay)
                      .map((schedule, index) => (
                        <div
                          key={index}
                          className="bg-light rounded-lg p-4 border border-gray-200 transition-all duration-300 hover:shadow-md"
                        >
                          <h4 className="font-semibold text-dark mb-2 flex items-center">
                            <FaBook className="text-primary mr-2 text-sm" />
                            {schedule.subjects.map(subject => getTranslatedSubject(subject)).join(", ")}
                          </h4>
                          <div className="text-sm text-gray-700 flex items-center mb-1">
                            <FaClock className="text-primary mr-2 text-sm" />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="text-sm text-gray-700 flex items-center">
                            <FaChalkboardTeacher className="text-primary mr-2 text-sm" />
                            {schedule.teacher?.name || t('student.calendar.unknownTeacher')}
                          </div>
                        </div>
                      ))}
                    {classSchedule.filter(
                      (schedule) => schedule.scheduleDay === scheduleDay
                    ).length === 0 && (
                      <div className="text-gray-500 text-center p-4">
                        {t('student.calendar.noClassesScheduled')}
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
      <StudentNavbar activeView={activeView} studentData={studentData} />

      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate("/stud")}
            className="mr-3 text-primary hover:text-secondary"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">{t('student.calendar.title')}</h2>
          <div className="flex items-center">
            <div className="flex items-center">
            </div>
          </div>
        </header>
        
        {renderScheduleContent()}
      </div>
    </div>
  );
};

// FaBook icon implementation
const FaBook = ({ className }) => {
  return (
    <svg 
      stroke="currentColor" 
      fill="currentColor" 
      strokeWidth="0" 
      viewBox="0 0 448 512" 
      className={className}
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M448 360V24c0-13.3-10.7-24-24-24H96C43 0 0 43 0 96v320c0 53 43 96 96 96h328c13.3 0 24-10.7 24-24v-16c0-7.5-3.5-14.3-8.9-18.7-4.2-15.4-4.2-59.3 0-74.7 5.4-4.3 8.9-11.1 8.9-18.6zM128 134c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm0 64c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm253.4 250H96c-17.7 0-32-14.3-32-32 0-17.6 14.4-32 32-32h285.4c-1.9 17.1-1.9 46.9 0 64z"></path>
    </svg>
  );
};

export default WeeklySchedule;