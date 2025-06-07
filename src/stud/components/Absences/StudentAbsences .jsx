import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../axiosConfig";
import { 
  FaCalendarTimes, 
  FaSpinner, 
  FaArrowLeft, 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaExclamationTriangle, 
  FaBook, 
  FaUserTie,
  FaCheckCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../StudentNavbar";
import { useTranslation } from 'react-i18next';

const StudentAbsences = () => {
  const { t } = useTranslation();
  const [absences, setAbsences] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [activeView, setActiveView] = useState("absences");
  const [studentData, setStudentData] = useState(null);
  const [filter, setFilter] = useState("all");
  
  const navigate = useNavigate();

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Lade Schülerdaten und Abwesenheiten parallel
        const [studentResponse, absencesResponse] = await Promise.all([
          axios.get('/students/me'),
          axios.get('/absences/me')
        ]);
        
        setStudentData(studentResponse.data);
        
        // Logge die Abwesenheitsdaten um die Struktur zu sehen
        console.log("Absences data received:", absencesResponse.data);
        
        setAbsences(absencesResponse.data);
        setMessage("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage(t('student.absences.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const sortedAbsences = useMemo(() => {
    // Filtere Abwesenheiten basierend auf ausgewähltem Filter
    let filteredAbsences = [...absences];
    if (filter === "justified") {
      filteredAbsences = absences.filter(absence => absence.justified);
    } else if (filter === "unjustified") {
      filteredAbsences = absences.filter(absence => !absence.justified);
    }
    
    let sortableAbsences = [...filteredAbsences];
    if (sortConfig.key !== null) {
      sortableAbsences.sort((a, b) => {
        // Behandle verschachtelte Eigenschaften für die Sortierung
        if (sortConfig.key === 'subject') {
          // Für die Sortierung nach Fach verwenden wir teacherWhoMarkedAbsence.subject
          const aValue = a.teacherWhoMarkedAbsence?.subject || "";
          const bValue = b.teacherWhoMarkedAbsence?.subject || "";
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else {
          // Für andere Sortierungen verwenden wir die Standardmethode
          const aValue = sortConfig.key.includes('.') 
            ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], a)
            : a[sortConfig.key];
          const bValue = sortConfig.key.includes('.')
            ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], b)
            : b[sortConfig.key];
            
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableAbsences;
  }, [absences, sortConfig, filter]);

  // Berechne nur unentschuldigte Abwesenheiten für Statistiken
  const unjustifiedAbsences = useMemo(() => {
    return absences.filter(absence => !absence.justified);
  }, [absences]);

  // Berechne entschuldigte Abwesenheiten separat
  const justifiedAbsences = useMemo(() => {
    return absences.filter(absence => absence.justified);
  }, [absences]);

  const subjectAbsences = useMemo(() => {
    // Verwende nur unentschuldigte Abwesenheiten für Fachstatistiken
    const counts = unjustifiedAbsences.reduce((acc, absence) => {
      const translatedSubject = getTranslatedSubject(absence.teacherWhoMarkedAbsence?.subject) || t('student.absences.unknownSubject');
      if (!acc[translatedSubject]) {
        acc[translatedSubject] = 0;
      }
      acc[translatedSubject] += 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([subject, count]) => ({
      subject,
      count
    }));
  }, [unjustifiedAbsences, t]);

  // Gesamt für unentschuldigte Abwesenheiten
  const totalUnjustifiedAbsences = useMemo(() => {
    return unjustifiedAbsences.length;
  }, [unjustifiedAbsences]);

  // Gesamt für entschuldigte Abwesenheiten
  const totalJustifiedAbsences = useMemo(() => {
    return justifiedAbsences.length;
  }, [justifiedAbsences]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return <FaSort className="ml-2" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-2" /> : <FaSortDown className="ml-2" />;
  };

  const getAttendanceStatus = (unjustifiedCount) => {
    if (unjustifiedCount <= 5) return t('student.absences.attendanceStatus.excellent');
    if (unjustifiedCount <= 15) return t('student.absences.attendanceStatus.good');
    return t('student.absences.attendanceStatus.atRisk');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">{t('student.absences.loading')}</p>
        </div>
      </div>
    );
  }

  const renderAbsencesContent = () => {
    return (
      <div className="space-y-6">
        {/* Main Stats - Zeige sowohl entschuldigte als auch unentschuldigte */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-6">
            <FaCalendarTimes className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">{t('student.absences.yourAbsences')}</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('student.absences.stats.unjustified')}</p>
              <p className="text-3xl font-bold">{totalUnjustifiedAbsences}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('student.absences.stats.justified')}</p>
              <p className="text-3xl font-bold">{totalJustifiedAbsences}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('student.absences.stats.attendanceStatus')}</p>
              <p className="text-3xl font-bold">
                {getAttendanceStatus(totalUnjustifiedAbsences)}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Absences - Zeige nur unentschuldigte Abwesenheiten */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
            <FaBook className="text-primary mr-3" />
            {t('student.absences.unjustifiedBySubject')}
          </h3>
          {subjectAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-dark2">
              <FaCheckCircle className="text-5xl mb-4 text-green-500" />
              <p className="text-xl">{t('student.absences.noUnjustified')}</p>
              <p className="text-sm mt-2">{t('student.absences.greatJobAttendance')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectAbsences.map((subjectData) => (
                <div key={subjectData.subject} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="overflow-hidden">
                      <p className="font-medium text-dark truncate">{subjectData.subject}</p>
                    </div>
                    <div className="flex items-center">
                      <p className={`text-xl font-bold ${subjectData.count > 5 ? "text-red-600" : "text-yellow-600"}`}>
                        {subjectData.count}
                      </p>
                      <span className="ml-2">{subjectData.count > 5 ? "⚠️" : "⚠️"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Absences Table with Filter */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-dark flex items-center mb-3 md:mb-0">
              <FaCalendarTimes className="text-primary mr-3" />
              {t('student.absences.absenceHistory')}
            </h3>
            
            {/* Filter controls */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200">
              <span className="text-dark2 text-sm mr-2">{t('student.absences.show')}:</span>
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-primary text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('all')}
              >
                {t('student.absences.filter.all')}
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'unjustified' ? 'bg-red-500 text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('unjustified')}
              >
                {t('student.absences.filter.unjustified')}
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'justified' ? 'bg-green-500 text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('justified')}
              >
                {t('student.absences.filter.justified')}
              </button>
            </div>
          </div>
          
          {message ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-4">{message}</div>
          ) : sortedAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark2">
              <FaCalendarTimes className="text-5xl mb-4 text-primary opacity-50" />
              <p className="text-xl">
                {filter !== 'all' 
                  ? t('student.absences.noAbsencesFound', { filter: t(`student.absences.filter.${filter}`) })
                  : t('student.absences.noAbsencesFound', { filter: '' })}
              </p>
              {filter === 'unjustified' && (
                <p className="text-sm mt-2">{t('student.absences.perfectAttendance')}</p>
              )}
            </div>
          ) : (
            <div>
              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-light bg-opacity-50">
                      <th className="p-4 text-left">
                        <button
                          className="flex items-center text-dark2 font-medium hover:text-primary"
                          onClick={() => requestSort('subject')}
                        >
                          <FaBook className="mr-2" />
                          <span>{t('student.absences.table.subject')}</span>
                          {getSortIcon('subject')}
                        </button>
                      </th>
                      <th className="p-4 text-left">
                        <div className="flex items-center">
                          <FaUserTie className="text-primary mr-2" />
                          <span className="text-dark2 font-medium">{t('student.absences.table.teacher')}</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <button
                          className="flex items-center justify-center text-dark2 font-medium hover:text-primary mx-auto"
                          onClick={() => requestSort('date')}
                        >
                          <span>{t('student.absences.table.date')}</span>
                          {getSortIcon('date')}
                        </button>
                      </th>
                      <th className="p-4 text-center">{t('student.absences.table.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAbsences.map((absence, index) => (
                      <tr 
                        key={absence.id || index} 
                        className={`border-t hover:bg-light transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-light bg-opacity-30" : ""
                        }`}
                      >
                        <td className="p-4 font-medium text-dark">
                          {getTranslatedSubject(absence.teacherWhoMarkedAbsence?.subject) || t('student.absences.unknownSubject')}
                        </td>
                        <td className="p-4 text-dark2">
                          {absence.teacherWhoMarkedAbsence?.name || t('student.absences.unknownTeacher')}
                        </td>
                        <td className="p-4 text-center text-dark2">
                          {absence.sessionDate 
                            ? new Date(absence.sessionDate).toLocaleString("ro-RO", { 
                                year: "numeric", 
                                month: "long", 
                                day: "numeric"
                              }) 
                            : t('student.absences.unknownDate')}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            absence.justified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {absence.justified ? t('student.absences.status.justified') : t('student.absences.status.unjustified')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Cards */}
              <div className="md:hidden">
                <div className="flex justify-between mb-3 px-2">
                  <button
                    className="flex items-center text-xs text-dark2 font-medium hover:text-primary"
                    onClick={() => requestSort('subject')}
                  >
                    <span>{t('student.absences.sortBySubject')}</span>
                    {getSortIcon('subject')}
                  </button>
                  <button
                    className="flex items-center text-xs text-dark2 font-medium hover:text-primary"
                    onClick={() => requestSort('date')}
                  >
                    <span>{t('student.absences.sortByDate')}</span>
                    {getSortIcon('date')}
                  </button>
                </div>
                {sortedAbsences.map((absence, index) => (
                  <div
                    key={absence.id || index}
                    className={`mb-3 p-3 rounded-lg border-l-4 ${
                      absence.justified ? "border-green-500" : "border-red-500"
                    } bg-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-dark truncate max-w-[70%]">
                        {getTranslatedSubject(absence.teacherWhoMarkedAbsence?.subject) || t('student.absences.unknownSubject')}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          absence.justified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {absence.justified ? t('student.absences.status.justified') : t('student.absences.status.unjustified')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex items-center text-dark2">
                        <FaUserTie className="mr-2 text-xs" />
                        <span className="truncate">{absence.teacherWhoMarkedAbsence?.name || t('student.absences.unknownTeacher')}</span>
                      </div>
                      <div className="flex items-center text-dark2">
                        <FaCalendarTimes className="mr-2 text-xs" />
                        <span>
                          {absence.sessionDate 
                            ? new Date(absence.sessionDate).toLocaleString("ro-RO", { 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric"
                              })
                            : t('student.absences.unknownDate')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      <StudentNavbar activeView={activeView} studentData={studentData} />

      <div className="flex-1 p-4 md:p-8 bg-light">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate("/stud")}
            className="mr-3 text-primary hover:text-secondary"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">{t('student.absences.title')}</h2>
          <div className="flex items-center">
            <div className="flex items-center">
            </div>
          </div>
        </header>
        
        {renderAbsencesContent()}
      </div>
    </div>
  );
};

export default StudentAbsences;