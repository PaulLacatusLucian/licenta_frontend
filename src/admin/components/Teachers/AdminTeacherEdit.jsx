import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, BookOpen, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";

const EditTeacher = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    type: "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const subjectsByCategory = {
    Reale: ["Informatica", "Matematica", "Fizica", "Chimie", "Biologie"],
    Umane: ["Istorie", "Geografie", "Romana", "Engleza", "Germana", "Italiana", "Latina", "Franceza"],
    "Arte și Sport": ["Educatie Fizica", "Arte Vizuale", "Muzica"],
    Altele: ["Religie", "Psihologie", "Economie", "Filosofie"],
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
          text: "Eroare la încărcarea datelor profesorului. Te rog încearcă din nou.",
        });
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  useEffect(() => {
    if (formData.type === "EDUCATOR") {
      axios.get(`/classes?classTeacherId=${id}`).then(res => {
        const assignedClass = res.data?.find(cls => cls.educationLevel === "PRIMARY");
        if (assignedClass) {
          setMessage({
            type: "error",
            text: `Profesorul este asignat clasei ${assignedClass.name} (clasă primară) și nu poate fi transformat în TEACHER.`,
          });
        }
      });
    }
  }, [id, formData.type]);
  

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
        text: "Profesorul a fost actualizat cu succes!",
      });
      // Optionally navigate back after successful update
      setTimeout(() => {
        navigate("/admin/teachers");
      }, 1500);
    } catch (error) {
      console.error("Error updating teacher:", error);
      setMessage({
        type: "error",
        text: "Eroare la actualizarea profesorului. Te rog încearcă din nou.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-gray-500">Se încarcă...</div>
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
            Înapoi la Listă
          </button>
          <h2 className="text-lg font-semibold ml-auto">Editează Profesor</h2>
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
              <label className="text-sm font-medium text-gray-900">Nume Profesor</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Ex: Mr. Smith"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Tip Profesor</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                required
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
              >
                <option value="">Selectează tipul</option>
                <option value="EDUCATOR">Învățător</option>
                <option value="TEACHER">Profesor</option>
              </select>
            </div>


            {formData.type !== "EDUCATOR" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Materie Predată</label>
                <select
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  required={formData.type !== "EDUCATOR"} // required doar dacă nu e educator
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950"
                >
                  <option value="">Selectează Materia</option>
                  {Object.entries(subjectsByCategory).map(([category, subjects]) => (
                    <optgroup key={category} label={category} className="font-medium">
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
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
                Anulează
              </button>
              <button
                type="submit"
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Salvează
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTeacher;