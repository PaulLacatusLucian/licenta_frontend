import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, School, BookOpen, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";

const CreateClass = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: "",
    classTeacherId: "",
    educationLevel: "PRIMARY",
    specialization: ""
  });

  const [teachers, setTeachers] = React.useState([]);
  const [message, setMessage] = React.useState(null);
  const [nameError, setNameError] = React.useState("");


  const specializations = [
    "Matematica-Informatica",
    "Matematica-Informatica-Bilingv",
    "Filologie",
    "Bio-Chimie",
  ];

  const isClassNameValid = (name, level) => {
    const patternMap = {
      PRIMARY: /^[0-4][A-Z]$/,
      MIDDLE: /^[5-8][A-Z]$/,
      HIGH: /^(9|1[0-2])[A-Z]$/,
    };
  
    const pattern = patternMap[level];
    return pattern ? pattern.test(name) : false;
  };
  

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
      const filteredTeachers = teachers
      .filter((t) => !t.classId) 
      .filter((t) =>
        formData.educationLevel === "PRIMARY"
          ? t.type === "EDUCATOR"
          : ["MIDDLE", "HIGH"].includes(formData.educationLevel)
          ? t.type === "TEACHER"
          : true
      );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  React.useEffect(() => {
    if (!formData.name) {
      setNameError("");
      return;
    }
  
    if (!isClassNameValid(formData.name, formData.educationLevel)) {
      setNameError("Numele clasei nu este valid pentru nivelul educațional ales.");
    } else {
      setNameError("");
    }
  }, [formData.name, formData.educationLevel]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.educationLevel || !formData.name) {
      setMessage({
        type: "error",
        text: "Te rog completează toate câmpurile necesare!",
      });
      return;
    }
  
    if (!isClassNameValid(formData.name, formData.educationLevel)) {
      setMessage({
        type: "error",
        text: "Numele clasei nu este valid pentru nivelul educațional selectat.",
      });
      return;
    }
    
    const payload = {
      name: formData.name,
      specialization: formData.educationLevel === "HIGH" ? formData.specialization : null,
    };
  
    let endpoint = "/classes/create-primary";

    if (formData.educationLevel === "PRIMARY") {
      endpoint = `/classes/create-primary`;
      if (formData.classTeacherId) {
        endpoint += `?teacherId=${formData.classTeacherId}`;
      }
    } else if (formData.educationLevel === "MIDDLE") {
      endpoint = `/classes/create-middle?teacherId=${formData.classTeacherId}`;
    } else if (formData.educationLevel === "HIGH") {
      endpoint = `/classes/create-high?teacherId=${formData.classTeacherId}`;
    }

    
  
    try {
await axios.post(endpoint, payload);
      setMessage({ type: "success", text: "Clasa a fost creată cu succes!" });
      setFormData({ name: "", classTeacherId: "", specialization: "" });
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
        <div className="p-6 pb-4 border-b flex items-center">
          {/* Back Button */}
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          <h2 className="text-lg font-semibold ml-auto">Creează o Clasă</h2>
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
            <label className="text-sm font-medium text-gray-900">Nume Clasă</label>
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
            {nameError && (
              <p className="text-red-500 text-xs mt-1">{nameError}</p>
            )}
          </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Nivel Educațional</label>
              <select
                name="educationLevel"
                className="w-full h-9 rounded-md border border-gray-200 px-3 py-1 text-sm shadow-sm"
                value={formData.educationLevel}
                onChange={handleInputChange}
                required
              >
                <option value="PRIMARY">Clasa 0–4 (Învățământ Primar)</option>
                <option value="MIDDLE">Clasa 5–8 (Învățământ Gimnazial)</option>
                <option value="HIGH">Clasa 9–12 (Învățământ Liceal)</option>
              </select>
            </div>


            {formData.educationLevel === "PRIMARY" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Învățător</label>
              <select
                name="classTeacherId"
                className="w-full h-9 rounded-md border border-gray-200 px-3 py-1 text-sm shadow-sm"
                value={formData.classTeacherId}
                onChange={handleInputChange}
              >
                <option value="">Selectează un învățător</option>
                {teachers
                  .filter((t) => t.type === "EDUCATOR" && !t.hasClassAssigned)
                  .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
              </select>
            </div>
          )}



          {(formData.educationLevel === "MIDDLE" || formData.educationLevel === "HIGH") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Diriginte</label>
              <select
                name="classTeacherId"
                className="w-full h-9 rounded-md border border-gray-200 px-3 py-1 text-sm shadow-sm"
                value={formData.classTeacherId}
                onChange={handleInputChange}
                required
              >
                <option value="">Selectează un profesor</option>
                {teachers
                .filter((t) => t.type === "TEACHER" && !t.hasClassAssigned)
                .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </option>
                  ))}
              </select>
            </div>
          )}


        {formData.educationLevel === "HIGH" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Specializare</label>
            <select
              name="specialization"
              className="w-full h-9 rounded-md border border-gray-200 px-3 py-1 text-sm shadow-sm"
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
        )}


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
