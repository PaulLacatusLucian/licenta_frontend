import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, FaUserTie, FaBook } from "react-icons/fa";

const StudentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState([]);

  // Mock data for classes
  const mockClasses = [
    {
      date: "2024-12-19T09:00:00.000Z",
      subject: "Mathematics",
      time: "09:00 AM - 10:30 AM",
      room: "101",
      teacher: "Mr. Smith"
    },
    {
      date: "2024-12-19T11:00:00.000Z",
      subject: "Physics",
      time: "11:00 AM - 12:30 PM",
      room: "203",
      teacher: "Mrs. Johnson"
    },
    {
      date: "2024-12-19T14:00:00.000Z",
      subject: "Computer Science",
      time: "02:00 PM - 03:30 PM",
      room: "Lab 3",
      teacher: "Dr. Brown"
    },
    {
      date: "2024-12-20T10:00:00.000Z",
      subject: "Chemistry",
      time: "10:00 AM - 11:30 AM",
      room: "302",
      teacher: "Ms. Davis"
    },
    {
      date: "2024-12-20T13:00:00.000Z",
      subject: "English Literature",
      time: "01:00 PM - 02:30 PM",
      room: "201",
      teacher: "Mr. Wilson"
    },
    {
      date: "2024-12-23T09:00:00.000Z",
      subject: "Biology",
      time: "09:00 AM - 10:30 AM",
      room: "304",
      teacher: "Mrs. Thompson"
    },
    {
      date: "2024-12-23T11:00:00.000Z",
      subject: "History",
      time: "11:00 AM - 12:30 PM",
      room: "102",
      teacher: "Dr. Anderson"
    },
    {
      date: "2024-12-24T14:00:00.000Z",
      subject: "Art",
      time: "02:00 PM - 03:30 PM",
      room: "Art Studio",
      teacher: "Ms. Martinez"
    },
    {
      date: "2024-12-25T10:00:00.000Z",
      subject: "Physical Education",
      time: "10:00 AM - 11:30 AM",
      room: "Gym",
      teacher: "Mr. Roberts"
    },
    {
      date: "2024-12-26T13:00:00.000Z",
      subject: "Music",
      time: "01:00 PM - 02:30 PM",
      room: "Music Hall",
      teacher: "Mrs. White"
    }
  ];

  useEffect(() => {
    // Filter classes for the selected month
    const monthClasses = mockClasses.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate.getMonth() === currentDate.getMonth() &&
             classDate.getFullYear() === currentDate.getFullYear();
    });
    setClasses(monthClasses);
  }, [currentDate]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getClassesForDate = (date) => {
    return classes.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate.getDate() === date &&
             classDate.getMonth() === selectedDate.getMonth() &&
             classDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 rounded-lg"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayClasses = getClassesForDate(day);
      const isSelected = selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentDate.getMonth() &&
                        selectedDate.getFullYear() === currentDate.getFullYear();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`h-32 p-2 rounded-lg transition-all duration-300 cursor-pointer
            ${isSelected ? 'bg-primary text-white shadow-lg transform scale-105' : 'bg-white hover:bg-gray-50'}
            ${isToday ? 'ring-2 ring-secondary' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`font-bold ${isSelected ? 'text-white' : 'text-dark'}`}>{day}</span>
            {dayClasses.length > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-secondary text-white' : 'bg-secondary text-white'}`}>
                {dayClasses.length} classes
              </span>
            )}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayClasses.slice(0, 2).map((cls, index) => (
              <div
                key={index}
                className={`text-xs rounded px-2 py-1 truncate
                  ${isSelected ? 'bg-secondary bg-opacity-20 text-white' : 'bg-gray-100 text-dark'}`}
              >
                {cls.subject}
              </div>
            ))}
            {dayClasses.length > 2 && (
              <div className={`text-xs ${isSelected ? 'text-white' : 'text-secondary'} font-medium`}>
                +{dayClasses.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-8 bg-light min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Calendar Header */}
        <div className="bg-primary rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center text-white">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-secondary">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-4">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-dark mb-4">
              {formatDate(selectedDate)}
            </h3>
            <div className="space-y-4">
              {getClassesForDate(selectedDate.getDate()).map((cls, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FaBook className="text-secondary" />
                    <h4 className="font-semibold text-dark">{cls.subject}</h4>
                  </div>
                  <div className="space-y-2 ml-7">
                    <div className="flex items-center text-sm text-dark2">
                      <FaClock className="mr-2" />
                      {cls.time}
                    </div>
                    <div className="flex items-center text-sm text-dark2">
                      <FaMapMarkerAlt className="mr-2" />
                      Room {cls.room}
                    </div>
                    <div className="flex items-center text-sm text-dark2">
                      <FaUserTie className="mr-2" />
                      {cls.teacher}
                    </div>
                  </div>
                </div>
              ))}
              {getClassesForDate(selectedDate.getDate()).length === 0 && (
                <div className="text-center text-dark2 py-8">
                  No classes scheduled for this day
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;