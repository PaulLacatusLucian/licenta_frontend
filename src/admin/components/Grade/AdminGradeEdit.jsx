import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaStar, FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import axios from "../../../axiosConfig";

const EditGrade = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const gradeFromList = location.state?.gradeData;

  const [formData, setFormData] = useState({
    grade: "",
    description: ""
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [displayInfo, setDisplayInfo] = useState({
    teacherName: "",
    subject: "",
    sessionDate: ""
  });

  useEffect(() => {
    const fetchGradeData = async () => {
      try {
        setLoading(true);
        
        if (gradeFromList) {
          setDisplayInfo({
            teacherName: gradeFromList.teacherName || "Necunoscut",
            subject: gradeFromList.subject || "Necunoscută",
            sessionDate: gradeFromList.sessionDate || ""
          });
          
          setFormData({
            grade: gradeFromList.grade || "",
            description: gradeFromList.description || ""
          });
        } else {
          setMessage({
            type: "warning",
            text: "Nu s-au putut încărca datele notei. Te rugăm să te întorci la lista de note."
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
        setMessage({
          type: "error",
          text: "A apărut o eroare. Te rugăm să te întorci la lista de note."
        });
        setLoading(false);
      }
    };

    fetchGradeData();
  }, [id, gradeFromList]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.grade) {
      setMessage({
        type: "error",
        text: "Te rugăm să introduci o valoare pentru notă."
      });
      return;
    }

    try {
      await axios.put(`/grades/${id}/simple`, {
        grade: formData.grade,
        description: formData.description || ""
      });
      
      setMessage({
        type: "success",
        text: "Nota a fost actualizată cu succes!"
      });
      
      setTimeout(() => {
        navigate("/admin/grades");
      }, 1500);
    } catch (error) {
      console.error("Eroare la actualizarea notei:", error);
      
      let errorMessage = "Eroare la actualizarea notei.";
      if (error.response) {
        errorMessage += ` Server: ${error.response.status}`;
        if (error.response.data) {
          errorMessage += ` - ${error.response.data}`;
        }
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
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
            onClick={() => navigate("/admin/grades")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Listă
          </button>
          <h2 className="text-lg font-semibold ml-auto mr-2">Editează Notă</h2>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50/50 text-green-600 border border-green-200"
                  : message.type === "warning"
                  ? "bg-yellow-50/50 text-yellow-600 border border-yellow-200"
                  : "bg-red-50/50 text-red-600 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(displayInfo.teacherName || displayInfo.subject || displayInfo.sessionDate) && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <FaInfoCircle className="mr-2 h-4 w-4 text-gray-500" />
                  Informații despre notă
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {displayInfo.teacherName && (
                    <div>
                      <span className="text-gray-500">Profesor:</span>
                      <p className="font-medium">{displayInfo.teacherName}</p>
                    </div>
                  )}
                  
                  {displayInfo.subject && (
                    <div>
                      <span className="text-gray-500">Materie:</span>
                      <p className="font-medium">{displayInfo.subject}</p>
                    </div>
                  )}
                  
                  {displayInfo.sessionDate && (
                    <div>
                      <span className="text-gray-500">Data:</span>
                      <p className="font-medium">{formatDate(displayInfo.sessionDate)}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 flex items-start">
                  <FaInfoCircle className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                  <span>Aceste informații nu pot fi modificate. Poți edita doar nota și descrierea.</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Valoare Notă</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                name="grade"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                required
                className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
              />
              <div className="grid grid-cols-5 gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`p-1 border rounded-md ${
                      Number(formData.grade) === num 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setFormData({...formData, grade: num})}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Descriere (opțional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                rows="3"
                placeholder="Ex: Evaluare sumativă, Răspuns oral..."
              />
            </div>

            <div className="flex space-x-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/grades")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <FaStar className="mr-2 h-4 w-4" />
                Salvează
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGrade;