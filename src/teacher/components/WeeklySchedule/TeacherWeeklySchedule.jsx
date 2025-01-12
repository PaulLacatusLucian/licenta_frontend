import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const WeeklySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/teachers/${userId}/weekly-schedule`); // Endpoint pentru orar
        setSchedule(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError("Failed to load schedule. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchSchedule();
    }
  }, [userId]);

  const daysOfWeek = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"]; // Zilele săptămânii conform răspunsului backend

  return (
    <div className="p-6 bg-light min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-dark font-medium rounded-lg shadow-md hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
        >
          ⬅ Back
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-dark">Weekly Schedule</h2>
      {isLoading && <p className="text-center text-green-600">Loading schedule...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map((day) => (
            <div key={day} className="bg-white p-6 rounded-xl shadow-md">
              <h4 className="text-xl font-semibold mb-4 text-dark">{day}</h4>
              <div className="space-y-4">
                {schedule
                  .filter((classItem) => classItem.scheduleDay === day)
                  .map((classItem) => (
                    <div key={classItem.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-dark">
                            {classItem.subjects.join(", ")}
                          </p>
                          <p className="text-dark2 text-sm">Teacher: {classItem.teacher.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-dark">{classItem.startTime} - {classItem.endTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                {schedule.filter((classItem) => classItem.scheduleDay === day).length === 0 && (
                  <p className="text-dark2 text-sm">No classes scheduled.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;
