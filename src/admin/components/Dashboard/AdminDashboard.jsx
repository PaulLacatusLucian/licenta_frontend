import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, School } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Creează Student/Părinte',
      description: 'Adaugă un nou student și conturile părinților acestuia',
      icon: Users,
      path: '/admin/create-student',
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Creează Profesor',
      description: 'Adaugă un nou profesor în sistem',
      icon: UserPlus,
      path: '/admin/create-teacher',
      bgColor: 'bg-green-500'
    },
    {
      title: 'Creează Clasă',
      description: 'Creează o nouă clasă și asignează un diriginte',
      icon: School,
      path: '/admin/create-class',
      bgColor: 'bg-purple-500'
    },
    {
      title: 'Creează Orar',
      description: 'Creează orarul pentru fiecare clasa',
      icon: School,
      path: '/admin/class-schedule',
      bgColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Panou de Administrare</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="group bg-white p-6 rounded-lg border shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`${item.bgColor} text-white p-3 rounded-full group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;