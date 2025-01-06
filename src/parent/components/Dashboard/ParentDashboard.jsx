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
  FaHandHoldingMedical
} from "react-icons/fa";
import ChildProfile from "../ChildProfile/ChildProfile"; // Profilul copilului
import ParentTimetable from "../Calendar/ParentTimetable"; // Noul calendar pentru părinți

const ParentDashboard = () => {
  const [activeView, setActiveView] = useState("home");
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const parentId = Cookies.get("userId"); // ID-ul părintelui din cookies

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/parents/${parentId}/student`);
        console.log("Received student data:", response.data);
        setStudentData(response.data); // Setăm datele studentului
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
      <div className="grid grid-cols-2 gap-6">
        {/* Welcome Card */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
          <h3 className="text-2xl font-bold text-dark mb-4">
            Welcome, Parent of {studentData.name}!
          </h3>
          <p className="text-dark2">Stay informed about your child's academic journey.</p>
        </div>

        {/* Academic Performance */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaChartLine className="text-2xl text-primary mr-3" />
            <h4 className="text-xl font-semibold text-dark">Student Details</h4>
          </div>
          <div>
            <p className="text-lg font-bold mb-3">Name: {studentData.name}</p>
            <p className="text-lg font-bold mb-3">Email: {studentData.email}</p>
            <p className="text-lg font-bold mb-3">Phone: {studentData.phoneNumber}</p>
            <p className="text-lg font-bold mb-3">Class: {studentData.studentClass?.name || "No class assigned"}</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaClock className="text-2xl text-primary mr-3" />
            <h4 className="text-xl font-semibold text-dark">Upcoming Events</h4>
          </div>
          <p>No upcoming events at the moment.</p>
        </div>

        {/* Health Tracker */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaHandHoldingMedical className="text-2xl text-primary mr-3" />
            <h4 className="text-xl font-semibold text-dark">Health Tracker</h4>
          </div>
          <p>Track your child's medical records here.</p>
        </div>

        {/* Food Order */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaUtensils className="text-2xl text-primary mr-3" />
            <h4 className="text-xl font-semibold text-dark">Food Orders</h4>
          </div>
          <p>Manage your child's meal orders here.</p>
        </div>

        {/* Communication */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaEnvelope className="text-2xl text-primary mr-3" />
            <h4 className="text-xl font-semibold text-dark">Communication</h4>
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

  return (
    <div className="flex min-h-screen bg-light">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-primary text-dark p-6 shadow-xl flex flex-col">
        <div className="flex items-center justify-center mb-10">
          <FaUserCircle className="text-4xl text-white" />
          <h2 className="text-2xl font-bold ml-4">Parent Dashboard</h2>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            {[ 
              { icon: FaHome, label: "Home", view: "home" },
              { icon: FaCalendarAlt, label: "School Calendar", view: "calendar" },
              { icon: FaUserCircle, label: "Child's Profile", view: "profile" },
              { icon: FaBook, label: "Academic Report", view: "report" },
              { icon: FaChalkboardTeacher, label: "Teacher Meetings", view: "meetings" },
              { icon: FaSignOutAlt, label: "Logout", view: "logout" },
            ].map(({ icon: Icon, label, view }) => (
              <li key={view}>
                <button
                  onClick={() => view === "logout" ? console.log("Logging out...") : setActiveView(view)}
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

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-light">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold">Parent Dashboard</h1>
          <div className="flex items-center">
            <FaSearch className="text-xl text-dark2 mr-4" />
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-md shadow-sm border border-gray-200"
            />
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
