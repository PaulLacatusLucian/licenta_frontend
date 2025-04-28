import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../assets/logo.png"
import { 
  FaUserCircle, 
  FaChild, 
  FaChalkboardTeacher, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaEdit, 
  FaArrowLeft,
  FaChartLine,
  FaCalendarTimes,
  FaIdCard,
  FaMapMarkerAlt,
  FaSchool,
  FaHistory,
  FaTrophy,
  FaUsers,
  FaBookReader,
  FaExclamationTriangle,
  FaHome,
  FaBars,
  FaUtensils,
  FaSignOutAlt
} from "react-icons/fa";

const ParentProfile = () => {
  const [parentData, setParentData] = useState(null);
  const [childData, setChildData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [totalAbsences, setTotalAbsences] = useState(0);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("profile");
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        // Fetch all required data in parallel
        const [parentResponse, childResponse, teachersResponse, absencesResponse, gradesResponse] = await Promise.all([
          axios.get('/parents/me'),
          axios.get('/parents/me/child'),
          axios.get('/parents/me/child/teachers'),
          axios.get('/parents/child/total-absences'),
          axios.get('/parents/me/child/grades')
        ]);

        setParentData(parentResponse.data);
        setChildData(childResponse.data);
        setTeachers(teachersResponse.data || []);
        setTotalAbsences(absencesResponse.data.total);
        setGrades(gradesResponse.data || []);
        setImagePreview(parentResponse.data?.profileImage);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAllData();
  }, [navigate]);
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setIsLoading(true);
      const response = await axios.post(`/parents/me/profile-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImagePreview(response.data.imageUrl);
      setParentData(prev => ({ ...prev, profileImage: response.data.imageUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAcademicReport = () => {
    navigate("/parent/academic-report");
  };

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
    { icon: FaCalendarAlt, label: "Calendar", view: "calendar", path: null },
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
          <p className="text-dark2 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="text-xl text-red-500 p-8 bg-light rounded-xl shadow-md border border-gray-200 max-w-lg">
          <h2 className="font-bold text-2xl mb-4">Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 bg-primary text-dark px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderProfileContent = () => {
    return (
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-md">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={imagePreview ? `http://localhost:8080${imagePreview}` : "/api/placeholder/160/160"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-300 transform">
                  <div className="text-center">
                    <FaEdit className="text-2xl mb-1 mx-auto" />
                    <span className="text-sm font-medium">Change</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              <div className="text-center md:text-left md:flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{parentData?.name || "Parent Name"}</h1>
                <p className="text-indigo-100 mb-4">Parent of {childData?.name || "Student Name"}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">Contact Email</p>
                    <p className="text-lg font-bold">{parentData?.email || "email@example.com"}</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">Contact Phone</p>
                    <p className="text-lg font-bold">{parentData?.motherPhoneNumber || "N/A"}</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">Parent ID</p>
                    <p className="text-lg font-bold">{parentData?.id || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-light rounded-xl shadow-md border border-gray-200">
          <div className="px-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: FaUserCircle },
                { id: "child", label: "Child Information", icon: FaChild },
                { id: "communications", label: "Teacher Communications", icon: FaEnvelope },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 relative font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-1">
              <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                  <FaUserCircle className="text-primary mr-3" />
                  Personal Information
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Email", value: parentData?.email || "N/A", icon: "📧" },
                    { label: "Father's Name", value: parentData?.fatherName || "N/A", icon: "👨" },
                    { label: "Father's Email", value: parentData?.fatherEmail || "N/A", icon: "📧" },
                    { label: "Father's Phone Number", value: parentData?.phoneNumber || "N/A", icon: "📱" },
                    { label: "Mother's Name", value: parentData?.motherName || "N/A", icon: "👩" },
                    { label: "Mother's Email", value: parentData?.motherEmail || "N/A", icon: "📧" },
                    { label: "Mother's Phone Number", value: parentData?.motherPhoneNumber || "N/A", icon: "📱" },
                    { label: "Parent ID", value: parentData?.id || "N/A", icon: "🪪" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center p-3 bg-white rounded-lg">
                      <div className="flex-shrink-0 text-xl mr-3">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm">{item.label}</p>
                        <p className="text-dark font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-bold text-dark mb-4 flex items-center">
                  <FaChartLine className="text-primary mr-3" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={handleViewAcademicReport}
                    className="w-full bg-primary text-dark py-3 px-4 rounded-lg flex items-center justify-between hover:bg-opacity-90 transition-all"
                  >
                    <span className="flex items-center">
                      <FaChartLine className="mr-3" />
                      View Academic Report
                    </span>
                    <FaArrowLeft className="transform rotate-180" />
                  </button>
                  
                  <button 
                    className="w-full bg-secondary text-white py-3 px-4 rounded-lg flex items-center justify-between hover:bg-opacity-90 transition-all"
                  >
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-3" />
                      Schedule Teacher Meeting
                    </span>
                    <FaArrowLeft className="transform rotate-180" />
                  </button>
                  
                  <button 
                    className="w-full bg-light text-dark py-3 px-4 rounded-lg flex items-center justify-between hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    <span className="flex items-center">
                      <FaEnvelope className="mr-3" />
                      Contact School Administration
                    </span>
                    <FaArrowLeft className="transform rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Child Overview */}
              <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-dark flex items-center">
                    <FaChild className="text-primary mr-3" />
                    Child Overview
                  </h2>
                  <button 
                    onClick={() => setActiveTab("child")}
                    className="text-primary text-sm font-medium hover:text-secondary flex items-center"
                  >
                    View Details
                    <FaArrowLeft className="ml-2 transform rotate-180" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary border-4 border-white border-opacity-20">
                     <img 
                        src={childData?.profileImage ? `http://localhost:8080${childData.profileImage}` : "/api/placeholder/128/128"} 
                        alt="Child" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-2">{childData?.name || "Student Name"}</h3>
                      <p className="text-gray-600 mb-4">Class: {childData?.className || "N/A"} | Specialization: {childData?.classSpecialization || "N/A"}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-light p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">Class Teacher</p>
                          <p className="font-medium">{childData?.classTeacher?.name || "N/A"}</p>
                        </div>
                        
                        <div className="bg-light p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">Total Absences</p>
                          <p className="font-medium">{totalAbsences || "0"}</p>
                        </div>
                        
                        <div className="bg-light p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">Student ID</p>
                          <p className="font-medium">{childData?.id || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Report Preview */}
                <div className="mt-6 bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4 flex items-center">
                    <FaChartLine className="text-primary mr-2" />
                    Academic Performance Preview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      <p className="text-3xl font-bold">{totalAbsences}</p>
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

                  <button 
                    onClick={handleViewAcademicReport}
                    className="w-full bg-secondary text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all"
                  >
                    <FaChartLine className="mr-2" />
                    View Full Academic Report
                  </button>
                </div>
              </div>

              {/* Teacher Contacts */}
              <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                  <FaChalkboardTeacher className="text-primary mr-3" />
                  Teacher Contacts
                </h2>

                {teachers.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {teachers.map((teacher, index) => (
                      <div key={index} className="flex items-center p-4 border rounded-lg bg-white">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-4">
                          <FaChalkboardTeacher className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-dark">{teacher.name}</h3>
                          <p className="text-gray-500 text-sm">{teacher.subject}</p>
                          <p className="text-primary text-sm mt-1">{teacher.email}</p>
                        </div>
                        <button className="ml-2 bg-light hover:bg-gray-200 p-2 rounded-full border border-gray-200">
                          <FaEnvelope className="text-dark2" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                    <FaChalkboardTeacher className="text-gray-400 text-4xl mx-auto mb-3" />
                    <p className="text-gray-500">No teacher information available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "child" && (
          <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
              <FaChild className="text-primary mr-3" />
              Child Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Child Personal Info */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary border-4 border-white border-opacity-20 mr-4">
                   <img 
                      src={childData?.profileImage ? `http://localhost:8080${childData.profileImage}` : "/api/placeholder/128/128"} 
                      alt="Child" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{childData?.name || "Student Name"}</h3>
                    <p className="text-gray-500">Student ID: {childData?.id || "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Email", value: childData?.email || "N/A", icon: <FaEnvelope className="text-primary" /> },
                    { label: "Phone", value: childData?.phoneNumber || "N/A", icon: <FaPhone className="text-primary" /> },
                    { label: "Date of Birth", value: childData?.dateOfBirth ? new Date(childData.dateOfBirth).toLocaleDateString() : "N/A", icon: <FaCalendarAlt className="text-primary" /> },
                    { label: "Student ID", value: childData?.id || "N/A", icon: <FaIdCard className="text-primary" /> }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 mr-4">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">{item.label}</p>
                        <p className="font-medium text-dark">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-dark mb-4 flex items-center">
                  <FaSchool className="text-primary mr-2" />
                  Educational Information
                </h3>
                
                <div className="space-y-4 mb-6">
                  {[
                    { label: "Class", value: childData?.className || "N/A", icon: <FaUsers className="text-primary" /> },
                    { label: "Specialization", value: childData?.classSpecialization || "N/A", icon: <FaBookReader className="text-primary" /> },
                    { label: "Class Teacher", value: childData?.classTeacher?.name || "N/A", icon: <FaChalkboardTeacher className="text-primary" /> },
                    { label: "Total Absences", value: totalAbsences || "0", icon: <FaCalendarTimes className="text-primary" /> }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 mr-4">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">{item.label}</p>
                        <p className="font-medium text-dark">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Academic Performance Summary */}
                <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
                  <h4 className="font-semibold text-dark mb-3">Academic Performance Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-light p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-sm">Overall GPA</p>
                      <p className="text-2xl font-bold text-primary">{calculateGPA(grades)}</p>
                    </div>
                    <div className="bg-light p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-sm">Performance Trend</p>
                      <div className="text-lg font-medium">{getTrendIcon()}</div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Grades */}
                <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
                  <h4 className="font-semibold text-dark mb-3">Recent Grades</h4>
                  {grades && grades.length > 0 ? (
                    <div className="space-y-2">
                      {grades.slice(0, 3).map((grade, index) => (
                        <div key={index} className="flex justify-between items-center bg-light p-3 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-medium">{grade.subject}</p>
                            <p className="text-gray-500 text-sm">
                              {grade.sessionDate ? new Date(grade.sessionDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full ${getGradeColor(grade.grade)} font-bold`}>
                            {grade.grade}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No recent grades available.</p>
                  )}
                </div>
                
                <button 
                  onClick={handleViewAcademicReport}
                  className="w-full bg-primary text-dark py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
                >
                  <FaChartLine className="mr-2" />
                  View Full Academic Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "communications" && (
          <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
              <FaEnvelope className="text-primary mr-3" />
              Teacher Communications
            </h2>
            
            <div className="space-y-6">
              {/* Teacher List */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-dark mb-4">Contact Teachers</h3>
                
                {teachers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachers.map((teacher, index) => (
                      <div key={index} className="flex items-center justify-between bg-light p-4 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-dark">{teacher.name}</h4>
                          <p className="text-gray-500 text-sm">{teacher.subject}</p>
                          <p className="text-primary text-sm">{teacher.email}</p>
                        </div>
                        <a 
                          href={`mailto:${teacher.email}`} 
                          className="bg-gradient-to-r from-primary to-secondary text-white p-2 rounded-full hover:opacity-90 transition"
                          title={`Send email to ${teacher.name}`}
                        >
                          <FaEnvelope />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 italic">
                    No teachers available at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
          Parent Profile
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
            <p className="text-sm text-white text-opacity-80 mt-1">Parent of: {childData?.name || "Loading..."}</p>
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
          <h2 className="text-2xl font-bold text-dark">Parent Profile</h2>
        </header>

        {renderProfileContent()}
      </div>
    </div>
  );
};
  
export default ParentProfile;