import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaSearch, FaUserCircle, FaHome, FaChartLine, FaCalendarTimes, FaCalendarAlt, FaUtensils, FaRobot, FaBars, FaSignOutAlt, FaArrowRight } from "react-icons/fa";
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
  const [activeView, setActiveView] = useState("home");

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }
    
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
  }, [navigate]);
  

  useEffect(() => {
    const fetchStudentOrders = async () => {
      try {  
        const now = new Date();
        const month = now.getMonth() + 1; // Months start at 0 in JS
        const year = now.getFullYear();
  
        // Use the new endpoint for student orders
        const orderResponse = await axios.get(`/students/me/orders`, {
          params: { month, year }
        });
        
        console.log("Student orders:", orderResponse.data);
        setStudentOrders(orderResponse.data || []);
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

  const getUpcomingClassesForToday = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes
    
    return upcomingClasses.filter(classItem => {
      // Check if the class is scheduled for today
      if (classItem.day && classItem.day.toLowerCase() !== currentDay.toLowerCase()) {
        return false;
      }
      
      // If the class has a startTime, check if it's in the future
      if (classItem.startTime) {
        const [hours, minutes] = classItem.startTime.split(':').map(Number);
        const classTimeInMinutes = hours * 60 + minutes;
        
        return classTimeInMinutes > currentTime;
      }
      
      // If no time info, include it
      return true;
    });
  };

  const navItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/stud" },
    { icon: FaUserCircle, label: "My Profile", view: "profile", path: "/stud/profile" },
    { icon: FaChartLine, label: "Grades", view: "grades", path: "/stud/grades" },
    { icon: FaCalendarTimes, label: "Absences", view: "absences", path: "/stud/absences" },
    { icon: FaCalendarAlt, label: "Schedule", view: "calendar", path: "/stud/calendar" },
    { icon: FaUtensils, label: "Food Orders", view: "food", path: "/stud/food-orders" },
    { icon: FaRobot, label: "Ask Schoolie", view: "ask", path: "/ask-schoolie" }
  ];

  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };

  const today = new Date().toLocaleString("en-US", { weekday: "long" });

  const renderHomeContent = () => {
    // Get filtered classes for today
    const todaysUpcomingClasses = getUpcomingClassesForToday();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-2">
            Welcome back, {studentData?.name || "Student"}!
          </h3>
          <p className="text-indigo-100 mb-4">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Summary Statistics */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">GPA</p>
              <p className="text-3xl font-bold">{calculateGPA(grades)}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Absences</p>
              <p className="text-3xl font-bold">{absences?.total || 0}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Classes Today</p>
              <p className="text-3xl font-bold">{todaysUpcomingClasses.length}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Class</p>
              <p className="text-3xl font-bold">{studentData?.className || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-span-1 md:col-span-2 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
            <FaRobot className="text-primary mr-3" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/grades')}
            >
              <FaChartLine className="mr-2" /> View Grades
            </button>
            <button 
              className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/absences')}
            >
              <FaCalendarTimes className="mr-2" /> Check Absences
            </button>
            <button 
              className="bg-primary text-dark font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/calendar')}
            >
              <FaCalendarAlt className="mr-2" /> View Schedule
            </button>
            <button 
              className="bg-secondary text-white font-semibold p-4 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate('/stud/food-orders')}
            >
              <FaUtensils className="mr-2" /> View Orders
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaCalendarAlt className="text-primary mr-3" />
              Today's Schedule
            </h4>
            <Link to="/stud/calendar" className="text-secondary hover:underline flex items-center">
              Full Schedule
              <FaArrowRight className="ml-2 text-xs" />
            </Link>
          </div>
          <div className="space-y-4">
            {todaysUpcomingClasses.length > 0 ? (
              todaysUpcomingClasses.slice(0, 3).map((classItem, index) => (
                <div key={index} className="border-l-4 border-secondary pl-3 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-dark">
                        {classItem.subjects?.join(", ") || "Unknown Subject"}
                      </p>
                      <p className="text-dark2 text-sm">
                        {classItem.teacher?.name || "Unknown Teacher"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-dark bg-primary px-2 py-1 rounded">{classItem.startTime}</p>
                      <p className="text-dark2 text-xs mt-1">{classItem.endTime}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-dark2 text-sm italic">No more classes scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Absences Overview */}
        <div className="col-span-1 md:col-span-1 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaCalendarTimes className="text-primary mr-3" />
              Absences
            </h4>
            <Link to="/stud/absences" className="text-secondary hover:underline flex items-center">
              View All
              <FaArrowRight className="ml-2 text-xs" />
            </Link>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold text-dark">Total</p>
              <p className={`text-xl md:text-2xl font-bold ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {absences?.total || "No data"}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg ${getAbsenceEmojiColor(absences?.total || 0)}`}>
                {getAbsenceEmoji(absences?.total || 0)}
              </p>
            </div>
          </div>
          <p className="text-dark2 text-sm mt-4">
            Remember: Regular attendance is key to academic success!
          </p>
        </div>

        
      {/* Food Orders */}
      <div className="col-span-1 md:col-span-1 bg-light p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-dark flex items-center">
            <FaUtensils className="text-primary mr-3" />
            Food Orders
          </h4>
          <Link to="/stud/food-orders" className="text-secondary hover:underline flex items-center">
            View Orders
            <FaArrowRight className="ml-2 text-xs" />
          </Link>
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
                    <p className="text-dark font-medium">Qty: {order.quantity || 1}</p>
                    <p className="text-dark font-medium">${order.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <FaUtensils className="text-gray-400 text-4xl mx-auto mb-3" />
              <p className="text-dark2 mb-4">No food orders this month.</p>
              <Link 
                to="/stud/food-orders"
                className="bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:opacity-90 inline-block"
              >
                View All Orders
              </Link>
            </div>
          )}
        </div>
      </div>

        {/* Grades Overview */}
        <div className="col-span-1 md:col-span-1 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaChartLine className="text-primary mr-3" />
              Grades
            </h4>
            <Link to="/stud/grades" className="text-secondary hover:underline flex items-center">
              All Grades
              <FaArrowRight className="ml-2 text-xs" />
            </Link>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold text-dark">Average</p>
              <p className="text-xl md:text-2xl font-bold text-primary">
                {grades.length > 0 ? calculateGPA(grades) : "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg text-primary">
                {grades.length > 0 
                  ? calculateGPA(grades) >= 8 ? "🌟 Excellent!" 
                    : calculateGPA(grades) >= 6 ? "✨ Keep it up!" 
                    : "📚 Room to improve"
                  : "No grades yet"}
              </p>
            </div>
          </div>
          <p className="text-dark2 text-sm mt-4">
            {grades.length > 0 ? `You have ${grades.length} recorded grades this year.` : "No grades recorded yet."}
          </p>
        </div>

        {/* Ask Schoolie */}
        <div className="col-span-1 md:col-span-3 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <FaRobot className="text-xl md:text-2xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">Ask Schoolie</h4>
          </div>
          <div className="flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Ask a question about your school, grades, or schedule..."
              className="w-full md:flex-grow p-3 border rounded-t-lg md:rounded-l-lg md:rounded-tr-none text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button 
              className="w-full md:w-auto bg-secondary text-white px-6 py-3 rounded-b-lg md:rounded-r-lg md:rounded-bl-none hover:opacity-90 transition-opacity duration-200 mt-2 md:mt-0 font-medium"
              onClick={() => navigate('/ask-schoolie')}
            >
              Ask Now
            </button>
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
              src="src\\assets\\logo.png" 
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
          <h2 className="text-2xl font-bold text-dark">Dashboard</h2>
          <div className="flex items-center">
            <div className="flex items-center">
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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