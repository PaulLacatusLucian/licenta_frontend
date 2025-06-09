import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaGraduationCap, FaSchool, FaCalendar, FaPlus, FaEye, 
  FaEdit, FaTrash, FaTimes, FaUserPlus, FaUtensils,
  FaStar, FaFileAlt, FaCheckSquare, FaGlobe, FaSignOutAlt
} from 'react-icons/fa';
import axios from "../../../axiosConfig";
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-8 w-full max-w-2xl m-4 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <FaGlobe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                lang.code === i18n.language ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm text-gray-700">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoToNextYear = async () => {
    try {
      const response = await axios.post("/api/year/start-new-year");
      alert(t('admin.dashboard.yearAdvancedSuccess'));
    } catch (err) {
      console.error("Error advancing school year:", err);
      alert(t('admin.dashboard.yearAdvancedError'));
    }
  };

  const handleLogout = () => {
    Cookies.remove("jwt-token");
    Cookies.remove("username");
    navigate("/login");
  };

  const sections = [
    {
      id: 'student',
      title: t('admin.dashboard.sections.studentParent.title'),
      icon: FaUserPlus,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      lightColor: 'bg-indigo-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.studentParent.createStudent'),
          icon: FaPlus,
          path: '/admin/create-student'
        },
        { 
          name: t('admin.dashboard.sections.studentParent.viewStudents'),
          icon: FaEye,
          path: '/admin/students'
        },
        { 
          name: t('admin.dashboard.sections.studentParent.viewParents'),
          icon: FaEye,
          path: '/admin/parents'
        }
      ]
    },    
    {
      id: 'professor',
      title: t('admin.dashboard.sections.professor.title'),
      icon: FaGraduationCap,
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      lightColor: 'bg-emerald-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.professor.createProfessor'),
          icon: FaPlus,
          path: '/admin/create-teacher'
        },
        { 
          name: t('admin.dashboard.sections.professor.viewProfessors'),
          icon: FaEye,
          path: '/admin/teachers'
        }
      ]
    },
    {
      id: 'class',
      title: t('admin.dashboard.sections.class.title'),
      icon: FaSchool,
      color: 'bg-violet-500',
      hoverColor: 'hover:bg-violet-600',
      lightColor: 'bg-violet-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.class.createClass'),
          icon: FaPlus,
          path: '/admin/create-class'
        },
        { 
          name: t('admin.dashboard.sections.class.viewClasses'),
          icon: FaEye,
          path: '/admin/classes'
        },
        { 
          name: t('admin.dashboard.sections.class.goToNextYear'),
          icon: FaCalendar,
          action: () => handleGoToNextYear()
        }
      ]
    },
    {
      id: 'timetable',
      title: t('admin.dashboard.sections.timetable.title'),
      icon: FaCalendar,
      color: 'bg-rose-500',
      hoverColor: 'hover:bg-rose-600',
      lightColor: 'bg-rose-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.timetable.createTimetable'),
          icon: FaPlus,
          path: '/admin/class-schedule'
        },
        { 
          name: t('admin.dashboard.sections.timetable.viewTimetables'),
          icon: FaEye,
          path: '/admin/class-schedule'
        }
      ]
    },
    {
      id: 'grades',
      title: t('admin.dashboard.sections.grades.title'),
      icon: FaStar,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      lightColor: 'bg-yellow-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.grades.createGrade'),
          icon: FaPlus,
          path: '/admin/grades/create'
        },
        { 
          name: t('admin.dashboard.sections.grades.manageGrades'),
          icon: FaEye,
          path: '/admin/grades'
        }
      ]
    },
    {
      id: 'absences',
      title: t('admin.dashboard.sections.absences.title'),
      icon: FaCalendar,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      lightColor: 'bg-red-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.absences.createAbsence'),
          icon: FaPlus,
          path: '/admin/absences/create'
        },
        { 
          name: t('admin.dashboard.sections.absences.manageAbsences'),
          icon: FaEye,
          path: '/admin/absences'
        },
        { 
          name: t('admin.dashboard.sections.absences.justifyAbsences'),
          icon: FaCheckSquare,
          path: '/admin/absences/justify'
        }
      ]
    },
    {
      id: 'catalog',
      title: t('admin.dashboard.sections.catalog.title'),
      icon: FaFileAlt,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      lightColor: 'bg-cyan-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.catalog.viewCatalog'),
          icon: FaEye,
          path: '/admin/catalog'
        }
      ]
    },
    {
      id: 'pastStudents',
      title: t('admin.dashboard.sections.pastStudents.title'),
      icon: FaGraduationCap,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      lightColor: 'bg-blue-50',
      operations: [
        { 
          name: t('admin.dashboard.sections.pastStudents.viewPastStudents'),
          icon: FaEye,
          path: '/admin/past-students'
        }
      ]
    },
    {
      id: "chef",
      title: t('admin.dashboard.sections.chefs.title'),
      icon: FaUtensils,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      lightColor: "bg-orange-50",
      operations: [
        {
          name: t('admin.dashboard.sections.chefs.registerChef'),
          icon: FaPlus,
          path: "/admin/create-chef",
        },
        {
          name: t('admin.dashboard.sections.chefs.viewChefs'),
          icon: FaEye,
          path: "/admin/chefs",
        }
      ],
    }
  ];

  const handleOperationClick = (section, operation) => {
    if (operation.action) {
      operation.action();
    } else if (operation.path) {
      navigate(operation.path);
    }
    setSelectedSection(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.dashboard.title')}</h1>
            <p className="text-gray-500">{t('admin.dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="text-sm font-medium">{t('admin.dashboard.logout')}</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section)}
              className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`${section.color} ${section.hoverColor} text-white p-4 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <section.icon className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
            </button>
          ))}
        </div>

        <Modal 
          isOpen={selectedSection !== null} 
          onClose={() => setSelectedSection(null)}
        >
          {selectedSection && (
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className={`${selectedSection.color} p-4 rounded-xl text-white shadow-lg`}>
                  <selectedSection.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedSection.title}
                  </h2>
                  <p className="text-gray-500">{t('admin.dashboard.selectOperation')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSection.operations.map((operation) => (
                  <button
                    key={operation.name}
                    onClick={() => handleOperationClick(selectedSection, operation)}
                    className={`flex items-center space-x-4 p-4 rounded-xl text-left transition-all duration-200
                      ${selectedSection.lightColor} hover:shadow-md border border-transparent
                      hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200`}
                  >
                    <div className={`${selectedSection.color} p-2 rounded-lg text-white shadow-sm`}>
                      <operation.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">{operation.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;