import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { 
  FaArrowLeft, 
  FaCalendarAlt,
  FaHome, 
  FaUserCircle, 
  FaChartLine, 
  FaCalendarTimes, 
  FaUtensils, 
  FaRobot, 
  FaBars, 
  FaSignOutAlt,
  FaClock,
  FaChalkboardTeacher,
  FaLayerGroup
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const WeeklySchedule = () => {
  const [classSchedule, setClassSchedule] = useState([]);
  const [studentClassName, setStudentClassName] = useState("");
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("calendar");
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch both student data and schedule in parallel
        const [studentResponse, scheduleResponse] = await Promise.all([
          axios.get('/students/me'),
          axios.get('/schedules/me/weekly')
        ]);
        
        setStudentData(studentResponse.data);
        const scheduleData = scheduleResponse.data;

        if (!scheduleData || scheduleData.length === 0) {
          setError("Nu a fost găsit niciun orar.");
        } else {
          setClassSchedule(scheduleData);
          if (studentResponse.data?.studentClass?.name) {
            setStudentClassName(studentResponse.data.studentClass.name);
          }
        }
      } catch (err) {
        console.error("Eroare la încărcarea orarului:", err);
        setError("Nu am putut încărca orarul. Vă rugăm să încercați din nou.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };

  // Navigation items
  const navItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/stud" },
    { icon: FaUserCircle, label: "My Profile", view: "profile", path: "/stud/profile" },
    { icon: FaChartLine, label: "Grades", view: "grades", path: "/stud/grades" },
    { icon: FaCalendarTimes, label: "Absences", view: "absences", path: "/stud/absences" },
    { icon: FaCalendarAlt, label: "Schedule", view: "calendar", path: "/stud/calendar" },
    { icon: FaUtensils, label: "Food", view: "food", path: "/food" },
    { icon: FaRobot, label: "Ask Schoolie", view: "ask", path: "/ask-schoolie" }
  ];

  const weekdays = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">Loading schedule...</p>
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
            <h2 className="text-2xl font-bold">Orarul Săptămânal</h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Class</p>
              <p className="text-2xl font-bold">{studentClassName || "N/A"}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Schedule</p>
              <p className="text-2xl font-bold">Weekly</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Days</p>
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
            Weekly Timetable
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {weekdays.map((day) => (
              <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary text-white p-3 text-center">
                  <h3 className="text-lg font-bold">{day}</h3>
                </div>
                <div className="p-4 space-y-4">
                  {classSchedule
                    .filter((schedule) => schedule.scheduleDay === day)
                    .map((schedule, index) => (
                      <div
                        key={index}
                        className="bg-light rounded-lg p-4 border border-gray-200 transition-all duration-300 hover:shadow-md"
                      >
                        <h4 className="font-semibold text-dark mb-2 flex items-center">
                          <FaBook className="text-primary mr-2 text-sm" />
                          {schedule.subjects.join(", ")}
                        </h4>
                        <div className="text-sm text-gray-700 flex items-center mb-1">
                          <FaClock className="text-primary mr-2 text-sm" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="text-sm text-gray-700 flex items-center">
                          <FaChalkboardTeacher className="text-primary mr-2 text-sm" />
                          {schedule.teacher?.name || "Profesor necunoscut"}
                        </div>
                      </div>
                    ))}
                  {classSchedule.filter(
                    (schedule) => schedule.scheduleDay === day
                  ).length === 0 && (
                    <div className="text-gray-500 text-center p-4">
                      Nicio oră programată
                    </div>
                  )}
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
      <div className="md:hidden bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-white">
          Weekly Schedule
        </h2>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:static w-72 bg-gradient-to-b from-primary to-secondary text-white p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto
      `}>
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <img 
              src="src\\assets\\logo.png" 
              alt="School Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Student Portal</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">{studentData?.studentClass?.name || "Student"}</p>
          </div>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map(({ icon: Icon, label, view, path }) => (
              <li key={path}>
                <Link 
                  to={path} 
                  className={`flex items-center p-3 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200 ${
                    activeView === view ? "bg-white bg-opacity-20 text-white" : "text-white"
                  }`}
                  onClick={() => {
                    setActiveView(view);
                    setIsSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 text-xl" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="mt-auto pt-6 border-t border-white border-opacity-30">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-white hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
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
          <h2 className="text-2xl font-bold text-dark">Weekly Schedule</h2>
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

// Need to add this import for the FaBook icon
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