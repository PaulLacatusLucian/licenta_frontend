import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { 
  FaHome, 
  FaUserCircle, 
  FaChartLine, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaUtensils, 
  FaRobot, 
  FaSignOutAlt, 
  FaSearch, 
  FaChalkboardTeacher,
  FaClock,
  FaBook,
  FaEnvelope,
  FaHandHoldingMedical,
  FaBars
} from "react-icons/fa";
import ChildProfile from "../ChildProfile/ChildProfile";
import ParentTimetable from "../Calendar/ParentTimetable";

const ParentDashboard = () => {
  const [activeView, setActiveView] = useState("home");
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const parentId = Cookies.get("userId");

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/parents/${parentId}/student`);
        console.log("Received student data:", response.data);
        setStudentData(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch student data:", err);
        setError("Failed to load student data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (parentId) {
      fetchStudentData();
    }
  }, [parentId]);

  const renderHomeContent = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (!studentData) {
      return <p>No data available for your child.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Welcome Card */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md col-span-1 md:col-span-2">
          <h3 className="text-xl md:text-2xl font-bold text-dark mb-2 md:mb-4">
            Welcome, Parent of {studentData.name}!
          </h3>
          <p className="text-dark2">Stay informed about your child's academic journey.</p>
        </div>

        {/* Academic Performance */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaChartLine className="text-xl md:text-2xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">Student Details</h4>
          </div>
          <div className="space-y-2 md:space-y-3">
            <p className="text-base md:text-lg font-bold">Name: {studentData.name}</p>
            <p className="text-base md:text-lg font-bold">Email: {studentData.email}</p>
            <p className="text-base md:text-lg font-bold">Phone: {studentData.phoneNumber}</p>
            <p className="text-base md:text-lg font-bold">Class: {studentData.studentClass?.name || "No class assigned"}</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaClock className="text-xl md:text-2xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">Upcoming Events</h4>
          </div>
          <p>No upcoming events at the moment.</p>
        </div>

        {/* Health Tracker */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaHandHoldingMedical className="text-xl md:text-2xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">Health Tracker</h4>
          </div>
          <p>Track your child's medical records here.</p>
        </div>

        {/* Food Order */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaUtensils className="text-xl md:text-2xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">Food Orders</h4>
          </div>
          <p>Manage your child's meal orders here.</p>
        </div>

        {/* Communication */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaEnvelope className="text-xl md:text-2xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">Communication</h4>
          </div>
          <button className="w-full bg-primary text-white py-2 rounded-lg mb-3 hover:opacity-90">
            Schedule Teacher Meeting
          </button>
          <button className="w-full bg-secondary text-white py-2 rounded-lg hover:opacity-90">
            Send Message to Class Teacher
          </button>
        </div>
      </div>
    );
  };

  const navItems = [
    { icon: FaHome, label: "Home", view: "home" },
    { icon: FaCalendarAlt, label: "School Calendar", view: "calendar" },
    { icon: FaUserCircle, label: "Child's Profile", view: "profile" },
    { icon: FaBook, label: "Academic Report", view: "report" },
    { icon: FaChalkboardTeacher, label: "Teacher Meetings", view: "meetings" },
    { icon: FaSignOutAlt, label: "Logout", view: "logout" },
  ];

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
        <h2 className="text-xl font-bold">Parent Dashboard</h2>
        <FaUserCircle className="text-2xl" />
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed md:static w-72 bg-primary text-dark p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto
      `}>
        <div className="flex items-center justify-center mb-10">
          <FaUserCircle className="text-4xl text-white" />
          <h2 className="text-2xl font-bold ml-4">Parent Dashboard</h2>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map(({ icon: Icon, label, view }) => (
              <li key={view}>
                <button
                  onClick={() => {
                    if (view === "logout") {
                      console.log("Logging out...");
                    } else {
                      setActiveView(view);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left flex items-center p-3 hover:bg-secondary rounded-lg transition-colors duration-200 ${
                    activeView === view ? "bg-secondary text-white" : ""
                  }`}
                >
                  <Icon className="mr-3 text-xl" />
                  <span className="font-medium">{label}</span>
                </button>
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

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-0">Parent Dashboard</h1>
          <div className="w-full md:w-auto flex items-center">
            <div className="relative flex-grow md:flex-grow-0">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-md shadow-sm border border-gray-200"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        {activeView === "home" && renderHomeContent()}
        {activeView === "calendar" && studentData?.studentClass?.schedules && (
          <ParentTimetable
            schedules={studentData.studentClass.schedules}
            className={studentData.studentClass.name}
          />
        )}
        {activeView === "profile" && studentData && <ChildProfile studentData={studentData} />}
        {activeView === "report" && <p>Academic Report coming soon...</p>}
        {activeView === "meetings" && <p>Teacher Meetings coming soon...</p>}
      </div>
    </div>
  );
};

export default ParentDashboard;