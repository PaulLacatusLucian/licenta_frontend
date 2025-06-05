import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaStar, FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const EditGrade = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  
  const gradeFromList = location.state?.gradeData;

  const [formData, setFormData] = useState({
    grade: "",
    description: ""
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [displayInfo, setDisplayInfo] = useState({
    teacherName: "",
    subject: "",
    sessionDate: ""
  });

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    const fetchGradeData = async () => {
      try {
        setLoading(true);
        
        if (gradeFromList) {
          setDisplayInfo({
            teacherName: gradeFromList.teacherName || t('admin.grades.list.unknown'),
            subject: gradeFromList.subject || t('admin.grades.list.unknown'),
            sessionDate: gradeFromList.sessionDate || ""
          });
          
          setFormData({
            grade: gradeFromList.grade || "",
            description: gradeFromList.description || ""
          });
        } else {
          setMessage({
            type: "warning",
            text: t('admin.grades.edit.errors.loadingData')
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setMessage({
          type: "error",
          text: t('admin.grades.edit.errors.generalError')
        });
        setLoading(false);
      }
    };

    fetchGradeData();
  }, [id, gradeFromList, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.grade) {
      setMessage({
        type: "error",
        text: t('admin.grades.edit.errors.gradeRequired')
      });
      return;
    }

    try {
      await axios.put(`/grades/${id}/simple`, {
        grade: formData.grade,
        description: formData.description || ""
      });
      
      setMessage({
        type: "success",
        text: t('admin.grades.edit.success')
      });
      
      setTimeout(() => {
        navigate("/admin/grades");
      }, 1500);
    } catch (error) {
      console.error("Error updating grade:", error);
      
      let errorMessage = t('admin.grades.edit.errors.updateError');
      if (error.response) {
        errorMessage += ` Server: ${error.response.status}`;
        if (error.response.data) {
          errorMessage += ` - ${error.response.data}`;
        }
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin/grades")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToList')}
          </button>
          <h2 className="text-lg font-semibold ml-auto mr-2">{t('admin.grades.edit.title')}</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50/50 text-green-600 border border-green-200"
                  : message.type === "warning"
                  ? "bg-yellow-50/50 text-yellow-600 border border-yellow-200"
                  : "bg-red-50/50 text-red-600 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(displayInfo.teacherName || displayInfo.subject || displayInfo.sessionDate) && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <FaInfoCircle className="mr-2 h-4 w-4 text-gray-500" />
                  {t('admin.grades.edit.gradeInfo')}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {displayInfo.teacherName && (
                    <div>
                      <span className="text-gray-500">{t('admin.grades.fields.teacher')}:</span>
                      <p className="font-medium">{displayInfo.teacherName}</p>
                    </div>
                  )}
                  
                  {displayInfo.subject && (
                    <div>
                      <span className="text-gray-500">{t('admin.grades.fields.subject')}:</span>
                      <p className="font-medium">{getTranslatedSubject(displayInfo.subject)}</p>
                    </div>
                  )}
                  
                  {displayInfo.sessionDate && (
                    <div>
                      <span className="text-gray-500">{t('admin.grades.fields.date')}:</span>
                      <p className="font-medium">{formatDate(displayInfo.sessionDate)}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 flex items-start">
                  <FaInfoCircle className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                  <span>{t('admin.grades.edit.infoNote')}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.grades.edit.gradeValue')}</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                name="grade"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                required
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
              />
              <div className="grid grid-cols-5 gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`p-1 border rounded-md ${
                      Number(formData.grade) === num 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setFormData({...formData, grade: num})}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.grades.edit.description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                rows="3"
                placeholder={t('admin.grades.edit.descriptionPlaceholder')}
              />
            </div>

            <div className="flex space-x-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/grades")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <FaStar className="mr-2 h-4 w-4" />
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGrade;