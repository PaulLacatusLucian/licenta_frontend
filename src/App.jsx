import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layouts/MainLayout";
import AuthLayout from "./components/Layouts/AuthLayout";
import Home from "./components/Home/Home";
import Services from "./components/Services/Services";
import AboutUs from "./components/AboutUs/AboutUs";
import OurTeam from "./components/OurTeam/OurTeam";
import ContactUs from "./components/ContactUs/ContactUs";
import Login from "./components/Auth/Login";
import ParentDashboard from "./parent/components/Dashboard/ParentDashboard";
import StudentDashboard from "./stud/components/Dashboard/StudentDashboard";
import AdminDashboard from "./admin/components/Dashboard/AdminDashboard";
import StudentProfile from "./stud/components/Profile/StudentProfile";
import StudentCalendar from "./stud/components/Calendar/StudentCalendar";
import AdminUserCreator from "./admin/components/Creation/AdminUserCreator";
import AdminClassCreator from "./admin/components/Creation/AdminClassCreator,";
import AdminTeacherCreator from "./admin/components/Creation/AdminTeacherCreator";
import AdminScheduleCreator from "./admin/components/Creation/Schdule/AdminScheduleCreator";
import ClassScheduleCalendar from "./admin/components/Creation/Schdule/ClassScheduleCalendar";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Layout cu Navbar */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
        <Route path="/about-us" element={<MainLayout><AboutUs /></MainLayout>} />
        <Route path="/our-team" element={<MainLayout><OurTeam /></MainLayout>} />
        <Route path="/contact-us" element={<MainLayout><ContactUs /></MainLayout>} />

        {/* Layout fără Navbar */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        {/* Rute pentru fiecare tip de utilizator */}
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/stud" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/stud/profile" element={<StudentProfile />} />
        <Route path="/stud/calendar" element={<StudentCalendar />} />
        <Route path="/admin/create-student" element={<AdminUserCreator />} />
        <Route path="/admin/create-class" element={<AdminClassCreator />} />
        <Route path="/admin/create-teacher" element={<AdminTeacherCreator />} />
        <Route path="/admin/create-schedule" element={<AdminScheduleCreator />} />
        <Route path="/admin/class-schedule" element={<ClassScheduleCalendar />} />
      </Routes>
    </Router>
  );
};

export default App;
