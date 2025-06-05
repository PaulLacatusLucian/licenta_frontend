import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, Mail, Phone, GraduationCap, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    studentClassId: "",
  });

  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funcție pentru a traduce specializările
  const getTranslatedSpecialization = (specialization) => {
    if (specialization && t(`admin.classes.specializations.${specialization}`) !== `admin.classes.specializations.${specialization}`) {
      return t(`admin.classes.specializations.${specialization}`);
    }
    return specialization || '';
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`/students/${id}`);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          studentClassId: response.data.classId || "", 
        });
      } catch (error) {
        console.error("Error fetching student:", error);
        setMessage({
          type: "error",
          text: t('admin.students.edit.errors.loadingData'),
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setMessage({
          type: "error",
          text: t('admin.students.edit.errors.loadingClasses'),
        });
      }
    };

    fetchStudent();
    fetchClasses();
  }, [id, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/students/${id}`, {
        ...formData,
        studentClass: { id: parseInt(formData.studentClassId) },
      });
      setMessage({
        type: "success",
        text: t('admin.students.edit.successMessage'),
      });
      setTimeout(() => {
        navigate("/admin/students");
      }, 1500);
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage({
        type: "error",
        text: t('admin.students.edit.errors.updateStudent'),
      });
    }
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
            onClick={() => navigate("/admin/students")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToList')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.students.edit.title')}</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50/50 text-green-600 border border-green-200"
                  : "bg-red-50/50 text-red-600 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.students.fields.studentName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  placeholder={t('admin.students.placeholders.studentName')}
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.students.fields.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  placeholder={t('admin.students.placeholders.email')}
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.students.fields.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder={t('admin.students.placeholders.phone')}
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.students.fields.class')}</label>
              <select
                name="studentClassId"
                value={formData.studentClassId}
                onChange={handleChange}
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                required
              >
                <option value="">{t('admin.students.placeholders.selectClass')}</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {getTranslatedSpecialization(cls.specialization)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/students")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;