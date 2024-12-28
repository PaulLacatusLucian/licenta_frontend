import React, { useState, useEffect } from "react";
import axios from "../../../../axiosConfig";
import CreateSchedule from "./AdminScheduleCreator";

const ClassScheduleCalendar = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [classSchedule, setClassSchedule] = useState([]);
  const [scheduleModal, setScheduleModal] = useState({ open: false, day: "", time: "" });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes");
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
          setSelectedClassName(response.data[0].name);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const fetchClassSchedule = async () => {
    if (selectedClass) {
      try {
        const response = await axios.get(`/schedules?classId=${selectedClass}`);
        setClassSchedule(response.data);
      } catch (error) {
        console.error("Error fetching class schedule:", error);
      }
    }
  };

  useEffect(() => {
    fetchClassSchedule();
  }, [selectedClass]);

  const handleSlotClick = (day, time) => {
    setScheduleModal({ open: true, day, time });
  };

  const closeScheduleModal = () => {
    setScheduleModal({ open: false, day: "", time: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Orarul Clasei</h1>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const selected = classes.find((cls) => cls.id === parseInt(e.target.value));
                setSelectedClassName(selected ? selected.name : "");
              }}
              className="h-9 rounded-md border bg-white px-3 text-sm shadow-sm focus:outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-sm font-semibold">Ziua</th>
              {[...Array(9)].map((_, index) => (
                <th key={index} className="p-3 text-left text-sm font-semibold">
                  {index + 8}:00 - {index + 8}:50
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["Luni", "Marți", "Miercuri", "Joi", "Vineri"].map((day) => (
              <tr key={day}>
                <td className="p-3 text-sm font-medium">{day}</td>
                {[...Array(9)].map((_, index) => {
                  const timeSlot = `${index + 8}:00 - ${index + 8}:50`;
                  const scheduleForSlot = classSchedule.find(
                    (schedule) =>
                      schedule.scheduleDay === day &&
                      schedule.startTime === `${index + 8}:00`
                  );

                  return (
                    <td
                      key={timeSlot}
                      className={`p-2 border cursor-pointer ${
                        scheduleForSlot ? "bg-green-100" : "hover:bg-gray-200"
                      }`}
                      onClick={() => !scheduleForSlot && handleSlotClick(day, timeSlot)}
                    >
                      <span className="text-sm text-gray-700">
                        {scheduleForSlot
                          ? `${scheduleForSlot.subjects} - ${scheduleForSlot.teacher?.name || "Unknown Teacher"}`
                          : timeSlot}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {scheduleModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <CreateSchedule
                day={scheduleModal.day}
                time={scheduleModal.time}
                selectedClass={selectedClass}
                selectedClassName={selectedClassName}
                onClose={closeScheduleModal}
                onScheduleCreated={fetchClassSchedule} // Sync the calendar after schedule creation
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassScheduleCalendar;
