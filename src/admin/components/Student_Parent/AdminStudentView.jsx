import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash, Eye, Pencil, ArrowLeft, Menu } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const ViewStudents = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  // Funcție pentru a traduce specializările
  const getTranslatedSpecialization = (specialization) => {
    if (specialization && t(`admin.classes.specializations.${specialization}`) !== `admin.classes.specializations.${specialization}`) {
      return t(`admin.classes.specializations.${specialization}`);
    }
    return specialization || '';
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/students");
        setStudents(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(t('admin.students.list.errorLoading'));
      }
    };

    fetchStudents();
  }, [t]);

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.students.list.confirmDelete'))) {
      try {
        await axios.delete(`/students/${id}`);
        setStudents((prev) => prev.filter((student) => student.id !== id));
        console.log(`Student with ID ${id} was deleted.`);
      } catch (err) {
        console.error("Error deleting student:", err);
        alert(t('admin.students.list.deleteError'));
      }
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.className || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMobileMenu = (studentId) => {
    setShowMobileMenu(showMobileMenu === studentId ? null : studentId);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4">
      <div className="w-full mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-3 sm:p-6 pb-2 sm:pb-4 border-b flex items-center flex-wrap">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2 sm:mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.students.list.title')}</h2>
        </div>

        <div className="p-3 sm:p-6">
          {error && (
            <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm bg-red-50/50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder={t('admin.students.list.searchPlaceholder')}
                className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop-Tabelle - auf kleinen Bildschirmen versteckt */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.students.columns.name')}
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.students.columns.email')}
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.students.columns.class')}
                  </th>
                  <th className="hidden lg:table-cell px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.students.columns.specialization')}
                  </th>
                  <th className="hidden lg:table-cell px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.students.columns.phoneNumber')}
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.students.columns.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.className || "N/A"}
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTranslatedSpecialization(student.classSpecialization) || "N/A"}
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.phoneNumber || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/students/edit/${student.id}`)}
                        className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">{t('common.edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">{t('common.delete')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Kartenansicht - nur auf kleinen Bildschirmen angezeigt */}
          <div className="md:hidden">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg border mb-3 overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <button
                      onClick={() => toggleMobileMenu(student.id)}
                      className="text-gray-500 hover:text-gray-900"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('admin.students.fields.email')}:</span>
                    <span className="text-gray-900">{student.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('admin.students.fields.class')}:</span>
                    <span className="text-gray-900">{student.className || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('admin.students.fields.specialization')}:</span>
                    <span className="text-gray-900">{getTranslatedSpecialization(student.classSpecialization) || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('admin.students.fields.phone')}:</span>
                    <span className="text-gray-900">{student.phoneNumber || "N/A"}</span>
                  </div>
                </div>
                {showMobileMenu === student.id && (
                  <div className="p-3 bg-gray-50 border-t flex justify-end space-x-3">
                    <button
                      onClick={() => navigate(`/admin/students/edit/${student.id}`)}
                      className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="bg-white text-red-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              {searchTerm
                ? t('admin.students.list.noStudentsFound')
                : t('admin.students.list.noStudents')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStudents;