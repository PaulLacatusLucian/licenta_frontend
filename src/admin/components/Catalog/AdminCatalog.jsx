import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaArrowLeft, FaSearch, 
  FaSortAlphaDown as SortAsc, FaStar, FaExclamationCircle, 
  FaFilePdf, FaPrint as Printer,
  FaInfoCircle as Info, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../axiosConfig';

const AdminCatalog = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("name"); // Options: "name", "grade", "absences"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [catalogEntries, setCatalogEntries] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Step 1: Fetch classes
        const classesResponse = await axios.get(`/classes`);
        const classesData = classesResponse.data;
        setClasses(classesData);
        
        // Initialize selectedClass
        if (classId) {
          setSelectedClass(classId);
        } else if (classesData.length > 0) {
          setSelectedClass(classesData[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load initial data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, classId]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassData(selectedClass);
    }
  }, [selectedClass]);

  const fetchClassData = async (classId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch class details
      const classResponse = await axios.get(`/classes/${classId}`);
      setClassData(classResponse.data);
      
      // Fetch catalog entries for the class
      const catalogResponse = await axios.get(`/catalog/class/${classId}`);
      
      // Process catalog entries
      const entries = catalogResponse.data;
      
      // Group entries by student
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
      
      // Fetch students for the class
      const studentsResponse = await axios.get(`/classes/${classId}/students`);
      let studentsData = studentsResponse.data;
      
      // Add catalog data to each student
      studentsData = studentsData.map(student => {
        const studentEntries = entriesByStudent[student.id] || { grades: [], absences: [] };
        
        // Calculate average grade
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
      setError("Failed to load class data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Administrare Catalog</h2>
          
          <div className="ml-auto flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrintCatalog}
              className="flex items-center text-gray-700 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print / Export PDF
            </button>
          </div>
        </div>

        {/* Class selector */}
        <div className="bg-white p-4 mb-6 border-b print:hidden">
          <label className="block text-gray-700 font-semibold mb-2 flex items-center">
            <FaUser className="mr-2 h-5 w-5 text-gray-900" />
            Selectează Clasa
          </label>
          <select
            className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
            value={selectedClass}
            onChange={handleClassChange}
            disabled={isLoading}
          >
            <option value="">-- Selectează o clasă --</option>
            {classes.length === 0 ? (
              <option disabled>No classes available</option>
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
                    {classData?.name || 'Catalog Clasă'}
                  </h3>
                  <p className="text-gray-200 mb-4 print:text-gray-700">
                    An Școlar: {new Date().getFullYear() - 1}/{new Date().getFullYear()}
                  </p>
                </div>
              </div>
              
              <div className="print:hidden flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm mt-4">
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-gray-200">Elevi</p>
                  <p className="text-3xl font-bold">{students.length}</p>
                </div>
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-gray-200">Media Clasei</p>
                  <p className="text-3xl font-bold">
                    {students.length > 0 && students.some(s => s.avgGrade !== null)
                      ? (students.reduce((sum, student) => student.avgGrade ? sum + student.avgGrade : sum, 0) / 
                         students.filter(s => s.avgGrade !== null).length).toFixed(2)
                      : "N/A"}
                  </p>
                </div>
                <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
                  <p className="text-xs text-gray-200">Total Note</p>
                  <p className="text-3xl font-bold">
                    {students.reduce((sum, student) => sum + student.grades.length, 0)}
                  </p>
                </div>
                <div className="text-center px-6 py-2">
                  <p className="text-xs text-gray-200">Total Absențe</p>
                  <p className="text-3xl font-bold">
                    {students.reduce((sum, student) => sum + student.totalAbsences, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block mb-6 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">Școala: {classData?.school || 'Nume Școală'}</p>
                  <p className="text-sm text-gray-700">Clasa: {classData?.name || 'Nume Clasă'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Generat: {formatDate(new Date().toISOString())}</p>
                  <p className="text-sm text-gray-700">An Școlar: {new Date().getFullYear() - 1}/{new Date().getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 mx-4 mb-6 flex flex-col md:flex-row justify-between items-center rounded-lg border print:hidden">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 w-full">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Caută elev după nume..."
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
                    Nume
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
                    Medie
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
                    Absențe
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[300px] mx-4 bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  <p className="text-gray-600 font-medium">Se încarcă date catalog...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 mx-4 rounded-lg border border-red-200 mb-6">
                <div className="flex items-start">
                  <FaExclamationCircle className="mt-1 mr-3 h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">Eroare încărcare catalog</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm mx-4 p-6 border mb-6 print:shadow-none print:border-none">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center print:mb-4">
                  <FaUser className="mr-3 h-6 w-6 text-gray-800" />
                  Situație Elevi
                  <span className="ml-3 text-sm font-normal text-gray-500">
                    ({filteredStudents.length} elevi)
                  </span>
                </h2>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="mx-auto h-12 w-12 mb-3 text-gray-300" />
                    <p className="font-medium">Nu s-au găsit elevi care să corespundă criteriilor</p>
                    {studentSearch && <p className="mt-2">Încercați să ajustați termenul de căutare</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 print:bg-gray-100">
                        <tr className="border-b border-gray-200">
                          <th className="p-3 text-left text-gray-700 font-semibold">#</th>
                          <th className="p-3 text-left text-gray-700 font-semibold">Nume Elev</th>
                          <th className="p-3 text-center text-gray-700 font-semibold">Medie Generală</th>
                          <th className="p-3 text-center text-gray-700 font-semibold">Total Note</th>
                          <th className="p-3 text-center text-gray-700 font-semibold">Absențe</th>
                          <th className="p-3 text-right text-gray-700 font-semibold print:hidden">Detalii</th>
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
                                  {student.avgGrade === null ? 'N/A' : student.avgGrade}
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
                                      Ascunde
                                    </>
                                  ) : (
                                    <>
                                      <FaChevronDown className="h-4 w-4 inline mr-1" />
                                      Detalii
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded student details */}
                            {expandedStudent === student.id && (
                              <tr className="bg-gray-50">
                                <td colSpan="6" className="p-0">
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Grades */}
                                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <h4 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
                                          <FaStar className="text-yellow-500 h-5 w-5 mr-2" />
                                          Note
                                        </h4>
                                        
                                        {student.grades.length === 0 ? (
                                          <p className="text-gray-500 italic">Nu sunt note înregistrate</p>
                                        ) : (
                                          <div className="max-h-80 overflow-y-auto">
                                            <table className="w-full">
                                              <thead className="bg-gray-50">
                                                <tr className="border-b border-gray-200">
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">Data</th>
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">Materie</th>
                                                  <th className="px-3 py-2 text-right text-gray-500 text-sm font-medium">Nota</th>
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
                                                        {grade.subject || "N/A"}
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
                                      
                                      {/* Absences */}
                                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <h4 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
                                          <FaExclamationCircle className="text-red-500 h-5 w-5 mr-2" />
                                          Absențe
                                        </h4>
                                        
                                        {student.absences.length === 0 ? (
                                          <p className="text-gray-500 italic">Nu sunt absențe înregistrate</p>
                                        ) : (
                                          <div className="max-h-80 overflow-y-auto">
                                            <table className="w-full">
                                              <thead className="bg-gray-50">
                                                <tr className="border-b border-gray-200">
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">Data</th>
                                                  <th className="px-3 py-2 text-left text-gray-500 text-sm font-medium">Materie</th>
                                                  <th className="px-3 py-2 text-right text-gray-500 text-sm font-medium">Status</th>
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
                                                        {absence.subject || "N/A"}
                                                      </td>
                                                      <td className="px-3 py-2 text-sm text-right">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${
                                                          absence.justified ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                          {absence.justified ? "Motivată" : "Nemotivată"}
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
            <div className="hidden print:block space-y-8 px-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Situație Detaliată Elevi</h3>
              
              {filteredStudents.map((student, index) => (
                <div key={student.id} className="page-break-inside-avoid mb-8">
                  <div className="border-b-2 border-gray-300 pb-2 mb-4">
                    <h4 className="text-lg font-bold">{index + 1}. {student.name}</h4>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Medie Generală: {student.avgGrade || 'N/A'}</span>
                      <span>Total Absențe: {student.totalAbsences}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Grades */}
                    <div>
                      <h5 className="font-semibold mb-2">Note</h5>
                      {student.grades.length === 0 ? (
                        <p className="text-gray-500 italic">Nu sunt note înregistrate</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1 text-left">Data</th>
                              <th className="py-1 text-left">Materie</th>
                              <th className="py-1 text-right">Nota</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.grades
                              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                              .map((grade, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-1">{formatDate(grade.date)}</td>
                                  <td className="py-1">{grade.subject || "N/A"}</td>
                                  <td className="py-1 text-right font-medium">{grade.value}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    
                    {/* Absences */}
                    <div>
                      <h5 className="font-semibold mb-2">Absențe</h5>
                      {student.absences.length === 0 ? (
                        <p className="text-gray-500 italic">Nu sunt absențe înregistrate</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="py-1 text-left">Data</th>
                              <th className="py-1 text-left">Materie</th>
                              <th className="py-1 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.absences
                              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                              .map((absence, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-1">{formatDate(absence.date)}</td>
                                  <td className="py-1">{absence.subject || "N/A"}</td>
                                  <td className="py-1 text-right">{absence.justified ? "Motivată" : "Nemotivată"}</td>
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
            <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-sm text-gray-500 px-4">
              <div className="flex justify-between">
                <p>Generat: {new Date().toLocaleDateString()}</p>
                <p>Administrator Sistem</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mx-4 my-6">
            <FaUser className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Selectează o Clasă</h3>
            <p className="text-gray-500 mb-6">Selectați o clasă din lista de mai sus pentru a vizualiza situația școlară.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCatalog;