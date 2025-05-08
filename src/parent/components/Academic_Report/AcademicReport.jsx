import React, { useState, useEffect, useMemo } from "react";
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
  FaSpinner,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUserTie,
  FaCheckCircle,
  FaFilter
} from "react-icons/fa";

// Import the StructuredPDFButton component
import StructuredPDFButton from "./StructuredPDFExport";

const AcademicReportPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [absences, setAbsences] = useState([]);  // Modificat pentru a fi array
  const [absencesTotal, setAbsencesTotal] = useState(0);  // Total absențe pentru overview
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("report");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "grades", "absences"
  const [parentData, setParentData] = useState(null);
  
  // State pentru absențe
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filter, setFilter] = useState("all"); // "all", "justified", "unjustified"
  
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
        const [
          parentResponse, 
          studentResponse, 
          gradesResponse, 
          totalAbsencesResponse,
          teachersResponse
        ] = await Promise.all([
          axios.get('/parents/me'),
          axios.get('/parents/me/child'),
          axios.get('/parents/me/child/grades'),
          axios.get('/parents/child/total-absences'),  // Endpoint pentru total absențe
          axios.get('/parents/me/child/teachers')
        ]);
        
        setParentData(parentResponse.data);
        setStudentData(studentResponse.data);
        setGrades(gradesResponse.data || []);
        setAbsencesTotal(totalAbsencesResponse.data?.total || 0);  // Setăm totalul inițial
        setTeachers(teachersResponse.data || []);

        // Când se încarcă tab-ul de absențe, facem un request separat pentru detalii
        if (activeTab === "absences") {
          await fetchDetailedAbsences();
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch academic data:", err);
        setError("Failed to load academic data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, activeTab]);

  // Funcție separată pentru a încărca absențele detaliate
  const fetchDetailedAbsences = async () => {
    try {
      // Aici folosim noul endpoint care returnează lista detaliată
      const detailedAbsencesResponse = await axios.get('/parents/me/child/detailed-absences');
      setAbsences(detailedAbsencesResponse.data || []);
      console.log("Absențe detaliate încărcate:", detailedAbsencesResponse.data);
    } catch (error) {
      console.error("Error fetching detailed absences:", error);
      // Inițializăm cu array gol în caz de eroare
      setAbsences([]);
    }
  };

  // Încărcăm absențele detaliate când se schimbă tabul
  useEffect(() => {
    if (activeTab === "absences" && !isLoading) {
      fetchDetailedAbsences();
    }
  }, [activeTab, isLoading]);

  // Calculăm doar absențele nemotivate pentru statistici
  const unjustifiedAbsences = useMemo(() => {
    return Array.isArray(absences) ? absences.filter(absence => !absence.justified) : [];
  }, [absences]);

  // Calculăm absențele motivate separat
  const justifiedAbsences = useMemo(() => {
    return Array.isArray(absences) ? absences.filter(absence => absence.justified) : [];
  }, [absences]);

  // Subiecte cu absențe nemotivate
  const subjectAbsences = useMemo(() => {
    if (!Array.isArray(absences) || absences.length === 0) return [];
    
    // Folosim doar absențele nemotivate pentru statistici pe materii
    const counts = unjustifiedAbsences.reduce((acc, absence) => {
      const subject = absence.teacherWhoMarkedAbsence?.subject || "Unknown Subject";
      if (!acc[subject]) {
        acc[subject] = 0;
      }
      acc[subject] += 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([subject, count]) => ({
      subject,
      count
    }));
  }, [unjustifiedAbsences, absences]);

  // Total pentru absențe nemotivate
  const totalUnjustifiedAbsences = useMemo(() => {
    return unjustifiedAbsences.length;
  }, [unjustifiedAbsences]);

  // Total pentru absențe motivate
  const totalJustifiedAbsences = useMemo(() => {
    return justifiedAbsences.length;
  }, [justifiedAbsences]);

  // Absențe sortate
  const sortedAbsences = useMemo(() => {
    if (!Array.isArray(absences)) return [];
    
    // Filter absences based on selected filter
    let filteredAbsences = [...absences];
    if (filter === "justified") {
      filteredAbsences = absences.filter(absence => absence.justified);
    } else if (filter === "unjustified") {
      filteredAbsences = absences.filter(absence => !absence.justified);
    }
    
    let sortableAbsences = [...filteredAbsences];
    if (sortConfig.key !== null) {
      sortableAbsences.sort((a, b) => {
        // Handle nested properties for sorting
        if (sortConfig.key === 'subject') {
          // Pentru sortarea după subject, folosim teacherWhoMarkedAbsence.subject
          const aValue = a.teacherWhoMarkedAbsence?.subject || "";
          const bValue = b.teacherWhoMarkedAbsence?.subject || "";
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else if (sortConfig.key === 'date') {
          // Pentru sortarea după dată
          const aDate = a.sessionDate ? new Date(a.sessionDate) : new Date(0);
          const bDate = b.sessionDate ? new Date(b.sessionDate) : new Date(0);
          
          if (aDate < bDate) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aDate > bDate) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else {
          // Pentru alte sortări, folosim metoda standard
          const aValue = sortConfig.key.includes('.') 
            ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], a)
            : a[sortConfig.key];
          const bValue = sortConfig.key.includes('.')
            ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], b)
            : b[sortConfig.key];
            
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableAbsences;
  }, [absences, sortConfig, filter]);

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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return <FaSort className="ml-2" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-2" /> : <FaSortDown className="ml-2" />;
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
    { icon: FaUtensils, label: "Meal Services", view: "food", path: "/cafeteria" },
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

  // Conținutul tab-ului de Absențe
  const renderAbsencesContent = () => {
    // Verifică dacă avem absențe încărcate
    if (!Array.isArray(absences) || absences.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <FaCalendarTimes className="text-5xl mb-4 text-primary opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Detailed Absence Data</h3>
          <p className="text-dark2 text-center max-w-md">
            No absences have been recorded yet or the detailed absence data is not available.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Main Stats - Modified to show both justified and unjustified */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-6">
            <FaCalendarTimes className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">Child's Absences</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Unjustified Absences</p>
              <p className="text-3xl font-bold">{totalUnjustifiedAbsences}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Justified Absences</p>
              <p className="text-3xl font-bold">{totalJustifiedAbsences}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Attendance Status</p>
              <p className="text-3xl font-bold">
                {totalUnjustifiedAbsences <= 5 ? "Excellent" : totalUnjustifiedAbsences <= 15 ? "Good" : "At Risk"}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Absences - Now showing only unjustified absences */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
            <FaBook className="text-primary mr-3" />
            Unjustified Absences by Subject
          </h3>
          {subjectAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-dark2">
              <FaCheckCircle className="text-5xl mb-4 text-green-500" />
              <p className="text-xl">No unjustified absences!</p>
              <p className="text-sm mt-2">Great attendance record!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectAbsences.map((subjectData) => (
                <div key={subjectData.subject} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="overflow-hidden">
                      <p className="font-medium text-dark truncate">{subjectData.subject}</p>
                    </div>
                    <div className="flex items-center">
                      <p className={`text-xl font-bold ${subjectData.count > 5 ? "text-red-600" : "text-yellow-600"}`}>
                        {subjectData.count}
                      </p>
                      <span className="ml-2">{subjectData.count > 5 ? "⚠️" : "⚠️"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Absences Table with Filter */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-dark flex items-center mb-3 md:mb-0">
              <FaCalendarTimes className="text-primary mr-3" />
              Absence History
            </h3>
            
            {/* Filter controls */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200">
              <FaFilter className="text-dark2 mr-2" />
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-primary text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'unjustified' ? 'bg-red-500 text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('unjustified')}
              >
                Unjustified
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'justified' ? 'bg-green-500 text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('justified')}
              >
                Justified
              </button>
            </div>
          </div>
          
          {sortedAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark2">
              <FaCalendarTimes className="text-5xl mb-4 text-primary opacity-50" />
              <p className="text-xl">No {filter !== 'all' ? filter : ''} absences found</p>
              {filter === 'unjustified' && (
                <p className="text-sm mt-2">Great job maintaining perfect attendance!</p>
              )}
            </div>
          ) : (
            <div>
              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-light bg-opacity-50">
                      <th className="p-4 text-left">
                        <button
                          className="flex items-center text-dark2 font-medium hover:text-primary"
                          onClick={() => requestSort('subject')}
                        >
                          <FaBook className="mr-2" />
                          <span>Subject</span>
                          {getSortIcon('subject')}
                        </button>
                      </th>
                      <th className="p-4 text-left">
                        <div className="flex items-center">
                          <FaUserTie className="text-primary mr-2" />
                          <span className="text-dark2 font-medium">Teacher</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <button
                          className="flex items-center justify-center text-dark2 font-medium hover:text-primary mx-auto"
                          onClick={() => requestSort('date')}
                        >
                          <span>Date</span>
                          {getSortIcon('date')}
                        </button>
                      </th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAbsences.map((absence, index) => (
                      <tr 
                        key={absence.id || index} 
                        className={`border-t hover:bg-light transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-light bg-opacity-30" : ""
                        }`}
                      >
                        <td className="p-4 font-medium text-dark">
                          {absence.teacherWhoMarkedAbsence?.subject || "Unknown Subject"}
                        </td>
                        <td className="p-4 text-dark2">
                          {absence.teacherWhoMarkedAbsence?.name || "Unknown Teacher"}
                        </td>
                        <td className="p-4 text-center text-dark2">
                          {absence.sessionDate 
                            ? new Date(absence.sessionDate).toLocaleString("ro-RO", { 
                                year: "numeric", 
                                month: "long", 
                                day: "numeric"
                              }) 
                            : "Unknown Date"}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            absence.justified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {absence.justified ? "Justified" : "Unjustified"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Cards */}
              <div className="md:hidden">
                <div className="flex justify-between mb-3 px-2">
                  <button
                    className="flex items-center text-xs text-dark2 font-medium hover:text-primary"
                    onClick={() => requestSort('subject')}
                  >
                    <span>Sort by Subject</span>
                    {getSortIcon('subject')}
                  </button>
                  <button
                    className="flex items-center text-xs text-dark2 font-medium hover:text-primary"
                    onClick={() => requestSort('date')}
                  >
                    <span>Sort by Date</span>
                    {getSortIcon('date')}
                  </button>
                </div>
                {sortedAbsences.map((absence, index) => (
                  <div
                    key={absence.id || index}
                    className={`mb-3 p-3 rounded-lg border-l-4 ${
                      absence.justified ? "border-green-500" : "border-red-500"
                    } bg-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-dark truncate max-w-[70%]">
                        {absence.teacherWhoMarkedAbsence?.subject || "Unknown Subject"}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          absence.justified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {absence.justified ? "Justified" : "Unjustified"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex items-center text-dark2">
                        <FaUserTie className="mr-2 text-xs" />
                        <span className="truncate">{absence.teacherWhoMarkedAbsence?.name || "Unknown Teacher"}</span>
                      </div>
                      <div className="flex items-center text-dark2">
                        <FaCalendarTimes className="mr-2 text-xs" />
                        <span>
                          {absence.sessionDate 
                            ? new Date(absence.sessionDate).toLocaleString("ro-RO", { 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric"
                              })
                            : "Unknown Date"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Funcția pentru a afișa conținutul bazat pe tab-ul activ
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Hero Header - Rezumat general */}
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
                  <p className="text-3xl font-bold">{absencesTotal}</p>
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
            <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid mt-6">
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
          </>
        );
      case "grades":
        return (
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
        );
      case "absences":
        return renderAbsencesContent();
      default:
        return null;
    }
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
              absences={{ total: absencesTotal }}
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
                absences={{ total: absencesTotal }}
                teachers={teachers}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 print:hidden overflow-x-auto">
          <button
            className={`px-4 py-3 text-center flex-1 md:flex-none font-medium ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark2 hover:text-primary hover:border-b-2 hover:border-primary transition-colors'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine className="inline mr-2" /> Overview
          </button>
          <button
            className={`px-4 py-3 text-center flex-1 md:flex-none font-medium ${
              activeTab === 'grades'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark2 hover:text-primary hover:border-b-2 hover:border-primary transition-colors'
            }`}
            onClick={() => setActiveTab('grades')}
          >
            <FaBook className="inline mr-2" /> Grades
          </button>
          <button
            className={`px-4 py-3 text-center flex-1 md:flex-none font-medium ${
              activeTab === 'absences'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark2 hover:text-primary hover:border-b-2 hover:border-primary transition-colors'
            }`}
            onClick={() => setActiveTab('absences')}
          >
            <FaCalendarTimes className="inline mr-2" /> Absences
          </button>
        </div>

        {/* Report Content - Afișează conținutul în funcție de tab-ul activ */}
        <div className="space-y-6">
          {/* Titlul paginii - vizibil doar la printare */}
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-bold text-center">Academic Performance Report</h1>
            <p className="text-center text-dark2">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Conținutul tab-ului activ */}
          {renderTabContent()}
          
          {/* Teacher Contact - Afișat doar când nu suntem în tab-ul absențe */}
          {activeTab !== "absences" && (
            <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid mt-6">
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
          )}
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