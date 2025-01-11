import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash, Pencil, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";

const ViewParents = () => {
  const [parents, setParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch parents data
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await axios.get("/parents");
        console.log("API Response:", response.data); // Debugging API response
        setParents(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching parents:", err);
        setError("Nu s-au putut prelua părinții. Încercați din nou.");
      }
    };

    fetchParents();
  }, []);

  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm("Ești sigur că vrei să ștergi acest părinte?")) {
      try {
        await axios.delete(`/parents/${id}`);
        setParents((prev) => prev.filter((parent) => parent.id !== id));
        console.log(`Părinte cu ID ${id} a fost șters.`); // Debugging
      } catch (err) {
        console.error("Error deleting parent:", err);
        alert("A apărut o eroare la ștergerea părintelui.");
      }
    }
  };

  // Filter parents based on search term
  const filteredParents = parents.filter((parent) =>
    [parent.motherName, parent.fatherName, parent.motherEmail, parent.fatherEmail]
      .filter(Boolean) // Ensure values are not null or undefined
      .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          <h2 className="text-lg font-semibold ml-auto">Lista Părinți</h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50/50 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Caută după nume sau email..."
            className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
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
                Nume Mamă
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Mamă
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon Mamă
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nume Tată
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Tată
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon Tată
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParents.map((parent) => (
              <tr key={parent.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parent.motherName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parent.motherEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parent.motherPhoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parent.fatherName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parent.fatherEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parent.fatherPhoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/admin/parents/edit/${parent.id}`)}
                    className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editează
                  </button>
                  <button
                    onClick={() => handleDelete(parent.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredParents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "Nu au fost găsiți părinți care corespund căutării."
              : "Nu există părinți disponibili."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewParents;
