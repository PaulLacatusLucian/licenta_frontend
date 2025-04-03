import React, { useEffect, useState } from "react";
import axios from "../../../../axiosConfig";
import { Calendar, Book, Users } from "lucide-react";

const CreateSchedule = ({
  day,
  time,
  selectedClass,
  selectedClassName,
  onClose,
  onScheduleCreated, // Callback for notifying parent component
}) => {
  const [formData, setFormData] = useState({
    classId: selectedClass || "",
    scheduleDay: day || "",
    startTime: time ? time.split(" - ")[0] : "",
    endTime: time ? time.split(" - ")[1] : "",
    teacherId: "",
    subject: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState(null);

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
          text: "Nu s-au putut prelua datele necesare. Verifică conexiunea.",
        });
      }
    };

    fetchTeachers();
  }, []);

  const [educationLevel, setEducationLevel] = useState("");

useEffect(() => {
  const fetchClassDetails = async () => {
    try {
      const response = await axios.get(`/classes/${selectedClass}`);
      setEducationLevel(response.data.educationLevel); 
    } catch (error) {
      console.error("Error fetching class info:", error);
    }
  };

  if (selectedClass) fetchClassDetails();
}, [selectedClass]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "teacherId") {
      const selectedTeacher = teachers.find(
        (teacher) => teacher.id === parseInt(value)
      );
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subject: selectedTeacher ? selectedTeacher.subject : "", // Actualizează materia
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

    if (
      !formData.classId ||
      !formData.scheduleDay ||
      (educationLevel !== "PRIMARY" && !formData.teacherId)
    ) {
          setMessage({
        type: "error",
        text: "Te rog completează toate câmpurile necesare.",
      });
      return;
    }

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
    

    console.log("Sending data:", requestData);

    try {
      const response = await axios.post("/schedules", requestData);
      console.log("Response:", response.data);

      setMessage({ type: "success", text: "Orarul a fost creat cu succes!" });

      if (onScheduleCreated) {
        onScheduleCreated();
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error creating schedule:", error.response?.data || error);
      setMessage({
        type: "error",
        text: "Eroare la crearea orarului. Te rog încearcă din nou.",
      });
    }
  };

  return (

    <div className="relative bg-white rounded-lg shadow-lg p-6">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
      >
        ×
      </button>
      <h2 className="text-lg font-semibold mb-4">Creează Orarul</h2>

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
              <input
                type="text"
                name="classId"
                value={selectedClassName || ""}
                readOnly
                className="w-full pl-9 h-9 rounded-md border bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Ziua</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="scheduleDay"
                value={formData.scheduleDay}
                readOnly
                className="w-full pl-9 h-9 rounded-md border bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Ora de început</label>
            <input
              type="text"
              name="startTime"
              value={formData.startTime}
              readOnly
              className="w-full h-9 rounded-md border bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Ora de sfârșit</label>
            <input
              type="text"
              name="endTime"
              value={formData.endTime}
              readOnly
              className="w-full h-9 rounded-md border bg-gray-50"
            />
          </div>

          {educationLevel === "PRIMARY" ? (
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-900">Materie</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full h-9 rounded-md border"
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
          ) : (
            <>
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

              <div>
                <label className="text-sm font-medium text-gray-900">Materie</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  readOnly
                  className="w-full h-9 rounded-md border bg-gray-100"
                />
              </div>
            </>
          )}

          </div> {/* <- închide gridul cu câmpuri */}

          <button
            type="submit"
            className="w-full h-9 rounded-md bg-green-500 text-white"
          >
            Creează Orar
          </button>
          </form>
            </div>
          );
        };







export default CreateSchedule;
