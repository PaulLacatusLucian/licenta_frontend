import React, { useState } from "react";
import axios from "../../../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const DeleteChef = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [message, setMessage] = useState(null);

  const handleDelete = async () => {
    try {
      await axios.delete(`/chefs/${id}`);
      setMessage(t('admin.chefs.delete.successMessage'));
      setTimeout(() => navigate("/admin/chefs"), 1500);
    } catch (err) {
      console.error("Error deleting chef:", err);
      setMessage(t('admin.chefs.delete.errorMessage'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-6">{t('admin.chefs.delete.title')}</h1>
        <p>{t('admin.chefs.delete.confirmMessage')}</p>
        <div className="mt-6 flex justify-between">
          <button onClick={handleDelete} className="bg-red-500 text-white py-2 px-4 rounded">
            {t('admin.chefs.delete.confirmButton')}
          </button>
          <button onClick={() => navigate("/admin/chefs")} className="bg-gray-300 py-2 px-4 rounded">
            {t('common.cancel')}
          </button>
        </div>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteChef;