import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import logo from "../../../assets/logo.png"
import { 
  FaHome, 
  FaUserCircle, 
  FaChartLine, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaUtensils, 
  FaSignOutAlt, 
  FaChalkboardTeacher,
  FaClock,
  FaBook,
  FaEnvelope,
  FaHandHoldingMedical,
  FaBars,
  FaCalendarTimes,
  FaExclamationTriangle,
  FaComments,
  FaChild,
  FaArrowLeft,
  FaTrophy,
  FaIdCard
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const ParentDashboard = () => {
  const [activeView, setActiveView] = useState("home");
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentOrders, setStudentOrders] = useState([]);
  const [absences, setAbsences] = useState({ total: 0 });
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [parentData, setParentData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }

    const fetchParentData = async () => {
      try {
        setIsLoading(true);
        // Fetch all required data in parallel for better performance
        const [parentResponse, childResponse, teachersResponse, absencesResponse, gradesResponse] = await Promise.all([
          axios.get('/parents/me'),
          axios.get('/parents/me/child'),
          axios.get('/parents/me/child/teachers'),
          axios.get('/parents/child/total-absences'),
          axios.get('/parents/me/child/grades')
        ]);
        
        setParentData(parentResponse.data);
        setStudentData(childResponse.data);
        setTeachers(teachersResponse.data || []);
        setAbsences(absencesResponse.data || { total: 0 });
        setGrades(gradesResponse.data || []);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParentData();
  }, [navigate]);

  useEffect(() => {
    const fetchStudentOrders = async () => {
      if (!studentData?.id) return;

      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const response = await axios.get(`/parents/me/child/orders`, {
          params: { month, year }
        });        
        setStudentOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching student orders:", error);
      }
    };

    fetchStudentOrders();
  }, [studentData]);

  const calculateGPA = (grades) => {
    if (!grades.length) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  // Calculate performance trend
  const calculateTrend = () => {
    if (!grades || grades.length < 2) return "stable";
    
    // Sort grades by date
    const sortedGrades = [...grades].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Compare first and last grades
    const firstGrade = sortedGrades[0].grade;
    const lastGrade = sortedGrades[sortedGrades.length - 1].grade;
    
    if (lastGrade > firstGrade) return "improving";
    if (lastGrade < firstGrade) return "declining";
    return "stable";
  };

  const performanceTrend = calculateTrend();

  const getTrendIcon = () => {
    switch (performanceTrend) {
      case "improving":
        return <div className="text-green-600">↗ Improving</div>;
      case "declining":
        return <div className="text-red-600">↘ Needs attention</div>;
      default:
        return <div className="text-blue-600">→ Stable</div>;
    }
  };

  const getAbsenceEmoji = (absenceCount) => {
    if (absenceCount <= 3) {
      return "😄 Excellent attendance";
    } else if (absenceCount > 3 && absenceCount <= 9) {
      return "😐 Attendance needs attention";
    } else {
      return "😱 Critical attendance issues";
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

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };

  const handleSendMessage = async () => {
    if (!selectedTeacher) {
      setError("Please select a teacher to send your message to.");
      return;
    }
  
    if (!messageSubject.trim() || !messageContent.trim()) {
      setError("Please enter both subject and message content.");
      return;
    }
  
    try {
      await axios.post("/parents/parents/me/send-message", {
        teacherEmail: selectedTeacher,
        subject: messageSubject,
        content: messageContent,
      });
  
      setMessageSent(true);
      setMessageSubject("");
      setMessageContent("");
      setSelectedTeacher("");
  
      setTimeout(() => setMessageSent(false), 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again later.");
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 8) return 'bg-green-100 text-green-800';
    if (grade >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const renderHomeContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-dark2 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-4 p-6 bg-red-50 text-red-600 rounded-xl shadow-sm">
          <h3 className="font-bold text-xl mb-2">Something went wrong</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-primary text-dark px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!studentData) {
      return (
        <div className="mt-4 p-6 bg-gray-50 text-gray-600 rounded-xl shadow-sm text-center">
          <FaExclamationTriangle className="mx-auto text-yellow-500 text-4xl mb-4" />
          <h3 className="font-bold text-xl mb-2">No Child Data Found</h3>
          <p>No data available for your child. Please contact the school administration.</p>
        </div>
      );
    }

          return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hero Header */}
        <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-2">
            Welcome to the Parent Portal
          </h3>
          <p className="text-indigo-100 mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          {/* Child Info Summary */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl mr-4">
                {studentData?.profileImage ? (
                  <img
                    src={`http://localhost:8080${studentData.profileImage}`}
                    alt="Child Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-4xl text-gray-300 bg-gray-100 w-full h-full p-2" />
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold">{studentData.name}</h4>
                <p className="text-indigo-100">Class: {studentData.studentClass?.name || "Not assigned"}</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="text-center px-4">
                <p className="text-2xl font-bold">{calculateGPA(grades)}</p>
                <p className="text-indigo-100 text-sm">GPA</p>
              </div>
              <div className="text-center px-4 border-l border-r border-white border-opacity-30">
                <p className="text-2xl font-bold">{absences?.total || 0}</p>
                <p className="text-indigo-100 text-sm">Absences</p>
              </div>
              <div className="text-center px-4">
                <p className="text-2xl font-bold">{grades.length}</p>
                <p className="text-indigo-100 text-sm">Grades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-span-1 md:col-span-1 bg-light p-6 rounded-xl shadow-sm border border-gray-200">
          <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
            <FaUserCircle className="text-primary mr-3" />
            Parent Actions
          </h4>
          <div className="space-y-3">
            <button 
              className="w-full bg-primary text-dark font-semibold p-3 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate("/parent/profile")}
            >
              <FaUserCircle className="mr-2" /> View Profile
            </button>
            <button 
              className="w-full bg-secondary text-white font-semibold p-3 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              onClick={() => navigate("/parent/academic-report")}
            >
              <FaChartLine className="mr-2" /> Academic Report
            </button>
            <button 
              className="w-full bg-light text-dark font-semibold p-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
              onClick={() => window.location.href = "http://localhost:5173/cafeteria/"}
            >
              <FaUtensils className="mr-2" /> Meal Services
            </button>
          </div>
          
          <div className="mt-6 bg-light rounded-lg p-4">
            <h5 className="font-medium text-dark mb-3 flex items-center">
              <FaIdCard className="mr-2 text-primary" />
              Parent Information
            </h5>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-24">Email:</span>
                <span className="font-medium">{parentData?.email || "N/A"}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-24">Phone:</span>
                <span className="font-medium">{parentData?.motherPhoneNumber || parentData?.phoneNumber || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Overview */}
        <div className="col-span-1 bg-light p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaChartLine className="text-primary mr-3" />
              Academic Overview
            </h4>
            <button 
              onClick={() => navigate("/parent/academic-report")}
              className="text-secondary hover:underline flex items-center"
            >
              Full Report
              <FaArrowLeft className="ml-2 transform rotate-180" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary p-4 rounded-lg">
              <p className="font-semibold text-dark">Current GPA</p>
              <div className="flex items-end">
                <p className="text-3xl font-bold text-dark">{calculateGPA(grades)}</p>
              </div>
            </div>
            
            <div className="bg-primary p-4 rounded-lg">
              <p className="font-semibold text-dark">Trend</p>
              <div className="text-xl font-bold">
                {getTrendIcon()}
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <p className="font-semibold text-dark">Recent Grades</p>
            {grades.length > 0 ? (
              grades.slice(0, 3).map((grade, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{grade.subject || "Subject"}</p>
                    <p className="text-dark2 text-xs">{new Date(grade.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${getGradeColor(grade.grade)} font-bold`}>
                    {grade.grade}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-dark2 italic">No grades recorded yet</p>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="col-span-1 bg-light p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark flex items-center">
              <FaCalendarTimes className="text-primary mr-3" />
              Attendance
            </h4>
          </div>
          <div className="flex flex-col items-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 ${
              absences.total <= 3 ? 'bg-green-100' : 
              absences.total <= 9 ? 'bg-yellow-100' : 
              'bg-red-100'
            }`}>
              <p className="text-3xl font-bold">{absences.total || 0}</p>
            </div>
            <p className={`font-medium ${getAbsenceEmojiColor(absences.total || 0)}`}>
              {getAbsenceEmoji(absences.total || 0)}
            </p>
          </div>
          
          <div className="border-t pt-3">
            <p className="text-dark2">
              School policy requires at least 90% attendance. Please ensure your child attends all classes regularly.
            </p>
          </div>
        </div>

        {/* Food Services */}
        <div className="col-span-1 md:col-span-3 bg-light p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <FaUtensils className="text-xl md:text-2xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">School Meal Services</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-dark2 mb-4">
                Manage your child's meal plan and view their food orders. You can pre-order meals for the upcoming week.
              </p>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => window.location.href = "http://localhost:5173/cafeteria/"}
                  className="bg-primary text-dark py-2 px-4 rounded-lg hover:opacity-90 font-medium"
                >
                  View Menu
                </button>
                <button
                  onClick={() => window.location.href = "http://localhost:5173/cafeteria/profile"}
                  className="bg-secondary text-white py-2 px-4 rounded-lg hover:opacity-90 font-medium"
                >
                  Manage Meals
                </button>
              </div>
            </div>
            <div className="border-l pl-6">
              <p className="font-semibold mb-3">Recent Orders</p>
              {studentOrders.length > 0 ? (
                studentOrders.slice(0, 3).map((order, index) => (
                  <div key={index} className="border-b pb-3 mb-3 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{order.menuItemName}</p>
                        <p className="text-dark2 text-xs">{new Date(order.orderTime).toLocaleDateString()}</p>
                      </div>
                      <p className="font-medium">${order.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-dark2 italic">No recent food orders</p>
              )}
            </div>
          </div>
        </div>

        {/* Communication Center */}
        <div className="col-span-1 md:col-span-3 bg-light p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <FaComments className="text-xl text-primary mr-3" />
            <h4 className="text-lg md:text-xl font-semibold text-dark">Teacher Communication</h4>
          </div>
          <p className="text-dark2 mb-4">
            Have questions about your child's progress? Send a message to their teacher.
          </p>
          
          {messageSent && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
              Message sent successfully!
            </div>
          )}
          
          <div className="space-y-3 mt-4">
            <div>
              <label className="block text-dark2 mb-2">Select Teacher</label>
              <select 
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher, index) => (
                  <option key={teacher.id || `teacher-${index}`} value={teacher.email}>
                    {teacher.name} - {teacher.subject}
                  </option>
                ))}
              </select>
            </div>
            <input 
              type="text" 
              placeholder="Subject"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea 
              placeholder="Write your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="w-full p-2 border rounded h-20"
            ></textarea>
            <button 
              className="w-full bg-secondary text-white font-medium py-2 rounded hover:opacity-90"
              onClick={handleSendMessage}
            >
              Send Message
            </button>
          </div>
        </div>

        {/* Child Overview Preview - REMOVED */}

       
      </div>
    );
  };

  // Updated navigation items with proper routes
  const navItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/parent" },
    { icon: FaUserCircle, label: "Profile", view: "profile", path: "/parent/profile" },
    { icon: FaChartLine, label: "Academic Report", view: "report", path: "/parent/academic-report" },
    { icon: FaCalendarAlt, label: "Calendar", view: "calendar", path: "/parent/calendar" },
    { icon: FaUtensils, label: "Meal Services", view: "food", path: "/cafeteria" },
  ];

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
          Parent Portal
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
              alt="School Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Parent Portal</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">Parent of: {studentData?.name || "Loading..."}</p>
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
                  >
                    <Icon className="mr-3 text-xl" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ) : (
                  <Link 
                    to="/parent"
                    onClick={() => {
                      setActiveView(view);
                      setIsSidebarOpen(false);
                    }}
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

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">
            {activeView === "home" ? "Parent Dashboard" : 
             activeView === "profile" ? "Child's Profile" :
             activeView === "report" ? "Academic Report" :
             activeView === "calendar" ? "School Calendar" :
             activeView === "food" ? "Meal Services" : "Parent Portal"}
          </h2>
        </header>

        {/* Dynamic Content */}
        {activeView === "home" && renderHomeContent()}
        
        {activeView === "calendar" && studentData?.studentClass?.schedules && (
          <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FaCalendarAlt className="text-primary mr-3" />
              School Calendar
            </h3>
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                <button className="px-4 py-2 bg-primary text-dark rounded">Classes</button>
                <button className="px-4 py-2 bg-secondary text-white rounded">Events</button>
              </div>
              {studentData.studentClass.schedules.length > 0 ? (
                studentData.studentClass.schedules.map((schedule, index) => (
                  <div key={index} className="border-l-4 border-secondary pl-3 py-2 mb-3">
                    <p className="font-semibold text-dark">
                      {schedule.subjects?.join(", ") || "N/A"}
                    </p>
                    <p className="text-sm text-dark2">
                      {schedule.teacher?.name || "Teacher"} | {schedule.day} {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-dark2 italic">No class schedule available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;