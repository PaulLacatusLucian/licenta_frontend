import React, { useEffect, useState } from "react";
import axios from "../../../axiosConfig";
import { Clock, Calendar, Book, Users } from "lucide-react";

const CreateSchedule = () => {
  const [formData, setFormData] = useState({
    classId: "",
    scheduleDay: "",
    startTime: "",
    endTime: "",
    teacherId: "",
    subject: "",
  });

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState(null);

  const daysOfWeek = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesResponse = await axios.get("/classes");
        setClasses(classesResponse.data);

        const teachersResponse = await axios.get("/teachers");
        setTeachers(teachersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({
          type: "error",
          text: "Nu s-au putut prelua datele necesare. Verifică conexiunea.",
        });
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "teacherId") {
      // Când se selectează un profesor, setăm automat materia
      const selectedTeacher = teachers.find((teacher) => teacher.id === parseInt(value));
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

    if (!formData.classId || !formData.scheduleDay || !formData.teacherId) {
      setMessage({
        type: "error",
        text: "Te rog completează toate câmpurile necesare.",
      });
      return;
    }

    try {
      await axios.post("/schedules", {
        studentClass: { id: parseInt(formData.classId) },
        scheduleDay: formData.scheduleDay,
        startTime: formData.startTime,
        endTime: formData.endTime,
        teacher: { id: parseInt(formData.teacherId) },
        subjects: [formData.subject],
      });

      setMessage({ type: "success", text: "Orarul a fost creat cu succes!" });
      setFormData({
        classId: "",
        scheduleDay: "",
        startTime: "",
        endTime: "",
        teacherId: "",
        subject: "",
      });
    } catch (error) {
      console.error("Error creating schedule:", error);
      setMessage({
        type: "error",
        text: "Eroare la crearea orarului. Te rog încearcă din nou.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b">
          <h2 className="text-lg font-semibold">Creează Orarul</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900">Clasă</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    className="w-full pl-9 h-9 rounded-md border"
                    required
                  >
                    <option value="">Selectează o clasă</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Ziua</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <select
                    name="scheduleDay"
                    value={formData.scheduleDay}
                    onChange={handleInputChange}
                    className="w-full pl-9 h-9 rounded-md border"
                    required
                  >
                    <option value="">Selectează ziua</option>
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Ora de început</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full pl-9 h-9 rounded-md border"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Ora de sfârșit</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full pl-9 h-9 rounded-md border"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Profesor</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="w-full pl-9 h-9 rounded-md border"
                    required
                  >
                    <option value="">Selectează un profesor</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Materie</label>
                <div className="relative">
                  <Book className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    readOnly
                    className="w-full pl-9 h-9 rounded-md border bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-9 rounded-md bg-green-500 text-white"
            >
              Creează Orar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSchedule;
