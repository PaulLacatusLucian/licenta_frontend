import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaSearch, FaArrowRight, FaChartLine, FaCalendarTimes, FaCalendarAlt, FaUtensils, FaRobot } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import StudentNavbar from "../StudentNavbar";
import { useTranslation } from 'react-i18next';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const [studentData, setStudentData] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [absences, setAbsences] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentOrders, setStudentOrders] = useState([]); 
  const [grades, setGrades] = useState([]);
  const [activeView, setActiveView] = useState("home");

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }
    
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
  
        const studentResponse = await axios.get(`/students/me`);
        console.log("Student data response:", studentResponse.data);
  
        const absencesResponse = await axios.get(`/students/me/total-absences`);
        const classesResponse = await axios.get(`/students/me/upcoming-classes`);
        const gradesResponse = await axios.get(`/grades/me`);

        setGrades(gradesResponse.data || []);
        setStudentData(studentResponse.data || null);
        setAbsences(absencesResponse.data || { total: 0 });
  
        const fetchedUpcomingClasses = classesResponse.data || [];
        if (fetchedUpcomingClasses.length === 0 && studentResponse.data.studentClass?.schedules) {
          setUpcomingClasses(studentResponse.data.studentClass.schedules);
        } else {
          setUpcomingClasses(fetchedUpcomingClasses);
        }
  
        setError(null);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError(t('student.dashboard.errorLoading'));
        setStudentData(null);
        setAbsences({ total: 0 });
        setUpcomingClasses([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchStudentData();
  }, [navigate, t]);
  

  useEffect(() => {
    const fetchStudentOrders = async () => {
      try {  
        const now = new Date();
        const month = now.getMonth() + 1; // Monate beginnen bei 0 in JS
        const year = now.getFullYear();
  
        // Verwende den neuen Endpunkt für Schülerbestellungen
        const orderResponse = await axios.get(`/students/me/orders`, {
          params: { month, year }
        });
        
        console.log("Student orders:", orderResponse.data);
        setStudentOrders(orderResponse.data || []);
      } catch (error) {
        console.error("Error fetching student orders:", error);
      }
    };
  
    fetchStudentOrders();
  }, []);
  
  const calculateGPA = (grades) => {
    if (!grades.length) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };
  
  const getAbsenceEmoji = (absenceCount) => {
    if (absenceCount <= 3) {
      return t('student.dashboard.absences.greatJob');
    } else if (absenceCount > 3 && absenceCount <= 9) {
      return t('student.dashboard.absences.tryImprove');
    } else {
      return t('student.dashboard.absences.urgent');
    }
  };

  const getAbsenceEmojiColor = (absenceCount) => {
    if (absenceCount <= 3) {
      return "text-green-600";
    } else if (absenceCount > 3 && absenceCount <= 9) {
      return "text-yellow-600";
    } else {
      return "text-red-600";
    }
  };

  const getUpcomingClassesForToday = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Aktuelle Zeit in Minuten umrechnen
    
    return upcomingClasses.filter(classItem => {
      // Prüfe ob der Unterricht für heute geplant ist
      if (classItem.day && classItem.day.toLowerCase() !== currentDay.toLowerCase()) {
        return false;
      }
      
      // Wenn der Unterricht eine Startzeit hat, prüfe ob er in der Zukunft liegt
      if (classItem.startTime) {
        const [hours, minutes] = classItem.startTime.split(':').map(Number);
        const classTimeInMinutes = hours * 60 + minutes;
        
        return classTimeInMinutes > currentTime;
      }
      
      // Wenn keine Zeitinfo vorhanden, einschließen
      return true;
    });
  };

  const today = new Date().toLocaleString("en-US", { weekday: "long" });

  const renderHomeContent = () => {
    // Gefilterte Klassen für heute abrufen
    const todaysUpcomingClasses = getUpcomingClassesForToday();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-2">
            {t('student.dashboard.welcome', { name: studentData?.name || t('student.dashboard.student') })}
          </h3>
          <p className="text-indigo-100 mb-4">{t('student.dashboard.todayIs', { date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Summary Statistics */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('student.dashboard.stats.gpa')}</p>
              <p className="text-3xl font-bold">{calculateGPA(grades)}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('student.dashboard.stats.absences')}</p>
              <p className="text-3xl font-bold">{absences?.total || 0}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('student.dashboard.stats.classesToday')}</p>
              <p className="text-3xl font-bold">{todaysUpcomingClasses.length}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('student.dashboard.stats.class')}</p>
              <p className="text-3xl font-bold">{studentData?.className || t('common.notAvailable')}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-span-1 md:col-span-2 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
            <FaRobot className="text-primary mr-3" />
            {t('student.dashboard.quickActions.title')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/grades')}
            >
              <FaChartLine className="mr-2" /> {t('student.dashboard.quickActions.viewGrades')}
            </button>
            <button 
              className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/absences')}
            >
              <FaCalendarTimes className="mr-2" /> {t('student.dashboard.quickActions.checkAbsences')}
            </button>
            <button 
              className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/calendar')}
            >
              <FaCalendarAlt className="mr-2" /> {t('student.dashboard.quickActions.viewSchedule')}
            </button>
            <button 
              className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/food-orders')}
            >
              <FaUtensils className="mr-2" /> {t('student.dashboard.quickActions.viewOrders')}
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaCalendarAlt className="text-primary mr-3" />
              {t('student.dashboard.todaySchedule.title')}
            </h4>
            <Link to="/stud/calendar" className="text-secondary hover:underline flex items-center">
              {t('student.dashboard.todaySchedule.fullSchedule')}
              <FaArrowRight className="ml-2 text-xs" />
            </Link>
          </div>
          <div className="space-y-4">
            {todaysUpcomingClasses.length > 0 ? (
              todaysUpcomingClasses.slice(0, 3).map((classItem, index) => (
                <div key={index} className="border-l-4 border-secondary pl-3 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-dark">
                        {classItem.subjects?.join(", ") || t('student.dashboard.unknownSubject')}
                      </p>
                      <p className="text-dark2 text-sm">
                        {classItem.teacher?.name || t('student.dashboard.unknownTeacher')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-dark bg-primary px-2 py-1 rounded">{classItem.startTime}</p>
                      <p className="text-dark2 text-xs mt-1">{classItem.endTime}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-dark2 text-sm italic">{t('student.dashboard.todaySchedule.noMoreClasses')}</p>
            )}
          </div>
        </div>

        {/* Absences Overview */}
        <div className="col-span-1 md:col-span-1 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaCalendarTimes className="text-primary mr-3" />
              {t('student.dashboard.absences.title')}
            </h4>
            <Link to="/stud/absences" className="text-secondary hover:underline flex items-center">
              {t('student.dashboard.viewAll')}
              <FaArrowRight className="ml-2 text-xs" />
            </Link>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold text-dark">{t('student.dashboard.absences.total')}</p>
              <p className={`text-xl md:text-2xl font-bold ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {absences?.total || t('student.dashboard.noData')}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {getAbsenceEmoji(absences?.total || 0)}
              </p>
            </div>
          </div>
          <p className="text-dark2 text-sm mt-4">
            {t('student.dashboard.absences.reminder')}
          </p>
        </div>

        
      {/* Food Orders */}
      <div className="col-span-1 md:col-span-1 bg-light p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-dark flex items-center">
            <FaUtensils className="text-primary mr-3" />
            {t('student.dashboard.foodOrders.title')}
          </h4>
          <Link to="/stud/food-orders" className="text-secondary hover:underline flex items-center">
            {t('student.dashboard.foodOrders.viewOrders')}
            <FaArrowRight className="ml-2 text-xs" />
          </Link>
        </div>
        <div className="space-y-4">
          {studentOrders.length > 0 ? (
            studentOrders.slice(0, 2).map((order, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark">{order.menuItemName}</p>
                    <p className="text-dark2 text-sm">
                      {new Date(order.orderTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-dark font-medium">{t('student.dashboard.foodOrders.qty')}: {order.quantity || 1}</p>
                    <p className="text-dark font-medium">${order.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <FaUtensils className="text-gray-400 text-4xl mx-auto mb-3" />
              <p className="text-dark2 mb-4">{t('student.dashboard.foodOrders.noOrders')}</p>
              <Link 
                to="/stud/food-orders"
                className="bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:opacity-90 inline-block"
              >
                {t('student.dashboard.foodOrders.viewAllOrders')}
              </Link>
            </div>
          )}
        </div>
      </div>

        {/* Grades Overview */}
        <div className="col-span-1 md:col-span-1 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaChartLine className="text-primary mr-3" />
              {t('student.dashboard.grades.title')}
            </h4>
            <Link to="/stud/grades" className="text-secondary hover:underline flex items-center">
              {t('student.dashboard.grades.allGrades')}
              <FaArrowRight className="ml-2 text-xs" />
            </Link>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold text-dark">{t('student.dashboard.grades.average')}</p>
              <p className="text-xl md:text-2xl font-bold text-primary">
                {grades.length > 0 ? calculateGPA(grades) : t('common.notAvailable')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg text-primary">
                {grades.length > 0 
                  ? calculateGPA(grades) >= 8 ? t('student.dashboard.grades.excellent')
                    : calculateGPA(grades) >= 6 ? t('student.dashboard.grades.keepItUp')
                    : t('student.dashboard.grades.roomToImprove')
                  : t('student.dashboard.grades.noGradesYet')}
              </p>
            </div>
          </div>
          <p className="text-dark2 text-sm mt-4">
            {grades.length > 0 
              ? t('student.dashboard.grades.recordedCount', { count: grades.length })
              : t('student.dashboard.grades.noRecorded')}
          </p>
        </div>
      </div>
    );
  };
  

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Include the shared navbar component */}
      <StudentNavbar activeView={activeView} studentData={studentData} />

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="flex items-center">
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">{t('student.dashboard.loading')}</p>
            </div>
          </div>
        ) : (
          renderHomeContent()
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;