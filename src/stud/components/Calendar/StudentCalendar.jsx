import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WeeklySchedule = () => {
  const [classSchedule, setClassSchedule] = useState([]); // Schedule of the student's class
  const [studentClassName, setStudentClassName] = useState(""); // Class name for the logged-in student
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const scheduleResponse = await axios.get(`/schedules/me/weekly`);
        const scheduleData = scheduleResponse.data;

        if (!scheduleData || scheduleData.length === 0) {
          setError("Nu a fost găsit niciun orar.");
          return;
        }

        setClassSchedule(scheduleData);
      } catch (err) {
        console.error("Eroare la încărcarea orarului:", err);
        setError("Nu am putut încărca orarul. Vă rugăm să încercați din nou.");
      }
    };

    fetchSchedule();
  }, []);

  const weekdays = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
            onClick={() => navigate("/stud")}
            className="mb-6 flex items-center text-dark2 hover:text-primary transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center mb-6">
          <FaCalendarAlt className="text-3xl text-primary mr-3" />
          <h2 className="text-2xl font-bold text-primary">
            Orarul Săptămânal
          </h2>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-6">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {weekdays.map((day) => (
            <div key={day} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-secondary mb-4">{day}</h3>
              <div className="space-y-4">
                {classSchedule
                  .filter((schedule) => schedule.scheduleDay === day)
                  .map((schedule, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-lg p-4 shadow transition-all duration-300 hover:shadow-md"
                    >
                      <h4 className="font-semibold text-dark mb-2">
                        {schedule.subjects.join(", ")}
                      </h4>
                      <div className="text-sm text-gray-700">
                        ⏰ {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-sm text-gray-700">
                        🧑‍🏫 {schedule.teacher?.name || "Profesor necunoscut"}
                      </div>
                    </div>
                  ))}
                {classSchedule.filter(
                  (schedule) => schedule.scheduleDay === day
                ).length === 0 && (
                  <div className="text-gray-500">Nicio oră programată</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;