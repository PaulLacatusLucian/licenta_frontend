import React, { useState } from 'react';
import { FaChartLine, FaFilter, FaSearch, FaChevronDown, FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentGrades = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Dummy data for demonstration
  const gradeData = {
    subjects: [
      {
        name: 'Mathematics',
        grades: [
          { assignment: 'Quiz 1', grade: 85, date: '2025-01-05', type: 'Quiz' },
          { assignment: 'Homework 1', grade: 92, date: '2025-01-10', type: 'Homework' },
          { assignment: 'Mid-term', grade: 88, date: '2025-01-15', type: 'Exam' },
        ],
        average: 88.3,
        trend: 'up',
      },
      {
        name: 'Physics',
        grades: [
          { assignment: 'Lab Report 1', grade: 90, date: '2025-01-08', type: 'Lab' },
          { assignment: 'Quiz 1', grade: 82, date: '2025-01-12', type: 'Quiz' },
          { assignment: 'Mid-term', grade: 87, date: '2025-01-18', type: 'Exam' },
        ],
        average: 86.3,
        trend: 'down',
      },
      {
        name: 'English',
        grades: [
          { assignment: 'Essay 1', grade: 88, date: '2025-01-07', type: 'Assignment' },
          { assignment: 'Presentation', grade: 95, date: '2025-01-14', type: 'Presentation' },
          { assignment: 'Mid-term', grade: 91, date: '2025-01-19', type: 'Exam' },
        ],
        average: 91.3,
        trend: 'up',
      }
    ]
  };

  // Data for the line chart
  const chartData = gradeData.subjects.flatMap(subject => 
    subject.grades.map(grade => ({
      date: grade.date,
      [subject.name]: grade.grade
    }))
  ).reduce((acc, curr) => {
    const existingDate = acc.find(item => item.date === curr.date);
    if (existingDate) {
      return acc.map(item => 
        item.date === curr.date ? { ...item, ...curr } : item
      );
    }
    return [...acc, curr];
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="p-4 md:p-8 bg-light min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">My Grades</h1>
        <p className="text-dark2">Track your academic performance across all subjects</p>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <select
          className="p-3 rounded-lg border bg-white text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="current">Current Semester</option>
          <option value="previous">Previous Semester</option>
          <option value="all">All Time</option>
        </select>
        <select
          className="p-3 rounded-lg border bg-white text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="all">All Subjects</option>
          {gradeData.subjects.map(subject => (
            <option key={subject.name} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark2" />
          <input
            type="text"
            placeholder="Search assignments..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white text-dark focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Grade Overview Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-dark mb-4">Grade Trends</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              {gradeData.subjects.map(subject => (
                <Line
                  key={subject.name}
                  type="monotone"
                  dataKey={subject.name}
                  stroke={subject.name === 'Mathematics' ? '#2563eb' : 
                         subject.name === 'Physics' ? '#7c3aed' : '#059669'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gradeData.subjects.map(subject => (
          <div key={subject.name} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-dark">{subject.name}</h3>
              <div className="flex items-center">
                <span className="text-lg font-bold mr-2">{subject.average}%</span>
                {subject.trend === 'up' ? (
                  <FaCaretUp className="text-green-500 text-xl" />
                ) : (
                  <FaCaretDown className="text-red-500 text-xl" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              {subject.grades.map((grade, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-dark">{grade.assignment}</p>
                      <p className="text-sm text-dark2">{grade.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">{grade.grade}%</p>
                      <p className="text-xs text-dark2">{grade.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentGrades;