import React, { useState } from "react";
import axios from "../../../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";

const DeleteParent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  const handleDelete = async () => {
    try {
      await axios.delete(`/parents/${id}`);
      setMessage("Părinte șters cu succes.");
      setTimeout(() => navigate("/parents"), 1500);
    } catch (err) {
      console.error("Error deleting parent:", err);
      setMessage("Eroare la ștergerea părintelui.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-6">Ștergere Părinte</h1>
        <p>Sunteți sigur că doriți să ștergeți acest părinte?</p>
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Da, Șterge
          </button>
          <button
            onClick={() => navigate("/parents")}
            className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
          >
            Anulează
          </button>
        </div>
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteParent;
