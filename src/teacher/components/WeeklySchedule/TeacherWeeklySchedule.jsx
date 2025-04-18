import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import { FaCalendarAlt, FaArrowLeft, FaChalkboardTeacher, FaClock, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WeeklySchedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"
  const [currentView, setCurrentView] = useState("week"); // "week" or "day"
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/teachers/me/weekly-schedule`);
        setSchedule(response.data);
        setMessageType("");
        setMessage("");
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setMessageType("error");
        setMessage("Failed to load schedule. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const daysOfWeek = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];
  
  const formatTime = (time) => {
    return time; // Already formatted as expected
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setCurrentView("day");
  };

  const backToWeekView = () => {
    setCurrentView("week");
    setSelectedDay(null);
  };

  // Group classes by day
  const classesByDay = daysOfWeek.map(day => ({
    day,
    classes: schedule.filter(classItem => classItem.scheduleDay === day)
  }));

  return (
    <div className="bg-light min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/teacher')}
            className="flex items-center text-dark hover:text-secondary transition font-medium"
            aria-label="Back to Dashboard"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          {currentView === "day" && (
            <button
              onClick={backToWeekView}
              className="flex items-center text-dark hover:text-secondary transition font-medium"
            >
              <FaCalendarAlt className="mr-2" />
              Back to Week View
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
            <FaCalendarAlt className="mr-3 text-secondary" />
            {currentView === "week" ? "Weekly Schedule" : `Classes for ${selectedDay}`}
          </h2>

          {messageType === "error" && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <FaExclamationCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            </div>
          )}

          {messageType === "success" && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block p-3 bg-primary rounded-full">
                <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-dark2">Loading schedule...</p>
            </div>
          ) : (
            <>
              {currentView === "week" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classesByDay.map(({ day, classes }) => (
                    <div 
                      key={day} 
                      className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition"
                      onClick={() => handleDayClick(day)}
                    >
                      <h3 className="text-lg font-semibold mb-2 flex items-center text-dark">
                        <span className="bg-yellow-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                          {day.charAt(0)}
                        </span>
                        {day}
                      </h3>
                      
                      <div className="text-dark2">
                        {classes.length === 0 ? (
                          <p className="text-sm italic">No classes scheduled</p>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="space-y-4">
                    {schedule
                      .filter(classItem => classItem.scheduleDay === selectedDay)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((classItem, index) => (
                        <div 
                          key={`${classItem.id}-${index}`} 
                          className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start md:items-center mb-2 md:mb-0">
                              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 mr-3">
                                <FaChalkboardTeacher size={20} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-dark">
                                  {classItem.subjects.join(", ")}
                                </h4>
                                <p className="text-dark2 text-sm">Room: {classItem.className || 'Not specified'}</p>
                              </div>
                            </div>
                            
                            <div className="bg-yellow-100 px-4 py-2 rounded-lg flex items-center text-dark">
                              <FaClock className="mr-2 text-yellow-600" />
                              <span>{formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {classItem.studentClass && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Class: {classItem.studentClass.name}
                                </span>
                              )}
                              {classItem.teacher && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Teacher: {classItem.teacher.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {schedule.filter(classItem => classItem.scheduleDay === selectedDay).length === 0 && (
                      <div className="text-center py-8 text-dark2">
                        <FaCalendarAlt className="mx-auto mb-2 text-4xl text-yellow-300" />
                        <p>No classes scheduled for {selectedDay}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;