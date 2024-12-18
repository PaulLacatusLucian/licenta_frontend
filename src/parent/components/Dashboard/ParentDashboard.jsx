import React, { useState } from "react";
import { 
  FaHome, 
  FaUserCircle, 
  FaChartLine, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaUtensils, 
  FaRobot, 
  FaSignOutAlt, 
  FaSearch, 
  FaChalkboardTeacher,
  FaClock,
  FaBook,
  FaEnvelope,
  FaHandHoldingMedical
} from "react-icons/fa";

const ParentDashboard = () => {
  const [activeView, setActiveView] = useState('home');

  // Mock data for child's academic information
  const childData = {
    name: "Emily Johnson",
    class: {
      name: "9B",
      classTeacher: "Mr. David Smith",
      specialization: "Science Stream"
    },
    performance: {
      overallGrade: "A",
      subjects: [
        { name: "Mathematics", grade: "A+", progress: "Excellent" },
        { name: "Science", grade: "A", progress: "Very Good" },
        { name: "English", grade: "B+", progress: "Good" }
      ]
    },
    absences: {
      total: 4,
      lastMonth: 2
    },
    upcomingEvents: [
      {
        type: "Parent-Teacher Meeting",
        date: "December 20, 2024",
        time: "4:00 PM",
        teacher: "Mr. David Smith"
      },
      {
        type: "Science Project Presentation",
        date: "January 15, 2025",
        time: "10:00 AM",
        location: "School Auditorium"
      }
    ],
    healthTracker: {
      lastCheckup: "November 15, 2024",
      vaccinations: [
        { name: "Annual Flu Shot", status: "Completed" },
        { name: "HPV Vaccine", status: "Pending" }
      ]
    },
    foodOrders: [
      {
        date: "Today",
        lunch: "Grilled Chicken with Vegetables",
        dinner: "Vegetarian Pasta"
      },
      {
        date: "Tomorrow",
        lunch: "Fish and Salad",
        dinner: "Roasted Vegetables with Tofu"
      }
    ]
  };

  const renderHomeContent = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
        <h3 className="text-2xl font-bold text-dark mb-4">Welcome, Parent of {childData.name}!</h3>
        <p className="text-dark2">Stay informed about your child's academic journey.</p>
      </div>

      {/* Academic Performance */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaChartLine className="text-2xl text-primary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Academic Performance</h4>
        </div>
        <div>
          <p className="text-lg font-bold mb-3">Overall Grade: <span className="text-green-600">{childData.performance.overallGrade}</span></p>
          {childData.performance.subjects.map((subject, index) => (
            <div key={index} className="mb-2 border-b pb-2 last:border-b-0">
              <div className="flex justify-between">
                <span className="font-semibold">{subject.name}</span>
                <span className="font-bold text-primary">{subject.grade}</span>
              </div>
              <p className="text-sm text-dark2">{subject.progress}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaClock className="text-2xl text-primary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Upcoming Events</h4>
        </div>
        {childData.upcomingEvents.map((event, index) => (
          <div key={index} className="mb-4 border-b pb-3 last:border-b-0">
            <h5 className="font-semibold text-dark">{event.type}</h5>
            <div className="flex justify-between text-dark2 text-sm">
              <span>{event.date}</span>
              <span>{event.time}</span>
            </div>
            {event.teacher && <p className="text-sm">With: {event.teacher}</p>}
            {event.location && <p className="text-sm">Location: {event.location}</p>}
          </div>
        ))}
      </div>

      {/* Health Tracker */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaHandHoldingMedical className="text-2xl text-primary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Health Tracker</h4>
        </div>
        <div>
          <p className="mb-3">Last Medical Checkup: <span className="font-semibold">{childData.healthTracker.lastCheckup}</span></p>
          <h5 className="text-dark font-medium mb-2">Vaccinations</h5>
          {childData.healthTracker.vaccinations.map((vax, index) => (
            <div key={index} className="flex justify-between items-center text-sm mb-2">
              <span>{vax.name}</span>
              <span className={`font-bold ${vax.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {vax.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Food Order */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaUtensils className="text-2xl text-primary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Food Order</h4>
        </div>
        {childData.foodOrders.map((order, index) => (
          <div key={index} className="mb-4 border-b pb-3 last:border-b-0">
            <h5 className="font-semibold text-dark">{order.date}</h5>
            <div className="flex justify-between text-dark2 text-sm">
              <span>Lunch: {order.lunch}</span>
              <span>Dinner: {order.dinner}</span>
            </div>
          </div>
        ))}
        <button className="mt-4 w-full bg-secondary text-white py-2 rounded-lg hover:opacity-90">
          Order Meals
        </button>
      </div>

      {/* Communication */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <FaEnvelope className="text-2xl text-primary mr-3" />
          <h4 className="text-xl font-semibold text-dark">Communication</h4>
        </div>
        <button className="w-full bg-primary text-white py-2 rounded-lg mb-3 hover:opacity-90">
          Schedule Teacher Meeting
        </button>
        <button className="w-full bg-secondary text-white py-2 rounded-lg hover:opacity-90">
          Send Message to Class Teacher
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-light">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-primary text-dark p-6 shadow-xl flex flex-col">
        <div className="flex items-center justify-center mb-10">
          <img 
            src="/api/placeholder/100/100" 
            alt="School Logo" 
            className="w-16 h-16 rounded-full border-4 border-white"
          />
          <h2 className="text-2xl font-bold ml-4">Schoolie</h2>
        </div>
        
        <nav className="flex-grow">
          <ul className="space-y-2">
            {[
              { icon: FaHome, label: "Home", view: 'home' },
              { icon: FaUserCircle, label: "Child's Profile", view: 'profile' },
              { icon: FaBook, label: "Academic Report", view: 'report' },
              { icon: FaChalkboardTeacher, label: "Teacher Meetings", view: 'meetings' },
              { icon: FaCalendarAlt, label: "School Calendar", view: 'calendar' },
              { icon: FaSignOutAlt, label: "Logout", view: 'logout' }
            ].map(({ icon: Icon, label, view }) => (
              <li key={view}>
                <button 
                  onClick={() => view === 'logout' ? handleLogout() : setActiveView(view)}
                  className="w-full text-left flex items-center p-3 hover:bg-secondary rounded-lg transition-colors duration-200"
                >
                  <Icon className="mr-3 text-xl" />
                  <span className="font-medium">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-light">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          {/* Search Bar */}
          <div className="flex-grow max-w-xl mr-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark2" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white shadow-md text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex items-center">
            <FaUserCircle className="text-4xl text-dark2 mr-4" />
            <div>
              <p className="font-semibold text-dark">Parent of {childData.name}</p>
              <p className="text-sm text-dark2">{childData.class.name}</p>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        {activeView === 'home' && renderHomeContent()}
      </div>
    </div>
  );
};

export default ParentDashboard;