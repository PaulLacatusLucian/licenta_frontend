import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaGraduationCap, FaSchool, FaCalendar, FaPlus, FaEye, 
  FaEdit, FaTrash, FaTimes, FaUserPlus, FaUtensils,
  FaStar, FaFileAlt, FaCheckSquare
} from 'react-icons/fa';
import axios from "../../../axiosConfig";

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

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const navigate = useNavigate();

  const sections = [
    {
      id: 'student',
      title: 'Student/Parent',
      icon: FaUserPlus,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      lightColor: 'bg-indigo-50',
      operations: [
        { 
          name: 'Create Student/Parent', 
          icon: FaPlus,
          path: '/admin/create-student'
        },
        { 
          name: 'View Students', 
          icon: FaEye,
          path: '/admin/students'
        },
        { 
          name: 'View Parents', 
          icon: FaEye,
          path: '/admin/parents'
        }
      ]
    },    
    {
      id: 'professor',
      title: 'Professor',
      icon: FaGraduationCap,
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      lightColor: 'bg-emerald-50',
      operations: [
        { 
          name: 'Create Professor', 
          icon: FaPlus,
          path: '/admin/create-teacher'
        },
        { 
          name: 'View Professors', 
          icon: FaEye,
          path: '/admin/teachers'
        }
      ]
    },
    {
      id: 'class',
      title: 'Class',
      icon: FaSchool,
      color: 'bg-violet-500',
      hoverColor: 'hover:bg-violet-600',
      lightColor: 'bg-violet-50',
      operations: [
        { 
          name: 'Create Class', 
          icon: FaPlus,
          path: '/admin/create-class'
        },
        { 
          name: 'View Classes', 
          icon: FaEye,
          path: '/admin/classes'
        },
        { 
          name: 'Go to Next Year', 
          icon: FaCalendar,
          action: () => handleGoToNextYear()
        }
      ]
    },
    {
      id: 'timetable',
      title: 'Timetable',
      icon: FaCalendar,
      color: 'bg-rose-500',
      hoverColor: 'hover:bg-rose-600',
      lightColor: 'bg-rose-50',
      operations: [
        { 
          name: 'Create Timetable', 
          icon: FaPlus,
          path: '/admin/class-schedule'
        },
        { 
          name: 'View Timetables', 
          icon: FaEye,
          path: '/admin/class-schedule'
        }
      ]
    },
    {
      id: 'grades',
      title: 'Grades',
      icon: FaStar,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      lightColor: 'bg-yellow-50',
      operations: [
        { 
          name: 'Create Grade', 
          icon: FaPlus,
          path: '/admin/grades/create'
        },
        { 
          name: 'Manage Grades', 
          icon: FaEye,
          path: '/admin/grades'
        }
      ]
    },
    {
      id: 'absences',
      title: 'Absences',
      icon: FaCalendar,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      lightColor: 'bg-red-50',
      operations: [
        { 
          name: 'Create Absence', 
          icon: FaPlus,
          path: '/admin/absences/create'
        },
        { 
          name: 'Manage Absences', 
          icon: FaEye,
          path: '/admin/absences'
        },
        { 
          name: 'Justify Absences', 
          icon: FaCheckSquare,
          path: '/admin/absences/justify'
        }
      ]
    },
    {
      id: 'catalog',
      title: 'Catalog',
      icon: FaFileAlt,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      lightColor: 'bg-cyan-50',
      operations: [
        { 
          name: 'View Catalog', 
          icon: FaEye,
          path: '/admin/catalog'
        }
      ]
    },
    {
      id: 'pastStudents',
      title: 'Past Students',
      icon: FaGraduationCap,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      lightColor: 'bg-blue-50',
      operations: [
        { 
          name: 'View Past Students', 
          icon: FaEye,
          path: '/admin/past-students'
        }
      ]
    },
    {
      id: "chef",
      title: "Bucătari",
      icon: FaUtensils,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      lightColor: "bg-orange-50",
      operations: [
        {
          name: "Înregistrează Bucătar",
          icon: FaPlus,
          path: "/admin/create-chef",
        },
        {
          name: "Vizualizează Bucătari",
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
  

  const handleGoToNextYear = async () => {
    try {
      const response = await axios.post("/api/year/start-new-year");
      alert("Anul școlar a fost avansat cu succes!");
    } catch (err) {
      console.error("Eroare la avansarea anului școlar:", err);
      alert("Eroare la avansarea anului școlar. Verificați logurile serverului.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panou de Administrare</h1>
        <p className="text-gray-500 mb-8">Gestionează elevii, profesorii, clasele, notele și absențele</p>
        
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
                  <p className="text-gray-500">Select an operation to continue</p>
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