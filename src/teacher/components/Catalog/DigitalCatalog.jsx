import React, { useState, useEffect } from 'react';
import { 
  FaUserGraduate, FaArrowLeft, FaSearch, 
  FaSortAlphaDown, FaStar, FaExclamationCircle, FaFilePdf, FaPrint,
  FaInfoCircle
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../axiosConfig';
import Cookies from 'js-cookie';
import logo from "../../../assets/logo.png";
import TeacherNavbar from '../TeacherNavbar';
import { useTranslation } from 'react-i18next';

const Catalog = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [teacherData, setTeacherData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("catalog");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [catalogEntries, setCatalogEntries] = useState({});
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        console.log("Starting data fetch...");
        
        // Schritt 1: Lehrerdaten abrufen
        console.log("Fetching teacher data...");
        const teacherResponse = await axios.get(`/teachers/me`);
        setTeacherData(teacherResponse.data);
        console.log("Teacher data received:", teacherResponse.data);
        
        // Schritt 2: Klassen abrufen, die dieser Lehrer unterrichtet
        console.log("Fetching classes...");
        const classesResponse = await axios.get(`/classes`);
        const classesData = classesResponse.data;
        setClasses(classesData);
        console.log("Classes data received:", classesData);
        
        // Ausgewählte Klasse initialisieren
        if (classId) {
          setSelectedClass(classId);
        } else if (classesData.length > 0) {
          setSelectedClass(classesData[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError(t('teacher.catalog.errors.loadingInitialData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, classId, t]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassData(selectedClass);
    }
  }, [selectedClass]);

  const fetchClassData = async (classId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Klassendetails abrufen
      const classResponse = await axios.get(`/classes/${classId}`);
      setClassData(classResponse.data);
      
      // Katalogeinträge für die Klasse abrufen
      const catalogResponse = await axios.get(`/catalog/class/${classId}`);
      
      // Katalogeinträge verarbeiten
      const entries = catalogResponse.data;
      
      // Debugging
      console.log("Raw catalog entries:", entries);
      
      // Einträge nach Schüler gruppieren
      const entriesByStudent = {};
      entries.forEach(entry => {
        if (!entriesByStudent[entry.student.id]) {
          entriesByStudent[entry.student.id] = {
            grades: [],
            absences: []
          };
        }
        
        if (entry.type === 'GRADE') {
          entriesByStudent[entry.student.id].grades.push({
            value: entry.gradeValue,
            subject: entry.subject,
            date: entry.date
          });
        } else if (entry.type === 'ABSENCE') {
          // Konvertierung des justified-Werts zu boolean
          const isJustified = Boolean(entry.justified);
          
          entriesByStudent[entry.student.id].absences.push({
            subject: entry.subject,
            date: entry.date,
            justified: isJustified
          });
        }
      });
      
      // Debugging
      console.log("Processed entries:", entriesByStudent);
      
      setCatalogEntries(entriesByStudent);
      
      // Schüler für die Klasse abrufen
      const studentsResponse = await axios.get(`/classes/${classId}/students`);
      let studentsData = studentsResponse.data;
      
      // Katalogdaten zu jedem Schüler hinzufügen
      studentsData = studentsData.map(student => {
        const studentEntries = entriesByStudent[student.id] || { grades: [], absences: [] };
        
        // Durchschnittsnote berechnen
        const grades = studentEntries.grades || [];
        const avgGrade = grades.length > 0 
          ? grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length 
          : null;
        
        // Debugging
        const absences = studentEntries.absences || [];
        const justifiedCount = absences.filter(abs => abs.justified === true).length;
        console.log(`Student ${student.name}: Total absences: ${absences.length}, Justified: ${justifiedCount}`);
        
        return {
          ...student,
          grades: grades,
          absences: absences,
          avgGrade: avgGrade ? parseFloat(avgGrade.toFixed(2)) : null,
          totalAbsences: absences.length,
          justifiedAbsences: justifiedCount
        };
      });
      
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      
    } catch (error) {
      console.error("Error fetching class data:", error);
      setError(t('teacher.catalog.errors.loadingClassData'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter und Sortierung anwenden
    let result = [...students];
    
    // Suchfilter anwenden
    if (studentSearch) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    
    // Sortierung anwenden
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
    if (!dateString) return t('common.notAvailable');
    
    // Überprüfen, ob es bereits im gewünschten Format ist (DD.MM.YYYY)
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('teacher.catalog.invalidDate');
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setExpandedStudent(null);
  };

  const handleExpandStudent = (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
    }
  };

  const handlePrintCatalog = () => {
    window.print();
  };

  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

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

      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6 print:mb-2">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/teacher")}
              className="mr-3 text-primary hover:text-secondary print:hidden"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold text-dark">{t('teacher.catalog.title')}</h2>
          </div>
          
          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrintCatalog}
              className="flex items-center text-dark hover:text-secondary bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            >
              <FaPrint className="mr-2" />
              {t('teacher.catalog.printSave')}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200 print:hidden">
          <label className="block text-dark font-semibold mb-2 flex items-center">
            <FaUserGraduate className="mr-2 text-primary" />
            {t('teacher.catalog.selectClass')}
          </label>
          <select
            className="w-full p-3 border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-primary bg-light"
            value={selectedClass}
            onChange={handleClassChange}
            disabled={isLoading}
          >
            <option value="">{t('teacher.catalog.selectClassPlaceholder')}</option>
            {classes.length === 0 ? (
              <option disabled>{t('teacher.catalog.noClassesAvailable')}</option>
            ) : (
              classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedClass ? (
          <>
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6 print:bg-white print:text-dark print:border print:border-gray-300 print:shadow-none">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 print:text-primary">
                    {classData?.name || t('teacher.catalog.classCatalog')}
                  </h3>
                  <p className="text-indigo-100 mb-4 print:text-dark">
                    {t('teacher.catalog.academicYear', { 
                      startYear: new Date().getFullYear() - 1, 
                      endYear: new Date().getFullYear() 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="print:hidden flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm mt-4">
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-indigo-100">{t('teacher.catalog.stats.students')}</p>
                  <p className="text-3xl font-bold">{students.length}</p>
                </div>
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-indigo-100">{t('teacher.catalog.stats.classAverage')}</p>
                  <p className="text-3xl font-bold">
                    {students.length > 0 && students.some(s => s.avgGrade !== null)
                      ? (students.reduce((sum, student) => student.avgGrade ? sum + student.avgGrade : sum, 0) / 
                         students.filter(s => s.avgGrade !== null).length).toFixed(2)
                      : t('common.notAvailable')}
                  </p>
                </div>
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-indigo-100">{t('teacher.catalog.stats.totalGrades')}</p>
                  <p className="text-3xl font-bold">
                    {students.reduce((sum, student) => sum + student.grades.length, 0)}
                  </p>
                </div>
                <div className="text-center px-6 py-2">
                  <p className="text-xs text-indigo-100">{t('teacher.catalog.stats.totalAbsences')}</p>
                  <p className="text-3xl font-bold">
                    {students.reduce((sum, student) => sum + student.totalAbsences, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden print:block mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-dark">{t('teacher.catalog.print.school', { school: teacherData?.school || t('teacher.catalog.print.schoolName') })}</p>
                  <p className="text-sm text-dark">{t('teacher.catalog.print.teacher', { teacher: teacherData?.name || t('teacher.catalog.print.teacherName') })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dark">{t('teacher.catalog.print.generated', { date: formatDate(new Date().toISOString()) })}</p>
                  <p className="text-sm text-dark">{t('teacher.catalog.academicYear', { 
                    startYear: new Date().getFullYear() - 1, 
                    endYear: new Date().getFullYear() 
                  })}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row justify-between items-center border border-gray-200 print:hidden">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 w-full">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-dark2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder={t('teacher.catalog.searchPlaceholder')}
                    className="w-full pl-10 p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    <FaSortAlphaDown className="mr-1" />
                    {t('teacher.catalog.sort.name')}
                  </button>
                  
                  <button 
                    onClick={() => setSortOrder("grade")}
                    className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                      sortOrder === "grade" 
                        ? "bg-secondary text-white border-secondary" 
                        : "text-dark hover:bg-gray-100 border-gray-200"
                    }`}
                    disabled={isLoading}
                  >
                    <FaStar className="mr-1" />
                    {t('teacher.catalog.sort.grade')}
                  </button>
                  
                  <button 
                    onClick={() => setSortOrder("absences")}
                    className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                      sortOrder === "absences" 
                        ? "bg-red-500 text-white border-red-500" 
                        : "text-dark hover:bg-gray-100 border-gray-200"
                    }`}
                    disabled={isLoading}
                  >
                    <FaExclamationCircle className="mr-1" />
                    {t('teacher.catalog.sort.absences')}
                  </button>
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
                  <p className="text-dark2 font-medium">{t('teacher.catalog.loadingClassData')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">
                <div className="flex items-start">
                  <FaExclamationCircle className="mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold">{t('teacher.catalog.errorLoadingCatalog')}</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6 print:shadow-none print:border-none">
                <h2 className="text-2xl font-bold text-dark mb-6 flex items-center print:mb-4">
                  <FaUserGraduate className="mr-3 text-secondary" />
                  {t('teacher.catalog.studentRecords')}
                  <span className="ml-3 text-sm font-normal text-dark2">
                    ({t('teacher.catalog.studentsCount', { count: filteredStudents.length })})
                  </span>
                </h2>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-dark2">
                    <FaInfoCircle className="mx-auto text-4xl mb-3 text-gray-300" />
                    <p className="font-medium">{t('teacher.catalog.noStudentsFound')}</p>
                    {studentSearch && <p className="mt-2">{t('teacher.catalog.tryAdjustingSearch')}</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 print:bg-gray-100">
                        <tr className="border-b border-gray-200">
                          <th className="p-3 text-left text-dark font-semibold">#</th>
                          <th className="p-3 text-left text-dark font-semibold">{t('teacher.catalog.table.studentName')}</th>
                          <th className="p-3 text-center text-dark font-semibold">{t('teacher.catalog.table.averageGrade')}</th>
                          <th className="p-3 text-center text-dark font-semibold">{t('teacher.catalog.table.totalGrades')}</th>
                          <th className="p-3 text-center text-dark font-semibold">{t('teacher.catalog.table.absences')}</th>
                          <th className="p-3 text-right text-dark font-semibold print:hidden">{t('teacher.catalog.table.details')}</th>
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
                                  {student.avgGrade === null ? t('common.notAvailable') : student.avgGrade}
                                </div>
                              </td>
                              <td className="p-3 text-center font-medium text-dark">
                                {student.grades.length}
                              </td>
                              <td className="p-3 text-center">
                                <div className={`inline-block px-3 py-1 rounded-full font-medium ${
                                  student.totalAbsences === 0 ? 'bg-green-100 text-green-800' :
                                  student.totalAbsences <= 3 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {student.totalAbsences}
                                </div>
                              </td>
                              <td className="p-3 text-right print:hidden">
                                <button
                                  onClick={() => handleExpandStudent(student.id)}
                                  className={`text-sm px-3 py-1 rounded border transition-colors ${
                                    expandedStudent === student.id
                                    ? 'bg-primary text-white border-primary'
                                    : 'text-primary border-gray-200 hover:border-primary'
                                  }`}
                                >
                                  {expandedStudent === student.id ? t('teacher.catalog.hideDetails') : t('teacher.catalog.showDetails')}
                                </button>
                              </td>
                            </tr>

                            {expandedStudent === student.id && (
                              <tr className="bg-gray-50">
                                <td colSpan="6" className="p-0">
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h4 className="text-lg font-semibold mb-3 flex items-center text-dark">
                                          <FaStar className="text-secondary mr-2" />
                                          {t('teacher.catalog.grades')}
                                        </h4>
                                        
                                        {student.grades.length === 0 ? (
                                          <p className="text-dark2 italic">{t('teacher.catalog.noGradesRecorded')}</p>
                                        ) : (
                                          <div className="max-h-80 overflow-y-auto">
                                            <table className="w-full">
                                              <thead className="bg-gray-50">
                                                <tr className="border-b border-gray-200">
                                                  <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">{t('teacher.catalog.gradeTable.date')}</th>
                                                  <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">{t('teacher.catalog.gradeTable.subject')}</th>
                                                  <th className="px-3 py-2 text-right text-dark2 text-sm font-medium">{t('teacher.catalog.gradeTable.grade')}</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {student.grades
                                                  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                                                  .map((grade, idx) => (
                                                    <tr key={idx} className="border-b border-gray-100">
                                                      <td className="px-3 py-2 text-sm text-dark">
                                                        {formatDate(grade.date)}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-dark">
                                                        {getTranslatedSubject(grade.subject) || t('common.notAvailable')}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-right">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                                                          grade.value >= 9 ? 'bg-green-100 text-green-800' :
                                                          grade.value >= 7 ? 'bg-blue-100 text-blue-800' :
                                                          grade.value >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                                          'bg-red-100 text-red-800'
                                                        }`}>
                                                          {grade.value}
                                                        </span>
                                                      </td>
                                                    </tr>
                                                  ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h4 className="text-lg font-semibold mb-3 flex items-center text-dark">
                                          <FaExclamationCircle className="text-red-500 mr-2" />
                                          {t('teacher.catalog.absences')}
                                        </h4>
                                        
                                        {student.absences.length === 0 ? (
                                          <p className="text-dark2 italic">{t('teacher.catalog.noAbsencesRecorded')}</p>
                                        ) : (
                                          <div className="max-h-80 overflow-y-auto">
                                            <table className="w-full">
                                              <thead className="bg-gray-50">
                                                <tr className="border-b border-gray-200">
                                                  <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">{t('teacher.catalog.absenceTable.date')}</th>
                                                  <th className="px-3 py-2 text-left text-dark2 text-sm font-medium">{t('teacher.catalog.absenceTable.subject')}</th>
                                                  <th className="px-3 py-2 text-right text-dark2 text-sm font-medium">{t('teacher.catalog.absenceTable.status')}</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {student.absences
                                                  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                                                  .map((absence, idx) => (
                                                    <tr key={idx} className="border-b border-gray-100">
                                                      <td className="px-3 py-2 text-sm text-dark">
                                                        {formatDate(absence.date)}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-dark">
                                                        {getTranslatedSubject(absence.subject) || t('common.notAvailable')}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-right">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${
                                                          absence.justified === true ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                          {absence.justified === true ? t('teacher.catalog.justified') : t('teacher.catalog.unjustified')}
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

            <div className="hidden print:block space-y-8">
              <h3 className="text-xl font-bold text-dark mb-4">{t('teacher.catalog.print.detailedRecords')}</h3>
              
              {filteredStudents.map((student, index) => (
                <div key={student.id} className="page-break-inside-avoid mb-8">
                  <div className="border-b-2 border-gray-300 pb-2 mb-4">
                    <h4 className="text-lg font-bold">{index + 1}. {student.name}</h4>
                    <div className="flex justify-between text-sm text-dark2">
                      <span>{t('teacher.catalog.print.averageGrade', { grade: student.avgGrade || t('common.notAvailable') })}</span>
                      <span>{t('teacher.catalog.print.totalAbsences', { count: student.totalAbsences })}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-2">{t('teacher.catalog.grades')}</h5>
                      {student.grades.length === 0 ? (
                        <p className="text-dark2 italic">{t('teacher.catalog.noGradesRecorded')}</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1 text-left">{t('teacher.catalog.gradeTable.date')}</th>
                              <th className="py-1 text-left">{t('teacher.catalog.gradeTable.subject')}</th>
                              <th className="py-1 text-right">{t('teacher.catalog.gradeTable.grade')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.grades
                              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                              .map((grade, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-1">{formatDate(grade.date)}</td>
                                  <td className="py-1">{getTranslatedSubject(grade.subject) || t('common.notAvailable')}</td>
                                  <td className="py-1 text-right font-medium">{grade.value}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2">{t('teacher.catalog.absences')}</h5>
                      {student.absences.length === 0 ? (
                        <p className="text-dark2 italic">{t('teacher.catalog.noAbsencesRecorded')}</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1 text-left">{t('teacher.catalog.absenceTable.date')}</th>
                              <th className="py-1 text-left">{t('teacher.catalog.absenceTable.subject')}</th>
                              <th className="py-1 text-right">{t('teacher.catalog.absenceTable.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.absences
                              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                              .map((absence, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-1">{formatDate(absence.date)}</td>
                                  <td className="py-1">{getTranslatedSubject(absence.subject) || t('common.notAvailable')}</td>
                                  <td className="py-1 text-right">{absence.justified === true ? t('teacher.catalog.justified') : t('teacher.catalog.unjustified')}</td>
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

            <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-sm text-dark2">
              <div className="flex justify-between">
                <p>{t('teacher.catalog.print.generatedOn', { date: new Date().toLocaleDateString() })}</p>
                <p>{t('teacher.catalog.print.teacher', { teacher: teacherData?.name })}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FaUserGraduate className="mx-auto text-6xl text-primary opacity-30 mb-4" />
            <h3 className="text-xl font-bold text-dark mb-2">{t('teacher.catalog.selectClassTitle')}</h3>
            <p className="text-dark2 mb-6">{t('teacher.catalog.selectClassMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;