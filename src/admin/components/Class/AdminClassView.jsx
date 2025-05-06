import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash, Search, Menu } from "lucide-react";
import axios from "../../../axiosConfig";

const ViewClasses = () => {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes");
        setClasses(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes. Please try again later.");
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to toggle visibility of action buttons on mobile
  const toggleMobileMenu = (classId) => {
    setShowMobileMenu(showMobileMenu === classId ? null : classId);
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
          <h2 className="text-lg font-semibold ml-auto">Listă Clase</h2>
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
                placeholder="Caută după nume sau specializare..."
                className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Table - Hidden on small screens */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nume Clasă
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="hidden lg:table-cell px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diriginte / Învățător
                  </th>
                  <th className="hidden lg:table-cell px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specializare
                  </th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {classItem.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {classItem.educationLevel}
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      {classItem.classTeacher?.name || <span className="text-gray-400 italic">Nespecificat</span>}
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.educationLevel === "HIGH"
                      ? classItem.specialization
                      : <span className="text-gray-400 italic">-</span>}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/classes/edit/${classItem.id}`)}
                        className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/classes/delete/${classItem.id}`)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Shown only on small screens */}
          <div className="md:hidden">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="bg-white rounded-lg border mb-3 overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{classItem.name}</h3>
                    <button
                      onClick={() => toggleMobileMenu(classItem.id)}
                      className="text-gray-500 hover:text-gray-900"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nivel:</span>
                    <span className="text-gray-900">{classItem.educationLevel}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Diriginte:</span>
                    <span className="text-gray-900">
                      {classItem.classTeacher?.name || <span className="text-gray-400 italic">Nespecificat</span>}
                    </span>
                  </div>
                  
                  {classItem.educationLevel === "HIGH" && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Specializare:</span>
                      <span className="text-gray-900">{classItem.specialization}</span>
                    </div>
                  )}
                </div>
                
                {showMobileMenu === classItem.id && (
                  <div className="p-3 bg-gray-50 border-t flex justify-end space-x-3">
                    <button
                      onClick={() => navigate(`/admin/classes/edit/${classItem.id}`)}
                      className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/admin/classes/delete/${classItem.id}`)}
                      className="bg-white text-red-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              {searchTerm ? "No classes found matching your search." : "No classes available."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewClasses;