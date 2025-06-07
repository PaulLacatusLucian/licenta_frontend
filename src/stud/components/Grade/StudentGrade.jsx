import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { 
  FaBook, 
  FaUserTie, 
  FaGraduationCap, 
  FaSpinner, 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import StudentNavbar from "../StudentNavbar";
import { useTranslation } from 'react-i18next';

const StudentGrades = () => {
  const { t } = useTranslation();
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [activeView, setActiveView] = useState("grades");
  const [studentData, setStudentData] = useState(null);
  
  const navigate = useNavigate();

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Lade Schülerdaten und Noten parallel
        const [studentResponse, gradesResponse] = await Promise.all([
          axios.get('/students/me'),
          axios.get('/grades/me')
        ]);
        
        setStudentData(studentResponse.data);
        setGrades(gradesResponse.data);
        setMessage("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage(t('student.grades.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const sortedGrades = useMemo(() => {
    let sortableGrades = [...grades];
    if (sortConfig.key !== null) {
      sortableGrades.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableGrades;
  }, [grades, sortConfig]);

  const subjectAverages = useMemo(() => {
    const averages = grades.reduce((acc, grade) => {
      const translatedSubject = getTranslatedSubject(grade.subject);
      if (!acc[translatedSubject]) {
        acc[translatedSubject] = { total: 0, count: 0, originalSubject: grade.subject };
      }
      acc[translatedSubject].total += grade.grade;
      acc[translatedSubject].count += 1;
      return acc;
    }, {});

    return Object.entries(averages).map(([subject, data]) => ({
      subject,
      originalSubject: data.originalSubject,
      average: (data.total / data.count).toFixed(2),
      count: data.count
    }));
  }, [grades]);

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

  const calculateGPA = (grades) => {
    if (!grades.length) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  const getGradeColor = (grade) => {
    if (grade >= 9) return "text-green-600";
    if (grade >= 7) return "text-blue-600";
    if (grade >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeEmoji = (grade) => {
    if (grade >= 9) return "🌟";
    if (grade >= 7) return "✨";
    if (grade >= 5) return "📚";
    return "💪";
  };

  const getAcademicStanding = (gpa) => {
    if (gpa >= 7) return t('student.grades.academicStanding.good');
    return t('student.grades.academicStanding.improving');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">{t('student.grades.loading')}</p>
        </div>
      </div>
    );
  }

  const renderGradesContent = () => {
    return (
      <div className="space-y-6">
        {/* Main Stats */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-6">
            <FaGraduationCap className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">{t('student.grades.academicPerformance')}</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('student.grades.stats.totalSubjects')}</p>
              <p className="text-3xl font-bold">{subjectAverages.length}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('student.grades.stats.overallAverage')}</p>
              <p className="text-3xl font-bold">{calculateGPA(grades)}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('student.grades.stats.academicStanding')}</p>
              <p className="text-3xl font-bold">
                {getAcademicStanding(calculateGPA(grades))}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Averages */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
            <FaBook className="text-primary mr-3" />
            {t('student.grades.subjectAverages')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectAverages.map((subjectData) => (
              <div key={subjectData.subject} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="overflow-hidden">
                    <p className="font-medium text-dark truncate">{subjectData.subject}</p>
                    <p className="text-sm text-dark2">{t('student.grades.gradesCount', { count: subjectData.count })}</p>
                  </div>
                  <p className={`text-xl font-bold ${getGradeColor(parseFloat(subjectData.average))}`}>
                    {subjectData.average} {getGradeEmoji(parseFloat(subjectData.average))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
            <FaChartLine className="text-primary mr-3" />
            {t('student.grades.gradeHistory')}
          </h3>
          
          {message ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-4">{message}</div>
          ) : sortedGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark2">
              <FaBook className="text-5xl mb-4 text-primary opacity-50" />
              <p className="text-xl">{t('student.grades.noGradesYet')}</p>
              <p className="text-sm mt-2">{t('student.grades.gradesWillAppear')}</p>
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
                          <span>{t('student.grades.table.subject')}</span>
                          {getSortIcon('subject')}
                        </button>
                      </th>
                      <th className="p-4 text-left">
                        <div className="flex items-center">
                          <FaUserTie className="text-primary mr-2" />
                          <span className="text-dark2 font-medium">{t('student.grades.table.teacher')}</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <button
                          className="flex items-center justify-center text-dark2 font-medium hover:text-primary mx-auto"
                          onClick={() => requestSort('grade')}
                        >
                          <span>{t('student.grades.table.grade')}</span>
                          {getSortIcon('grade')}
                        </button>
                      </th>
                      <th className="p-4 text-center">
                        <button
                          className="flex items-center justify-center text-dark2 font-medium hover:text-primary mx-auto"
                          onClick={() => requestSort('dateReceived')}
                        >
                          <FaCalendarAlt className="mr-2" />
                          <span>{t('student.grades.table.date')}</span>
                          {getSortIcon('dateReceived')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGrades.map((grade, index) => (
                      <tr 
                        key={index} 
                        className={`border-t hover:bg-light transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-light bg-opacity-30" : ""
                        }`}
                      >
                        <td className="p-4 font-medium text-dark">{getTranslatedSubject(grade.subject) || t('common.notAvailable')}</td>
                        <td className="p-4 text-dark2">{grade.teacherName || t('common.notAvailable')}</td>
                        <td className={`p-4 text-center font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade} {getGradeEmoji(grade.grade)}
                        </td>
                        <td className="p-4 text-center text-dark2">
                          {grade.sessionDate 
                            ? new Date(grade.sessionDate).toLocaleString("ro-RO", { 
                                year: "numeric", 
                                month: "long", 
                                day: "numeric", 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              }) 
                            : t('common.notAvailable')}
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
                    <span>{t('student.grades.sortBySubject')}</span>
                    {getSortIcon('subject')}
                  </button>
                  <button
                    className="flex items-center text-xs text-dark2 font-medium hover:text-primary"
                    onClick={() => requestSort('grade')}
                  >
                    <span>{t('student.grades.sortByGrade')}</span>
                    {getSortIcon('grade')}
                  </button>
                </div>
                {sortedGrades.map((grade, index) => (
                  <div
                    key={index}
                    className={`mb-3 p-3 rounded-lg border-l-4 ${
                      getGradeColor(grade.grade).replace('text-', 'border-')
                    } bg-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-dark">{getTranslatedSubject(grade.subject) || t('common.notAvailable')}</div>
                      <div className={`font-bold text-lg ${getGradeColor(grade.grade)}`}>
                        {grade.grade} {getGradeEmoji(grade.grade)}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex items-center text-dark2">
                        <FaUserTie className="mr-2 text-xs" />
                        <span>{grade.teacherName || t('common.notAvailable')}</span>
                      </div>
                      <div className="flex items-center text-dark2">
                        <FaCalendarAlt className="mr-2 text-xs" />
                        <span>
                          {grade.sessionDate 
                            ? new Date(grade.sessionDate).toLocaleString("ro-RO", { 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric", 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })
                            : t('common.notAvailable')}
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      <StudentNavbar activeView={activeView} studentData={studentData} />

      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate("/stud")}
          className="mr-3 text-primary hover:text-secondary"
        >
          <FaArrowLeft className="text-xl" />
        </button>
          <h2 className="text-2xl font-bold text-dark">{t('student.grades.title')}</h2>
          <div className="flex items-center">
            <div className="flex items-center">
            </div>
          </div>
        </header>
        
        {renderGradesContent()}
      </div>
    </div>
  );
};

export default StudentGrades;