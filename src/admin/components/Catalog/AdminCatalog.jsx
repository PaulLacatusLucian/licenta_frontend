import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaArrowLeft, FaSearch, 
  FaSortAlphaDown as SortAsc, FaStar, FaExclamationCircle, 
  FaFilePdf, FaPrint as Printer,
  FaInfoCircle as Info, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../axiosConfig';
import { useTranslation } from 'react-i18next';

const AdminCatalog = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { t } = useTranslation();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [catalogEntries, setCatalogEntries] = useState({});

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        const classesResponse = await axios.get(`/classes`);
        const classesData = classesResponse.data;
        setClasses(classesData);
        
        if (classId) {
          setSelectedClass(classId);
        } else if (classesData.length > 0) {
          setSelectedClass(classesData[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError(t('admin.catalog.errors.loadingInitialData'));
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
      
      const classResponse = await axios.get(`/classes/${classId}`);
      setClassData(classResponse.data);
      
      const catalogResponse = await axios.get(`/catalog/class/${classId}`);
      
      const entries = catalogResponse.data;
      
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
          entriesByStudent[entry.student.id].absences.push({
            subject: entry.subject,
            date: entry.date,
            justified: entry.justified === true
          });
        }
      });
      
      setCatalogEntries(entriesByStudent);
      
      const studentsResponse = await axios.get(`/classes/${classId}/students`);
      let studentsData = studentsResponse.data;
      
      studentsData = studentsData.map(student => {
        const studentEntries = entriesByStudent[student.id] || { grades: [], absences: [] };
        
        const grades = studentEntries.grades || [];
        const avgGrade = grades.length > 0 
          ? grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length 
          : null;
        
        const absences = studentEntries.absences || [];
        const justifiedCount = absences.filter(abs => abs.justified === true).length;
        
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
      setError(t('admin.catalog.errors.loadingClassData'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...students];
    
    if (studentSearch) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    
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
    if (!dateString) return t('admin.catalog.notAvailable');
    
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('admin.catalog.invalidDate');
    
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

  const getCurrentSchoolYear = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear - 1}/${currentYear}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="w-full mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-4 md:p-6 pb-4 border-b flex items-center">
          <button 
            onClick={() => navigate("/admin")}
            className="mr-3 text-gray-600 hover:text-gray-900 print:hidden"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('admin.catalog.title')}</h2>
          
          <div className="ml-auto flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrintCatalog}
              className="flex items-center text-gray-700 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            >
              <Printer className="mr-2 h-4 w-4" />
              {t('admin.catalog.printExport')}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 mb-6 border-b print:hidden">
          <label className="block text-gray-700 font-semibold mb-2 flex items-center">
            <FaUser className="mr-2 h-5 w-5 text-gray-900" />
            {t('admin.catalog.selectClass')}
          </label>
          <select
            className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
            value={selectedClass}
            onChange={handleClassChange}
            disabled={isLoading}
          >
            <option value="">{t('admin.catalog.selectClassPlaceholder')}</option>
            {classes.length === 0 ? (
              <option disabled>{t('admin.catalog.noClassesAvailable')}</option>
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
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-md mx-4 mb-6 print:bg-white print:text-gray-900 print:border print:border-gray-300 print:shadow-none">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 print:text-gray-900">
                    {classData?.name || t('admin.catalog.classCatalog')}
                  </h3>
                  <p className="text-gray-200 mb-4 print:text-gray-700">
                    {t('admin.catalog.schoolYear')}: {getCurrentSchoolYear()}
                  </p>
                </div>
              </div>
              
              <div className="print:hidden flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm mt-4">
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-gray-200">{t('admin.catalog.stats.students')}</p>
                  <p className="text-3xl font-bold">{students.length}</p>
                </div>
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-gray-200">{t('admin.catalog.stats.classAverage')}</p>
                  <p className="text-3xl font-bold">
                    {students.length > 0 && students.some(s => s.avgGrade !== null)
                      ? (students.reduce((sum, student) => student.avgGrade ? sum + student.avgGrade : sum, 0) / 
                         students.filter(s => s.avgGrade !== null).length).toFixed(2)
                      : t('admin.catalog.notAvailable')}
                  </p>
                </div>
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-gray-200">{t('admin.catalog.stats.totalGrades')}</p>
                  <p className="text-3xl font-bold">
                    {students.reduce((sum, student) => sum + student.grades.length, 0)}
                  </p>
                </div>
                <div className="text-center px-6 py-2">
                  <p className="text-xs text-gray-200">{t('admin.catalog.stats.totalAbsences')}</p>
                  <p className="text-3xl font-bold">
                    {students.reduce((sum, student) => sum + student.totalAbsences, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden print:block mb-6 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">{t('admin.catalog.print.school')}: {classData?.school || t('admin.catalog.print.schoolName')}</p>
                  <p className="text-sm text-gray-700">{t('admin.catalog.print.class')}: {classData?.name || t('admin.catalog.print.className')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">{t('admin.catalog.print.generated')}: {formatDate(new Date().toISOString())}</p>
                  <p className="text-sm text-gray-700">{t('admin.catalog.schoolYear')}: {getCurrentSchoolYear()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 mx-4 mb-6 flex flex-col md:flex-row justify-between items-center rounded-lg border print:hidden">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 w-full">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder={t('admin.catalog.searchPlaceholder')}
                    className="w-full pl-10 p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSortOrder("name")}
                    className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                      sortOrder === "name" 
                        ? "bg-gray-900 text-white border-gray-900" 
                        : "text-gray-700 hover:bg-gray-100 border-gray-200"
                    }`}
                    disabled={isLoading}
                  >
                    <SortAsc className="w-4 h-4 mr-1" />
                    {t('admin.catalog.sort.name')}
                  </button>
                  
                  <button 
                    onClick={() => setSortOrder("grade")}
                    className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                      sortOrder === "grade" 
                        ? "bg-blue-600 text-white border-blue-600" 
                        : "text-gray-700 hover:bg-gray-100 border-gray-200"
                    }`}
                    disabled={isLoading}
                  >
                    <FaStar className="w-4 h-4 mr-1" />
                    {t('admin.catalog.sort.average')}
                  </button>
                  
                  <button 
                    onClick={() => setSortOrder("absences")}
                    className={`flex items-center px-3 py-1.5 rounded-lg border transition-colors ${
                      sortOrder === "absences" 
                        ? "bg-red-500 text-white border-red-500" 
                        : "text-gray-700 hover:bg-gray-100 border-gray-200"
                    }`}
                    disabled={isLoading}
                  >
                    <FaExclamationCircle className="w-4 h-4 mr-1" />
                    {t('admin.catalog.sort.absences')}
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[300px] mx-4 bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  <p className="text-gray-600 font-medium">{t('admin.catalog.loadingData')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 mx-4 rounded-lg border border-red-200 mb-6">
                <div className="flex items-start">
                  <FaExclamationCircle className="mt-1 mr-3 h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">{t('admin.catalog.errorTitle')}</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm mx-4 p-6 border mb-6 print:shadow-none print:border-none">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center print:mb-4">
                  <FaUser className="mr-3 h-6 w-6 text-gray-800" />
                  {t('admin.catalog.studentSituation')}
                  <span className="ml-3 text-sm font-normal text-gray-500">
                    ({t('admin.catalog.studentCount', { count: filteredStudents.length })})
                  </span>
                </h2>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="mx-auto h-12 w-12 mb-3 text-gray-300" />
                    <p className="font-medium">{t('admin.catalog.noStudentsFound')}</p>
                    {studentSearch && <p className="mt-2">{t('admin.catalog.tryAdjustSearch')}</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 print:bg-gray-100">
                        <tr className="border-b border-gray-200">
                          <th className="p-3 text-left text-gray-700 font-semibold">#</th>
                          <th className="p-3 text-left text-gray-700 font-semibold">{t('admin.catalog.table.studentName')}</th>
                          <th className="p-3 text-center text-gray-700 font-semibold">{t('admin.catalog.table.average')}</th>
                          <th className="p-3 text-center text-gray-700 font-semibold">{t('admin.catalog.table.totalGrades')}</th>
                          <th className="p-3 text-center text-gray-700 font-semibold">{t('admin.catalog.table.absences')}</th>
                          <th className="p-3 text-right text-gray-700 font-semibold print:hidden">{t('admin.catalog.table.details')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student, index) => (
                          <React.Fragment key={student.id}>
                            <tr className={`border-b border-gray-100 hover:bg-gray-50 ${
                              expandedStudent === student.id ? 'bg-gray-50' : ''
                            }`}>
                              <td className="p-3 text-gray-700">{index + 1}</td>
                              <td className="p-3">
                                <div className="font-semibold text-gray-900">{student.name}</div>
                              </td>
                              <td className="p-3 text-center">
                                <div className={`inline-block px-3 py-1 rounded-full font-medium ${
                                  student.avgGrade === null ? 'bg-gray-100 text-gray-500' :
                                  student.avgGrade >= 9 ? 'bg-green-100 text-green-800' :
                                  student.avgGrade >= 7 ? 'bg-blue-100 text-blue-800' :
                                  student.avgGrade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {student.avgGrade === null ? t('admin.catalog.notAvailable') : student.avgGrade}
                                </div>
                              </td>
                              <td className="p-3 text-center font-medium text-gray-700">
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
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'text-gray-700 border-gray-200 hover:border-gray-900'
                                  }`}
                                >
                                  {expandedStudent === student.id ? (
                                    <>
                                      <FaChevronUp className="h-4 w-4 inline mr-1" />
                                      {t('admin.catalog.hide')}
                                    </>
                                  ) : (
                                    <>
                                      <FaChevronDown className="h-4 w-4 inline mr-1" />
                                      {t('admin.catalog.details')}
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>

                            {expandedStudent === student.id && (
                              <tr className="bg-gray-50">
                                <td colSpan="6" className="p-0">
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <h4 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
                                          <FaStar className="text-yellow-500 h-5 w-5 mr-2" />
                                          {t('admin.catalog.grades')}
                                        </h4>
                                        
                                        {student.grades.length === 0 ? (
                                          <p className="text-gray-500 italic">{t('admin.catalog.noGradesRecorded')}</p>
                                        ) : (
                                          <div className="max-h-80 overflow-y-auto">
                                            <table className="w-full">
                                              <thead className="bg-gray-50">
                                                <tr className="border-b border-gray-200">
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">{t('admin.catalog.table.date')}</th>
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">{t('admin.catalog.table.subject')}</th>
                                                  <th className="px-3 py-2 text-right text-gray-500 text-sm font-medium">{t('admin.catalog.table.grade')}</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {student.grades
                                                  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                                                  .map((grade, idx) => (
                                                    <tr key={idx} className="border-b border-gray-100">
                                                      <td className="px-3 py-2 text-sm text-gray-700">
                                                        {formatDate(grade.date)}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-gray-700">
                                                        {getTranslatedSubject(grade.subject) || t('admin.catalog.notAvailable')}
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
                                      
                                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <h4 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
                                          <FaExclamationCircle className="text-red-500 h-5 w-5 mr-2" />
                                          {t('admin.catalog.absences')}
                                        </h4>
                                        
                                        {student.absences.length === 0 ? (
                                          <p className="text-gray-500 italic">{t('admin.catalog.noAbsencesRecorded')}</p>
                                        ) : (
                                          <div className="max-h-80 overflow-y-auto">
                                            <table className="w-full">
                                              <thead className="bg-gray-50">
                                                <tr className="border-b border-gray-200">
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">{t('admin.catalog.table.date')}</th>
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">{t('admin.catalog.table.subject')}</th>
                                                  <th className="px-3 py-2 text-right text-gray-500 text-sm font-medium">{t('admin.catalog.table.status')}</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {student.absences
                                                  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                                                  .map((absence, idx) => (
                                                    <tr key={idx} className="border-b border-gray-100">
                                                      <td className="px-3 py-2 text-sm text-gray-700">
                                                        {formatDate(absence.date)}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-gray-700">
                                                        {getTranslatedSubject(absence.subject) || t('admin.catalog.notAvailable')}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-right">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${
                                                          absence.justified ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                          {absence.justified ? t('admin.absences.list.justified') : t('admin.absences.list.unjustified')}
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

            <div className="hidden print:block space-y-8 px-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('admin.catalog.print.detailedSituation')}</h3>
              
              {filteredStudents.map((student, index) => (
                <div key={student.id} className="page-break-inside-avoid mb-8">
                  <div className="border-b-2 border-gray-300 pb-2 mb-4">
                    <h4 className="text-lg font-bold">{index + 1}. {student.name}</h4>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{t('admin.catalog.table.average')}: {student.avgGrade || t('admin.catalog.notAvailable')}</span>
                      <span>{t('admin.catalog.table.totalAbsences')}: {student.totalAbsences}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-2">{t('admin.catalog.grades')}</h5>
                      {student.grades.length === 0 ? (
                        <p className="text-gray-500 italic">{t('admin.catalog.noGradesRecorded')}</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1 text-left">{t('admin.catalog.table.date')}</th>
                              <th className="py-1 text-left">{t('admin.catalog.table.subject')}</th>
                              <th className="py-1 text-right">{t('admin.catalog.table.grade')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.grades
                              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                              .map((grade, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-1">{formatDate(grade.date)}</td>
                                  <td className="py-1">{getTranslatedSubject(grade.subject) || t('admin.catalog.notAvailable')}</td>
                                  <td className="py-1 text-right font-medium">{grade.value}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2">{t('admin.catalog.absences')}</h5>
                      {student.absences.length === 0 ? (
                        <p className="text-gray-500 italic">{t('admin.catalog.noAbsencesRecorded')}</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1 text-left">{t('admin.catalog.table.date')}</th>
                              <th className="py-1 text-left">{t('admin.catalog.table.subject')}</th>
                              <th className="py-1 text-right">{t('admin.catalog.table.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.absences
                              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                              .map((absence, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-1">{formatDate(absence.date)}</td>
                                  <td className="py-1">{getTranslatedSubject(absence.subject) || t('admin.catalog.notAvailable')}</td>
                                  <td className="py-1 text-right">{absence.justified ? t('admin.absences.list.justified') : t('admin.absences.list.unjustified')}</td>
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

            <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-sm text-gray-500 px-4">
              <div className="flex justify-between">
                <p>{t('admin.catalog.print.generated')}: {new Date().toLocaleDateString()}</p>
                <p>{t('admin.catalog.print.administrator')}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mx-4 my-6">
            <FaUser className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.catalog.selectClassTitle')}</h3>
            <p className="text-gray-500 mb-6">{t('admin.catalog.selectClassMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCatalog;