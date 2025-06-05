import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, BookOpen, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const EditTeacher = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    type: "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const subjectsByCategory = {
    [t('admin.teachers.subjects.categories.sciences')]: ["informatica", "matematica", "fizica", "chimie", "biologie"],
    [t('admin.teachers.subjects.categories.humanities')]: ["istorie", "geografie", "romana", "engleza", "germana", "italiana", "latina", "franceza"],
    [t('admin.teachers.subjects.categories.artsAndSports')]: ["educatieFizica", "arteVizuale", "muzica"],
    [t('admin.teachers.subjects.categories.others')]: ["religie", "psihologie", "economie", "filosofie"],
  };

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await axios.get(`/teachers/${id}`);
        setFormData({
          name: response.data.name,
          subject: response.data.subject,
          type: response.data.type || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher:", error);
        setMessage({
          type: "error",
          text: t('admin.teachers.edit.errors.loadingData'),
        });
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id, t]);

  useEffect(() => {
    if (formData.type === "EDUCATOR") {
      axios.get(`/classes?classTeacherId=${id}`).then(res => {
        const assignedClass = res.data?.find(cls => cls.educationLevel === "PRIMARY");
        if (assignedClass) {
          setMessage({
            type: "error",
            text: t('admin.teachers.edit.errors.teacherAssignedToPrimary', { className: assignedClass.name }),
          });
        }
      });
    }
  }, [id, formData.type, t]);

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
      await axios.put(`/teachers/${id}`, formData);
      setMessage({
        type: "success",
        text: t('admin.teachers.edit.successMessage'),
      });
      setTimeout(() => {
        navigate("/admin/teachers");
      }, 1500);
    } catch (error) {
      console.error("Error updating teacher:", error);
      setMessage({
        type: "error",
        text: t('admin.teachers.edit.errors.updateTeacher'),
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
            onClick={() => navigate("/admin/teachers")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToList')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.teachers.edit.title')}</h2>
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
              <label className="text-sm font-medium text-gray-900">{t('admin.teachers.fields.teacherType')}</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                required
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
              >
                <option value="">{t('admin.teachers.placeholders.selectType')}</option>
                <option value="EDUCATOR">{t('admin.teachers.types.educatorLabel')}</option>
                <option value="TEACHER">{t('admin.teachers.types.teacherLabel')}</option>
              </select>
            </div>

            {formData.type !== "EDUCATOR" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">{t('admin.teachers.fields.subjectTaught')}</label>
                <select
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  required={formData.type !== "EDUCATOR"}
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950"
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

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/teachers")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTeacher;