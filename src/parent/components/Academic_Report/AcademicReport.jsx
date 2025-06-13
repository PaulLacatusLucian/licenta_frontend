import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import {
  FaChartLine,
  FaBook,
  FaCalendarTimes,
  FaChalkboardTeacher,
  FaTrophy,
  FaPrint,
  FaArrowLeft,
  FaUserCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUserTie,
  FaCheckCircle,
  FaFilter
} from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import ParentNavbar from "../ParentNavbar";

const AcademicReportPage = () => {
  const { t, i18n } = useTranslation();
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [absences, setAbsences] = useState([]);  // Array für detaillierte Abwesenheiten
  const [absencesTotal, setAbsencesTotal] = useState(0);  // Gesamtabwesenheiten für Übersicht
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("report");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "grades", "absences"
  const [parentData, setParentData] = useState(null);
  
  // State für Abwesenheiten
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filter, setFilter] = useState("all"); // "all", "justified", "unjustified"
  
  // Notification system
  const [notification, setNotification] = useState(null);
  
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Lade alle erforderlichen Daten parallel für bessere Leistung
        const [
          parentResponse, 
          studentResponse, 
          gradesResponse, 
          totalAbsencesResponse,
          teachersResponse
        ] = await Promise.all([
          axios.get('/parents/me'),
          axios.get('/parents/me/child'),
          axios.get('/parents/me/child/grades'),
          axios.get('/parents/child/total-absences'),  // Endpoint für Gesamtabwesenheiten
          axios.get('/parents/me/child/teachers')
        ]);
        
        setParentData(parentResponse.data);
        setStudentData(studentResponse.data);
        setGrades(gradesResponse.data || []);
        setAbsencesTotal(totalAbsencesResponse.data?.total || 0);  // Setze Gesamtzahl initial
        setTeachers(teachersResponse.data || []);

        // Wenn der Abwesenheiten-Tab geladen wird, mache einen separaten Request für Details
        if (activeTab === "absences") {
          await fetchDetailedAbsences();
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch academic data:", err);
        setError(t('parent.academicReport.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, activeTab, t]);

  // Separate Funktion zum Laden detaillierter Abwesenheiten
  const fetchDetailedAbsences = async () => {
    try {
      // Hier verwenden wir den neuen Endpoint, der die detaillierte Liste zurückgibt
      const detailedAbsencesResponse = await axios.get('/parents/me/child/detailed-absences');
      setAbsences(detailedAbsencesResponse.data || []);
      console.log("Detaillierte Abwesenheiten geladen:", detailedAbsencesResponse.data);
    } catch (error) {
      console.error("Error fetching detailed absences:", error);
      // Initialisiere mit leerem Array bei Fehler
      setAbsences([]);
    }
  };

  // Lade detaillierte Abwesenheiten wenn Tab gewechselt wird
  useEffect(() => {
    if (activeTab === "absences" && !isLoading) {
      fetchDetailedAbsences();
    }
  }, [activeTab, isLoading]);

  // Berechne nur unentschuldigte Abwesenheiten für Statistiken
  const unjustifiedAbsences = useMemo(() => {
    return Array.isArray(absences) ? absences.filter(absence => !absence.justified) : [];
  }, [absences]);

  // Berechne entschuldigte Abwesenheiten separat
  const justifiedAbsences = useMemo(() => {
    return Array.isArray(absences) ? absences.filter(absence => absence.justified) : [];
  }, [absences]);

  // Fächer mit unentschuldigten Abwesenheiten
  const subjectAbsences = useMemo(() => {
    if (!Array.isArray(absences) || absences.length === 0) return [];
    
    // Verwende nur unentschuldigte Abwesenheiten für Fächerstatistiken
    const counts = unjustifiedAbsences.reduce((acc, absence) => {
      const subject = absence.teacherWhoMarkedAbsence?.subject || t('parent.academicReport.absences.unknownSubject');
      if (!acc[subject]) {
        acc[subject] = 0;
      }
      acc[subject] += 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([subject, count]) => ({
      subject,
      count
    }));
  }, [unjustifiedAbsences, absences, t]);

  // Gesamt für unentschuldigte Abwesenheiten
  const totalUnjustifiedAbsences = useMemo(() => {
    return unjustifiedAbsences.length;
  }, [unjustifiedAbsences]);

  // Gesamt für entschuldigte Abwesenheiten
  const totalJustifiedAbsences = useMemo(() => {
    return justifiedAbsences.length;
  }, [justifiedAbsences]);

  // Sortierte Abwesenheiten
  const sortedAbsences = useMemo(() => {
    if (!Array.isArray(absences)) return [];
    
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
        // Behandle verschachtelte Eigenschaften für Sortierung
        if (sortConfig.key === 'subject') {
          // Für Sortierung nach Fach verwenden wir teacherWhoMarkedAbsence.subject
          const aValue = a.teacherWhoMarkedAbsence?.subject || "";
          const bValue = b.teacherWhoMarkedAbsence?.subject || "";
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else if (sortConfig.key === 'date') {
          // Für Sortierung nach Datum
          const aDate = a.sessionDate ? new Date(a.sessionDate) : new Date(0);
          const bDate = b.sessionDate ? new Date(b.sessionDate) : new Date(0);
          
          if (aDate < bDate) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aDate > bDate) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        } else {
          // Für andere Sortierungen verwende Standardmethode
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

  const calculateGPA = (gradesList) => {
    if (!gradesList || !gradesList.length) return 0;
    const sum = gradesList.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / gradesList.length).toFixed(2);
  };

  // Berechne Leistungstrend
  const calculateTrend = () => {
    if (!grades || grades.length < 2) return "stable";
    
    // Sortiere Noten nach Datum
    const sortedGrades = [...grades].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Vergleiche erste und letzte Note
    const firstGrade = sortedGrades[0].grade;
    const lastGrade = sortedGrades[sortedGrades.length - 1].grade;
    
    if (lastGrade > firstGrade) return "improving";
    if (lastGrade < firstGrade) return "declining";
    return "stable";
  };

  const performanceTrend = calculateTrend();

  const getGradeColor = (grade) => {
    if (grade >= 8) return 'bg-green-100 text-green-800';
    if (grade >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendIcon = () => {
    switch (performanceTrend) {
      case "improving":
        return <div className="text-green-600">↗ {t('parent.academicReport.trend.improving')}</div>;
      case "declining":
        return <div className="text-red-600">↘ {t('parent.academicReport.trend.needsAttention')}</div>;
      default:
        return <div className="text-blue-600">→ {t('parent.academicReport.trend.stable')}</div>;
    }
  };

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

  const handleBackToDashboard = () => {
    navigate("/parent");
  };

  // Inhalt des Abwesenheiten-Tabs
  const renderAbsencesContent = () => {
    // Überprüfe ob Abwesenheiten geladen wurden
    if (!Array.isArray(absences) || absences.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <FaCalendarTimes className="text-5xl mb-4 text-primary opacity-50" />
          <h3 className="text-xl font-bold mb-2">{t('parent.academicReport.absences.noDetailedData.title')}</h3>
          <p className="text-dark2 text-center max-w-md">
            {t('parent.academicReport.absences.noDetailedData.message')}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Hauptstatistiken - Zeigt sowohl entschuldigte als auch unentschuldigte */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-6">
            <FaCalendarTimes className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">{t('parent.academicReport.absences.title')}</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('parent.academicReport.absences.unjustified')}</p>
              <p className="text-3xl font-bold">{totalUnjustifiedAbsences}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('parent.academicReport.absences.justified')}</p>
              <p className="text-3xl font-bold">{totalJustifiedAbsences}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('parent.academicReport.absences.attendanceStatus')}</p>
              <p className="text-3xl font-bold">
                {totalUnjustifiedAbsences <= 5 ? t('parent.academicReport.absences.excellent') : 
                 totalUnjustifiedAbsences <= 15 ? t('parent.academicReport.absences.good') : 
                 t('parent.academicReport.absences.atRisk')}
              </p>
            </div>
          </div>
        </div>

        {/* Fächer-Abwesenheiten - Zeigt nur unentschuldigte Abwesenheiten */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
            <FaBook className="text-primary mr-3" />
            {t('parent.academicReport.absences.bySubject')}
          </h3>
          {subjectAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-dark2">
              <FaCheckCircle className="text-5xl mb-4 text-green-500" />
              <p className="text-xl">{t('parent.academicReport.absences.noUnjustified')}</p>
              <p className="text-sm mt-2">{t('parent.academicReport.absences.greatAttendance')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectAbsences.map((subjectData) => (
                <div key={subjectData.subject} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="overflow-hidden">
                      <p className="font-medium text-dark truncate">{getTranslatedSubject(subjectData.subject)}</p>
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

        {/* Abwesenheitstabelle mit Filter */}
        <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-dark flex items-center mb-3 md:mb-0">
              <FaCalendarTimes className="text-primary mr-3" />
              {t('parent.academicReport.absences.history')}
            </h3>
            
            {/* Filter-Kontrollen */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200">
              <FaFilter className="text-dark2 mr-2" />
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-primary text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('all')}
              >
                {t('parent.academicReport.absences.filter.all')}
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'unjustified' ? 'bg-red-500 text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('unjustified')}
              >
                {t('parent.academicReport.absences.filter.unjustified')}
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm ${filter === 'justified' ? 'bg-green-500 text-white' : 'text-dark2 hover:bg-light'}`}
                onClick={() => setFilter('justified')}
              >
                {t('parent.academicReport.absences.filter.justified')}
              </button>
            </div>
          </div>
          
          {sortedAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-dark2">
              <FaCalendarTimes className="text-5xl mb-4 text-primary opacity-50" />
              <p className="text-xl">
                {filter !== 'all' 
                  ? t('parent.academicReport.absences.noFilteredAbsences', { filter: t(`parent.academicReport.absences.filter.${filter}`) })
                  : t('parent.academicReport.absences.noAbsences')
                }
              </p>
              {filter === 'unjustified' && (
                <p className="text-sm mt-2">{t('parent.academicReport.absences.perfectAttendance')}</p>
              )}
            </div>
          ) : (
            <div>
              {/* Desktop-Ansicht - Tabelle */}
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
                          <span>{t('parent.academicReport.absences.table.subject')}</span>
                          {getSortIcon('subject')}
                        </button>
                      </th>
                      <th className="p-4 text-left">
                        <div className="flex items-center">
                          <FaUserTie className="text-primary mr-2" />
                          <span className="text-dark2 font-medium">{t('parent.academicReport.absences.table.teacher')}</span>
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <button
                          className="flex items-center justify-center text-dark2 font-medium hover:text-primary mx-auto"
                          onClick={() => requestSort('date')}
                        >
                          <span>{t('parent.academicReport.absences.table.date')}</span>
                          {getSortIcon('date')}
                        </button>
                      </th>
                      <th className="p-4 text-center">{t('parent.academicReport.absences.table.status')}</th>
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
                          {getTranslatedSubject(absence.teacherWhoMarkedAbsence?.subject) || t('parent.academicReport.absences.unknownSubject')}
                        </td>
                        <td className="p-4 text-dark2">
                          {absence.teacherWhoMarkedAbsence?.name || t('parent.academicReport.absences.unknownTeacher')}
                        </td>
                        <td className="p-4 text-center text-dark2">
                          {absence.sessionDate 
                            ? new Date(absence.sessionDate).toLocaleString(i18n.language === 'de' ? 'de-DE' : i18n.language === 'ro' ? 'ro-RO' : 'en-US', { 
                                year: "numeric", 
                                month: "long", 
                                day: "numeric"
                              }) 
                            : t('parent.academicReport.absences.unknownDate')}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            absence.justified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {absence.justified 
                              ? t('parent.academicReport.absences.justified') 
                              : t('parent.academicReport.absences.unjustified')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile-Ansicht - Karten */}
              <div className="md:hidden">
                <div className="flex justify-between mb-3 px-2">
                  <button
                    className="flex items-center text-xs text-dark2 font-medium hover:text-primary"
                    onClick={() => requestSort('subject')}
                  >
                    <span>{t('parent.academicReport.absences.sortBySubject')}</span>
                    {getSortIcon('subject')}
                  </button>
                  <button
                    className="flex items-center text-xs text-dark2 font-medium hover:text-primary"
                    onClick={() => requestSort('date')}
                  >
                    <span>{t('parent.academicReport.absences.sortByDate')}</span>
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
                        {getTranslatedSubject(absence.teacherWhoMarkedAbsence?.subject) || t('parent.academicReport.absences.unknownSubject')}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          absence.justified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {absence.justified 
                            ? t('parent.academicReport.absences.justified') 
                            : t('parent.academicReport.absences.unjustified')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex items-center text-dark2">
                        <FaUserTie className="mr-2 text-xs" />
                        <span className="truncate">{absence.teacherWhoMarkedAbsence?.name || t('parent.academicReport.absences.unknownTeacher')}</span>
                      </div>
                      <div className="flex items-center text-dark2">
                        <FaCalendarTimes className="mr-2 text-xs" />
                        <span>
                          {absence.sessionDate 
                            ? new Date(absence.sessionDate).toLocaleString(i18n.language === 'de' ? 'de-DE' : i18n.language === 'ro' ? 'ro-RO' : 'en-US', { 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric"
                              })
                            : t('parent.academicReport.absences.unknownDate')}
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

  // Funktion zum Anzeigen des Inhalts basierend auf aktivem Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Hero Header - Gesamtübersicht */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t('parent.academicReport.overview.performanceSummary')}</h3>
                  <p className="text-indigo-100">
                    {t('parent.academicReport.overview.student')}: {studentData?.name || t('common.notAvailable')} | 
                    {t('parent.academicReport.overview.class')}: {studentData?.className || t('common.notAvailable')}
                  </p>
                  <p className="text-indigo-100">
                    {t('parent.academicReport.overview.schoolYear')}: {new Date().getFullYear()} | 
                    {t('parent.academicReport.overview.reportDate')}: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-center px-8 py-4">
                  <p className="text-indigo-100 text-sm">{t('parent.academicReport.overview.overallGPA')}</p>
                  <p className="text-3xl font-bold">{calculateGPA(grades)}</p>
                  <p className="text-indigo-100 text-xs">{t('parent.academicReport.overview.outOf10')}</p>
                </div>
                
                <div className="text-center px-8 py-4 border-t md:border-t-0 md:border-l md:border-r border-white border-opacity-30">
                  <p className="text-indigo-100 text-sm">{t('parent.academicReport.overview.absences')}</p>
                  <p className="text-3xl font-bold">{absencesTotal}</p>
                  <p className="text-indigo-100 text-xs">{t('parent.academicReport.overview.totalThisYear')}</p>
                </div>
                
                <div className="text-center px-8 py-4">
                  <p className="text-indigo-100 text-sm">{t('parent.academicReport.overview.performanceTrend')}</p>
                  <div className="text-xl font-bold text-white">
                    {getTrendIcon()}
                  </div>
                  <p className="text-indigo-100 text-xs">{t('parent.academicReport.overview.basedOnRecent')}</p>
                </div>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid mt-6">
              <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
                <FaBook className="text-primary mr-3" />
                {t('parent.academicReport.overview.subjectPerformance')}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...new Set(grades.map(grade => grade.subject))].map(subject => {
                  const subjectGrades = grades.filter(grade => grade.subject === subject);
                  const avgGrade = calculateGPA(subjectGrades);
                  const teacher = teachers.find(t => t.subject === subject);
                  
                  return (
                    <div key={subject} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-semibold text-dark">{getTranslatedSubject(subject)}</h5>
                          <p className="text-dark2 text-sm">{t('parent.academicReport.overview.teacher')}: {teacher?.name || t('common.notAvailable')}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${getGradeColor(avgGrade)} font-bold`}>
                          {avgGrade}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-dark2 text-sm mb-1">{t('parent.academicReport.overview.recentGrades')}:</p>
                        <div className="flex space-x-2">
                          {subjectGrades.slice(-3).map((grade, i) => (
                            <span key={i} className={`px-2 py-1 rounded ${getGradeColor(grade.grade)}`}>
                              {grade.grade}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      case "grades":
        return (
          <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid">
            <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
              <FaClipboardList className="text-primary mr-3" />
              {t('parent.academicReport.grades.history')}
            </h4>
            
            {grades.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        {t('parent.academicReport.grades.table.subject')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        {t('parent.academicReport.grades.table.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        {t('parent.academicReport.grades.table.grade')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        {t('parent.academicReport.grades.table.teacher')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-dark2 uppercase tracking-wider">
                        {t('parent.academicReport.grades.table.comments')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade, index) => {
                      // Finde Lehrer für dieses Fach
                      const teacher = teachers.find(t => t.subject === grade.subject);
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-dark">{getTranslatedSubject(grade.subject) || t('common.notAvailable')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-dark2">
                            {new Date(grade.sessionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full ${getGradeColor(grade.grade)} font-bold`}>
                              {grade.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-dark2">
                            {teacher?.name || t('common.notAvailable')}
                          </td>
                          <td className="px-6 py-4 text-dark2">
                            {grade.comment || t('parent.academicReport.grades.noComments')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-dark2 italic">{t('parent.academicReport.grades.noGradesFound')}</p>
            )}
          </div>
        );
      case "absences":
        return renderAbsencesContent();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-dark2 font-medium">{t('parent.academicReport.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl p-6 bg-light rounded-xl shadow-md border border-gray-200">
          <div className="text-center mb-6">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-3 mx-auto" />
            <h2 className="text-2xl font-bold text-dark mb-2">{t('parent.academicReport.errorTitle')}</h2>
            <p className="text-dark2">{error}</p>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={handleBackToDashboard}
              className="bg-primary text-dark px-4 py-2 rounded-lg hover:opacity-90 font-medium"
            >
              <FaArrowLeft className="inline mr-2" /> {t('parent.academicReport.backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Use the ParentNavbar component */}
      <ParentNavbar 
        activeView={activeView} 
        childName={studentData?.name}
        onToggleSidebar={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        {/* Desktop Header */}
        <header className="relative flex justify-center items-center mb-6 hidden md:flex">
          <button 
            onClick={() => navigate("/parent")}
            className="absolute left-0 text-primary hover:text-secondary"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">{t('parent.academicReport.title')}</h2>
          
          <div className="absolute right-0 flex space-x-3 print:hidden">
          </div>
        </header>

        {/* Mobile Header (different layout) */}
        <div className="md:hidden mb-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => navigate("/parent")}
              className="text-primary hover:text-secondary mr-4"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-xl font-bold text-dark">{t('parent.academicReport.title')}</h2>
          </div>
          
          <div className="flex space-x-3 print:hidden">
            <div className="flex-1">
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 print:hidden overflow-x-auto">
          <button
            className={`px-4 py-3 text-center flex-1 md:flex-none font-medium ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark2 hover:text-primary hover:border-b-2 hover:border-primary transition-colors'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine className="inline mr-2" /> {t('parent.academicReport.tabs.overview')}
          </button>
          <button
            className={`px-4 py-3 text-center flex-1 md:flex-none font-medium ${
              activeTab === 'grades'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark2 hover:text-primary hover:border-b-2 hover:border-primary transition-colors'
            }`}
            onClick={() => setActiveTab('grades')}
          >
            <FaBook className="inline mr-2" /> {t('parent.academicReport.tabs.grades')}
          </button>
          <button
            className={`px-4 py-3 text-center flex-1 md:flex-none font-medium ${
              activeTab === 'absences'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark2 hover:text-primary hover:border-b-2 hover:border-primary transition-colors'
            }`}
            onClick={() => setActiveTab('absences')}
          >
            <FaCalendarTimes className="inline mr-2" /> {t('parent.academicReport.tabs.absences')}
          </button>
        </div>

        {/* Report Content - Zeigt Inhalt basierend auf aktivem Tab */}
        <div className="space-y-6">
          {/* Seitentitel - nur beim Drucken sichtbar */}
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-bold text-center">{t('parent.academicReport.printTitle')}</h1>
            <p className="text-center text-dark2">{t('parent.academicReport.generatedOn')} {new Date().toLocaleDateString()}</p>
          </div>

          {/* Inhalt des aktiven Tabs */}
          {renderTabContent()}
          
          {/* Teacher Contact - Anzeigen wenn nicht im Abwesenheiten-Tab */}
          {activeTab !== "absences" && (
            <div className="bg-light p-6 rounded-xl shadow-md border border-gray-200 print:break-inside-avoid mt-6">
              <h4 className="text-xl font-semibold text-dark mb-4 flex items-center">
                <FaChalkboardTeacher className="text-primary mr-3" />
                {t('parent.academicReport.teacherContact.title')}
              </h4>
              
              {teachers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teachers.map((teacher, index) => (
                    <div key={index} className="flex items-center border rounded-lg p-3 bg-white">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center mr-4">
                        <FaChalkboardTeacher className="text-xl" />
                      </div>
                      <div>
                        <h5 className="font-semibold">{teacher.name}</h5>
                        <p className="text-dark2">{getTranslatedSubject(teacher.subject)}</p>
                        <p className="text-primary">{teacher.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-dark2 italic">{t('parent.academicReport.teacherContact.noInfo')}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed bottom-4 right-4 max-w-md z-50 rounded-lg shadow-lg p-4 flex items-start space-x-4 ${
            notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              notification.type === "success" ? "bg-green-200" : "bg-red-200"
            }`}>
              {notification.type === "success" ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              )}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
            </div>
            <button 
              className="flex-shrink-0 ml-1 text-gray-400 hover:text-gray-600"
              onClick={() => setNotification(null)}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicReportPage;