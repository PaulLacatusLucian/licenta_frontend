import React, { useState } from "react";
import axios from "../../../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";

const DeleteTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  const handleDelete = async () => {
    try {
      await axios.delete(`/teachers/${id}`);
      setMessage("Profesor șters cu succes.");
      navigate("/admin/teachers");
    } catch (err) {
      console.error("Error deleting teacher:", err);
      setMessage("Eroare la ștergerea profesorului.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-6">Ștergere Profesor</h1>
        <p>Sunteți sigur că doriți să ștergeți acest profesor?</p>
        <div className="mt-6 flex justify-between">
          <button onClick={handleDelete} className="bg-red-500 text-white py-2 px-4 rounded">
            Da, Șterge
          </button>
          <button onClick={() => navigate("/admin/teachers")} className="bg-gray-300 py-2 px-4 rounded">
            Anulează
          </button>
        </div>
        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default DeleteTeacher;
