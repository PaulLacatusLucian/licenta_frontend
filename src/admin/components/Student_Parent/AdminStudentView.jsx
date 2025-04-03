import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash, Eye, Pencil, ArrowLeft } from "lucide-react";
import axios from "../../../axiosConfig";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/students");
        setStudents(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Nu s-au putut prelua studenții. Încercați din nou.");
      }
    };

    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Ești sigur că vrei să ștergi acest student?")) {
      try {
        await axios.delete(`/students/${id}`);
        setStudents((prev) => prev.filter((student) => student.id !== id));
        console.log(`Student cu ID ${id} a fost șters.`);
      } catch (err) {
        console.error("Error deleting student:", err);
        alert("A apărut o eroare la ștergerea studentului.");
      }
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.className || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          <h2 className="text-lg font-semibold ml-auto">Lista Studenți</h2>
        </div>

        <div className="p-6">
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
                placeholder="Caută după nume, email sau clasă..."
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
                    Nume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clasă
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specializare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Număr de telefon
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.className || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.classSpecialization || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.phoneNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/students/edit/${student.id}`)}
                        className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editează
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
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

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "Nu au fost găsiți studenți care corespund căutării."
                  : "Nu există studenți disponibili."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudents;
