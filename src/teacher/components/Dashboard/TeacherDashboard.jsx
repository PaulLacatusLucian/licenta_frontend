import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaHome, FaChartLine, FaClipboardList, FaCalendarAlt, FaUserGraduate, FaBars, FaVideo, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import Cookies from 'js-cookie';

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {  
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
  
  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };
  
  // Updated navItems - Removed Notifications, added Start Meeting
  const navItems = [
    { icon: FaHome, label: "Home", path: "/" },
    { icon: FaUserGraduate, label: "Students", path: "/teacher/students" },
    { icon: FaChartLine, label: "Grades", path: "/teacher/grades" },
    { icon: FaClipboardList, label: "Attendance", path: "/teacher/attendance" },
    { icon: FaCalendarAlt, label: "Schedule", path: "/teacher/schedule" },
    { icon: FaVideo, label: "Start Meeting", path: "/teacher/meetings/new" }
    
  ];

  const today = new Date().toLocaleString("ro-RO", { weekday: "long" });
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);
  
  const renderDashboardContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-dark mb-2">
            Welcome back, {teacherData?.name || 'Teacher'}!
          </h3>
          <p className="text-dark2 mb-4">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-primary p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-dark">{students.length}</p>
              <p className="text-dark2">Students</p>
            </div>
            <div className="bg-primary p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-dark">{todaySessions.length}</p>
              <p className="text-dark2">Classes Today</p>
            </div>
            <div className="bg-primary p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-dark">{Array.from(new Set(students.map(s => s.studentClass?.name))).length}</p>
              <p className="text-dark2">Classes</p>
            </div>
            <div className="bg-primary p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-dark">{teacherData?.subject || 'N/A'}</p>
              <p className="text-dark2">Subject</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h4 className="text-xl font-semibold text-dark mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
          <button 
              className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/teacher/attendance')}
            >
              <FaClipboardList className="mr-2" /> Take Attendance
            </button>
            <button className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/teacher/grades')} 
            >
              <FaChartLine className="mr-2" /> Enter Grades
            </button>
            <button className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/teacher/schedule')} 
            >
              <FaCalendarAlt className="mr-2" /> View Schedule
            </button>
            <button 
              onClick={() => navigate('/teacher/meetings/new')} 
              className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
            >
              <FaVideo className="mr-2" /> Start Meeting
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark">Today's Schedule</h4>
            <Link to="/teacher/schedule" className="text-secondary hover:underline">
              Full Schedule
            </Link>
          </div>
          <div className="space-y-4">
            {todaySessions.length > 0 ? (
              todaySessions.map((classItem) => (
                <div key={classItem.id} className="border-l-4 border-secondary pl-3 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-dark">{classItem.subjects.join(", ")}</p>
                      <p className="text-dark2 text-sm">Class: {classItem.className || 'N/A'}</p>
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

        {/* Students Overview */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark">My Students</h4>
            <Link to="/teacher/students" className="text-secondary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students.slice(0, 6).map((student) => (
              <div key={student.id} className="bg-light p-3 rounded-lg border border-primary">
                <div className="flex items-center">
                  <div className="bg-secondary text-white p-2 rounded-full mr-3">
                    <FaUserGraduate />
                  </div>
                  <div>
                    <p className="font-semibold text-dark">{student.name}</p>
                    <p className="text-dark2 text-sm">
                      {student.studentClass?.name} - {student.studentClass?.specialization}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary p-4 flex justify-between items-center relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-dark text-2xl"
        >
          <FaBars />
        </button>

        {/* Centrare absolută */}
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold">
          Teacher Portal
        </h2>
      </div>


      <div className={`
        fixed md:static w-72 bg-primary text-dark p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto
      `}>
        <div className="flex flex-col items-center justify-center mb-10">
          <img 
            src="src\\assets\\logo.png" 
            alt="School Logo" 
            className="w-24 h-24 mb-4"
          />
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold">Teacher Portal</h2>
            <p className="text-sm text-dark2">{teacherData?.subject || 'Teacher'}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map(({ icon: Icon, label, path }) => (
              <li key={path}>
                <Link 
                  to={path} 
                  className="flex items-center p-3 hover:bg-secondary hover:text-white rounded-lg transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="mr-3 text-xl" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button fixat jos */}
        <div className="mt-auto pt-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-3 text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>


      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">Dashboard</h2>
          <div className="flex items-center">
            <div className="flex items-center">
              <FaUserCircle className="text-3xl text-dark2 mr-3" />
              <div>
                <p className="font-semibold text-dark">{teacherData?.name || 'Teacher'}</p>
                <p className="text-sm text-dark2">{teacherData?.subject} Teacher</p>
              </div>
            </div>
          </div>
        </header>

        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default TeacherDashboard;