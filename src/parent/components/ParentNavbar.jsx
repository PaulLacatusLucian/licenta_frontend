import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import logo from  "../../assets/logo.png";
import { 
  FaHome, 
  FaUserCircle, 
  FaChartLine, 
  FaCalendarAlt, 
  FaUtensils, 
  FaSignOutAlt,
  FaBars 
} from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const ParentNavbar = ({ activeView, childName, onToggleSidebar }) => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (onToggleSidebar) {
      onToggleSidebar(!isSidebarOpen);
    }
  };

  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };

  // Navigationseinträge
  const navItems = [
    { icon: FaHome, label: t('parent.navbar.dashboard'), view: "home", path: "/parent" },
    { icon: FaUserCircle, label: t('parent.navbar.profile'), view: "profile", path: "/parent/profile" },
    { icon: FaChartLine, label: t('parent.navbar.academicReport'), view: "report", path: "/parent/academic-report" },
    { icon: FaCalendarAlt, label: t('parent.navbar.calendar'), view: "calendar", path: "/parent/calendar" },
    { icon: FaUtensils, label: t('parent.navbar.mealServices'), view: "food", path: "/cafeteria" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center relative">
        <button 
          onClick={handleSidebarToggle}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-white">
          {t('parent.navbar.parentPortal')}
        </h2>
      </div>

      {/* Sidebar Navigation */}
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
              alt={t('parent.navbar.schoolLogoAlt')} 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">{t('parent.navbar.parentPortal')}</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">
              {t('parent.navbar.parentOf', { childName: childName || t('parent.navbar.loading') })}
            </p>
          </div>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map(({ icon: Icon, label, view, path }) => (
              <li key={view}>
                {path ? (
                  <Link
                    to={path}
                    className={`w-full text-left flex items-center p-3 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200 ${
                      activeView === view ? "bg-white bg-opacity-20 text-white" : "text-white"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="mr-3 text-xl" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ) : (
                  <Link 
                    to="/parent"
                    onClick={() => setIsSidebarOpen(false)}
                    className={`w-full text-left flex items-center p-3 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200 ${
                      activeView === view ? "bg-white bg-opacity-20 text-white" : "text-white"
                    }`}
                  >
                    <Icon className="mr-3 text-xl" />
                    <span className="font-medium">{label}</span>
                  </Link>
                )}
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
            <span className="font-medium">{t('parent.navbar.logout')}</span>
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

export default ParentNavbar;