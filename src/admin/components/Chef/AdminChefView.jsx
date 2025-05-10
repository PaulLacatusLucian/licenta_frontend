import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash, Search, Menu } from "lucide-react";
import axios from "../../../axiosConfig";

const ViewChefs = () => {
  const [chefs, setChefs] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChefs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/chefs/all");
        setChefs(response.data);
        setError(null);
      } catch (err) {
        setError("Eroare la încărcarea bucătarilor. Te rog încearcă din nou.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChefs();
  }, []);

  const filteredChefs = chefs.filter((chef) =>
    chef.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMobileMenu = (chefId) => {
    setShowMobileMenu(showMobileMenu === chefId ? null : chefId);
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
          <h2 className="text-lg font-semibold ml-auto">Lista Bucătari</h2>
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
                placeholder="Caută după nume..."
                className="w-full pl-9 h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on small screens */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nume Bucătar
                      </th>
                      <th className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredChefs.map((chef) => (
                      <tr key={chef.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {chef.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/edit-chef/${chef.id}`)}
                            className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => navigate(`/admin/delete-chef/${chef.id}`)}
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

              {/* Mobile Card View - Shown only on small screens */}
              <div className="md:hidden">
                {filteredChefs.map((chef) => (
                  <div key={chef.id} className="bg-white rounded-lg border mb-3 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">{chef.name}</h3>
                      <button
                        onClick={() => toggleMobileMenu(chef.id)}
                        className="text-gray-500 hover:text-gray-900"
                      >
                        <Menu className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {showMobileMenu === chef.id && (
                      <div className="p-3 bg-gray-50 border-t flex justify-end space-x-3">
                        <button
                          onClick={() => navigate(`/admin/edit-chef/${chef.id}`)}
                          className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm inline-flex items-center"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/admin/delete-chef/${chef.id}`)}
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

              {filteredChefs.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  {searchTerm ? "Niciun bucătar găsit." : "Nu există bucătari înregistrați."}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewChefs;