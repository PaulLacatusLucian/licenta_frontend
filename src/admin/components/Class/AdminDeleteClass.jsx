import React, { useState } from "react";
import axios from "../../../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const DeleteClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [message, setMessage] = useState(null);

  const handleDelete = async () => {
    try {
      await axios.delete(`/classes/${id}`);
      setMessage(t('admin.classes.delete.success'));
      setTimeout(() => navigate("/admin/classes"), 1500);
    } catch (err) {
      console.error("Error deleting class:", err);
      setMessage(t('admin.classes.delete.error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-6">{t('admin.classes.delete.title')}</h1>
        <p>{t('admin.classes.delete.confirmMessage')}</p>
        <div className="mt-6 flex justify-between">
          <button 
            onClick={handleDelete} 
            className="bg-red-500 text-white py-2 px-4 rounded"
          >
            {t('admin.classes.delete.confirmButton')}
          </button>
          <button 
            onClick={() => navigate("/admin/classes")} 
            className="bg-gray-300 py-2 px-4 rounded"
          >
            {t('common.cancel')}
          </button>
        </div>
        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteClass;