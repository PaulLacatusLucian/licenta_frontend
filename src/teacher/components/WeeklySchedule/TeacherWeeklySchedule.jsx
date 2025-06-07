import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import { FaCalendarAlt, FaArrowLeft, FaChalkboardTeacher, FaClock, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import logo from "../../../assets/logo.png";
import TeacherNavbar from '../TeacherNavbar';
import { useTranslation } from 'react-i18next';

const WeeklySchedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentView, setCurrentView] = useState("week");
  const [selectedDay, setSelectedDay] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("schedule");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [scheduleResponse, teacherResponse] = await Promise.all([
          axios.get(`/teachers/me/weekly-schedule`),
          axios.get(`/teachers/me`)
        ]);
        
        setSchedule(scheduleResponse.data);
        setTeacherData(teacherResponse.data);
        setMessageType("");
        setMessage("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessageType("error");
        setMessage(t('teacher.schedule.errors.loadingSchedule'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  // Übersetzung für Wochentage
  const getTranslatedDay = (day) => {
    // Konvertiere englische Tage zu Übersetzungsschlüsseln
    const dayMap = {
      'Monday': 'monday',
      'Tuesday': 'tuesday',
      'Wednesday': 'wednesday',
      'Thursday': 'thursday',
      'Friday': 'friday',
      'Saturday': 'saturday',
      'Sunday': 'sunday'
    };
    
    const dayKey = dayMap[day] || day.toLowerCase();
    return t(`common.days.${dayKey}`);
  };

  // Übersetzung für Fächer
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const formatTime = (time) => {
    return time;
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setCurrentView("day");
  };

  const backToWeekView = () => {
    setCurrentView("week");
    setSelectedDay(null);
  };

  // Klassen nach Tag gruppieren
  const classesByDay = daysOfWeek.map(day => ({
    day,
    classes: schedule.filter(classItem => {
      // Mapare între zilele în engleză și cele din schedule
      const scheduleToEnglishMap = {
        'Luni': 'Monday',
        'Marți': 'Tuesday',
        'Miercuri': 'Wednesday',
        'Joi': 'Thursday',
        'Vineri': 'Friday'
      };
      
      // Găsește cheia engleză pentru ziua din schedule
      const englishDay = Object.entries(scheduleToEnglishMap).find(
        ([ro, en]) => classItem.scheduleDay === ro || classItem.scheduleDay === en
      )?.[1];
      
      return englishDay === day || classItem.scheduleDay === day;
    })
  }));
  
  // Gesamtzahl der Klassen zählen
  const totalClasses = schedule.length;
  
  // Tage mit Klassen zählen
  const daysWithClasses = classesByDay.filter(day => day.classes.length > 0).length;
  
  // Heutiges Programm holen
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });
  const todayClasses = schedule.filter(classItem => {
    // Mapare pentru a verifica dacă ziua din schedule corespunde cu today
    const scheduleToEnglishMap = {
      'Luni': 'Monday',
      'Marți': 'Tuesday',
      'Miercuri': 'Wednesday',
      'Joi': 'Thursday',
      'Vineri': 'Friday'
    };
    
    const englishDay = Object.entries(scheduleToEnglishMap).find(
      ([ro, en]) => classItem.scheduleDay === ro
    )?.[1];
    
    return englishDay === today || classItem.scheduleDay === today;
  }).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      <TeacherNavbar 
        teacherData={teacherData}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logo={logo}
      />

      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex items-center mb-6 relative">
          <button 
            onClick={() => navigate("/teacher")}
            className="text-primary hover:text-secondary z-10 absolute left-0"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark w-full text-center">
            {currentView === "week" ? t('teacher.schedule.weeklySchedule') : t('teacher.schedule.classesForDay', { day: getTranslatedDay(selectedDay) })}
          </h2>
          {currentView === "day" && (
            <button
              onClick={backToWeekView}
              className="flex items-center text-dark hover:text-secondary transition font-medium z-10 absolute right-0"
            >
              <FaCalendarAlt className="mr-2" />
              {t('teacher.schedule.backToWeek')}
            </button>
          )}
        </header>

        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-2xl font-bold mb-2">
            {t('teacher.schedule.overview.title')}
          </h3>
          <p className="text-indigo-100 mb-4">{t('teacher.schedule.overview.subtitle')}</p>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.schedule.stats.totalClasses')}</p>
              <p className="text-3xl font-bold">{totalClasses}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.schedule.stats.daysWithClasses')}</p>
              <p className="text-3xl font-bold">{daysWithClasses}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.schedule.stats.todayClasses')}</p>
              <p className="text-3xl font-bold">{todayClasses}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('teacher.schedule.stats.view')}</p>
              <p className="text-3xl font-bold">{currentView === "week" ? t('teacher.schedule.weekly') : t('teacher.schedule.daily')}</p>
            </div>
          </div>
        </div>

        {messageType === "error" && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <FaExclamationCircle className="h-5 w-5 mr-2" />
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

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px] bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">{t('teacher.schedule.loading')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            {currentView === "week" ? (
              <div>
                <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
                  <FaCalendarAlt className="mr-3 text-secondary" />
                  {t('teacher.schedule.weeklySchedule')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {classesByDay.map(({ day, classes }) => (
                    <div 
                      key={day} 
                      className="bg-light p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition"
                      onClick={() => handleDayClick(day)}
                    >
                      <h3 className="text-lg font-semibold mb-2 flex items-center text-dark">
                        <span className="bg-secondary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                          {getTranslatedDay(day).charAt(0)}
                        </span>
                        {getTranslatedDay(day)}
                      </h3>
                      
                      <div className="text-dark2">
                        {classes.length === 0 ? (
                          <p className="text-sm italic">{t('teacher.schedule.noClassesScheduled')}</p>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {classes.length} {classes.length === 1 ? t('teacher.schedule.class') : t('teacher.schedule.classes')}
                            </span>
                            
                            {day === today && (
                              <span className="bg-primary text-dark text-xs px-2 py-1 rounded-full">
                                {t('teacher.schedule.today')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
                  <FaCalendarAlt className="mr-3 text-secondary" />
                  {t('teacher.schedule.classesForDay', { day: getTranslatedDay(selectedDay) })}
                </h2>
                <div className="space-y-4">
                  {schedule
                    .filter(classItem => {
                      // Mapare pentru filtrare corectă
                      const scheduleToEnglishMap = {
                        'Luni': 'Monday',
                        'Marți': 'Tuesday',
                        'Miercuri': 'Wednesday',
                        'Joi': 'Thursday',
                        'Vineri': 'Friday'
                      };
                      
                      const englishDay = Object.entries(scheduleToEnglishMap).find(
                        ([ro, en]) => classItem.scheduleDay === ro
                      )?.[1];
                      
                      return englishDay === selectedDay || classItem.scheduleDay === selectedDay;
                    })
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((classItem, index) => (
                      <div 
                        key={`${classItem.id || index}-${index}`} 
                        className="bg-light p-4 rounded-lg shadow-sm border-l-4 border-secondary hover:shadow-md transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start md:items-center mb-2 md:mb-0">
                            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-secondary mr-3">
                              <FaChalkboardTeacher size={20} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-dark">
                                {classItem.subjects?.map(subject => getTranslatedSubject(subject)).join(", ") || t('teacher.schedule.noSubject')}
                              </h4>
                              <p className="text-dark2 text-sm">{t('teacher.schedule.classLabel')}: {classItem.className || t('teacher.schedule.notSpecified')}</p>
                            </div>
                          </div>
                          
                          <div className="bg-primary bg-opacity-10 px-4 py-2 rounded-lg flex items-center text-dark">
                            <FaClock className="mr-2 text-secondary" />
                            <span>{formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {classItem.studentClass && (
                              <span className="bg-primary bg-opacity-10 text-dark text-xs px-2 py-1 rounded-full">
                                {t('teacher.schedule.classLabel')}: {classItem.studentClass.name}
                              </span>
                            )}
                            {classItem.teacher && (
                              <span className="bg-secondary bg-opacity-10 text-dark text-xs px-2 py-1 rounded-full">
                                {t('teacher.schedule.teacher')}: {classItem.teacher.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {schedule.filter(classItem => {
                    const scheduleToEnglishMap = {
                      'Luni': 'Monday',
                      'Marți': 'Tuesday',
                      'Miercuri': 'Wednesday',
                      'Joi': 'Thursday',
                      'Vineri': 'Friday'
                    };
                    
                    const englishDay = Object.entries(scheduleToEnglishMap).find(
                      ([ro, en]) => classItem.scheduleDay === ro
                    )?.[1];
                    
                    return englishDay === selectedDay || classItem.scheduleDay === selectedDay;
                  }).length === 0 && (
                    <div className="text-center py-8 text-dark2">
                      <FaCalendarAlt className="mx-auto mb-2 text-4xl text-primary opacity-30" />
                      <p>{t('teacher.schedule.noClassesForDay', { day: getTranslatedDay(selectedDay) })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklySchedule;