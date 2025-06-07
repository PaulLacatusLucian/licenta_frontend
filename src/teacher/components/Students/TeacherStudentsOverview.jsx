import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSearch, FaSortAmountDown, FaGraduationCap, 
  FaChalkboardTeacher, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import logo from "../../../assets/logo.png";
import Cookies from 'js-cookie';
import TeacherNavbar from '../TeacherNavbar';
import { useTranslation } from 'react-i18next';

const StudentsOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [sortBy, setSortBy] = useState("class");
  const [filterBy, setFilterBy] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("students");

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
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [studentsResponse, teacherResponse] = await Promise.all([
          axios.get('/teachers/me/students'),
          axios.get(`/teachers/me`)
        ]);
        
        setStudents(studentsResponse.data);
        setFilteredStudents(studentsResponse.data);
        setTeacherData(teacherResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(t('teacher.students.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  // Schüler sortieren
  const handleSort = (criteria) => {
    setSortBy(criteria);
    const sorted = [...filteredStudents].sort((a, b) => {
      if (criteria === "class") {
        const aClass = a.className || a.studentClass?.name || "";
        const bClass = b.className || b.studentClass?.name || "";
        return aClass.localeCompare(bClass);
      } else if (criteria === "profile") {
        const aProfile = a.classSpecialization || a.studentClass?.specialization || "";
        const bProfile = b.classSpecialization || b.studentClass?.specialization || "";
        return aProfile.localeCompare(bProfile);
      }
      return 0;
    });
    setFilteredStudents(sorted);
  };

  // Schüler nach Klasse oder Profil filtern
  const handleFilter = (value) => {
    setFilterBy(value);
    if (value) {
      const filtered = students.filter(
        (student) =>
          (student.className || student.studentClass?.name || "").toLowerCase().includes(value.toLowerCase()) ||
          (student.classSpecialization || student.studentClass?.specialization || "").toLowerCase().includes(value.toLowerCase()) ||
          (student.name || "").toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

  // Eindeutige Klassenprofile finden
  const uniqueProfiles = [...new Set(students
    .map(student => student.studentClass?.specialization)
    .filter(profile => profile)
  )];

  // Schüler nach Klasse zählen
  const classCounts = students.reduce((acc, student) => {
    const className = student.studentClass?.name || t('teacher.students.unassigned');
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      <TeacherNavbar 
        teacherData={teacherData}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logo={logo}
      />

      {/* Hauptinhaltsbereich */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate("/teacher")}
            className="mr-3 text-primary hover:text-secondary"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">{t('teacher.students.title')}</h2>
          <div className="flex items-center">
          </div>
        </header>

        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-2xl font-bold mb-2">
            {t('teacher.students.studentManagement')}
          </h3>
          <p className="text-indigo-100 mb-4">{t('teacher.students.subtitle')}</p>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.students.stats.totalStudents')}</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.students.stats.classes')}</p>
              <p className="text-3xl font-bold">{Object.keys(classCounts).length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.students.stats.profiles')}</p>
              <p className="text-3xl font-bold">{uniqueProfiles.length}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('teacher.students.stats.filtered')}</p>
              <p className="text-3xl font-bold">{filteredStudents.length}</p>
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
              <p className="text-dark2 font-medium">{t('teacher.students.loading')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
              <FaGraduationCap className="mr-3 text-secondary" />
              {t('teacher.students.studentsList')}
            </h2>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-dark font-semibold mb-2">{t('teacher.students.filterStudents')}</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-dark2" />
                    <input
                      type="text"
                      placeholder={t('teacher.students.searchPlaceholder')}
                      value={filterBy}
                      onChange={(e) => handleFilter(e.target.value)}
                      className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-light"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  <label className="block text-dark font-semibold mb-2">{t('teacher.students.sortBy')}</label>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSort("class")}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center ${
                        sortBy === "class" ? "bg-secondary text-white" : "bg-primary text-dark"
                      }`}
                    >
                      <FaChalkboardTeacher className="mr-2" />
                      {t('teacher.students.class')}
                    </button>
                    <button 
                      onClick={() => handleSort("profile")}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center ${
                        sortBy === "profile" ? "bg-secondary text-white" : "bg-primary text-dark"
                      }`}
                    >
                      <FaSortAmountDown className="mr-2" />
                      {t('teacher.students.profile')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-primary to-secondary text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold rounded-tl-lg">{t('teacher.students.table.name')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('teacher.students.table.class')}</th>
                    <th className="py-3 px-4 text-left font-semibold rounded-tr-lg">{t('teacher.students.table.profile')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-dark2">
                        {t('teacher.students.noStudentsFound')}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-primary hover:bg-opacity-5 transition">
                        <td className="py-3 px-4 text-dark flex items-center">
                          <FaUserCircle className="mr-2 text-secondary" />
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-dark">
                          {student.className || student.studentClass?.name || t('common.notAvailable')}
                        </td>
                        <td className="py-3 px-4 text-dark">
                          {getTranslatedSpecialization(student.classSpecialization || student.studentClass?.specialization) || t('common.notAvailable')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-sm text-dark2">
              {t('teacher.students.showing', { 
                filtered: filteredStudents.length, 
                total: students.length 
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsOverview;