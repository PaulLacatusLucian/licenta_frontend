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
    const fetchParentData = async () => {
      try {
        const response = await axios.get(`/parents/${id}`);
        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching parent data:", error);
        setMessage({
          type: "error",
          text: "Eroare la încărcarea datelor părintelui. Te rog încearcă din nou.",
        });
        setLoading(false);
      }
    };

    fetchParentData();
  }, [id]);

  const handleInputChange = (e) => {
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
        text: "Eroare la actualizarea datelor. Te rog încearcă din nou.",
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
            <fieldset>
              <legend className="text-sm font-medium text-gray-900 mb-2">Informații Mamă</legend>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Nume</label>
                <input
                  type="text"
                  name="motherName"
                  placeholder="Nume Mamă"
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  required
                />
                <label className="text-sm font-medium text-gray-900">Email</label>
                <input
                  type="email"
                  name="motherEmail"
                  placeholder="Email Mamă"
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  value={formData.motherEmail}
                  onChange={handleInputChange}
                />
                <label className="text-sm font-medium text-gray-900">Telefon</label>
                <input
                  type="text"
                  name="motherPhoneNumber"
                  placeholder="Telefon Mamă"
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  value={formData.motherPhoneNumber}
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-gray-900 mb-2">Informații Tată</legend>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Nume</label>
                <input
                  type="text"
                  name="fatherName"
                  placeholder="Nume Tată"
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  required
                />
                <label className="text-sm font-medium text-gray-900">Email</label>
                <input
                  type="email"
                  name="fatherEmail"
                  placeholder="Email Tată"
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  value={formData.fatherEmail}
                  onChange={handleInputChange}
                />
                <label className="text-sm font-medium text-gray-900">Telefon</label>
                <input
                  type="text"
                  name="fatherPhoneNumber"
                  placeholder="Telefon Tată"
                  className="w-full h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                  value={formData.fatherPhoneNumber}
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/parents")}
                className="inline-flex w-1/2 items-center justify-center rounded-md border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="inline-flex w-1/2 items-center justify-center rounded-md bg-gray-900 px-4 h-9 text-sm font-medium text-gray-50 hover:bg-gray-800"
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
