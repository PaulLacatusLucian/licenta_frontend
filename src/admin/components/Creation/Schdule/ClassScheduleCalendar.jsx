import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import CreateSchedule from "./AdminScheduleCreator";
import { ArrowLeft } from "lucide-react";

const ClassScheduleCalendar = () => {
  const [classes, setClasses] = useState([]); // List of all classes
  const [selectedClass, setSelectedClass] = useState(""); // ID of the selected class
  const [selectedClassName, setSelectedClassName] = useState(""); // Name of the selected class
  const [classSchedule, setClassSchedule] = useState([]); // Schedule of the selected class
  const [scheduleModal, setScheduleModal] = useState({ open: false, day: "", time: "" }); // Modal state
  const navigate = useNavigate(); // Navigation hook for redirect

  // Fetch the list of classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes");
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id); // Select the first class by default
          setSelectedClassName(response.data[0].name);
          fetchClassSchedule(response.data[0].id); // Set the schedule for the first class
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  // Fetch the schedule for a specific class
  const fetchClassSchedule = async (classId) => {
    try {
      const response = await axios.get(`/classes/${classId}`);
      setClassSchedule(response.data.schedules || []); // Update the schedule with fetched data
    } catch (error) {
      console.error("Error fetching class schedule:", error);
    }
  };

  // Handle class change from dropdown
  const handleClassChange = (e) => {
    const classId = parseInt(e.target.value);
    setSelectedClass(classId);
    const selected = classes.find((cls) => cls.id === classId);
    if (selected) {
      setSelectedClassName(selected.name);
      fetchClassSchedule(classId); // Update the schedule for the selected class
    }
  };

  // Handle slot click to open the modal
  const handleSlotClick = (day, time) => {
    setScheduleModal({ open: true, day, time });
  };

  // Close the modal
  const closeScheduleModal = () => {
    setScheduleModal({ open: false, day: "", time: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back button and class dropdown */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={handleClassChange}
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

        {/* Schedule Table */}
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
                          ? `${scheduleForSlot.subjects.join(", ")} - ${
                              scheduleForSlot.teacher?.name || "Unknown Teacher"
                            }`
                          : timeSlot}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Schedule Modal */}
        {scheduleModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <CreateSchedule
                day={scheduleModal.day}
                time={scheduleModal.time}
                selectedClass={selectedClass}
                selectedClassName={selectedClassName}
                onClose={closeScheduleModal}
                onScheduleCreated={() => fetchClassSchedule(selectedClass)} // Sync after schedule creation
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassScheduleCalendar;
