import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft, FaPencilAlt, FaTrash, FaSearch, FaBars as Menu, FaSync } from 'react-icons/fa';
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { useTranslation } from 'react-i18next';

const ViewGrades = () => {
  const { t } = useTranslation();
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const navigate = useNavigate();

  // Funcție pentru a traduce subiectele
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get("/grades");
      
      const gradesData = response.data;
      
      const processedGrades = gradesData.filter(grade => grade.id);
      
      setGrades(processedGrades);
      
      const uniqueSubjects = [...new Set(processedGrades
        .filter(grade => grade.subject)
        .map(grade => grade.subject))];
      setSubjects(uniqueSubjects.sort());
      
      const uniqueTeachers = [...new Set(processedGrades
        .filter(grade => grade.teacherName)
        .map(grade => grade.teacherName))];
      setClasses(uniqueTeachers.sort());
      
      setError(null);
    } catch (err) {
      console.error("Error fetching grades:", err);
      setError(t('admin.grades.list.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);
  
  const filteredGrades = grades.filter(grade =>
    (searchTerm === "" || 
      (grade.description && grade.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (grade.teacherName && grade.teacherName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (subjectFilter === "all" || 
      (grade.subject && grade.subject === subjectFilter)) &&
    (classFilter === "all" || 
      (grade.teacherName && grade.teacherName === classFilter))
  );

  const toggleMobileMenu = (gradeId) => {
    setShowMobileMenu(showMobileMenu === gradeId ? null : gradeId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('admin.grades.list.unknownDate');
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('admin.grades.list.invalidDate');
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const handleDeleteGrade = (gradeId, gradeData) => {
    if (!gradeId) {
      setError("Nu se poate șterge o notă fără ID valid.");
      return;
    }
    
    // Navigăm către pagina de ștergere cu datele notei
    navigate(`/admin/grades/delete/${gradeId}`, {
      state: { gradeData: gradeData }
    });
  };

  const handleRefresh = () => {
    fetchGrades();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4">
      <div className="w-full mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-3 sm:p-6 pb-2 sm:pb-4 border-b flex items-center flex-wrap">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2 sm:mb-0"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold ml-auto mr-2">{t('admin.grades.list.title')}</h2>
          
          <button
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700 transition ml-2"
            title={t('admin.grades.list.refresh')}
          >
            <FaSync className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 sm:p-6">
          {error && (
            <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm bg-red-50/50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder={t('admin.grades.list.searchPlaceholder')}
                className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 sm:w-1/4">
              <select
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">{t('admin.grades.list.allSubjects')}</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>{getTranslatedSubject(subject)}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 sm:w-1/4">
              <select
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">{t('admin.grades.list.allTeachers')}</option>
                {classes.map((teacher, index) => (
                  <option key={index} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.grades.fields.teacher')}
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.grades.fields.subject')}
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.grades.fields.grade')}
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.grades.fields.date')}
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.grades.fields.description')}
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.grades.fields.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGrades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {grade.teacherName || t('admin.grades.list.unknown')}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {getTranslatedSubject(grade.subject) || t('admin.grades.list.notAvailable')}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`inline-flex items-center justify-center w-10 h-6 rounded-full ${
                            grade.grade >= 9 ? 'bg-green-100 text-green-800' :
                            grade.grade >= 7 ? 'bg-blue-100 text-blue-800' :
                            grade.grade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(grade.sessionDate)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {grade.description || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/grades/edit/${grade.id}`, {
                              state: { gradeData: grade }
                            })}
                            className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                          >
                            <FaPencilAlt className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">{t('common.edit')}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(grade.id, grade)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <FaTrash className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">{t('common.delete')}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden">
                {filteredGrades.map((grade) => (
                  <div key={grade.id} className="bg-white rounded-lg border mb-3 overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{grade.teacherName || t('admin.grades.list.unknown')}</h3>
                        <button
                          onClick={() => toggleMobileMenu(grade.id)}
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <Menu className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('admin.grades.fields.subject')}:</span>
                        <span className="text-gray-900">{getTranslatedSubject(grade.subject) || t('admin.grades.list.notAvailable')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('admin.grades.fields.grade')}:</span>
                        <span className={`inline-flex items-center justify-center w-10 h-6 rounded-full ${
                          grade.grade >= 9 ? 'bg-green-100 text-green-800' :
                          grade.grade >= 7 ? 'bg-blue-100 text-blue-800' :
                          grade.grade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.grade}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('admin.grades.fields.date')}:</span>
                        <span className="text-gray-900">{formatDate(grade.sessionDate)}</span>
                      </div>
                      {grade.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('admin.grades.fields.description')}:</span>
                          <span className="text-gray-900">{grade.description}</span>
                        </div>
                      )}
                    </div>
                    
                    {showMobileMenu === grade.id && (
                      <div className="p-3 bg-gray-50 border-t flex justify-end space-x-3">
                        <button
                          onClick={() => navigate(`/admin/grades/edit/${grade.id}`, {
                            state: { gradeData: grade }
                          })}
                          className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                        >
                          <FaPencilAlt className="h-4 w-4 mr-1" />
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(grade.id, grade)}
                          className="bg-white text-red-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                        >
                          <FaTrash className="h-4 w-4 mr-1" />
                          {t('common.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredGrades.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  {searchTerm || subjectFilter !== "all" || classFilter !== "all" 
                    ? t('admin.grades.list.noGradesFound')
                    : t('admin.grades.list.noGrades')}
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {filteredGrades.length > 0 && 
                    t('admin.grades.list.showing', { count: filteredGrades.length, total: grades.length })}
                </div>
                <button
                  onClick={() => navigate("/admin/grades/create")}
                  className="inline-flex items-center bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <FaStar className="mr-2 h-4 w-4" />
                  {t('admin.grades.create.title')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewGrades;