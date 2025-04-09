import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaSearch, FaUserCircle, FaHome, FaChartLine, FaCalendarTimes, FaCalendarAlt, FaUtensils, FaRobot, FaBars } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [absences, setAbsences] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [studentOrders, setStudentOrders] = useState([]); 
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
  
        const studentResponse = await axios.get(`/students/me`);
        console.log("Student data response:", studentResponse.data);
  
        const absencesResponse = await axios.get(`/students/me/total-absences`);
        const classesResponse = await axios.get(`/students/me/upcoming-classes`);
        const gradesResponse = await axios.get(`/grades/me`);

        setGrades(gradesResponse.data || []);
        setStudentData(studentResponse.data || null);
        setAbsences(absencesResponse.data || { total: 0 });
  
        const fetchedUpcomingClasses = classesResponse.data || [];
        if (fetchedUpcomingClasses.length === 0 && studentResponse.data.studentClass?.schedules) {
          setUpcomingClasses(studentResponse.data.studentClass.schedules);
        } else {
          setUpcomingClasses(fetchedUpcomingClasses);
        }
  
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
  }, []);
  

  useEffect(() => {
    const fetchStudentOrders = async () => {
      try {  
        const now = new Date();
        const month = now.getMonth() + 1; // Lunile încep de la 0 în JS
        const year = now.getFullYear();
  
        const response = await axios.get(`/menu/orders/student/me/${month}/${year}`);
        console.log("Student orders:", response.data);
        setStudentOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching student orders:", error);
      }
    };
  
    fetchStudentOrders();
  }, []);
  
  const calculateGPA = (grades) => {
    if (!grades.length) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };
  
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

  const navItems = [
    { icon: FaHome, label: "Home", path: "/" },
    { icon: FaUserCircle, label: "My Profile", path: "/stud/profile" },
    { icon: FaChartLine, label: "Grades", path: "/stud/grades" },
    { icon: FaCalendarTimes, label: "Absences", path: "/stud/absences" },
    { icon: FaCalendarAlt, label: "Schedule", path: "/stud/calendar" },
    { icon: FaUtensils, label: "Food", path: "/food" },
    { icon: FaRobot, label: "Ask Schoolie", path: "/ask-schoolie" }
  ];

  const renderHomeContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Welcome Card */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-xl md:text-2xl font-bold text-dark mb-2 md:mb-4">
          Welcome, {studentData?.name || "Student"}!
        </h3>
        <p className="text-dark2">Here's a quick overview of your academic journey.</p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
  
      {/* Absences Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <FaCalendarTimes className="text-xl md:text-2xl text-primary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Absences</h4>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-dark">Total Absences</p>
              <p className={`text-xl md:text-2xl font-bold ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {absences?.total || "No data"}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg md:text-xl ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {getAbsenceEmoji(absences?.total || 0)}
              </p>
            </div>
          </div>
          <Link 
            to="/stud/absences" 
            className="block text-center bg-light py-2 rounded-lg text-primary font-medium hover:bg-primary hover:text-white transition-colors duration-200"
          >
            View All Absences
          </Link>
        </div>
      </div>

      {/* Food Orders Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <FaUtensils className="text-xl md:text-2xl text-primary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Your Food Orders</h4>
        </div>
        <div className="space-y-4">
          {studentOrders.length > 0 ? (
            studentOrders.slice(0, 2).map((order, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark">{order.menuItemName}</p>
                    <p className="text-dark2 text-sm">
                      {new Date(order.orderTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-dark font-medium">Qty: {order.quantity}</p>
                    <p className="text-dark font-medium">${order.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-dark2">No food orders this month.</p>
          )}
        </div>
      </div>
  
      {/* Upcoming Classes Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <FaCalendarAlt className="text-xl md:text-2xl text-primary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Upcoming Classes</h4>
        </div>
        <div className="space-y-4">
          {upcomingClasses.length > 0 ? (
            upcomingClasses.slice(0, 2).map((classItem, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-dark">
                      {classItem.subjects?.join(", ") || "Unknown Subject"}
                    </p>
                    <p className="text-dark2 text-sm">
                      {classItem.teacher?.name || "Unknown Teacher"}
                    </p>
                  </div>
                  <div className="mt-1">
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
          <Link 
            to="/stud/calendar" 
            className="block text-center bg-light py-2 rounded-lg text-primary font-medium hover:bg-primary hover:text-white transition-colors duration-200"
          >
            View Schedule
          </Link>
        </div>
      </div>
  
      {/* Grades Quick View */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <FaChartLine className="text-xl md:text-2xl text-primary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Grades</h4>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-dark">Average</p>
              <p className="text-xl md:text-2xl font-bold text-primary">
                {grades.length > 0 ? calculateGPA(grades) : "N/A"}
              </p>
            </div>
            <div className="text-right">
            <p className="text-lg md:text-xl text-primary">
            {grades.length > 0 
              ? calculateGPA(grades) >= 8 ? "🌟 Excellent!" 
                : calculateGPA(grades) >= 6 ? "✨ Keep it up!" 
                : "📚 Room to improve"
              : "No grades yet"}
          </p>
            </div>
          </div>
          <Link 
            to="/stud/grades" 
            className="block text-center bg-light py-2 rounded-lg text-primary font-medium hover:bg-primary hover:text-white transition-colors duration-200"
          >
            View All Grades
          </Link>
        </div>
      </div>

      {/* Ask Schoolie Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md col-span-1 lg:col-span-3 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <FaRobot className="text-xl md:text-2xl text-secondary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Ask Schoolie</h4>
        </div>
        <div className="flex flex-col md:flex-row">
          <input
            type="text"
            placeholder="Ask a question about your school, grades, or schedule..."
            className="w-full md:flex-grow p-3 border rounded-t-lg md:rounded-l-lg md:rounded-tr-none text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button className="w-full md:w-auto bg-secondary text-white px-6 py-3 rounded-b-lg md:rounded-r-lg md:rounded-bl-none hover:opacity-90 transition-opacity duration-200 mt-2 md:mt-0 font-medium">
            Ask Now
          </button>
        </div>
      </div>
    </div>
  );
  

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
        <h2 className="text-xl font-bold">Schoolie</h2>
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
          <img
            src={studentData?.profileImage || "/api/placeholder/100/100"}
            alt="Profile"
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white"
          />
          <h2 className="text-xl md:text-2xl font-bold ml-4">Schoolie</h2>
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

        {/* Profile Info */}
        <div className="mt-auto pt-6 border-t border-gray-200 mt-6">
          <div className="flex items-center">
            <FaUserCircle className="text-3xl mr-3" />
            <div>
              <p className="font-medium">{studentData?.name || "Student"}</p>
              <p className="text-sm text-dark2">{studentData?.studentClass?.name || "No Class"}</p>
            </div>
          </div>
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10">
          <div className="w-full md:flex-grow md:max-w-xl md:mr-6 mb-4 md:mb-0">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white shadow-md text-dark focus:outline-none focus:ring-2 focus:ring-secondary" 
              />
            </div>
          </div>


        </header>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-dark2 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          renderHomeContent()
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;