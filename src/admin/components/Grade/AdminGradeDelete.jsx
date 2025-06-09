import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeleteGrade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [message, setMessage] = useState(null);
  const [gradeDetails, setGradeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funcție pentru a traduce subiectele
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    // Încercăm să obținem datele notei din state sau facem un request
    if (location.state?.gradeData) {
      setGradeDetails(location.state.gradeData);
      setLoading(false);
    } else {
      fetchGradeDetails();
    }
  }, [id]);

  const fetchGradeDetails = async () => {
    try {
      const response = await axios.get(`/grades/${id}`);
      setGradeDetails(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching grade details:", err);
      setMessage(t('admin.grades.delete.errorFetching'));
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/grades/${id}`);
      setMessage({ type: 'success', text: t('admin.grades.delete.successMessage') });
      setTimeout(() => navigate("/admin/grades"), 1500);
    } catch (err) {
      console.error("Error deleting grade:", err);
      setMessage({ type: 'error', text: t('admin.grades.delete.errorMessage') });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
          <h1 className="text-xl font-bold">{t('admin.grades.delete.title')}</h1>
        </div>
        
        {gradeDetails && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-3">{t('admin.grades.delete.confirmMessage')}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{t('admin.grades.fields.teacher')}:</span>
                <span>{gradeDetails.teacherName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('admin.grades.fields.subject')}:</span>
                <span>{getTranslatedSubject(gradeDetails.subject) || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('admin.grades.fields.grade')}:</span>
                <span className={`inline-flex items-center justify-center w-10 h-6 rounded-full ${
                  gradeDetails.grade >= 9 ? 'bg-green-100 text-green-800' :
                  gradeDetails.grade >= 7 ? 'bg-blue-100 text-blue-800' :
                  gradeDetails.grade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {gradeDetails.grade}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('admin.grades.fields.date')}:</span>
                <span>{formatDate(gradeDetails.sessionDate)}</span>
              </div>
              {gradeDetails.description && (
                <div className="flex justify-between">
                  <span className="font-medium">{t('admin.grades.fields.description')}:</span>
                  <span>{gradeDetails.description}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3">
          <button 
            onClick={handleDelete} 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
            disabled={message?.type === 'success'}
          >
            {t('admin.grades.delete.confirmButton')}
          </button>
          <button 
            onClick={() => navigate("/admin/grades")} 
            className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded text-center text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteGrade;