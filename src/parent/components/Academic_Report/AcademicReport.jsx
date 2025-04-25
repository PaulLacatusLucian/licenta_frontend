import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { 
  FaChartLine, 
  FaBook, 
  FaCalendarTimes, 
  FaChalkboardTeacher,
  FaTrophy,
  FaPrint,
  FaFilePdf,
  FaArrowLeft,
  FaHome
} from "react-icons/fa";

const AcademicReportPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [absences, setAbsences] = useState({ total: 0 });
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch student data
        const studentResponse = await axios.get(`/parents/me/child`);
        setStudentData(studentResponse.data);
        
        // Fetch grades data
        const gradesResponse = await axios.get(`/parents/me/child/grades`);
        setGrades(gradesResponse.data || []);
        
        // Fetch absences
        const absencesResponse = await axios.get("/parents/child/total-absences");
        setAbsences(absencesResponse.data || { total: 0 });
        
        // Fetch teachers
        const teachersResponse = await axios.get(`/parents/me/child/teachers`);
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
    if (!gradesList.length) return 0;
    const sum = gradesList.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / gradesList.length).toFixed(2);
  };

  // Calculate performance trend
  const calculateTrend = () => {
    if (grades.length < 2) return "stable";
    
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

  const handlePrintReport = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-dark2 font-medium">Loading academic report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl p-6 bg-white rounded-xl shadow-md">
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
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-primary p-4 shadow-md print:hidden">
        <div className="container mx-auto">
          <div className="flex items-center">
            <img 
              src="/src/assets/logo.png" 
              alt="School Logo" 
              className="h-12 w-12 mr-3"
            />
            <h1 className="text-xl font-bold">School Parent Portal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center print:hidden">
          <button 
            onClick={handleBackToDashboard}
            className="mb-4 md:mb-0 flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex space-x-3">
            <button 
              onClick={handlePrintReport}
              className="flex items-center space-x-2 bg-primary text-dark py-2 px-4 rounded-lg hover:opacity-90"
            >
              <FaPrint />
              <span>Print</span>
            </button>
            <button className="flex items-center space-x-2 bg-secondary text-white py-2 px-4 rounded-lg hover:opacity-90">
              <FaFilePdf />
              <span>Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Page Title - visible in print */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-center">Academic Performance Report</h1>
          <p className="text-center text-dark2">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-dark mb-2">
                  Academic Performance Report
                </h3>
                <p className="text-dark2">
                  Student: {studentData?.name || "N/A"} | Class: {studentData?.className || "N/A"}
                </p>
                <p className="text-dark2">
                  School Year: {new Date().getFullYear()} | Report Date: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaChartLine className="text-xl mr-2" />
                  <h4 className="font-semibold">Overall GPA</h4>
                </div>
                <p className="text-3xl font-bold">{calculateGPA(grades)}</p>
                <p className="text-dark2 text-sm">Out of 10</p>
              </div>
              
              <div className="bg-primary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaCalendarTimes className="text-xl mr-2" />
                  <h4 className="font-semibold">Absences</h4>
                </div>
                <p className="text-3xl font-bold">{absences.total}</p>
                <p className="text-dark2 text-sm">Total absences this year</p>
              </div>
              
              <div className="bg-primary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaTrophy className="text-xl mr-2" />
                  <h4 className="font-semibold">Performance Trend</h4>
                </div>
                <div className="text-xl font-bold">
                  {getTrendIcon()}
                </div>
                <p className="text-dark2 text-sm">Based on recent grades</p>
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-white p-6 rounded-xl shadow-md print:break-inside-avoid">
            <h4 className="text-xl font-semibold text-dark mb-4">
              Subject Performance
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...new Set(grades.map(grade => grade.subject))].map(subject => {
                const subjectGrades = grades.filter(grade => grade.subject === subject);
                const avgGrade = calculateGPA(subjectGrades);
                const teacher = teachers.find(t => t.subject === subject);
                
                return (
                  <div key={subject} className="border rounded-lg p-4">
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
          <div className="bg-white p-6 rounded-xl shadow-md print:break-inside-avoid">
            <h4 className="text-xl font-semibold text-dark mb-4">
              Grade History
            </h4>
            
            {grades.length > 0 ? (
              <div className="overflow-x-auto">
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
          <div className="bg-white p-6 rounded-xl shadow-md print:break-inside-avoid">
            <h4 className="text-xl font-semibold text-dark mb-4">
              Teacher Contact Information
            </h4>
            
            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map((teacher, index) => (
                  <div key={index} className="flex items-center border rounded-lg p-3">
                    <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center mr-4">
                      <FaChalkboardTeacher className="text-xl" />
                    </div>
                    <div>
                      <h5 className="font-semibold">{teacher.name}</h5>
                      <p className="text-dark2">{teacher.subject}</p>
                      <p className="text-secondary">{teacher.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark2 italic">No teacher information available.</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white p-4 mt-8 print:hidden">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} School Management System. All rights reserved.</p>
          <p className="text-sm mt-1">Parent Portal Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default AcademicReportPage;