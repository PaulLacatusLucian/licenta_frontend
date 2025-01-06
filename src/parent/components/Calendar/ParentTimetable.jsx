import React from "react";

const ParentTimetable = ({ schedules, className }) => {
  const weekdays = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Orarul Clasei - {className || "Clasă necunoscută"}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {weekdays.map((day) => (
            <div key={day} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-secondary mb-4">{day}</h3>
              <div className="space-y-4">
                {schedules
                  ?.filter((schedule) => schedule.scheduleDay === day)
                  .map((schedule, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-lg p-4 shadow transition-all duration-300 hover:shadow-md"
                    >
                      <h4 className="font-semibold text-dark mb-2">
                        {schedule.subjects?.join(", ") || "Fără materii"}
                      </h4>
                      <div className="text-sm text-gray-700">
                        ⏰ {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-sm text-gray-700">
                        🧑‍🏫 {schedule.teacher?.name || "Profesor necunoscut"}
                      </div>
                    </div>
                  ))}
                {schedules?.filter((schedule) => schedule.scheduleDay === day).length === 0 && (
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

export default ParentTimetable;
