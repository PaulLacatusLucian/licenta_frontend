import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
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
  FaGlobe
} from "react-icons/fa";
import { useTranslation } from 'react-i18next';

import ParentNavbar from "../ParentNavbar";

// Language Switcher Component
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <FaGlobe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                lang.code === i18n.language ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm text-gray-700">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ParentProfile = () => {
  const { t } = useTranslation();
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

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  // Funktion zur Übersetzung von Spezialisierungen
  const getTranslatedSpecialization = (specialization) => {
    if (specialization && t(`admin.classes.specializations.${specialization}`) !== `admin.classes.specializations.${specialization}`) {
      return t(`admin.classes.specializations.${specialization}`);
    }
    return specialization || '';
  };

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        // Lade alle benötigten Daten parallel
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
        setError(t('parent.profile.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAllData();
  }, [navigate, t]);
  
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
      setError(t('parent.profile.errorUploadingImage'));
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

  // Berechne Leistungstrend
  const calculateTrend = () => {
    if (!grades || grades.length < 2) return "stable";
    
    // Sortiere Noten nach Datum
    const sortedGrades = [...grades].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Vergleiche erste und letzte Note
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
        return <div className="text-green-600">↗ {t('parent.profile.trend.improving')}</div>;
      case "declining":
        return <div className="text-red-600">↘ {t('parent.profile.trend.needsAttention')}</div>;
      default:
        return <div className="text-blue-600">→ {t('parent.profile.trend.stable')}</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">{t('parent.profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="text-xl text-red-500 p-8 bg-light rounded-xl shadow-md border border-gray-200 max-w-lg">
          <h2 className="font-bold text-2xl mb-4">{t('parent.profile.somethingWentWrong')}</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 bg-primary text-dark px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            {t('parent.profile.tryAgain')}
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
                {imagePreview ? (
                  <img
                    src={`http://localhost:8080${imagePreview}`}
                    alt={t('parent.profile.childProfileAlt')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                <FaUserCircle className="text-4xl text-gray-300 bg-gray-100 w-full h-full p-2" />
                )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-300 transform">
                  <div className="text-center">
                    <FaEdit className="text-2xl mb-1 mx-auto" />
                    <span className="text-sm font-medium">{t('parent.profile.change')}</span>
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{parentData?.name || t('parent.profile.parentName')}</h1>
                <p className="text-indigo-100 mb-4">{t('parent.profile.parentOf', { childName: childData?.name || t('parent.profile.studentName') })}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">{t('parent.profile.contactEmail')}</p>
                    <p className="text-lg font-bold">{parentData?.email || "email@example.com"}</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">{t('parent.profile.contactPhone')}</p>
                    <p className="text-lg font-bold">{parentData?.motherPhoneNumber || t('common.notAvailable')}</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">{t('parent.profile.parentId')}</p>
                    <p className="text-lg font-bold">{parentData?.id || t('common.notAvailable')}</p>
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
                { id: "overview", label: t('parent.profile.tabs.overview'), icon: FaUserCircle },
                { id: "child", label: t('parent.profile.tabs.childInfo'), icon: FaChild },
                { id: "communications", label: t('parent.profile.tabs.teacherComm'), icon: FaEnvelope },
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
                  {t('parent.profile.personalInfo.title')}
                </h2>
                <div className="space-y-4">
                  {[
                    { label: t('parent.profile.personalInfo.email'), value: parentData?.email || t('common.notAvailable'), icon: "📧" },
                    { label: t('parent.profile.personalInfo.fatherName'), value: parentData?.fatherName || t('common.notAvailable'), icon: "👨" },
                    { label: t('parent.profile.personalInfo.fatherEmail'), value: parentData?.fatherEmail || t('common.notAvailable'), icon: "📧" },
                    { label: t('parent.profile.personalInfo.fatherPhone'), value: parentData?.fatherPhoneNumber || t('common.notAvailable'), icon: "📱" },
                    { label: t('parent.profile.personalInfo.motherName'), value: parentData?.motherName || t('common.notAvailable'), icon: "👩" },
                    { label: t('parent.profile.personalInfo.motherEmail'), value: parentData?.motherEmail || t('common.notAvailable'), icon: "📧" },
                    { label: t('parent.profile.personalInfo.motherPhone'), value: parentData?.motherPhoneNumber || t('common.notAvailable'), icon: "📱" },
                    { label: t('parent.profile.personalInfo.parentId'), value: parentData?.id || t('common.notAvailable'), icon: "🪪" }
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
                  {t('parent.profile.quickActions.title')}
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={handleViewAcademicReport}
                    className="w-full bg-primary text-dark py-3 px-4 rounded-lg flex items-center justify-between hover:bg-opacity-90 transition-all"
                  >
                    <span className="flex items-center">
                      <FaChartLine className="mr-3" />
                      {t('parent.profile.quickActions.viewAcademicReport')}
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
                    {t('parent.profile.childOverview.title')}
                  </h2>
                  <button 
                    onClick={() => setActiveTab("child")}
                    className="text-primary text-sm font-medium hover:text-secondary flex items-center"
                  >
                    {t('parent.profile.viewDetails')}
                    <FaArrowLeft className="ml-2 transform rotate-180" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary border-4 border-white border-opacity-20">
                      {childData?.profileImage ? (
                        <img
                          src={`http://localhost:8080${childData.profileImage}`}
                          alt={t('parent.profile.childProfileAlt')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                      <FaUserCircle className="text-4xl text-gray-300 bg-gray-100 w-full h-full p-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-2">{childData?.name || t('parent.profile.studentName')}</h3>
                      <p className="text-gray-600 mb-4">
                        {t('parent.profile.childOverview.classInfo', {
                          class: childData?.className || t('common.notAvailable'),
                          specialization: getTranslatedSpecialization(childData?.classSpecialization) || t('common.notAvailable')
                        })}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-light p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">{t('parent.profile.childOverview.classTeacher')}</p>
                          <p className="font-medium">{childData?.classTeacher?.name || t('common.notAvailable')}</p>
                        </div>
                        
                        <div className="bg-light p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">{t('parent.profile.childOverview.totalAbsences')}</p>
                          <p className="font-medium">{totalAbsences || "0"}</p>
                        </div>
                        
                        <div className="bg-light p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-sm mb-1">{t('parent.profile.childOverview.studentId')}</p>
                          <p className="font-medium">{childData?.id || t('common.notAvailable')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Report Preview */}
                <div className="mt-6 bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4 flex items-center">
                    <FaChartLine className="text-primary mr-2" />
                    {t('parent.profile.academicPreview.title')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-primary p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FaChartLine className="text-xl mr-2" />
                        <h4 className="font-semibold">{t('parent.profile.academicPreview.overallGPA')}</h4>
                      </div>
                      <p className="text-3xl font-bold">{calculateGPA(grades)}</p>
                      <p className="text-dark2 text-sm">{t('parent.profile.academicPreview.outOf10')}</p>
                    </div>
                    
                    <div className="bg-primary p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FaCalendarTimes className="text-xl mr-2" />
                        <h4 className="font-semibold">{t('parent.profile.academicPreview.absences')}</h4>
                      </div>
                      <p className="text-3xl font-bold">{totalAbsences}</p>
                      <p className="text-dark2 text-sm">{t('parent.profile.academicPreview.totalThisYear')}</p>
                    </div>
                    
                    <div className="bg-primary p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FaTrophy className="text-xl mr-2" />
                        <h4 className="font-semibold">{t('parent.profile.academicPreview.performanceTrend')}</h4>
                      </div>
                      <div className="text-xl font-bold">
                        {getTrendIcon()}
                      </div>
                      <p className="text-dark2 text-sm">{t('parent.profile.academicPreview.basedOnRecent')}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleViewAcademicReport}
                    className="w-full bg-secondary text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all"
                  >
                    <FaChartLine className="mr-2" />
                    {t('parent.profile.academicPreview.viewFullReport')}
                  </button>
                </div>
              </div>

              {/* Teacher Contacts */}
              <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                  <FaChalkboardTeacher className="text-primary mr-3" />
                  {t('parent.profile.teacherContacts.title')}
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
                          <p className="text-gray-500 text-sm">{getTranslatedSubject(teacher.subject)}</p>
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
                    <p className="text-gray-500">{t('parent.profile.teacherContacts.noTeachers')}</p>
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
              {t('parent.profile.childInfo.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Child Personal Info */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary border-4 border-white border-opacity-20 mr-4">
                     {childData?.profileImage ? (
                      <img
                        src={`http://localhost:8080${childData.profileImage}`}
                        alt={t('parent.profile.childProfileAlt')}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                    <FaUserCircle className="text-4xl text-gray-300 bg-gray-100 w-full h-full p-2" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{childData?.name || t('parent.profile.studentName')}</h3>
                    <p className="text-gray-500">{t('parent.profile.childInfo.studentIdLabel', { id: childData?.id || t('common.notAvailable') })}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: t('parent.profile.childInfo.email'), value: childData?.email || t('common.notAvailable'), icon: <FaEnvelope className="text-primary" /> },
                    { label: t('parent.profile.childInfo.phone'), value: childData?.phoneNumber || t('common.notAvailable'), icon: <FaPhone className="text-primary" /> },
                    { label: t('parent.profile.childInfo.dateOfBirth'), value: childData?.dateOfBirth ? new Date(childData.dateOfBirth).toLocaleDateString() : t('common.notAvailable'), icon: <FaCalendarAlt className="text-primary" /> },
                    { label: t('parent.profile.childInfo.studentId'), value: childData?.id || t('common.notAvailable'), icon: <FaIdCard className="text-primary" /> }
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
                  {t('parent.profile.educationalInfo.title')}
                </h3>
                
                <div className="space-y-4 mb-6">
                  {[
                    { label: t('parent.profile.educationalInfo.class'), value: childData?.className || t('common.notAvailable'), icon: <FaUsers className="text-primary" /> },
                    { label: t('parent.profile.educationalInfo.specialization'), value: getTranslatedSpecialization(childData?.classSpecialization) || t('common.notAvailable'), icon: <FaBookReader className="text-primary" /> },
                    { label: t('parent.profile.educationalInfo.classTeacher'), value: childData?.classTeacher?.name || t('common.notAvailable'), icon: <FaChalkboardTeacher className="text-primary" /> },
                    { label: t('parent.profile.educationalInfo.totalAbsences'), value: totalAbsences || "0", icon: <FaCalendarTimes className="text-primary" /> }
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
                  <h4 className="font-semibold text-dark mb-3">{t('parent.profile.academicSummary.title')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-light p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-sm">{t('parent.profile.academicSummary.overallGPA')}</p>
                      <p className="text-2xl font-bold text-primary">{calculateGPA(grades)}</p>
                    </div>
                    <div className="bg-light p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-sm">{t('parent.profile.academicSummary.performanceTrend')}</p>
                      <div className="text-lg font-medium">{getTrendIcon()}</div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Grades */}
                <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
                  <h4 className="font-semibold text-dark mb-3">{t('parent.profile.recentGrades.title')}</h4>
                  {grades && grades.length > 0 ? (
                    <div className="space-y-2">
                      {grades.slice(0, 3).map((grade, index) => (
                        <div key={index} className="flex justify-between items-center bg-light p-3 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-medium">{getTranslatedSubject(grade.subject)}</p>
                            <p className="text-gray-500 text-sm">
                              {grade.sessionDate ? new Date(grade.sessionDate).toLocaleDateString() : t('common.notAvailable')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full ${getGradeColor(grade.grade)} font-bold`}>
                            {grade.grade}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">{t('parent.profile.recentGrades.noGrades')}</p>
                  )}
                </div>
                
                <button 
                  onClick={handleViewAcademicReport}
                  className="w-full bg-primary text-dark py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
                >
                  <FaChartLine className="mr-2" />
                  {t('parent.profile.viewFullAcademicReport')}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "communications" && (
          <div className="bg-light rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
              <FaEnvelope className="text-primary mr-3" />
              {t('parent.profile.teacherComm.title')}
            </h2>
            
            <div className="space-y-6">
              {/* Teacher List */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-dark mb-4">{t('parent.profile.teacherComm.contactTeachers')}</h3>
                
                {teachers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachers.map((teacher, index) => (
                      <div key={index} className="flex items-center justify-between bg-light p-4 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-medium text-dark">{teacher.name}</h4>
                          <p className="text-gray-500 text-sm">{getTranslatedSubject(teacher.subject)}</p>
                          <p className="text-primary text-sm">{teacher.email}</p>
                        </div>
                        <a 
                          href={`mailto:${teacher.email}`} 
                          className="bg-gradient-to-r from-primary to-secondary text-white p-2 rounded-full hover:opacity-90 transition"
                          title={t('parent.profile.teacherComm.sendEmailTo', { name: teacher.name })}
                        >
                          <FaEnvelope />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 italic">
                    {t('parent.profile.teacherComm.noTeachersAvailable')}
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
      {/* Use the ParentNavbar component */}
      <ParentNavbar 
        activeView={activeView} 
        childName={childData?.name}
        onToggleSidebar={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/parent")}
              className="mr-3 text-primary hover:text-secondary"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-dark">{t('parent.profile.title')}</h2>
          </div>
          <div className="self-end sm:self-auto">
            <LanguageSwitcher />
          </div>
        </header>

        {renderProfileContent()}
      </div>
    </div>
  );
};
  
export default ParentProfile;