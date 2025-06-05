import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { School, BookOpen, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';

const EditClass = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    classTeacherId: "",
    educationLevel: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const specializations = [
    "matematica-informatica",
    "matematica-informatica-bilingv",
    "filologie",
    "bio-chimie",
  ];

  // Funcție pentru a traduce subiectele profesorilor
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classResponse = await axios.get(`/classes/${id}`);
        setFormData({
          name: classResponse.data.name,
          specialization: classResponse.data.specialization || "",
          classTeacherId: classResponse.data.classTeacher?.id || "",
          educationLevel: classResponse.data.educationLevel || "",
        });

        const teachersResponse = await axios.get("/teachers");
        setTeachers(teachersResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching class data:", error);
        setMessage({
          type: "error",
          text: t('admin.classes.edit.errors.loadingData'),
        });
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id, t]);

  // Funcție pentru a traduce nivelurile de educație (pentru mesaje)
  const getTranslatedEducationLevel = (level) => {
    const levelMap = {
      'PRIMARY': t('admin.classes.levels.primary'),
      'MIDDLE': t('admin.classes.levels.middle'),
      'HIGH': t('admin.classes.levels.high')
    };
    return levelMap[level] || level;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
  
      if (name === "name" || name === "educationLevel") {
        const namePattern = /^(\d{1,2})([A-Z])$/;
        const match = updated.name.match(namePattern);
        const grade = match ? parseInt(match[1]) : null;
        const level = updated.educationLevel;
  
        let valid = false;
        if (match) {
          if (
            (level === "PRIMARY" && grade >= 0 && grade <= 4) ||
            (level === "MIDDLE" && grade >= 5 && grade <= 8) ||
            (level === "HIGH" && grade >= 9 && grade <= 12)
          ) {
            valid = true;
          }
        }
  
        if (!valid && updated.name !== "") {
          setMessage({
            type: "error",
            text: t('admin.classes.edit.errors.invalidClassName'),
          });
        } else {
          setMessage(null);
        }
      }
  
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/classes/${id}`, formData);
      setMessage({
        type: "success",
        text: t('admin.classes.edit.success'),
      });
      setTimeout(() => {
        navigate("/admin/classes");
      }, 1500);
    } catch (error) {
      console.error("Error updating class:", error);
      setMessage({
        type: "error",
        text: t('admin.classes.edit.errors.updateClass'),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-gray-500">{t('admin.classes.edit.loading')}</div>
      </div>
    );
  }
  
  const filteredTeachers = teachers.filter((teacher) => {
    if (formData.educationLevel === "PRIMARY") return teacher.type === "EDUCATOR";
    return teacher.type === "TEACHER";
  });

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin/classes")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToList')}
          </button>
          <h2 className="text-lg font-semibold ml-auto">{t('admin.classes.edit.title')}</h2>
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
              <label className="text-sm font-medium text-gray-900">{t('admin.classes.fields.className')}</label>
              <div className="relative">
                <School className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  placeholder={t('admin.classes.placeholders.className')}
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {formData.educationLevel === "HIGH" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">{t('admin.classes.fields.specialization')}</label>
                <select
                  name="specialization"
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t('admin.classes.placeholders.selectSpecialization')}</option>
                  {specializations.map((spec, index) => (
                    <option key={index} value={spec}>
                      {t(`admin.classes.specializations.${spec}`)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                {formData.educationLevel === "PRIMARY" 
                  ? t('admin.classes.fields.primaryTeacher')
                  : t('admin.classes.fields.classTeacher')}
              </label>
              <select
                name="classTeacherId"
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.classTeacherId}
                onChange={handleInputChange}
                required
              >
                <option value="">
                  {formData.educationLevel === "PRIMARY" 
                    ? t('admin.classes.placeholders.selectPrimaryTeacher')
                    : t('admin.classes.placeholders.selectTeacher')}
                </option>
                {filteredTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {getTranslatedSubject(teacher.subject)} ({teacher.type === "EDUCATOR" ? t('admin.teachers.types.educatorLabel') : t('admin.teachers.types.teacherLabel')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/classes")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={message?.type === "error"}
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

export default EditClass;