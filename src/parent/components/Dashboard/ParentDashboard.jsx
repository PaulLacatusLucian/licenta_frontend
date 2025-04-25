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
  FaSignOutAlt, 
  FaChalkboardTeacher,
  FaClock,
  FaBook,
  FaEnvelope,
  FaHandHoldingMedical,
  FaBars,
  FaCalendarTimes,
  FaExclamationTriangle,
  FaComments
} from "react-icons/fa";
import ChildProfile from "../Profile/Profile";
import ParentTimetable from "../Calendar/ParentTimetable";
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


  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }

    const fetchParentData = async () => {
      try {
        setIsLoading(true);
        // Fetch child data connected to parent
        const response = await axios.get(`/parents/me/child`);
        setStudentData(response.data);

        // Fetch additional data for the child
        if (response.data.id) {
          try {
            const absencesResponse = await axios.get("/parents/child/total-absences");
            setAbsences(absencesResponse.data || { total: 0 });
            
            const gradesResponse = await axios.get(`/parents/me/child/grades`);
            setGrades(gradesResponse.data || []);

            const teachersResponse = await axios.get(`/parents/me/child/teachers`);
            setTeachers(teachersResponse.data || []);
            

            
          } catch (err) {
            console.error("Failed to fetch additional student data:", err);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch student data:", err);
        setError("Failed to load student data. Please try again later.");
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
        const month = now.getMonth() + 1; // Months start at 0 in JS
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
  
  const renderHomeContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-dark2 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      );
    }

    if (!studentData) {
      return <p>No data available for your child.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-dark mb-2">
            Welcome to the Parent Portal
          </h3>
          <p className="text-dark2 mb-4">Managing your child's education - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          {/* Child Info Summary */}
          <div className="mt-4 p-4 bg-primary rounded-lg flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                <FaUserCircle className="text-4xl text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold">{studentData.name}</h4>
                <p className="text-dark2">Class: {studentData.studentClass?.name || "Not assigned"}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="text-center px-4">
                <p className="text-2xl font-bold">{calculateGPA(grades)}</p>
                <p className="text-dark2 text-sm">GPA</p>
              </div>
              <div className="text-center px-4 border-l border-r border-dark2">
                <p className="text-2xl font-bold">{absences?.total || 0}</p>
                <p className="text-dark2 text-sm">Absences</p>
              </div>
              <div className="text-center px-4">
                <p className="text-2xl font-bold">{grades.length}</p>
                <p className="text-dark2 text-sm">Grades</p>
              </div>
            </div>
          </div>
        </div>



        {/* Quick Actions Card */}
        <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-xl shadow-md">
          <h4 className="text-xl font-semibold text-dark mb-4">Parent Actions</h4>
          <div className="grid grid-cols-1 gap-3">
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
          </div>
        </div>

        {/* Academic Overview */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark">Academic Overview</h4>
            <button 
              onClick={() => navigate("/parent/academic-report")}
              className="text-secondary hover:underline"
            >
              Full Report
            </button>
          </div>
          <div className="mb-4">
            <p className="font-semibold text-dark">Current GPA</p>
            <div className="flex items-end">
              <p className="text-3xl font-bold text-dark">{calculateGPA(grades)}</p>
              <p className="ml-2 text-sm text-dark2">out of 10</p>
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
                  <div className={`px-3 py-1 rounded-full ${
                    grade.grade >= 8 ? 'bg-green-100 text-green-800' : 
                    grade.grade >= 6 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  } font-bold`}>
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
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-dark">Attendance</h4>
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



        {/* Communication Center */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaComments className="text-xl text-secondary mr-3" />
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
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.email}>
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





        {/* Food Services */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <FaUtensils className="text-xl md:text-2xl text-secondary mr-3" />
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
      </div>
    );
  };

  // Updated navigation items with proper routes - removed unwanted views
  const navItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/parent" },
    { icon: FaUserCircle, label: "Profile", view: "profile", path: "/parent/profile" },
    { icon: FaChartLine, label: "Academic Report", view: "report", path: "/parent/academic-report" },
    { icon: FaCalendarAlt, label: "Calendar", view: "calendar", path: null },
    { icon: FaUtensils, label: "Meal Services", view: "food", path: "/cafeteria/profile" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary p-4 flex justify-between items-center relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-dark text-2xl"
        >
          <FaBars />
        </button>
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold">
          Parent Portal
        </h2>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed md:static w-72 bg-primary text-dark p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto
      `}>
        <div className="flex flex-col items-center justify-center mb-10">
          <img 
            src="src\\assets\\logo.png" 
            alt="School Logo" 
            className="w-24 h-24 mb-4"
          />
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold">Parent Portal</h2>
            <p className="text-sm text-dark2">Parent of: {studentData?.name || "Loading..."}</p>
          </div>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map(({ icon: Icon, label, view, path }) => (
              <li key={view}>
                {path ? (
                  <Link
                    to={path}
                    className={`w-full text-left flex items-center p-3 hover:bg-secondary hover:text-white rounded-lg transition-colors duration-200 ${
                      activeView === view ? "bg-secondary text-white" : ""
                    }`}
                  >
                    <Icon className="mr-3 text-xl" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setActiveView(view);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left flex items-center p-3 hover:bg-secondary hover:text-white rounded-lg transition-colors duration-200 ${
                      activeView === view ? "bg-secondary text-white" : ""
                    }`}
                  >
                    <Icon className="mr-3 text-xl" />
                    <span className="font-medium">{label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="mt-auto pt-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg transition-colors duration-200"
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
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">School Calendar</h3>
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