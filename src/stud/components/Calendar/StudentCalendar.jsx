import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";

const WeeklySchedule = () => {
  const [classSchedule, setClassSchedule] = useState([]); // Schedule of the student's class
  const [studentClassName, setStudentClassName] = useState(""); // Class name for the logged-in student
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentClassSchedule = async () => {
      try {
        // Get userId from cookies
        const userId = Cookies.get("userId");
        if (!userId) {
          setError("Utilizatorul nu este autentificat.");
          return;
        }

        // Fetch student data to get the class ID
        const studentResponse = await axios.get(`/students/${userId}`);
        const studentClass = studentResponse.data.studentClass;

        if (!studentClass) {
          setError("Studentul nu are o clasă asociată.");
          return;
        }

        setStudentClassName(studentClass.name);

        // Fetch schedule for the student's class
        const scheduleResponse = await axios.get(`/classes/${studentClass.id}`);
        setClassSchedule(scheduleResponse.data.schedules || []);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Nu am putut încărca orarul. Vă rugăm să încercați din nou.");
      }
    };

    fetchStudentClassSchedule();
  }, []);

  const weekdays = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Orarul Săptămânal - {studentClassName}
        </h2>
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
                {classSchedule.filter((schedule) => schedule.scheduleDay === day).length === 0 && (
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
