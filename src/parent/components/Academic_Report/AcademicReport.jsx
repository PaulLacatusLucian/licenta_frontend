import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../assets/logo.png"
import { 
  FaChartLine, 
  FaBook, 
  FaCalendarTimes, 
  FaChalkboardTeacher,
  FaTrophy,
  FaPrint,
  FaFilePdf,
  FaArrowLeft,
  FaHome,
  FaBars,
  FaUserCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaCalendarAlt,
  FaUtensils,
  FaSignOutAlt,
  FaSpinner
} from "react-icons/fa";

// Import the StructuredPDFButton component
import StructuredPDFButton from "./StructuredPDFExport";

const AcademicReportPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [absences, setAbsences] = useState({ total: 0 });
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("report");
  const [parentData, setParentData] = useState(null);
  
  // Notification system
  const [notification, setNotification] = useState(null);
  
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all required data in parallel for better performance
        const [parentResponse, studentResponse, gradesResponse, absencesResponse, teachersResponse] = await Promise.all([
          axios.get('/parents/me'),
          axios.get('/parents/me/child'),
          axios.get('/parents/me/child/grades'),
          axios.get('/parents/child/total-absences'),
          axios.get('/parents/me/child/teachers')
        ]);
        
        setParentData(parentResponse.data);
        setStudentData(studentResponse.data);
        setGrades(gradesResponse.data || []);
        setAbsences(absencesResponse.data || { total: 0 });
        setTeachers(teachersResponse.data || []);
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch academic data:", err);
        setError("Failed to load academic data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const calculateGPA = (gradesList) => {
    if (!gradesList || !gradesList.length) return 0;
    const sum = gradesList.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / gradesList.length).toFixed(2);
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

  const getGradeColor = (grade) => {
    if (grade >= 8) return 'bg-green-100 text-green-800';
    if (grade >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

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

  const handleBackToDashboard = () => {
    navigate("/parent");
  };

  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };

  // Navigation items - similar to Dashboard
  const navItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/parent" },
    { icon: FaUserCircle, label: "Profile", view: "profile", path: "/parent/profile" },
    { icon: FaChartLine, label: "Academic Report", view: "report", path: "/parent/academic-report" },
    { icon: FaCalendarAlt, label: "Calendar", view: "calendar", path: "/parent/calendar" },
    { icon: FaUtensils, label: "Meal Services", view: "food", path: "/cafeteria/profile" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">Loading academic report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl p-6 bg-light rounded-xl shadow-md border border-gray-200">
          <div className="text-center mb-6">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-3 mx-auto" />
            <h2 className="text-2xl font-bold text-dark mb-2">Error Loading Report</h2>
            <p className="text-dark2">{error}</p>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={handleBackToDashboard}
              className="bg-primary text-dark px-4 py-2 rounded-lg hover:opacity-90 font-medium"
            >
              <FaArrowLeft className="inline mr-2" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          Academic Report
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
        {/* Desktop Header */}
        <header className="relative flex justify-center items-center mb-6 hidden md:flex">
          <button 
            onClick={() => navigate("/parent")}
            className="absolute left-0 text-primary hover:text-secondary"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">Academic Performance Report</h2>
          
          <div className="absolute right-0 flex space-x-3 print:hidden">
            <StructuredPDFButton 
              studentData={studentData}
              grades={grades}
              absences={absences}
              teachers={teachers}
            />
          </div>
        </header>

        {/* Mobile Header (different layout) */}
        <div className="md:hidden mb-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => navigate("/parent")}
              className="text-primary hover:text-secondary mr-4"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-xl font-bold text-dark">Academic Performance Report</h2>
          </div>
          
          <div className="flex space-x-3 print:hidden">
            <div className="flex-1">
              <StructuredPDFButton 
                studentData={studentData}
                grades={grades}
                absences={absences}
                teachers={teachers}
              />
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Page Title - visible in print */}
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-bold text-center">Academic Performance Report</h1>
            <p className="text-center text-dark2">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Hero Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Student Performance Summary</h3>
                <p className="text-indigo-100">
                  Student: {studentData?.name || "N/A"} | Class: {studentData?.className || "N/A"}
                </p>
                <p className="text-indigo-100">
                  School Year: {new Date().getFullYear()} | Report Date: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-center px-8 py-4">
                <p className="text-indigo-100 text-sm">Overall GPA</p>
                <p className="text-3xl font-bold">{calculateGPA(grades)}</p>
                <p className="text-indigo-100 text-xs">Out of 10</p>
              </div>
              
              <div className="text-center px-8 py-4 border-t md:border-t-0 md:border-l md:border-r border-white border-opacity-30">
                <p className="text-indigo-100 text-sm">Absences</p>
                <p className="text-3xl font-bold">{absences.total}</p>
                <p className="text-indigo-100 text-xs">Total this year</p>
              </div>
              
              <div className="text-center px-8 py-4">
                <p className="text-indigo-100 text-sm">Performance Trend</p>
                <div className="text-xl font-bold text-white">
                  {getTrendIcon()}
                </div>
                <p className="text-indigo-100 text-xs">Based on recent grades</p>
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid">
            <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
              <FaBook className="text-primary mr-3" />
              Subject Performance
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...new Set(grades.map(grade => grade.subject))].map(subject => {
                const subjectGrades = grades.filter(grade => grade.subject === subject);
                const avgGrade = calculateGPA(subjectGrades);
                const teacher = teachers.find(t => t.subject === subject);
                
                return (
                  <div key={subject} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-dark">{subject}</h5>
                        <p className="text-dark2 text-sm">Teacher: {teacher?.name || "N/A"}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${getGradeColor(avgGrade)} font-bold`}>
                        {avgGrade}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-dark2 text-sm mb-1">Recent grades:</p>
                      <div className="flex space-x-2">
                        {subjectGrades.slice(-3).map((grade, i) => (
                          <span key={i} className={`px-2 py-1 rounded ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid">
            <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
              <FaClipboardList className="text-primary mr-3" />
              Grade History
            </h4>
            
            {grades.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade, index) => {
                      // Find teacher for this subject
                      const teacher = teachers.find(t => t.subject === grade.subject);
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-dark">{grade.subject || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-dark2">
                            {new Date(grade.sessionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full ${getGradeColor(grade.grade)} font-bold`}>
                              {grade.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-dark2">
                            {teacher?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-dark2">
                            {grade.comment || "No comments"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-dark2 italic">No grades found.</p>
            )}
          </div>
          
          {/* Teacher Contact */}
          <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid">
            <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
              <FaChalkboardTeacher className="text-primary mr-3" />
              Teacher Contact Information
            </h4>
            
            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map((teacher, index) => (
                  <div key={index} className="flex items-center border rounded-lg p-3 bg-white">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center mr-4">
                      <FaChalkboardTeacher className="text-xl" />
                    </div>
                    <div>
                      <h5 className="font-semibold">{teacher.name}</h5>
                      <p className="text-dark2">{teacher.subject}</p>
                      <p className="text-primary">{teacher.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark2 italic">No teacher information available.</p>
            )}
          </div>
        </div>
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed bottom-4 right-4 max-w-md z-50 rounded-lg shadow-lg p-4 flex items-start space-x-4 ${
            notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              notification.type === "success" ? "bg-green-200" : "bg-red-200"
            }`}>
              {notification.type === "success" ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              )}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
            </div>
            <button 
              className="flex-shrink-0 ml-1 text-gray-400 hover:text-gray-600"
              onClick={() => setNotification(null)}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicReportPage;