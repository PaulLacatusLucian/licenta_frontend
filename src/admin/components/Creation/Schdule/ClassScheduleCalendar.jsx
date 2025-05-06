import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import CreateSchedule from "./AdminScheduleCreator";
import { ArrowLeft, RefreshCw, Book } from "lucide-react";

const ClassScheduleCalendar = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [classSchedule, setClassSchedule] = useState([]);
  const [scheduleModal, setScheduleModal] = useState({ 
    open: false, 
    day: "", 
    time: "",
    edit: false,
    scheduleData: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch the list of classes
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/classes");
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
          setSelectedClassName(response.data[0].name);
          fetchClassSchedule(response.data[0].id);
        } else {
          setIsLoading(false);
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError("Nu s-au putut încărca clasele. Verificați conexiunea.");
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch the schedule for a specific class
  const fetchClassSchedule = async (classId) => {
    setIsLoading(true);
    try {
      // Using the endpoint from your backend: /schedules/class/{classId}
      const response = await axios.get(`/schedules/class/${classId}`);
      setClassSchedule(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching class schedule:", error);
      setError("Nu s-a putut încărca orarul pentru această clasă.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle class change from dropdown
  const handleClassChange = (e) => {
    const classId = parseInt(e.target.value);
    setSelectedClass(classId);
    const selected = classes.find((cls) => cls.id === classId);
    if (selected) {
      setSelectedClassName(selected.name);
      fetchClassSchedule(classId);
    }
  };

  // Handle slot click to open the modal
  const handleSlotClick = (day, time, existingSchedule = null) => {
    if (existingSchedule) {
      setScheduleModal({ 
        open: true, 
        day, 
        time,
        edit: true,
        scheduleData: existingSchedule 
      });
    } else {
      setScheduleModal({ 
        open: true, 
        day, 
        time,
        edit: false,
        scheduleData: null 
      });
    }
  };

  // Close the modal
  const closeScheduleModal = () => {
    setScheduleModal({ 
      open: false, 
      day: "", 
      time: "",
      edit: false,
      scheduleData: null
    });
  };

  // Refresh schedule data
  const refreshSchedule = () => {
    if (selectedClass) {
      fetchClassSchedule(selectedClass);
    }
  };

  // Generate time slots
  const timeSlots = [
    { start: "8:00", end: "8:50", display: "8:00 - 8:50" },
    { start: "9:00", end: "9:50", display: "9:00 - 9:50" },
    { start: "10:00", end: "10:50", display: "10:00 - 10:50" },
    { start: "11:00", end: "11:50", display: "11:00 - 11:50" },
    { start: "12:00", end: "12:50", display: "12:00 - 12:50" },
    { start: "13:00", end: "13:50", display: "13:00 - 13:50" },
    { start: "14:00", end: "14:50", display: "14:00 - 14:50" },
    { start: "15:00", end: "15:50", display: "15:00 - 15:50" },
    { start: "16:00", end: "16:50", display: "16:00 - 16:50" }
  ];

  // Days of the week
  const weekDays = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];

  // Handle delete schedule
  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm("Ești sigur că vrei să ștergi această programare?")) {
      try {
        // Using the DELETE endpoint from your backend: /schedules/{id}
        await axios.delete(`/schedules/${scheduleId}`);
        // Refresh schedule after deletion
        fetchClassSchedule(selectedClass);
      } catch (error) {
        console.error("Error deleting schedule:", error);
        alert("A apărut o eroare la ștergerea programării.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg border shadow-sm">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </button>
          
          <h2 className="text-lg font-medium text-center flex-grow">Orar Clasă</h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Clasă:</span>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className="h-8 rounded border border-gray-300 bg-white px-2 py-1 text-sm appearance-none pr-8"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            <button 
              onClick={refreshSchedule}
              className="p-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
              title="Reîmprospătează datele"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="p-3 sm:p-4">
          {error && (
            <div className="mb-4 px-4 py-3 rounded text-sm bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border text-left text-sm font-medium bg-gray-50 text-gray-600 w-24 uppercase">
                      ZIUA / ORA
                    </th>
                    {timeSlots.map((slot, index) => (
                      <th key={index} className="p-2 border text-center text-sm font-medium bg-gray-50 text-gray-600 w-24">
                        <div>{slot.start}</div>
                        <div className="text-xs text-gray-400">{slot.end}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekDays.map((day) => (
                    <tr key={day}>
                      <td className="p-2 border text-sm font-medium text-gray-700">
                        {day}
                      </td>
                      {timeSlots.map((timeSlot) => {
                        const scheduleForSlot = classSchedule.find(
                          (schedule) =>
                            schedule.scheduleDay === day &&
                            schedule.startTime === timeSlot.start
                        );

                        return (
                          <td
                            key={`${day}-${timeSlot.start}`}
                            className="p-0 border relative group"
                          >
                            {scheduleForSlot ? (
                              <div 
                                className="p-1 h-full flex flex-col cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSlotClick(day, timeSlot.display, scheduleForSlot)}
                              >
                                <div className="text-xs font-medium flex items-start mb-1">
                                  <Book className="h-3.5 w-3.5 mr-1 text-gray-700 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{scheduleForSlot.subjects.join(", ")}</span>
                                </div>
                                {scheduleForSlot.teacher && (
                                  <div className="text-xs text-gray-600 ml-4">
                                    {scheduleForSlot.teacher.name}
                                  </div>
                                )}
                                <div className="hidden group-hover:flex absolute top-1 right-1 space-x-1">
                                  <button
                                    className="p-0.5 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSchedule(scheduleForSlot.id);
                                    }}
                                    title="Șterge"
                                  >
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center justify-center h-14 cursor-pointer text-xs text-gray-400 hover:bg-gray-50"
                                onClick={() => handleSlotClick(day, timeSlot.display)}
                              >
                                <span className="w-4 h-4 flex items-center justify-center border border-gray-300 rounded-full mr-1">
                                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </span>
                                <span>Adaugă</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 pt-2 border-t flex justify-end items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center">
              <Book className="h-4 w-4 text-gray-600 mr-1" />
              <span>Programat</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 flex items-center justify-center border border-gray-300 rounded-full mr-1">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
              <span>Disponibil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {scheduleModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-lg"
          >
            <CreateSchedule
              day={scheduleModal.day}
              time={scheduleModal.time}
              selectedClass={selectedClass}
              selectedClassName={selectedClassName}
              onClose={closeScheduleModal}
              onScheduleCreated={() => fetchClassSchedule(selectedClass)}
              editMode={scheduleModal.edit}
              scheduleData={scheduleModal.scheduleData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassScheduleCalendar;