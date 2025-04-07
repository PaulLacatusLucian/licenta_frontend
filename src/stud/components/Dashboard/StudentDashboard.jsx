import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaSearch, FaUserCircle, FaHome, FaChartLine, FaClipboardList, FaCalendarAlt, FaUtensils, FaRobot, FaBars } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [absences, setAbsences] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [studentOrders, setStudentOrders] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
  
        const studentResponse = await axios.get(`/students/me`);
        console.log("Student data response:", studentResponse.data);
  
        const absencesResponse = await axios.get(`/students/me/total-absences`);
        const classesResponse = await axios.get(`/students/me/upcoming-classes`);
  
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
  
    fetchStudentData(); // 👈 Apelul real al funcției
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
    { icon: FaClipboardList, label: "Assignments", path: "/assignments" },
    { icon: FaCalendarAlt, label: "Calendar", path: "/stud/calendar" },
    { icon: FaUtensils, label: "Food", path: "/food" },
    { icon: FaRobot, label: "Ask Schoolie", path: "/ask-schoolie" }
  ];

  const renderHomeContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Welcome Card */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md col-span-1 md:col-span-2">
        <h3 className="text-xl md:text-2xl font-bold text-dark mb-2 md:mb-4">
          Welcome, {studentData?.name || "Student"}!
        </h3>
        <p className="text-dark2">Here's a quick overview of your academic journey.</p>
      </div>
  
      {/* Absences Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaHome className="text-xl md:text-2xl text-primary mr-3" />
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
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaUtensils className="text-xl md:text-2xl text-primary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Your Food Orders</h4>
        </div>
        <div className="space-y-4">
          {studentOrders.length > 0 ? (
            studentOrders.map((order, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark">{order.menuItemName}</p>
                    <p className="text-dark2 text-sm">
                      Ordered on: {new Date(order.orderTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-dark font-medium">Quantity: {order.quantity}</p>
                    <p className="text-dark font-medium">Total: ${order.price.toFixed(2)}</p>
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
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaCalendarAlt className="text-xl md:text-2xl text-primary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Upcoming Classes</h4>
        </div>
        <div className="space-y-4">
          {upcomingClasses.length > 0 ? (
            upcomingClasses.slice(0, 3).map((classItem, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div>
                    <p className="font-semibold text-dark">
                      {classItem.subjects?.join(", ") || "Unknown Subject"}
                    </p>
                    <p className="text-dark2 text-sm">
                      with {classItem.teacher?.name || "Unknown Teacher"}
                    </p>
                  </div>
                  <div className="text-left md:text-right mt-2 md:mt-0">
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
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaRobot className="text-xl md:text-2xl text-secondary mr-3" />
          <h4 className="text-lg md:text-xl font-semibold text-dark">Ask Schoolie</h4>
        </div>
        <div className="flex flex-col md:flex-row">
          <input
            type="text"
            placeholder="Ask a question..."
            className="w-full md:flex-grow p-2 border rounded-t-lg md:rounded-l-lg md:rounded-tr-none text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button className="w-full md:w-auto bg-secondary text-white px-4 py-2 rounded-b-lg md:rounded-r-lg md:rounded-bl-none hover:opacity-90 mt-2 md:mt-0">
            Send
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

          <div className="hidden md:flex items-center">
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