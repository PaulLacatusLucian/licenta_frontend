import React, { useEffect, useState } from "react";
import axios from "../../../axiosConfig";
import { FaUserCircle, FaTrophy, FaCalendarCheck, FaGraduationCap, FaBookReader, 
         FaAward, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

const ChildProfile = ({ studentData }) => {
  const achievements = [
    {
      id: "perfect-attendance",
      title: "Perfect Attendance",
      description: "No absences this semester",
      icon: FaCalendarCheck,
      condition: (student) => student?.absences === 0,
      level: "gold",
    },
    {
      id: "honor-roll",
      title: "Honor Roll Scholar",
      description: "Maintained an average grade above 90%",
      icon: FaGraduationCap,
      condition: (student) => student?.averageGrade >= 90,
      level: "platinum",
    },
    {
      id: "active-learner",
      title: "Active Learner",
      description: "Participated in 5+ school activities",
      icon: FaBookReader,
      condition: (student) => student?.activitiesCount >= 5,
      level: "silver",
    },
    {
      id: "class-leader",
      title: "Class Leader",
      description: "Demonstrated exceptional leadership skills",
      icon: FaChalkboardTeacher,
      condition: (student) => student?.isClassLeader,
      level: "gold",
    },
    {
      id: "academic-excellence",
      title: "Academic Excellence",
      description: "Top performer in multiple subjects",
      icon: FaUserGraduate,
      condition: (student) => student?.topPerformer,
      level: "diamond",
    },
  ];

  const getLevelStyle = (level) => {
    switch (level) {
      case "platinum":
        return "bg-gradient-to-r from-gray-100 to-gray-300";
      case "diamond":
        return "bg-gradient-to-r from-blue-200 to-purple-200";
      case "gold":
        return "bg-gradient-to-r from-yellow-200 to-yellow-400";
      case "silver":
        return "bg-gradient-to-r from-gray-200 to-gray-400";
      default:
        return "bg-gray-100";
    }
  };

  if (!studentData) {
    return <p>No student data available.</p>;
  }

  return (
    <div className="p-8 bg-light min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-primary rounded-xl shadow-lg p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary opacity-10 rounded-full transform -translate-x-24 translate-y-24"></div>

          <div className="flex items-center gap-8 relative z-10">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-secondary shadow-xl">
              <img
                src={studentData?.profileImage || "/api/placeholder/160/160"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">{studentData?.name}</h1>
              <div className="flex items-center gap-6">
                <div className="bg-secondary bg-opacity-20 px-4 py-2 rounded-lg">
                  <p className="text-sm opacity-80">Class</p>
                  <p className="font-semibold">{studentData?.studentClass?.name}</p>
                </div>
                <div className="bg-secondary bg-opacity-20 px-4 py-2 rounded-lg">
                  <p className="text-sm opacity-80">Student ID</p>
                  <p className="font-semibold">{studentData?.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                <FaUserCircle className="text-secondary mr-3" />
                Personal Information
              </h2>
              <div className="space-y-6">
                {[
                  { label: "Email", value: studentData?.email },
                  { label: "Teacher", value: studentData?.studentClass?.classTeacher },
                  { label: "Specialization", value: studentData?.studentClass?.specialization },
                  { label: "Phone", value: studentData?.phoneNumber },
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-secondary text-sm font-medium mb-1">{item.label}</p>
                    <p className="text-dark font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-dark mb-6 flex items-center">
                <FaTrophy className="text-secondary mr-3" />
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const isEarned = achievement.condition(studentData);
                  return (
                    <div
                      key={achievement.id}
                      className={`relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        isEarned ? getLevelStyle(achievement.level) : "bg-gray-100 opacity-50"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`text-4xl ${
                              isEarned ? "text-secondary" : "text-gray-400"
                            }`}
                          >
                            <achievement.icon />
                          </div>
                          <div>
                            <h3 className="font-bold text-dark flex items-center gap-2">
                              {achievement.title}
                              {isEarned && (
                                <FaAward className="text-secondary animate-pulse" />
                              )}
                            </h3>
                            <p className="text-dark2 text-sm mt-1">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
