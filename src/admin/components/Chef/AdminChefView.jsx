import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash, Search } from "lucide-react";
import axios from "../../../axiosConfig";

const ViewChefs = () => {
  const [chefs, setChefs] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const response = await axios.get("/chefs/all");
        setChefs(response.data);
        setError(null);
      } catch (err) {
        setError("Eroare la încărcarea bucătarilor. Te rog încearcă din nou.");
      }
    };

    fetchChefs();
  }, []);

  const filteredChefs = chefs.filter((chef) =>
    chef.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Înapoi
          </button>
          <h2 className="text-lg font-semibold ml-auto">Lista Bucătari</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Caută după nume..."
                className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm focus:ring-2 focus:ring-gray-950"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nume Bucătar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChefs.map((chef) => (
                  <tr key={chef.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{chef.name}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/edit-chef/${chef.id}`)}
                        className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => navigate(`/admin/delete-chef/${chef.id}`)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" /> Șterge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredChefs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "Niciun bucătar găsit." : "Nu există bucătari înregistrați."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewChefs;
