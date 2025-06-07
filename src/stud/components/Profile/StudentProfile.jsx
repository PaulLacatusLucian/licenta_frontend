import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import { 
  FaUserCircle, 
  FaMedal, 
  FaTrophy, 
  FaStar, 
  FaGraduationCap, 
  FaCalendarCheck, 
  FaBookReader, 
  FaAward, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaChartLine,
  FaClipboardCheck, 
  FaBell, 
  FaCalendarAlt, 
  FaEdit, 
  FaChevronRight, 
  FaClock, 
  FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../StudentNavbar";
import { useTranslation } from 'react-i18next';

const StudentProfile = () => {
  const { t } = useTranslation();
  const [studentData, setStudentData] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [grades, setGrades] = useState([]);
  const [totalAbsences, setTotalAbsences] = useState(0);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeView, setActiveView] = useState("profile");
  
  const navigate = useNavigate();

  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };

  // Funktion zur Übersetzung von Spezialisierungen
  const getTranslatedSpecialization = (specialization) => {
    if (specialization && t(`admin.classes.specializations.${specialization}`) !== `admin.classes.specializations.${specialization}`) {
      return t(`admin.classes.specializations.${specialization}`);
    }
    return specialization || '';
  };

  // Berechne Durchschnittsnote aus Notenarray
  const calculateAverageGrade = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return sum / grades.length;
  };

  // Prüfe ob Schüler Top-Performer ist (mindestens 2 Noten über 9)
  const isTopPerformer = (grades) => {
    if (!grades) return false;
    const highGrades = grades.filter(grade => grade.grade >= 9);
    return highGrades.length >= 2;
  };
  
  // Prüfe ob Schüler seine Noten im Laufe der Zeit verbessert hat
  const hasImprovedGrades = (grades) => {
    if (!grades || grades.length < 2) return false;
    
    // Sortiere Noten nach Datum
    const sortedGrades = [...grades].sort((a, b) => 
      new Date(a.sessionDate) - new Date(b.sessionDate)
    );
    
    // Prüfe ob letzte Note höher ist als erste Note
    return sortedGrades[sortedGrades.length - 1].grade > sortedGrades[0].grade;
  };

  // Prüfe ob Schüler perfekte Mathe-Noten hat
  const hasPerfectMathGrades = (grades) => {
    if (!grades) return false;
    const mathGrades = grades.filter(grade => {
      const originalSubject = grade.subject.toLowerCase();
      const translatedSubject = getTranslatedSubject(grade.subject).toLowerCase();
      return originalSubject.includes("math") || 
             originalSubject.includes("matematică") ||
             originalSubject.includes("matematica") ||
             translatedSubject.includes("math") ||
             translatedSubject.includes("mathe");
    });
    return mathGrades.length > 0 && mathGrades.every(grade => grade.grade >= 9.5);
  };

  // Bestimme ob Schüler in einer spezialisierten Klasse ist
  const isInSpecializedClass = (student) => {
    if (!student?.classSpecialization) return false;
    const originalSpec = student.classSpecialization;
    const translatedSpec = getTranslatedSpecialization(student.classSpecialization);
    return originalSpec.includes("Matematică-Informatică") || 
           originalSpec.includes("matematica-informatica") ||
           translatedSpec.includes("Mathematics-Computer Science") ||
           translatedSpec.includes("Mathematik-Informatik");
  };

  const achievements = [
    {
      id: "perfect-attendance",
      title: t('student.profile.achievements.perfectAttendance.title'),
      description: t('student.profile.achievements.perfectAttendance.description'),
      icon: FaCalendarCheck,
      condition: () => totalAbsences === 0,
      level: "gold"
    },
    {
      id: "honor-roll",
      title: t('student.profile.achievements.honorRoll.title'),
      description: t('student.profile.achievements.honorRoll.description'),
      icon: FaGraduationCap,
      condition: () => calculateAverageGrade(grades) >= 9,
      level: "platinum"
    },
    {
      id: "math-wizard",
      title: t('student.profile.achievements.mathWizard.title'),
      description: t('student.profile.achievements.mathWizard.description'),
      icon: FaChartLine,
      condition: () => hasPerfectMathGrades(grades),
      level: "diamond"
    },
    {
      id: "class-specialist",
      title: t('student.profile.achievements.stemSpecialist.title'),
      description: t('student.profile.achievements.stemSpecialist.description'),
      icon: FaClipboardCheck,
      condition: () => isInSpecializedClass(studentData),
      level: "silver"
    },
    {
      id: "improvement-star",
      title: t('student.profile.achievements.risingStar.title'),
      description: t('student.profile.achievements.risingStar.description'),
      icon: FaChartLine,
      condition: () => hasImprovedGrades(grades),
      level: "gold"
    },
    {
      id: "academic-excellence",
      title: t('student.profile.achievements.academicExcellence.title'),
      description: t('student.profile.achievements.academicExcellence.description'),
      icon: FaUserGraduate,
      condition: () => isTopPerformer(grades),
      level: "diamond"
    }
  ];

  const getLevelStyle = (level) => {
    switch (level) {
      case 'platinum':
        return 'bg-light border-gray-300';
      case 'diamond':
        return 'bg-primary bg-opacity-10 border-primary';
      case 'gold':
        return 'bg-yellow-100 border-yellow-300';
      case 'silver':
        return 'bg-gray-200 border-gray-400';
      default:
        return 'bg-light border-gray-200';
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        // Lade alle benötigten Daten parallel
        const [studentResponse, absencesResponse, gradesResponse, totalAbsencesResponse, upcomingClassesResponse] = await Promise.all([
          axios.get('/students/me'),
          axios.get('/absences/me'),
          axios.get('/grades/me'),
          axios.get('/students/me/total-absences'),
          axios.get('/students/me/upcoming-classes')
        ]);

        setStudentData(studentResponse.data);
        setAbsences(absencesResponse.data || []);
        setGrades(gradesResponse.data || []);
        setTotalAbsences(totalAbsencesResponse.data.total);
        
        // Für Debugging
        console.log("Upcoming classes data:", upcomingClassesResponse.data);
        
        setUpcomingClasses(upcomingClassesResponse.data || []);
        setImagePreview(studentResponse.data?.profileImage);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(t('student.profile.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAllData();
  }, [t]);
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setIsLoading(true);
      const response = await axios.post(`/students/me/profile-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImagePreview(response.data.imageUrl);
      setStudentData(prev => ({ ...prev, profileImage: response.data.imageUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(t('student.profile.errorUploadingImage'));
    } finally {
      setIsLoading(false);
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
          <p className="text-dark2 font-medium">{t('student.profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="text-xl text-red-500 p-8 bg-light rounded-xl shadow-md border border-gray-200 max-w-lg">
          <h2 className="font-bold text-2xl mb-4">{t('student.profile.somethingWentWrong')}</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 bg-primary text-dark px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            {t('student.profile.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const averageGrade = calculateAverageGrade(grades);
  const earnedAchievements = achievements.filter(achievement => achievement.condition());

  // Funktion zur Formatierung von Datum und Zeit
  const formatTimeFromISO = (isoString) => {
    if (!isoString) return "";
    if (typeof isoString !== 'string') return isoString;
    
    // Prüfe ob der String ein 'T' enthält, das Datum von Zeit trennt
    if (isoString.includes('T')) {
      return isoString.split('T')[1].substring(0, 5);
    }
    
    return isoString;
  };

  const renderProfileContent = () => {
    return (
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-md">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                   {imagePreview ? (
                    <img
                      src={`http://localhost:8080${imagePreview}`}
                      alt={t('student.profile.childProfileAlt')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                  <FaUserCircle className="text-4xl text-gray-300 bg-gray-100 w-full h-full p-2" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-300 transform">
                  <div className="text-center">
                    <FaEdit className="text-2xl mb-1 mx-auto" />
                    <span className="text-sm font-medium">{t('student.profile.change')}</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              <div className="text-center md:text-left md:flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{studentData?.name}</h1>
                <p className="text-indigo-100 mb-4">{t('student.profile.studentAt', { 
                  className: studentData?.className, 
                  specialization: getTranslatedSpecialization(studentData?.classSpecialization) 
                })}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">{t('student.profile.stats.averageGrade')}</p>
                    <p className="text-2xl font-bold">{averageGrade.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">{t('student.profile.stats.absences')}</p>
                    <p className="text-2xl font-bold">{totalAbsences}</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 px-5 py-3 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80">{t('student.profile.stats.achievements')}</p>
                    <p className="text-2xl font-bold">{earnedAchievements.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-light rounded-xl shadow-md border border-gray-200">
          <div className="px-4">
            <nav className="flex space-x-8">
              {[
                { id: "overview", label: t('student.profile.tabs.overview'), icon: FaUserCircle },
                { id: "achievements", label: t('student.profile.tabs.achievements'), icon: FaTrophy },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 relative font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-1">
                <div className="bg-light rounded-xl shadow-md border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                    <FaUserCircle className="text-primary mr-3" />
                    {t('student.profile.personalInfo.title')}
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: t('student.profile.personalInfo.email'), value: studentData?.email || t('common.notAvailable'), icon: "📧" },
                      { label: t('student.profile.personalInfo.classTeacher'), value: studentData?.classTeacher?.name || t('common.notAvailable'), icon: "👨‍🏫" },
                      { label: t('student.profile.personalInfo.specialization'), value: getTranslatedSpecialization(studentData?.classSpecialization) || t('common.notAvailable'), icon: "🎓" },
                      { label: t('student.profile.personalInfo.phone'), value: studentData?.phoneNumber || t('common.notAvailable'), icon: "📱" },
                      { label: t('student.profile.personalInfo.studentId'), value: studentData?.id || t('common.notAvailable'), icon: "🪪" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 text-xl mr-3">{item.icon}</div>
                        <div className="flex-1">
                          <p className="text-gray-500 text-sm">{item.label}</p>
                          <p className="text-dark font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-light rounded-xl shadow-md border border-gray-200 p-6 mt-6">
                  <h2 className="text-xl font-bold text-dark mb-4 flex items-center">
                    <FaChartLine className="text-primary mr-3" />
                    {t('student.profile.quickStats.title')}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary bg-opacity-10 p-4 rounded-lg text-center border border-primary border-opacity-20">
                      <p className="text-primary text-sm mb-1">{t('student.profile.quickStats.totalGrades')}</p>
                      <p className="text-3xl font-bold text-primary">{grades.length}</p>
                    </div>
                    <div className="bg-secondary bg-opacity-10 p-4 rounded-lg text-center border border-secondary border-opacity-20">
                      <p className="text-secondary text-sm mb-1">{t('student.profile.quickStats.absences')}</p>
                      <p className="text-3xl font-bold text-secondary">{totalAbsences}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                      <p className="text-blue-600 text-sm mb-1">{t('student.profile.quickStats.highestGrade')}</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {grades.length > 0 ? Math.max(...grades.map(g => g.grade)).toFixed(2) : t('common.notAvailable')}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                      <p className="text-green-600 text-sm mb-1">{t('student.profile.quickStats.perfectSubjects')}</p>
                      <p className="text-3xl font-bold text-green-600">
                        {grades
                          .filter(g => g.grade === 10)
                          .filter((g, i, arr) => arr.findIndex(t => t.subject === g.subject) === i)
                          .length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2">
                {/* Top Achievements */}
                <div className="bg-light rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-dark flex items-center">
                      <FaTrophy className="text-primary mr-3" />
                      {t('student.profile.topAchievements')}
                    </h2>
                    <button 
                      onClick={() => setActiveTab("achievements")}
                      className="text-primary text-sm font-medium hover:text-secondary flex items-center"
                    >
                      {t('student.profile.viewAll')} <FaChevronRight className="ml-1" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {earnedAchievements.slice(0, 3).map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${getLevelStyle(achievement.level)}`}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl text-primary bg-white p-3 rounded-full shadow-md">
                              <achievement.icon />
                            </div>
                            <div>
                              <h3 className="font-bold text-dark flex items-center gap-2">
                                {achievement.title}
                                <FaAward className="text-yellow-500" />
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {earnedAchievements.length === 0 && (
                      <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                        <FaTrophy className="text-gray-400 text-4xl mx-auto mb-3" />
                        <p className="text-gray-500">{t('student.profile.noAchievementsYet')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Grades */}
                <div className="bg-light rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-dark flex items-center">
                      <FaGraduationCap className="text-primary mr-3" />
                      {t('student.profile.recentGrades.title')}
                    </h2>
                    <button 
                      onClick={() => navigate("/stud/grades")}
                      className="text-primary text-sm font-medium hover:text-secondary flex items-center"
                    >
                      {t('student.profile.viewAll')} <FaChevronRight className="ml-1" />
                    </button>
                  </div>

                  {grades.length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-light bg-opacity-50">
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('student.profile.recentGrades.subject')}</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('student.profile.recentGrades.grade')}</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('student.profile.recentGrades.teacher')}</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('student.profile.recentGrades.date')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {grades.slice(0, 3).map((grade, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-light bg-opacity-30" : ""}>
                                <td className="py-3 px-4 text-sm text-dark">{getTranslatedSubject(grade.subject)}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    grade.grade >= 9 ? 'bg-green-100 text-green-800' : 
                                    grade.grade >= 7 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {grade.grade.toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{grade.teacherName}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{new Date(grade.sessionDate).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                      <FaGraduationCap className="text-gray-400 text-4xl mx-auto mb-3" />
                      <p className="text-gray-500">{t('student.profile.recentGrades.noGrades')}</p>
                    </div>
                  )}
                </div>

                {/* Upcoming Classes/Calendar */}
                <div className="bg-light rounded-xl shadow-md border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                    <FaCalendarAlt className="text-primary mr-3" />
                    {t('student.profile.upcomingSchedule.title')}
                  </h2>
                  
                  <div className="space-y-4">
                    {upcomingClasses && upcomingClasses.length > 0 ? (
                      upcomingClasses.slice(0, 3).map((classSession, index) => {
                        // Für Debugging
                        console.log("Class session data:", classSession);
                        
                        return (
                          <div key={index} className="flex items-center p-4 bg-white rounded-lg border border-gray-200 border-l-4 border-l-primary">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-lg mr-4">
                              <FaClock className="text-primary text-xl" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-dark">
                                {getTranslatedSubject(classSession.subject) || 
                                getTranslatedSubject(classSession.classDiscipline?.subject) ||
                                getTranslatedSubject(classSession.classSession?.subject) || 
                                (classSession.subjects && classSession.subjects.length > 0 ? getTranslatedSubject(classSession.subjects[0]) : t('student.profile.upcomingSchedule.classSession'))}
                              </p>
                              <p className="text-sm text-gray-500">
                                {classSession.scheduleDay ? `${classSession.scheduleDay}, ` : ""}
                                {classSession.startTime ? formatTimeFromISO(classSession.startTime) : ""}
                                {classSession.startTime && classSession.endTime ? " - " : ""}
                                {classSession.endTime ? formatTimeFromISO(classSession.endTime) : ""}
                                {(classSession.scheduleDay || classSession.startTime) ? "" : t('student.profile.upcomingSchedule.scheduleTBD')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {classSession.teacher?.name || classSession.teacherName || ""}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                        <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-3" />
                        <p className="text-gray-500">{t('student.profile.upcomingSchedule.noClasses')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="bg-light rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                <FaTrophy className="text-primary mr-3" />
                {t('student.profile.allAchievements')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => {
                  const isEarned = achievement.condition();
                  return (
                    <div
                      key={achievement.id}
                      className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                        isEarned ? getLevelStyle(achievement.level) : 'bg-gray-100 border-gray-200 opacity-70'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-full ${
                            isEarned ? 'bg-white text-primary' : 'bg-gray-200 text-gray-400'
                          } text-3xl shadow`}>
                            <achievement.icon />
                          </div>
                          <div>
                            <h3 className="font-bold text-dark flex items-center gap-2">
                              {achievement.title}
                              {isEarned && (
                                <FaAward className={`${
                                  achievement.level === 'diamond' ? 'text-purple-500' :
                                  achievement.level === 'platinum' ? 'text-gray-500' :
                                  achievement.level === 'gold' ? 'text-yellow-500' : 'text-gray-400'
                                }`} />
                              )}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                            <div className="mt-3">
                              <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                                isEarned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {isEarned ? t('student.profile.earned') : t('student.profile.notEarned')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
          <h2 className="text-2xl font-bold text-dark">{t('student.profile.title')}</h2>
          <div className="flex items-center">
            <div className="flex items-center">
            </div>
          </div>
        </header>
        
        {renderProfileContent()}
      </div>
    </div>
  );
};

export default StudentProfile;