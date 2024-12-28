import React from 'react';
import { Users, School, BookOpen } from 'lucide-react';
import axios from '../../../axiosConfig';

const CreateClass = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    classTeacherId: "",
    specialization: "",
  });

  const [teachers, setTeachers] = React.useState([]);
  const [message, setMessage] = React.useState(null);

  const specializations = [
    "Matematica-Informatica",
    "Matematica-Informatica-Bilingv",
    "Filologie",
    "Bio-Chimie",
  ];

  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("/teachers");
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setMessage({ type: "error", text: "Nu s-au putut prelua profesorii." });
      }
    };

    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.specialization || !formData.classTeacherId) {
      setMessage({
        type: "error",
        text: "Te rog selectează o specializare și un profesor diriginte!",
      });
      return;
    }

    try {
      const response = await axios.post("/classes", {
        name: formData.name,
        classTeacher: teachers.find((t) => t.id === parseInt(formData.classTeacherId))?.name,
        specialization: formData.specialization,
      });

      setMessage({ type: "success", text: "Clasa a fost creată cu succes!" });
      setFormData({
        name: "",
        classTeacherId: "",
        specialization: "",
      });
    } catch (error) {
      console.error("Error creating class:", error);
      setMessage({
        type: "error",
        text: "Eroare la crearea clasei. Te rog încearcă din nou.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b">
          <h2 className="text-lg font-semibold">Creează o Clasă</h2>
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
              <label className="text-sm font-medium text-gray-900">
                Nume Clasă
              </label>
              <div className="relative">
                <School className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: 10A"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Profesor Diriginte
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  name="classTeacherId"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.classTeacherId}
                  onChange={handleInputChange}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Specializare
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  name="specialization"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selectează o specializare</option>
                  {specializations.map((spec, index) => (
                    <option key={index} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
            >
              <School className="mr-2 h-4 w-4" />
              Creează Clasă
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClass;
