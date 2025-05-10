import React, { useState } from "react";
import Cookies from "js-cookie";
import logo from "../../assets/logo.png";
import { 
  FaHome,
  FaUserCircle,
  FaChartLine,
  FaCalendarTimes,
  FaCalendarAlt,
  FaUtensils,
  FaRobot,
  FaBars,
  FaSignOutAlt
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const StudentNavbar = ({ activeView, studentData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
    { icon: FaUtensils, label: "Food", view: "food", path: "/stud/food-orders" },
    { icon: FaRobot, label: "Ask Schoolie", view: "ask", path: "/ask-schoolie" }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-white">
          Student Portal
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
              src={logo}
              alt="School Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Student Portal</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">{studentData?.className || "Student"}</p>
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
    </>
  );
};

export default StudentNavbar;