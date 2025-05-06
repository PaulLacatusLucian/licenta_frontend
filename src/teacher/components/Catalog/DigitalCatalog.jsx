import React, { useState, useEffect } from 'react';
import { 
  FaUserGraduate, FaHome, FaChartLine, FaClipboardList, FaCalendarAlt, 
  FaVideo, FaBars, FaSignOutAlt, FaArrowLeft, FaSearch, 
  FaSortAlphaDown, FaStar, FaExclamationCircle, FaFilePdf, FaPrint,
  FaArrowRight, FaInfoCircle
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../../axiosConfig';
import Cookies from 'js-cookie';
import logo from "../../../assets/logo.png";

const DigitalCatalog = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [teacherData, setTeacherData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("name"); // Options: "name", "grade", "absences"
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("catalog");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [hasAbsencesEndpoint, setHasAbsencesEndpoint] = useState(true);

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Starting data fetch...");
        
        // Step 1: Fetch teacher data
        console.log("Fetching teacher data...");
        const teacherResponse = await axios.get(`/teachers/me`);
        setTeacherData(teacherResponse.data);
        console.log("Teacher data received:", teacherResponse.data);
        
        // Step 2: Fetch students for this teacher
        console.log("Fetching teacher's students...");
        const studentsResponse = await axios.get(`/teachers/me/students`);
        console.log("Teacher's students:", studentsResponse.data);
        
        if (studentsResponse.data.length === 0) {
          throw new Error("No students found for this teacher");
        }
        
        // Group students by class name instead of class ID
        const studentsByClass = {};
        
        studentsResponse.data.forEach(student => {
          // Extract class name (could be in student.className or student.studentClass.name)
          const className = student.className || 
                         (student.studentClass && student.studentClass.name) || 
                         "Unknown Class";
          
          if (!studentsByClass[className]) {
            studentsByClass[className] = [];
          }
          
          studentsByClass[className].push(student);
        });
        
        console.log("Students grouped by class:", studentsByClass);
        
        // Check if we have any classes
        const classNames = Object.keys(studentsByClass);
        if (classNames.length === 0) {
          throw new Error("No classes found from student data");
        }
        
        // Determine which class to show
        let targetClassName = null;
        
        // If classId is specified, use it as class name
        if (classId && classNames.includes(classId)) {
          targetClassName = classId;
          console.log("Using class from URL parameter:", targetClassName);
        } else {
          // Otherwise use first available class
          targetClassName = classNames[0];
          console.log("Using first available class:", targetClassName);
        }
        
        // Create dummy class data for display
        const dummyClassData = {
          id: 1,
          name: targetClassName,
          // Add any other fields you need
        };
        
        setClassData(dummyClassData);
        console.log("Class data set:", dummyClassData);
        
        // Use students from the selected class
        const classStudents = studentsByClass[targetClassName] || [];
        console.log(`Found ${classStudents.length} students for this class`);
        
        if (classStudents.length === 0) {
          throw new Error("No students found for the selected class");
        }
        
        // For each student, fetch their grades and absences
        console.log("Fetching grades and absences for each student...");
        const studentsWithData = await Promise.all(
          classStudents.map(async (student) => {
            try {
              console.log(`Fetching data for student ${student.id}:`, student.name);
              
              // Try to get grades
              const gradesResponse = await axios.get(`/grades/student/${student.id}`);
              let absences = [];
              let absenceLoadError = false;
              
              // Try to get absences, but handle 403 errors gracefully
              try {
                const absencesResponse = await axios.get(`/absences/student/${student.id}`);
                absences = absencesResponse.data;
              } catch (error) {
                console.log(`Couldn't load absence data for student ${student.id}. This endpoint may not exist.`);
                absenceLoadError = true;
                // Mark that the absences endpoint isn't available
                setHasAbsencesEndpoint(false);
              }
              
              // Calculate average grade
              const grades = gradesResponse.data;
              const avgGrade = grades.length > 0 
                ? grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length 
                : null;
              
              return {
                ...student,
                grades: grades,
                absences: absences,
                absenceLoadError: absenceLoadError,
                avgGrade: avgGrade ? parseFloat(avgGrade.toFixed(2)) : null,
                totalAbsences: absences.length
              };
            } catch (error) {
              console.error(`Error fetching data for student ${student.id}:`, error);
              return {
                ...student,
                grades: [],
                absences: [],
                absenceLoadError: true,
                avgGrade: null,
                totalAbsences: 0,
                error: "Failed to load student details"
              };
            }
          })
        );
        
        setStudents(studentsWithData);
        setFilteredStudents(studentsWithData);
        console.log("Data loading complete:", studentsWithData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, classId]);

  useEffect(() => {
    // Apply filters and sorting whenever these values change
    let result = [...students];
    
    // Apply search filter
    if (studentSearch) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortOrder === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "grade") {
      result.sort((a, b) => {
        if (a.avgGrade === null) return 1;
        if (b.avgGrade === null) return -1;
        return b.avgGrade - a.avgGrade;
      });
    } else if (sortOrder === "absences") {
      result.sort((a, b) => b.totalAbsences - a.totalAbsences);
    }
    
    setFilteredStudents(result);
  }, [students, studentSearch, sortOrder]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    // Check if it's already in the format we want (DD.MM.YYYY)
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const handleExpandStudent = (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
    }
  };

  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };

  const handlePrintCatalog = () => {
    window.print();
  };

  // Match the navItems from TeacherDashboard
  const navItems = [
    { icon: FaHome, label: "Dashboard", view: "home", path: "/teacher" },
    { icon: FaUserGraduate, label: "Students", view: "students", path: "/teacher/students" },
    { icon: FaChartLine, label: "Grades", view: "grades", path: "/teacher/grades" },
    { icon: FaClipboardList, label: "Attendance", view: "attendance", path: "/teacher/attendance" },
    { icon: FaCalendarAlt, label: "Schedule", view: "schedule", path: "/teacher/schedule" },
    { icon: FaVideo, label: "Start Meeting", view: "meetings", path: "/teacher/meetings/new" },
    { icon: FaUserGraduate, label: "Catalog", view: "catalog", path: "/teacher/catalog" }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center relative print:hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>
        <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-white">
          Class Catalog
        </h2>
      </div>

      {/* Sidebar - Matched styling from TeacherDashboard */}
      <div className={`
        fixed md:static w-72 bg-gradient-to-b from-primary to-secondary text-white p-6 shadow-xl flex flex-col
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none transition-transform duration-200 z-30
        h-full md:h-auto print:hidden
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
            <h2 className="text-xl md:text-2xl font-bold text-white">Teacher Portal</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">{teacherData?.subject || 'Teacher'}</p>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6 print:mb-2">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/teacher")}
              className="mr-3 text-primary hover:text-secondary print:hidden"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold text-dark">Class Catalog</h2>
          </div>
          
          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrintCatalog}
              className="flex items-center text-dark hover:text-secondary bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
            <button
              className="flex items-center text-dark hover:text-secondary bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            >
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
          </div>
        </header>

        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6 print:bg-white print:text-dark print:border print:border-gray-300 print:shadow-none">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2 print:text-primary">
                {classData?.name || 'Class Catalog'}
              </h3>
              <p className="text-indigo-100 mb-4 print:text-dark">
                Academic Year: {new Date().getFullYear() - 1}/{new Date().getFullYear()}
              </p>
            </div>
          </div>
          
          <div className="print:hidden flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm mt-4">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Students</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Class Average</p>
              <p className="text-3xl font-bold">
                {students.length > 0 
                  ? (students.reduce((sum, student) => student.avgGrade ? sum + student.avgGrade : sum, 0) / 
                     students.filter(s => s.avgGrade !== null).length).toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">Total Grades</p>
              <p className="text-3xl font-bold">
                {students.reduce((sum, student) => sum + student.grades.length, 0)}
              </p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">Total Absences</p>
              <p className="text-3xl font-bold">
                {hasAbsencesEndpoint ? students.reduce((sum, student) => sum + student.absences.length, 0) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Print Header (Only visible when printing) */}
        <div className="hidden print:block mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-dark">School: {teacherData?.school || 'School Name'}</p>
              <p className="text-sm text-dark">Teacher: {teacherData?.name || 'Teacher Name'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-dark">Generated: {formatDate(new Date().toISOString())}</p>
              <p className="text-sm text-dark">Academic Year: {new Date().getFullYear() - 1}/{new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row justify-between items-center border border-gray-200 print:hidden">
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 w-full">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-dark2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student by name..."
                className="w-full pl-10 p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setSortOrder("name")}
                className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                  sortOrder === "name" 
                    ? "bg-primary text-white border-primary" 
                    : "text-dark hover:bg-gray-100 border-gray-200"
                }`}
              >
                <FaSortAlphaDown className="mr-1" />
                Name
              </button>
              
              <button 
                onClick={() => setSortOrder("grade")}
                className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                  sortOrder === "grade" 
                    ? "bg-secondary text-white border-secondary" 
                    : "text-dark hover:bg-gray-100 border-gray-200"
                }`}
              >
                <FaStar className="mr-1" />
                Grade
              </button>
              
              {hasAbsencesEndpoint && (
                <button 
                  onClick={() => setSortOrder("absences")}
                  className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                    sortOrder === "absences" 
                      ? "bg-red-500 text-white border-red-500" 
                      : "text-dark hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <FaExclamationCircle className="mr-1" />
                  Absences
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px] bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">Loading class data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">
            <div className="flex items-start">
              <FaExclamationCircle className="mt-1 mr-3" />
              <div>
                <h3 className="font-semibold">Error loading class catalog</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6 print:shadow-none print:border-none">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center print:mb-4">
              <FaUserGraduate className="mr-3 text-secondary" />
              Student Records
              <span className="ml-3 text-sm font-normal text-dark2">
                ({filteredStudents.length} students)
              </span>
            </h2>

            {!hasAbsencesEndpoint && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 border border-blue-200">
                <div className="flex items-start">
                  <FaInfoCircle className="mt-1 mr-2" />
                  <p>The absences feature is not currently available. The catalog will display grades information only.</p>
                </div>
              </div>
            )}

            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-dark2">
                <FaInfoCircle className="mx-auto text-4xl mb-3 text-gray-300" />
                <p className="font-medium">No students found matching your criteria</p>
                {studentSearch && <p className="mt-2">Try adjusting your search term</p>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 print:bg-gray-100">
                    <tr className="border-b border-gray-200">
                      <th className="p-3 text-left text-dark font-semibold">#</th>
                      <th className="p-3 text-left text-dark font-semibold">Student Name</th>
                      <th className="p-3 text-center text-dark font-semibold">Average Grade</th>
                      <th className="p-3 text-center text-dark font-semibold">Total Grades</th>
                      {hasAbsencesEndpoint && (
                        <th className="p-3 text-center text-dark font-semibold">Absences</th>
                      )}
                      <th className="p-3 text-right text-dark font-semibold print:hidden">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <React.Fragment key={student.id}>
                        <tr className={`border-b border-gray-100 hover:bg-gray-50 ${
                          expandedStudent === student.id ? 'bg-primary bg-opacity-5' : ''
                        }`}>
                          <td className="p-3 text-dark">{index + 1}</td>
                          <td className="p-3">
                            <div className="font-semibold text-dark">{student.name}</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className={`inline-block px-3 py-1 rounded-full font-medium ${
                              student.avgGrade === null ? 'bg-gray-100 text-dark2' :
                              student.avgGrade >= 9 ? 'bg-green-100 text-green-800' :
                              student.avgGrade >= 7 ? 'bg-blue-100 text-blue-800' :
                              student.avgGrade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.avgGrade === null ? 'N/A' : student.avgGrade}
                            </div>
                          </td>
                          <td className="p-3 text-center font-medium text-dark">
                            {student.grades.length}
                          </td>
                          {hasAbsencesEndpoint && (
                            <td className="p-3 text-center">
                              <div className={`inline-block px-3 py-1 rounded-full font-medium ${
                                student.totalAbsences === 0 ? 'bg-green-100 text-green-800' :
                                student.totalAbsences <= 3 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {student.totalAbsences}
                              </div>
                            </td>
                          )}
                          <td className="p-3 text-right print:hidden">
                            <button
                              onClick={() => handleExpandStudent(student.id)}
                              className={`text-sm px-3 py-1 rounded border transition-colors ${
                                expandedStudent === student.id
                                ? 'bg-primary text-white border-primary'
                                : 'text-primary border-gray-200 hover:border-primary'
                              }`}
                            >
                              {expandedStudent === student.id ? 'Hide Details' : 'Show Details'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded student details */}
                        {expandedStudent === student.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={hasAbsencesEndpoint ? "6" : "5"} className="p-0">
                              <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Grades */}
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold mb-3 flex items-center text-dark">
                                      <FaStar className="text-secondary mr-2" />
                                      Grades
                                    </h4>
                                    
                                    {student.grades.length === 0 ? (
                                      <p className="text-dark2 italic">No grades recorded</p>
                                    ) : (
                                      <div className="max-h-80 overflow-y-auto">
                                        <table className="w-full">
                                          <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                              <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">Date</th>
                                              <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">Subject</th>
                                              <th className="px-3 py-2 text-right text-dark2 text-sm font-medium">Grade</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {student.grades
                                              .sort((a, b) => new Date(b.sessionDate || 0) - new Date(a.sessionDate || 0))
                                              .map((grade, idx) => (
                                                <tr key={idx} className="border-b border-gray-100">
                                                  <td className="px-3 py-2 text-sm text-dark">
                                                    {formatDate(grade.sessionDate)}
                                                  </td>
                                                  <td className="px-3 py-2 text-sm text-dark">
                                                    {grade.subject || "N/A"}
                                                  </td>
                                                  <td className="px-3 py-2 text-sm text-right">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                                                      grade.grade >= 9 ? 'bg-green-100 text-green-800' :
                                                      grade.grade >= 7 ? 'bg-blue-100 text-blue-800' :
                                                      grade.grade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                                      'bg-red-100 text-red-800'
                                                    }`}>
                                                      {grade.grade}
                                                    </span>
                                                  </td>
                                                </tr>
                                              ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Absences */}
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold mb-3 flex items-center text-dark">
                                      <FaExclamationCircle className="text-red-500 mr-2" />
                                      Absences
                                      {student.absenceLoadError && (
                                        <span className="ml-2 text-sm font-normal text-red-500">
                                          (Data unavailable)
                                        </span>
                                      )}
                                    </h4>
                                    
                                    {student.absenceLoadError ? (
                                      <p className="text-dark2 italic">
                                        Absence data couldn't be loaded. The feature may not be available.
                                      </p>
                                    ) : student.absences.length === 0 ? (
                                      <p className="text-dark2 italic">No absences recorded</p>
                                    ) : (
                                      <div className="max-h-80 overflow-y-auto">
                                        <table className="w-full">
                                          <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                              <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">ID</th>
                                              <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {student.absences.map((absence, idx) => (
                                              <tr key={idx} className="border-b border-gray-100">
                                                <td className="px-3 py-2 text-sm text-dark">
                                                  {absence.id || "N/A"}
                                                </td>
                                                <td className="px-3 py-2 text-sm">
                                                  <span className="inline-block px-2 py-0.5 rounded-full text-sm bg-red-100 text-red-800">
                                                    {absence.justified ? "Justified" : "Unjustified"}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Print-specific student details (visible only when printing) */}
        <div className="hidden print:block space-y-8">
          <h3 className="text-xl font-bold text-dark mb-4">Detailed Student Records</h3>
          
          {filteredStudents.map((student, index) => (
            <div key={student.id} className="page-break-inside-avoid mb-8">
              <div className="border-b-2 border-gray-300 pb-2 mb-4">
                <h4 className="text-lg font-bold">{index + 1}. {student.name}</h4>
                <div className="flex justify-between text-sm text-dark2">
                  <span>Average Grade: {student.avgGrade || 'N/A'}</span>
                  {!student.absenceLoadError && (
                    <span>Total Absences: {student.totalAbsences}</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Grades */}
                <div>
                  <h5 className="font-semibold mb-2">Grades</h5>
                  {student.grades.length === 0 ? (
                    <p className="text-dark2 italic">No grades recorded</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="py-1 text-left">Date</th>
                          <th className="py-1 text-left">Subject</th>
                          <th className="py-1 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.grades
                          .sort((a, b) => new Date(b.sessionDate || 0) - new Date(a.sessionDate || 0))
                          .map((grade, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-1">{formatDate(grade.sessionDate)}</td>
                              <td className="py-1">{grade.subject || "N/A"}</td>
                              <td className="py-1 text-right font-medium">{grade.grade}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
                
                {/* Absences */}
                <div>
                  <h5 className="font-semibold mb-2">
                    Absences
                    {student.absenceLoadError && " (Data unavailable)"}
                  </h5>
                  {student.absenceLoadError ? (
                    <p className="text-dark2 italic">
                      Absence data couldn't be loaded. The feature may not be available.
                    </p>
                  ) : student.absences.length === 0 ? (
                    <p className="text-dark2 italic">No absences recorded</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="py-1 text-left">ID</th>
                          <th className="py-1 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.absences.map((absence, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-1">{absence.id || "N/A"}</td>
                            <td className="py-1">{absence.justified ? "Justified" : "Unjustified"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-sm text-dark2">
          <div className="flex justify-between">
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            <p>Teacher: {teacherData?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalCatalog;