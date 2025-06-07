import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const ViewPastStudents = () => {
  const [pastStudents, setPastStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPastStudents = async () => {
      try {
        const response = await axios.get("/api/past-students");
        setPastStudents(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching past students:", err);
        setError(t('admin.pastStudents.errorLoading'));
      }
    };

    fetchPastStudents();
  }, [t]);

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.pastStudents.confirmDelete'))) {
      try {
        await axios.delete(`/api/past-students/${id}`);
        setPastStudents((prev) => prev.filter((student) => student.id !== id));
        console.log(`PastStudent with ID ${id} deleted.`);
      } catch (err) {
        console.error("Error deleting past student:", err);
        alert(t('admin.pastStudents.deleteError'));
      }
    }
  };

  const filteredPastStudents = pastStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.pastStudents.title')}</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50/50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder={t('admin.pastStudents.searchPlaceholder')}
                className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.pastStudents.fields.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.pastStudents.fields.profile')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.pastStudents.fields.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPastStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.profile}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPastStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? t('admin.pastStudents.noStudentsFoundSearch')
                  : t('admin.pastStudents.noStudents')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPastStudents;