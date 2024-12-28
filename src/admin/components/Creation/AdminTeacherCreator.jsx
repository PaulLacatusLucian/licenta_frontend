import React from 'react';
import { User, BookOpen } from 'lucide-react';
import axios from '../../../axiosConfig';

const CreateTeacher = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    subject: "",
  });

  const [message, setMessage] = React.useState(null);

  const subjectsByCategory = {
    "Reale": ["Informatica", "Matematica", "Fizica", "Chimie", "Biologie"],
    "Umane": ["Istorie", "Geografie", "Romana", "Engleza", "Germana", "Italiana", "Latina", "Franceza"],
    "Arte și Sport": ["Educatie Fizica", "Arte Vizuale", "Muzica"],
    "Altele": ["Religie", "Psihologie", "Economie", "Filosofie"],
  };

  const handleNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleSubjectChange = (e) => {
    setFormData(prev => ({
      ...prev,
      subject: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/teachers", formData);
      setMessage({
        type: "success",
        text: "Profesorul a fost creat cu succes!"
      });
      setFormData({
        name: "",
        subject: "",
      });
    } catch (error) {
      console.error("Error creating teacher:", error);
      setMessage({
        type: "error",
        text: "Eroare la crearea profesorului. Te rog încearcă din nou."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b">
          <h2 className="text-lg font-semibold">Creează Profesor</h2>
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
                Nume Profesor
              </label>
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
              <label className="text-sm font-medium text-gray-900">
                Materie Predată
              </label>
              <select
                value={formData.subject}
                onChange={handleSubjectChange}
                required
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
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

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Creează Profesor
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeacher;