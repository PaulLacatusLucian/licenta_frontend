import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaExclamationCircle, FaCheckCircle, FaArrowLeft, FaSearch, FaFilter } from "react-icons/fa";
import axios from "../../../axiosConfig";

const JustifyAbsences = () => {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [justifyingAbsence, setJustifyingAbsence] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all unjustified absences
        // In a real scenario, you might want to implement pagination
        const absencesResponse = await axios.get('/absences');
        
        // Filter only unjustified absences
        const unjustifiedAbsences = absencesResponse.data.filter(
          absence => !absence.justified
        );
        
        setAbsences(unjustifiedAbsences);
        setFilteredAbsences(unjustifiedAbsences);
        
        // Extract unique subjects
        const subjects = [...new Set(unjustifiedAbsences
          .filter(absence => 
            absence.classSession && 
            absence.classSession.subject && 
            absence.classSession.subject.trim() !== ""
          )
          .map(absence => absence.classSession.subject))];
        
        setAvailableSubjects(subjects.sort());
        
        // Extract unique classes
        const classes = [...new Set(unjustifiedAbsences
          .filter(absence => 
            absence.student && 
            absence.student.studentClass && 
            absence.student.studentClass.name && 
            absence.student.studentClass.name.trim() !== ""
          )
          .map(absence => absence.student.studentClass.name))];
        
        setAvailableClasses(classes.sort());
        
        setMessageType("");
        setMessage("");
      } catch (error) {
        setMessageType("error");
        setMessage("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    // Filter absences based on search and filters
    let result = [...absences];
    
    if (searchQuery) {
      result = result.filter(absence => 
        absence.student?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (subjectFilter !== "all") {
      result = result.filter(absence => {
        // Check subject from multiple sources
        const sessionSubject = absence.classSession?.subject;
        const teacherSubject = absence.teacherWhoMarkedAbsence?.subject;
        
        return sessionSubject === subjectFilter || teacherSubject === subjectFilter;
      });
    }
    
    if (classFilter !== "all") {
      result = result.filter(absence => 
        absence.student?.studentClass?.name === classFilter
      );
    }
    
    setFilteredAbsences(result);
  }, [searchQuery, subjectFilter, classFilter, absences]);

  const handleJustifyAbsence = async (absenceId) => {
    try {
      setJustifyingAbsence(absenceId);
      
      await axios.put(`/absences/${absenceId}/justify`);
      
      // Remove the absence from the list after justification
      setAbsences(prev => prev.filter(absence => absence.id !== absenceId));
      setFilteredAbsences(prev => prev.filter(absence => absence.id !== absenceId));
      
      setMessageType("success");
      setMessage("Absence successfully justified!");
    } catch (error) {
      setMessageType("error");
      setMessage("Failed to justify absence. Please try again.");
    } finally {
      setJustifyingAbsence(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="w-full mx-auto bg-white rounded-lg border shadow-sm">
        <div className="p-4 md:p-6 pb-4 border-b flex items-center">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          <h2 className="text-lg font-semibold ml-auto">Motivare Absențe</h2>
        </div>

        <div className="p-4 md:p-6">
          {messageType === "error" && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <FaExclamationCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            </div>
          )}

          {messageType === "success" && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <FaCheckCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Caută după nume elev"
                  className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                />
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-gray-500" />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  <option value="all">Toate Materiile</option>
                  {availableSubjects.map((subject, index) => (
                    <option key={index} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-gray-500" />
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  <option value="all">Toate Clasele</option>
                  {availableClasses.map((className, index) => (
                    <option key={index} value={className}>{className}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px] bg-white">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="text-gray-600 font-medium">Se încarcă datele...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaExclamationCircle className="mr-3 text-red-500" />
                Absențe Nemotivate
              </h2>

              {filteredAbsences.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nu Există Absențe Nemotivate</h3>
                  <p className="text-gray-600">Toate absențele au fost motivate!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="px-4 py-3 text-gray-600 font-semibold rounded-tl-lg">Elev</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Clasa</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Materie</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold">Data</th>
                        <th className="px-4 py-3 text-gray-600 font-semibold rounded-tr-lg">Acțiune</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAbsences.map(absence => {
                        // Extract information with fallbacks for missing data
                        const studentName = absence.student?.name || "Unknown Student";
                        const className = absence.student?.studentClass?.name || "N/A";
                        
                        // Try to get subject from multiple sources
                        let subject = "N/A";
                        if (absence.classSession?.subject) {
                          subject = absence.classSession.subject;
                        } else if (absence.teacherWhoMarkedAbsence?.subject) {
                          subject = absence.teacherWhoMarkedAbsence.subject;
                        }
                        
                        // Get the date
                        let displayDate = "Unknown date";
                        if (absence.date) {
                          displayDate = formatDate(absence.date);
                        } else if (absence.classSession?.startTime) {
                          displayDate = formatDate(absence.classSession.startTime);
                        }
                        
                        return (
                          <tr key={absence.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-900">{studentName}</td>
                            <td className="px-4 py-4 text-gray-900">{className}</td>
                            <td className="px-4 py-4 text-gray-900">{subject}</td>
                            <td className="px-4 py-4 text-gray-900">{displayDate}</td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleJustifyAbsence(absence.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
                                disabled={justifyingAbsence === absence.id}
                              >
                                {justifyingAbsence === absence.id ? (
                                  <>
                                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                    Se motivează...
                                  </>
                                ) : (
                                  <>
                                    <FaCheckCircle className="mr-2 h-4 w-4" />
                                    Motivează
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JustifyAbsences;