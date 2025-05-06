import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash, Pencil, ArrowLeft, Menu } from "lucide-react";
import axios from "../../../axiosConfig";

const ViewParents = () => {
  const [parents, setParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // Function to toggle visibility of action buttons on mobile
  const toggleMobileMenu = (parentId) => {
    setShowMobileMenu(showMobileMenu === parentId ? null : parentId);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4">
      <div className="w-full mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-3 sm:p-6 pb-2 sm:pb-4 border-b flex items-center flex-wrap">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2 sm:mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          <h2 className="text-lg font-semibold ml-auto">Lista Părinți</h2>
        </div>

        <div className="p-3 sm:p-6">
          {error && (
            <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm bg-red-50/50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-4 sm:mb-6">
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

          {/* Desktop Table - Hidden on small screens */}
          <div className="hidden lg:block border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nume Mamă
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Mamă
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon Mamă
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nume Tată
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Tată
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon Tată
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.motherName || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.motherEmail || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.motherPhoneNumber || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.fatherName || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.fatherEmail || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {parent.fatherPhoneNumber || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/parents/edit/${parent.id}`)}
                        className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Editează</span>
                      </button>
                      <button
                        onClick={() => handleDelete(parent.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Șterge</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Shown only on smaller screens */}
          <div className="lg:hidden">
            {filteredParents.map((parent) => (
              <div key={parent.id} className="bg-white rounded-lg border mb-3 overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">
                      {(parent.motherName && parent.fatherName) 
                        ? `${parent.motherName} & ${parent.fatherName}`
                        : parent.motherName || parent.fatherName || "Părinte"}
                    </h3>
                    <button
                      onClick={() => toggleMobileMenu(parent.id)}
                      className="text-gray-500 hover:text-gray-900"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Mother Information */}
                  {(parent.motherName || parent.motherEmail || parent.motherPhoneNumber) && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Informații Mamă</h4>
                      <div className="space-y-2 text-sm">
                        {parent.motherName && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nume:</span>
                            <span className="text-gray-900">{parent.motherName}</span>
                          </div>
                        )}
                        {parent.motherEmail && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span className="text-gray-900">{parent.motherEmail}</span>
                          </div>
                        )}
                        {parent.motherPhoneNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Telefon:</span>
                            <span className="text-gray-900">{parent.motherPhoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Father Information */}
                  {(parent.fatherName || parent.fatherEmail || parent.fatherPhoneNumber) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informații Tată</h4>
                      <div className="space-y-2 text-sm">
                        {parent.fatherName && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nume:</span>
                            <span className="text-gray-900">{parent.fatherName}</span>
                          </div>
                        )}
                        {parent.fatherEmail && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span className="text-gray-900">{parent.fatherEmail}</span>
                          </div>
                        )}
                        {parent.fatherPhoneNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Telefon:</span>
                            <span className="text-gray-900">{parent.fatherPhoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {showMobileMenu === parent.id && (
                  <div className="p-3 bg-gray-50 border-t flex justify-end space-x-3">
                    <button
                      onClick={() => navigate(`/admin/parents/edit/${parent.id}`)}
                      className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editează
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="bg-white text-red-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Șterge
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredParents.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              {searchTerm
                ? "Nu au fost găsiți părinți care corespund căutării."
                : "Nu există părinți disponibili."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewParents;