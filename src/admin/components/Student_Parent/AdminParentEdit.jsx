import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, Mail, Phone, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";

const EditParent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    motherName: "",
    motherEmail: "",
    motherPhoneNumber: "",
    fatherName: "",
    fatherEmail: "",
    fatherPhoneNumber: "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const response = await axios.get(`/parents/${id}`);
        setFormData({
          motherName: response.data.motherName,
          motherEmail: response.data.motherEmail,
          motherPhoneNumber: response.data.motherPhoneNumber,
          fatherName: response.data.fatherName,
          fatherEmail: response.data.fatherEmail,
          fatherPhoneNumber: response.data.fatherPhoneNumber,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching parent:", error);
        setMessage({
          type: "error",
          text: "Eroare la încărcarea datelor părintelui. Te rog încearcă din nou.",
        });
        setLoading(false);
      }
    };

    fetchParent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/parents/${id}`, formData);
      setMessage({
        type: "success",
        text: "Datele părintelui au fost actualizate cu succes!",
      });
      setTimeout(() => {
        navigate("/admin/parents");
      }, 1500);
    } catch (error) {
      console.error("Error updating parent:", error);
      setMessage({
        type: "error",
        text: "Eroare la actualizarea datelor părintelui. Te rog încearcă din nou.",
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
            onClick={() => navigate("/admin/parents")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Listă
          </button>
          <h2 className="text-lg font-semibold ml-auto">Editează Părinte</h2>
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
              <label className="text-sm font-medium text-gray-900">Nume Mamă</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Nume Mamă"
                  name="motherName"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.motherName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Email Mamă</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email Mamă"
                  name="motherEmail"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.motherEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Telefon Mamă</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Telefon Mamă"
                  name="motherPhoneNumber"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.motherPhoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Nume Tată</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Nume Tată"
                  name="fatherName"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.fatherName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Email Tată</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email Tată"
                  name="fatherEmail"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.fatherEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Telefon Tată</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Telefon Tată"
                  name="fatherPhoneNumber"
                  className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                  value={formData.fatherPhoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/parents")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
              >
                Salvează
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditParent;
