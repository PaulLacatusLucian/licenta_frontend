import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaHome, FaChartLine, FaClipboardList, FaCalendarAlt, FaBell, FaUserGraduate, FaBars, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import Cookies from 'js-cookie';

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [schedule, setSchedule] = useState([]); 
  const navigate = useNavigate();
  
  const userId = Cookies.get("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
  
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        const [teacherResponse, studentsResponse, scheduleResponse] = await Promise.all([
          axios.get(`/teachers/${userId}`),
          axios.get(`/teachers/${userId}/students`),
          axios.get(`/teachers/${userId}/weekly-schedule`) // Cererea pentru schedule
        ]);
  
        setTeacherData(teacherResponse.data);
        setStudents(studentsResponse.data);
        setSchedule(scheduleResponse.data); // Setăm starea pentru schedule
        setError(null);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setError("Failed to load teacher data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTeacherData();
  }, [userId, navigate]);
  

  const navItems = [
    { icon: FaHome, label: "Home", path: "/" },
    { icon: FaUserGraduate, label: "Students", path: "/teacher/students" },
    { icon: FaChartLine, label: "Grades", path: "/teacher/grades" },
    { icon: FaClipboardList, label: "Attendance", path: "/teacher/attendance" },
    { icon: FaCalendarAlt, label: "Schedule", path: "/teacher/schedule" },
    { icon: FaBell, label: "Notifications", path: "/teacher/notifications" }
  ];

  const today = new Date().toLocaleString("en-US", { weekday: "long" });


  const renderDashboardContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-dark mb-4">
            Welcome back, {teacherData?.name || 'Teacher'}!
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition">
              Take Attendance
            </button>
            <button className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition">
              Enter Grades
            </button>
            <button className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition">
              Create Assignment
            </button>
          </div>
        </div>

        {/* Students Overview */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark">My Students</h4>
            <Link to="/teacher/students" className="text-secondary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-dark">{student.name}</p>
                    <p className="text-dark2 text-sm">
                      Class {student.studentClass?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-dark2 text-sm">
                      {student.studentClass?.specialization}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Schedule */}
<div className="bg-white p-6 rounded-xl shadow-md">
  <div className="flex items-center justify-between mb-4">
    <h4 className="text-xl font-semibold text-dark">Today's Classes</h4>
    <Link to="/teacher/schedule" className="text-secondary hover:underline">
      Full Schedule
    </Link>
  </div>
  <div className="space-y-4">
    {schedule
      .filter((classItem) => classItem.scheduleDay === today) // Filtrează după ziua curentă
      .map((classItem) => (
        <div key={classItem.id} className="border-b pb-4 last:border-b-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-dark">{classItem.subjects.join(", ")}</p>
              <p className="text-dark2 text-sm">Teacher: {classItem.teacher.name}</p>
            </div>
            <div className="text-right">
              <p className="text-dark">{classItem.startTime}</p>
              <p className="text-dark2 text-xs">{classItem.endTime}</p>
            </div>
          </div>
        </div>
      ))}
    {schedule.filter((classItem) => classItem.scheduleDay === today).length === 0 && (
      <p className="text-dark2 text-sm">No classes scheduled today.</p>
    )}
  </div>
</div>


        {/* Quick Grade Entry */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h4 className="text-xl font-semibold text-dark mb-4">Quick Grade Entry</h4>
          <div className="space-y-4">
            <select 
              className="w-full p-2 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.studentClass?.name}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Grade" 
                className="w-20 p-2 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <button className="w-full bg-secondary text-white font-semibold p-2 rounded-lg hover:opacity-90 transition">
              Submit Grade
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary p-4 flex justify-between items-center">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-dark text-2xl"
        >
          <FaBars />
        </button>
        <h2 className="text-xl font-bold">Teacher Portal</h2>
        <FaUserCircle className="text-2xl" />
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:static w-72 bg-primary text-dark p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto
      `}>
        <div className="flex items-center justify-center mb-10">
          <FaUserCircle className="w-12 h-12 md:w-16 md:h-16" />
          <h2 className="text-xl md:text-2xl font-bold ml-4">Teacher Portal</h2>
        </div>

        <nav>
          <ul className="space-y-2">
            {navItems.map(({ icon: Icon, label, path }) => (
              <li key={path}>
                <Link 
                  to={path} 
                  className="flex items-center p-3 hover:bg-secondary rounded-lg transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="mr-3 text-xl" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10">
          <div className="w-full md:flex-grow md:max-w-xl md:mr-6 mb-4 md:mb-0">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark2" />
              <input 
                type="text" 
                placeholder="Search students, classes..." 
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white shadow-md text-dark focus:outline-none focus:ring-2 focus:ring-secondary" 
              />
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <FaUserCircle className="text-4xl text-dark2 mr-4" />
            <div>
              <p className="font-semibold text-dark">{teacherData?.name || 'Teacher'}</p>
              <p className="text-sm text-dark2">{teacherData?.subject} Teacher</p>
            </div>
          </div>
        </header>

        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default TeacherDashboard;