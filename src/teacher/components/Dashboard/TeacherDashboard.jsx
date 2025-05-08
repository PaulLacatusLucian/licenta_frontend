import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaArrowRight, FaClipboardList, FaCalendarAlt, FaUserGraduate, FaChartLine, FaVideo } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import Cookies from 'js-cookie';
import logo from "../../../assets/logo.png";
import TeacherNavbar from '../TeacherNavbar'; // Importăm componenta de navbar

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [activeView, setActiveView] = useState("home");
  const navigate = useNavigate();
  
  useEffect(() => {  
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }
    
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        const [teacherResponse, studentsResponse, scheduleResponse] = await Promise.all([
          axios.get(`/teachers/me`),
          axios.get(`/teachers/me/students`),
          axios.get(`/teachers/me/weekly-schedule`)
        ]);
  
        setTeacherData(teacherResponse.data);
        setStudents(studentsResponse.data);
        setSchedule(scheduleResponse.data);
        
        // Filter today's sessions for quick display
        const today = new Date().toLocaleString("en-US", { weekday: "long" });
        const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);
        const todayClasses = scheduleResponse.data.filter(item => item.scheduleDay === todayFormatted);
        setTodaySessions(todayClasses);
        
        setError(null);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setError("Failed to load teacher data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTeacherData();
  }, [navigate]);
  
  const today = new Date().toLocaleString("en-US", { weekday: "long" });
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);
  
  const renderDashboardContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Welcome Card */}
      <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold mb-2">
          Welcome back, {teacherData?.name || 'Teacher'}!
        </h3>
        <p className="text-indigo-100 mb-4">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Summary Statistics */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
          <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
            <p className="text-xs text-indigo-100">Students</p>
            <p className="text-3xl font-bold">{students.length}</p>
          </div>
          <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
            <p className="text-xs text-indigo-100">Classes Today</p>
            <p className="text-3xl font-bold">{todaySessions.length}</p>
          </div>
          <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
            <p className="text-xs text-indigo-100">Classes Taught</p>
            <p className="text-3xl font-bold">{Array.from(new Set(students.map(s => s.studentClass?.name))).length}</p>
          </div>
          <div className="text-center px-6 py-2">
            <p className="text-xs text-indigo-100">Subject</p>
            <p className="text-3xl font-bold">{teacherData?.subject || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="col-span-1 md:col-span-2 bg-light p-6 rounded-xl shadow-md border border-gray-200">
        <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
          <FaUserGraduate className="text-primary mr-3" />
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <button 
            className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
            onClick={() => navigate('/teacher/attendance')}
          >
            <FaClipboardList className="mr-2" /> Take Attendance
          </button>
          <button 
            className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
            onClick={() => navigate('/teacher/grades')} 
          >
            <FaChartLine className="mr-2" /> Enter Grades
          </button>
          <button 
            className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
            onClick={() => navigate('/teacher/schedule')} 
          >
            <FaCalendarAlt className="mr-2" /> View Schedule
          </button>
          <button 
            className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
            onClick={() => navigate('/teacher/meetings/new')} 
          >
            <FaVideo className="mr-2" /> Start Meeting
          </button>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-dark flex items-center">
            <FaCalendarAlt className="text-primary mr-3" />
            Today's Schedule
          </h4>
          <Link to="/teacher/schedule" className="text-secondary hover:underline flex items-center">
            Full Schedule
            <FaArrowRight className="ml-2 text-xs" />
          </Link>
        </div>
        <div className="space-y-4">
          {todaySessions.length > 0 ? (
            todaySessions.slice(0, 3).map((classItem, index) => (
              <div key={index} className="border-l-4 border-secondary pl-3 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-dark">
                      {classItem.subjects?.join(", ") || "Unknown Subject"}
                    </p>
                    <p className="text-dark2 text-sm">
                      Class: {classItem.className || 'N/A'}
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
            <p className="text-dark2 text-sm italic">No classes scheduled today.</p>
          )}
        </div>
      </div>

      {/* Students Overview Card */}
      <div className="col-span-1 md:col-span-3 bg-light p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-dark flex items-center">
            <FaUserGraduate className="text-primary mr-3" />
            My Students
          </h4>
          <Link to="/teacher/students" className="text-secondary hover:underline flex items-center">
            View All
            <FaArrowRight className="ml-2 text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {students.slice(0, 6).map((student, index) => (
            <div key={index} className="bg-light p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary text-white p-2 rounded-full">
                  <FaUserGraduate />
                </div>
                <div>
                  <p className="font-semibold text-dark">{student.name}</p>
                  <p className="text-dark2 text-sm">
                    {student.studentClass?.name} {student.className}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Folosim componenta TeacherNavbar */}
      <TeacherNavbar 
        teacherData={teacherData}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logo={logo}
      />

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">Dashboard</h2>
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
              <p className="text-dark2 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          renderDashboardContent()
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;