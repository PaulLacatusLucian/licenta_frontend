import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const RegisterChef = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "" });
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/users/register-chef", formData);
      setMessage({ type: "success", text: response.data.message });
      setFormData({ name: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || t('admin.chefs.create.errorRegistering')
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm p-6">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('common.back')}
        </button>
        <h2 className="text-lg font-semibold mb-4">{t('admin.chefs.create.title')}</h2>

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
            {t('admin.chefs.create.submitButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterChef;