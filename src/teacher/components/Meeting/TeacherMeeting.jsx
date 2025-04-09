import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaVideo, FaCalendarAlt, FaClock, FaEnvelope, FaCheckSquare, FaRegSquare, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TeacherMeeting = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [parentEmails, setParentEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [className, setClassName] = useState("5B"); // Default class or you could fetch available classes
  const [meetingType, setMeetingType] = useState("immediate"); // "immediate" or "scheduled"
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // Default 1 hour later
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchParentEmails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/teachers/my-class/parent-emails');
        setParentEmails(response.data);
        setSelectedEmails(response.data);
      } catch (error) {
        console.error("Error fetching parent emails:", error);
        setError("Failed to load parent emails. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParentEmails();
  }, []);

  const formatWithOffset = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .replace('Z', getOffsetString(date));
  };
  
  const getOffsetString = (date) => {
    const offsetMinutes = date.getTimezoneOffset(); // ex: -180 pentru România (UTC+3)
    const abs = Math.abs(offsetMinutes);
    const hours = String(Math.floor(abs / 60)).padStart(2, '0');
    const minutes = String(abs % 60).padStart(2, '0');
    const sign = offsetMinutes <= 0 ? '+' : '-';
    return `${sign}${hours}:${minutes}`;
  };
  

  const toggleEmailSelection = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const selectAllEmails = () => {
    setSelectedEmails([...parentEmails]);
  };

  const deselectAllEmails = () => {
    setSelectedEmails([]);
  };

  const handleStartMeeting = async () => {
    if (selectedEmails.length === 0) {
      setError("Please select at least one parent email");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let requestBody = {
        className: className,
        parentEmails: selectedEmails
      };

      if (meetingType === "scheduled") {
            requestBody.startDateTime = formatWithOffset(startDateTime);
            requestBody.endDateTime = formatWithOffset(endDateTime);
        }
            

      await axios.post('/meetings/start', requestBody);
      setSuccess(meetingType === "immediate" ? 
        "Meeting will start in 5 minutes. Invitations sent!" : 
        "Meeting scheduled successfully. Invitations sent!");
      
      setTimeout(() => {
        navigate('/teacher');
      }, 3000);
      
    } catch (error) {
      console.error("Error starting meeting:", error);
      setError("Failed to start meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateSchedule = () => {
    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      return false;
    }
    return true;
  };

  return (
    <div className="bg-light min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center text-dark hover:text-secondary transition"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
            <FaVideo className="mr-3 text-secondary" />
            Create New Meeting
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-dark font-semibold mb-2">Meeting Type</label>
            <div className="flex space-x-4">
              <button 
                onClick={() => setMeetingType("immediate")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  meetingType === "immediate" ? "bg-secondary text-white" : "bg-primary text-dark"
                }`}
              >
                <FaClock className="inline mr-2" />
                Start in 5 minutes
              </button>
              <button 
                onClick={() => setMeetingType("scheduled")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  meetingType === "scheduled" ? "bg-secondary text-white" : "bg-primary text-dark"
                }`}
              >
                <FaCalendarAlt className="inline mr-2" />
                Schedule for later
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-dark font-semibold mb-2">Class</label>
            <input 
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Enter class name"
            />
          </div>

          {meetingType === "scheduled" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-dark font-semibold mb-2">Start Date & Time</label>
                <DatePicker
                  selected={startDateTime}
                  onChange={(date) => setStartDateTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-dark font-semibold mb-2">End Date & Time</label>
                <DatePicker
                  selected={endDateTime}
                  onChange={(date) => setEndDateTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-dark font-semibold">Invite Parents</label>
              <div className="space-x-2">
                <button 
                  onClick={selectAllEmails}
                  className="text-secondary hover:underline text-sm"
                >
                  Select All
                </button>
                <button 
                  onClick={deselectAllEmails}
                  className="text-secondary hover:underline text-sm"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">Loading parent emails...</div>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                {parentEmails.length === 0 ? (
                  <p className="text-dark2">No parent emails available.</p>
                ) : (
                  parentEmails.map((email, index) => (
                    <div 
                      key={index} 
                      className="flex items-center p-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <button 
                        onClick={() => toggleEmailSelection(email)}
                        className="flex items-center w-full text-left"
                      >
                        {selectedEmails.includes(email) ? 
                          <FaCheckSquare className="text-secondary mr-3" /> : 
                          <FaRegSquare className="text-dark2 mr-3" />
                        }
                        <FaEnvelope className="text-dark2 mr-2" />
                        <span className={selectedEmails.includes(email) ? "text-dark" : "text-dark2"}>
                          {email}
                        </span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            <p className="text-sm text-dark2 mt-2">
              Selected: {selectedEmails.length} of {parentEmails.length} parents
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="bg-gray-200 text-dark font-semibold px-6 py-3 rounded-lg mr-3 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleStartMeeting}
              disabled={isLoading}
              className="bg-secondary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition flex items-center"
            >
              {isLoading ? "Processing..." : (
                <>
                  <FaVideo className="mr-2" />
                  {meetingType === "immediate" ? "Start Meeting" : "Schedule Meeting"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMeeting;