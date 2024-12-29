import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaSearch, FaUserCircle, FaHome, FaChartLine, FaClipboardList, FaCalendarAlt, FaUtensils, FaRobot } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [absences, setAbsences] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const userId = Cookies.get("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const [studentResponse, absencesResponse, classesResponse] = await Promise.all([
          axios.get(`/api/students/${userId}`),
          axios.get(`/api/students/${userId}/total_absences`),
          axios.get(`/api/students/${userId}/upcoming-classes`),
        ]);

        const fetchedStudentData = studentResponse.data || null;
        const fetchedUpcomingClasses = classesResponse.data || [];

        // Fallback la schedules dacă upcomingClasses este gol
        if (fetchedUpcomingClasses.length === 0 && fetchedStudentData?.studentClass?.schedules) {
          setUpcomingClasses(fetchedStudentData.studentClass.schedules);
        } else {
          setUpcomingClasses(fetchedUpcomingClasses);
        }

        setStudentData(fetchedStudentData);
        setAbsences(absencesResponse.data || { total: 0 });
        setError(null);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError("Failed to load student data. Please try again later.");
        setStudentData(null);
        setAbsences({ total: 0 });
        setUpcomingClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [userId, navigate]);

  // Funcții auxiliare
  const getAbsenceEmoji = (absenceCount) => {
    if (absenceCount <= 3) {
      return "😄 Great job attending classes!";
    } else if (absenceCount > 3 && absenceCount <= 9) {
      return "😐 Try to improve your attendance";
    } else {
      return "😱 Urgent! Too many absences!";
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

  // Render principal
  const renderHomeContent = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
        <h3 className="text-2xl font-bold text-dark mb-4">
          Welcome, {studentData?.name || "Student"}!
        </h3>
        <p className="text-dark2">Here's a quick overview of your academic journey.</p>
      </div>

      {/* Absences Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaHome className="text-2xl text-primary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Absences</h4>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-dark">Total Absences</p>
              <p className={`text-2xl font-bold ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {absences?.total || "No data"}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xl ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {getAbsenceEmoji(absences?.total || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Classes Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaCalendarAlt className="text-2xl text-primary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Upcoming Classes</h4>
        </div>
        <div className="space-y-4">
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((classItem, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark">
                      {classItem.subjects?.join(", ") || "Unknown Subject"}
                    </p>
                    <p className="text-dark2 text-sm">
                      with {classItem.teacher?.name || "Unknown Teacher"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-dark font-medium">
                      {classItem.startTime} - {classItem.endTime}
                    </p>
                    <p className="text-dark2 text-xs">{classItem.scheduleDay || "No day"}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-dark2">No upcoming classes</p>
          )}
        </div>
      </div>

      {/* Ask Schoolie Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaRobot className="text-2xl text-secondary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Ask Schoolie</h4>
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-grow p-2 border rounded-l-lg text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button className="bg-secondary text-white px-4 py-2 rounded-r-lg hover:opacity-90">
            Send
          </button>
        </div>
      </div>
    </div>
  );

  // Layout principal
  return (
    <div className="flex min-h-screen bg-light">
      {/* Sidebar with navigation options */}
      <div className="w-72 bg-primary text-dark p-6 shadow-xl flex flex-col">
        <div className="flex items-center justify-center mb-10">
          <img
            src={studentData?.profileImage || "/api/placeholder/100/100"}
            alt="Profile"
            className="w-16 h-16 rounded-full border-4 border-white"
          />
          <h2 className="text-2xl font-bold ml-4">Schoolie</h2>
        </div>

        <nav>
          <ul className="space-y-2">
            {[
              { icon: FaHome, label: "Home", path: "/" },
              { icon: FaUserCircle, label: "My Profile", path: "/stud/profile" },
              { icon: FaChartLine, label: "Grades", path: "/grades" },
              { icon: FaClipboardList, label: "Assignments", path: "/assignments" },
              { icon: FaCalendarAlt, label: "Calendar", path: "/stud/calendar" },
              { icon: FaUtensils, label: "Food", path: "/food" },
              { icon: FaRobot, label: "Ask Schoolie", path: "/ask-schoolie" }
            ].map(({ icon: Icon, label, path }) => (
              <li key={path}>
                <Link 
                  to={path} 
                  className="flex items-center p-3 hover:bg-secondary rounded-lg transition-colors duration-200"
                >
                  <Icon className="mr-3 text-xl" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8 bg-light">
        <header className="flex justify-between items-center mb-10">
          <div className="flex-grow max-w-xl mr-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white shadow-md text-dark focus:outline-none focus:ring-2 focus:ring-secondary" 
              />
            </div>
          </div>

          <div className="flex items-center">
            <FaUserCircle className="text-4xl text-dark2 mr-4" />
            <div>
              <p className="font-semibold text-dark">
                {studentData?.name || "Student Name"}
              </p>
              <p className="text-sm text-dark2">
                {studentData?.studentClass?.name || "No Class"}
              </p>
            </div>
          </div>
        </header>

        {renderHomeContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;
