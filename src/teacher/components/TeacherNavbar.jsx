import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUserGraduate, 
  FaChartLine, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaVideo, 
  FaBars, 
  FaSignOutAlt,
  FaCheckCircle,
  FaBook
} from 'react-icons/fa';
import Cookies from 'js-cookie';

const TeacherNavbar = ({ 
  teacherData, 
  activeView, 
  setActiveView, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  logo 
}) => {
  const navigate = useNavigate();
  
  // Verificăm dacă profesorul este diriginte
  const isHomeroom = teacherData?.hasClassAssigned || teacherData?.classAsTeacher;
  
  // Funcția de logout
  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };
  
  // Elementele de navigare de bază
  const baseNavItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/teacher" },
    { icon: FaUserGraduate, label: "Students", view: "students", path: "/teacher/students" },
    { icon: FaChartLine, label: "Grades", view: "grades", path: "/teacher/grades" },
    { icon: FaClipboardList, label: "Attendance", view: "attendance", path: "/teacher/attendance" },
    { icon: FaCalendarAlt, label: "Schedule", view: "schedule", path: "/teacher/schedule" },
    { icon: FaBook, label: "Catalog", view: "catalog", path: "/teacher/catalog" }
  ];
  
  // Elemente de navigare doar pentru diriginți
  const homeroomItems = [
    { icon: FaVideo, label: "Start Meeting", view: "meetings", path: "/teacher/meetings/new" },
    { icon: FaCheckCircle, label: "Justify Absences", view: "justify", path: "/teacher/justify" }
  ];
  
  // Combinăm elementele de navigare în funcție de rolul profesorului
  let navItems = [...baseNavItems];
  
  // Adăugăm opțiunile pentru diriginți
  if (isHomeroom) {
    // Inserăm opțiunile pentru diriginți înainte de "Catalog"
    navItems.splice(5, 0, ...homeroomItems);
  }
  
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
          {activeView === "home" ? "Teacher Portal" : 
            activeView === "students" ? "Students" :
            activeView === "grades" ? "Enter Grades" :
            activeView === "attendance" ? "Record Attendance" :
            activeView === "schedule" ? "Schedule" :
            activeView === "meetings" ? "Create Meeting" :
            activeView === "justify" ? "Justify Absences" :
            activeView === "catalog" ? "Class Catalog" : "Teacher Portal"}
        </h2>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:static w-72 bg-gradient-to-b from-primary to-secondary text-white p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto print:hidden
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
            <h2 className="text-xl md:text-2xl font-bold text-white">Teacher Portal</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">{teacherData?.subject || 'Teacher'}</p>
            {isHomeroom && (
              <span className="bg-white text-primary text-xs font-bold px-2 py-1 rounded-full mt-2 inline-block">
                Homeroom Teacher
              </span>
            )}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default TeacherNavbar;