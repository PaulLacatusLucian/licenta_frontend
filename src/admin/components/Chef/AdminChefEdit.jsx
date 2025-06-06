import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const EditChef = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChefData = async () => {
      try {
        const response = await axios.get(`/chefs/${id}`);
        setFormData({ name: response.data.name });
        setLoading(false);
      } catch (error) {
        setMessage({
          type: "error",
          text: t('admin.chefs.edit.errorLoading')
        });
        setLoading(false);
      }
    };
    fetchChefData();
  }, [id, t]);

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/chefs/${id}`, formData);
      setMessage({ type: "success", text: t('admin.chefs.edit.successMessage') });
      setTimeout(() => navigate("/admin/chefs"), 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: t('admin.chefs.edit.errorUpdating')
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm p-6">
        <button
          onClick={() => navigate("/admin/chefs")}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('common.back')}
        </button>
        <h2 className="text-lg font-semibold mb-4">{t('admin.chefs.edit.title')}</h2>

        {message && (
          <div className={`mb-4 p-3 rounded text-sm ${message.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900">{t('admin.chefs.create.chefName')}</label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="name"
                placeholder={t('admin.chefs.create.namePlaceholder')}
                className="w-full pl-9 h-9 rounded-md border bg-transparent px-3 text-sm shadow-sm focus:ring-2 focus:ring-gray-950"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800"
          >
            {t('admin.chefs.edit.submitButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditChef;