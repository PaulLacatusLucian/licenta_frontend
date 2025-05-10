import React, { useEffect, useState } from "react";
import axios from "../../../../axiosConfig";
import { Calendar, Book, Users, Clock, X, AlertCircle } from "lucide-react";

const CreateSchedule = ({
  day,
  time,
  selectedClass,
  selectedClassName,
  onClose,
  onScheduleCreated,
  editMode = false,
  scheduleData = null
}) => {
  const initialFormData = editMode && scheduleData ? 
    {
      id: scheduleData.id,
      classId: scheduleData.studentClass?.id || selectedClass,
      scheduleDay: scheduleData.scheduleDay || day,
      startTime: scheduleData.startTime || (time ? time.split(" - ")[0] : ""),
      endTime: scheduleData.endTime || (time ? time.split(" - ")[1] : ""),
      teacherId: scheduleData.teacher?.id || "",
      subject: scheduleData.subjects && scheduleData.subjects.length > 0 ? scheduleData.subjects[0] : "",
    } : 
    {
      classId: selectedClass || "",
      scheduleDay: day || "",
      startTime: time ? time.split(" - ")[0] : "",
      endTime: time ? time.split(" - ")[1] : "",
      teacherId: "",
      subject: "",
    };

  const [formData, setFormData] = useState(initialFormData);
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [educationLevel, setEducationLevel] = useState("");

  const subjectsByCategory = {
    Reale: ["Informatica", "Matematica", "Fizica", "Chimie", "Biologie"],
    Umane: ["Istorie", "Geografie", "Romana", "Engleza", "Germana", "Italiana", "Latina", "Franceza"],
    "Arte și Sport": ["Educatie Fizica", "Arte Vizuale", "Muzica"],
    Altele: ["Religie", "Psihologie", "Economie", "Filosofie"],
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersResponse = await axios.get("/teachers");
        setTeachers(teachersResponse.data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setMessage({
          type: "error",
          text: "Nu s-au putut prelua datele profesorilor. Verifică conexiunea.",
        });
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await axios.get(`/classes/${selectedClass}`);
        setEducationLevel(response.data.educationLevel);
        
        if (response.data.educationLevel === "PRIMARY" && editMode && scheduleData) {
          setFormData(prev => ({
            ...prev,
            subject: scheduleData.subjects && scheduleData.subjects.length > 0 
              ? scheduleData.subjects[0] 
              : prev.subject
          }));
        }
      } catch (error) {
        console.error("Error fetching class info:", error);
      }
    };

    if (selectedClass) fetchClassDetails();
  }, [selectedClass, editMode, scheduleData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "teacherId") {
      const selectedTeacher = teachers.find(
        (teacher) => teacher.id === parseInt(value)
      );
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subject: selectedTeacher ? selectedTeacher.subject : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.classId ||
      !formData.scheduleDay ||
      (educationLevel !== "PRIMARY" && !formData.teacherId) ||
      !formData.subject
    ) {
      setMessage({
        type: "error",
        text: "Te rog completează toate câmpurile necesare.",
      });
      setIsLoading(false);
      return;
    }

    try {
      let response;
      
      const requestData = {
        studentClass: { id: parseInt(formData.classId) },
        scheduleDay: formData.scheduleDay,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjects: [formData.subject],
      };

      if (educationLevel !== "PRIMARY") {
        requestData.teacher = { id: parseInt(formData.teacherId) };
      }
      
      if (editMode && formData.id) {
        requestData.id = formData.id;
        response = await axios.put(`/schedules/${formData.id}`, requestData);
        setMessage({ type: "success", text: "Orarul a fost actualizat cu succes!" });
      } else {
        response = await axios.post("/schedules", requestData);
        setMessage({ type: "success", text: "Orarul a fost creat cu succes!" });
      }

      if (onScheduleCreated) {
        onScheduleCreated();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error saving schedule:", error);
      setMessage({
        type: "error",
        text: editMode 
          ? "Eroare la actualizarea orarului. Te rog încearcă din nou."
          : "Eroare la crearea orarului. Te rog încearcă din nou."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-2xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-gray-700" />
          {editMode ? "Actualizează Orarul" : "Creează Orarul"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-start ${
            message.type === "success"
              ? "bg-gray-50 text-gray-800 border border-gray-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          <AlertCircle className={`h-5 w-5 mr-2 flex-shrink-0 ${message.type === "success" ? "text-gray-500" : "text-red-500"}`} />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clasă</label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="classId"
                value={selectedClassName || ""}
                readOnly
                className="w-full pl-9 h-9 rounded-md border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ziua</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="scheduleDay"
                value={formData.scheduleDay}
                readOnly
                className="w-full pl-9 h-9 rounded-md border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          {/* Time fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ora de început</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                readOnly
                className="w-full pl-9 h-9 rounded-md border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ora de sfârșit</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="endTime"
                value={formData.endTime}
                readOnly
                className="w-full pl-9 h-9 rounded-md border border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          {/* Course fields - Different based on education level */}
          {educationLevel === "PRIMARY" ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Materie</label>
              <div className="relative">
                <Book className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full pl-9 h-9 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  required
                >
                  <option value="">Selectează Materia</option>
                  {Object.entries(subjectsByCategory).map(([category, subjects]) => (
                    <optgroup key={category} label={category}>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="w-full pl-9 h-9 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    required
                  >
                    <option value="">Selectează un profesor</option>
                    {teachers
                      .filter((teacher) => teacher.type !== "EDUCATOR")
                      .map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.subject}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Materie</label>
                <div className="relative">
                  <Book className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    readOnly
                    className="w-full pl-9 h-9 rounded-md border border-gray-300 bg-gray-50 shadow-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-9 rounded-md bg-gray-800 text-white font-medium shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Se procesează...
              </span>
            ) : (
              editMode ? "Actualizează Orar" : "Creează Orar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSchedule;