import React from "react";
import { useNavigate } from "react-router-dom";
import { User, BookOpen, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const CreateTeacher = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    type: "TEACHER",
  });

  const [message, setMessage] = React.useState(null);

  const subjectsByCategory = {
    [t('admin.teachers.subjects.categories.sciences')]: ["informatica", "matematica", "fizica", "chimie", "biologie"],
    [t('admin.teachers.subjects.categories.humanities')]: ["istorie", "geografie", "romana", "engleza", "germana", "italiana", "latina", "franceza"],
    [t('admin.teachers.subjects.categories.artsAndSports')]: ["educatieFizica", "arteVizuale", "muzica"],
    [t('admin.teachers.subjects.categories.others')]: ["religie", "psihologie", "economie", "filosofie"],
  };

  const handleNameChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: selectedType,
      subject: selectedType === "EDUCATOR" ? "" : prev.subject,
    }));
  };

  const handleSubjectChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      subject: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("/auth/register-teacher", formData);
      setMessage({
        type: "success",
        text: t('admin.teachers.create.successMessage', { 
          username: response.data.username, 
          password: response.data.password 
        }),
      });
  
      setFormData({
        name: "",
        subject: "",
        type: "TEACHER",
      });
    } catch (error) {
      console.error("Error creating teacher:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || t('admin.teachers.create.errors.createTeacher'),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.teachers.create.title')}</h2>
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
              <label className="text-sm font-medium text-gray-900">{t('admin.teachers.fields.teacherName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={t('admin.teachers.placeholders.teacherName')}
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.teachers.fields.teacherEmail')}</label>
              <input
                type="email"
                placeholder={t('admin.teachers.placeholders.teacherEmail')}
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            {formData.type !== "EDUCATOR" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">{t('admin.teachers.fields.subjectTaught')}</label>
                <select
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  required={formData.type !== "EDUCATOR"}
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                >
                  <option value="">{t('admin.teachers.placeholders.selectSubject')}</option>
                  {Object.entries(subjectsByCategory).map(([category, subjects]) => (
                    <optgroup key={category} label={category} className="font-medium">
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {t(`admin.teachers.subjects.list.${subject}`)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">{t('admin.teachers.fields.teacherType')}</label>
              <select
                value={formData.type}
                onChange={handleTypeChange}
                required
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="TEACHER">{t('admin.teachers.types.teacher')}</option>
                <option value="EDUCATOR">{t('admin.teachers.types.educator')}</option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {t('admin.teachers.create.submitButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeacher;