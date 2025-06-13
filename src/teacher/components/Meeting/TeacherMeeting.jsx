import React, { useState, useEffect } from 'react';
import { FaVideo, FaCalendarAlt, FaClock, FaEnvelope, FaCheckSquare, 
  FaRegSquare, FaArrowLeft, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import logo from "../../../assets/logo.png";
import Cookies from 'js-cookie';
import TeacherNavbar from '../TeacherNavbar';
import { useTranslation } from 'react-i18next';

const TeacherMeeting = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [parentEmails, setParentEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [meetingType, setMeetingType] = useState("immediate");
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("meetings");
  const [dataLoading, setDataLoading] = useState(true);
  const [meetingLink, setMeetingLink] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
    }
    
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [emailsResponse, teacherResponse] = await Promise.all([
          axios.get('/teachers/my-class/parent-emails'),
          axios.get(`/teachers/me`)
        ]);
        
        setParentEmails(emailsResponse.data);
        setSelectedEmails(emailsResponse.data);
        setTeacherData(teacherResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(t('teacher.meeting.errorLoadingEmails'));
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  const formatWithOffset = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .replace('Z', getOffsetString(date));
  };
  
  const getOffsetString = (date) => {
    const offsetMinutes = date.getTimezoneOffset();
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleStartMeeting = async () => {
    if (selectedEmails.length === 0) {
      setError(t('teacher.meeting.selectEmailError'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let requestBody = {
        parentEmails: selectedEmails
      };

      if (meetingType === "scheduled") {
        requestBody.startDateTime = formatWithOffset(startDateTime);
        requestBody.endDateTime = formatWithOffset(endDateTime);
      }
      
      const response = await axios.post('/meetings/start', requestBody);
      
      if (response.data) {
        setMeetingLink(response.data);
        setSuccess(meetingType === "immediate" ? 
          t('teacher.meeting.immediateSuccess') : 
          t('teacher.meeting.scheduledSuccess'));
      }
      
    } catch (error) {
      console.error("Error starting meeting:", error);
      setError(t('teacher.meeting.errorStarting'));
    } finally {
      setIsLoading(false);
    }
  };

  const validateSchedule = () => {
    if (endDateTime <= startDateTime) {
      setError(t('teacher.meeting.endTimeError'));
      return false;
    }
    return true;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      <TeacherNavbar 
        teacherData={teacherData}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logo={logo}
      />

      <div className="flex-1 p-4 md:p-8 bg-light">
      <header className="flex items-center mb-6 relative">
        <button 
          onClick={() => navigate("/teacher")}
          className="text-primary hover:text-secondary z-10 absolute left-0"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h2 className="text-2xl font-bold text-dark w-full text-center">
          {t('teacher.meeting.createNewMeeting')}
        </h2>
      </header>

        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-2xl font-bold mb-2">
            {t('teacher.meeting.virtualMeeting')}
          </h3>
          <p className="text-indigo-100 mb-4">{t('teacher.meeting.subtitle')}</p>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.meeting.stats.meetingType')}</p>
              <p className="text-lg font-bold">{meetingType === "immediate" ? t('teacher.meeting.startIn5Min') : t('teacher.meeting.scheduled')}</p>
            </div>
            <div className="text-center px-6 py-2 md:border-r border-white border-opacity-20">
              <p className="text-xs text-indigo-100">{t('teacher.meeting.stats.parents')}</p>
              <p className="text-lg font-bold">{parentEmails.length}</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs text-indigo-100">{t('teacher.meeting.stats.selected')}</p>
              <p className="text-lg font-bold">{selectedEmails.length}</p>
            </div>
          </div>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center min-h-[300px] bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">{t('teacher.meeting.loadingData')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center">
              <FaVideo className="mr-3 text-secondary" />
              {t('teacher.meeting.meetingDetails')}
            </h2>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            {meetingLink && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <FaVideo className="mr-2" />
                  {t('teacher.meeting.meetingCreatedSuccess')}
                </h3>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-2">{t('teacher.meeting.meetingLinkLabel')}</p>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <a 
                      href={meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-all mr-4"
                    >
                      {meetingLink}
                    </a>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopyLink}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center whitespace-nowrap"
                      >
                        <FaCopy className="mr-2" />
                        {copySuccess ? t('teacher.meeting.linkCopied') : t('teacher.meeting.copyLink')}
                      </button>
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center whitespace-nowrap"
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        {t('teacher.meeting.joinMeeting')}
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    {t('teacher.meeting.parentsNotified')}
                  </p>
                </div>
              </div>
            )}

            {!meetingLink && (
              <>
                <div className="mb-6">
                  <label className="block text-dark font-semibold mb-2">{t('teacher.meeting.meetingTypeLabel')}</label>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setMeetingType("immediate")}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        meetingType === "immediate" ? "bg-secondary text-white" : "bg-primary text-dark"
                      }`}
                    >
                      <FaClock className="inline mr-2" />
                      {t('teacher.meeting.startIn5Minutes')}
                    </button>
                    <button 
                      onClick={() => setMeetingType("scheduled")}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        meetingType === "scheduled" ? "bg-secondary text-white" : "bg-primary text-dark"
                      }`}
                    >
                      <FaCalendarAlt className="inline mr-2" />
                      {t('teacher.meeting.scheduleForLater')}
                    </button>
                  </div>
                </div>

                {meetingType === "scheduled" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-dark font-semibold mb-2">{t('teacher.meeting.startDateTime')}</label>
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-light"
                      />
                    </div>
                    <div>
                      <label className="block text-dark font-semibold mb-2">{t('teacher.meeting.endDateTime')}</label>
                      <DatePicker
                        selected={endDateTime}
                        onChange={(date) => setEndDateTime(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-light"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6 bg-light p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-dark font-semibold">{t('teacher.meeting.inviteParents')}</label>
                    <div className="space-x-2">
                      <button 
                        onClick={selectAllEmails}
                        className="text-secondary hover:underline text-sm"
                      >
                        {t('teacher.meeting.selectAll')}
                      </button>
                      <button 
                        onClick={deselectAllEmails}
                        className="text-secondary hover:underline text-sm"
                      >
                        {t('teacher.meeting.deselectAll')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-white">
                    {parentEmails.length === 0 ? (
                      <p className="text-dark2 text-center py-4">{t('teacher.meeting.noParentEmails')}</p>
                    ) : (
                      parentEmails.map((email, index) => (
                        <div 
                          key={index} 
                          className="flex items-center p-2 hover:bg-primary hover:bg-opacity-5 border-b last:border-b-0 transition-colors"
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
                  <p className="text-sm text-dark2 mt-2">
                    {t('teacher.meeting.selectedCount', { 
                      selected: selectedEmails.length, 
                      total: parentEmails.length 
                    })}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate('/teacher')}
                    className="bg-primary text-dark font-medium px-6 py-3 rounded-lg mr-3 hover:opacity-90 transition"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleStartMeeting}
                    disabled={isLoading}
                    className="bg-secondary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                        {t('common.processing')}
                      </>
                    ) : (
                      <>
                        <FaVideo className="mr-2" />
                        {meetingType === "immediate" ? t('teacher.meeting.startMeeting') : t('teacher.meeting.scheduleMeeting')}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMeeting;