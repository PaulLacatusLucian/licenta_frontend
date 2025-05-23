import React, { useState } from "react";
import axios from "../../../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";

const DeleteClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  const handleDelete = async () => {
    try {
      await axios.delete(`/classes/${id}`);
      setMessage("Clasa a fost ștearsă cu succes.");
      setTimeout(() => navigate("/admin/classes"), 1500);
    } catch (err) {
      console.error("Eroare la ștergerea clasei:", err);
      setMessage("Eroare la ștergerea clasei. Te rog încearcă din nou.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-6">Ștergere Clasă</h1>
        <p>Sunteți sigur că doriți să ștergeți această clasă?</p>
        <div className="mt-6 flex justify-between">
          <button onClick={handleDelete} className="bg-red-500 text-white py-2 px-4 rounded">
            Da, Șterge
          </button>
          <button onClick={() => navigate("/admin/classes")} className="bg-gray-300 py-2 px-4 rounded">
            Anulează
          </button>
        </div>
        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteClass;
