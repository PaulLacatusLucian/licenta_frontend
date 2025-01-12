import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./homepage/Layouts/MainLayout";
import AuthLayout from "./homepage/Layouts/AuthLayout";
import Home from "./homepage/Home/Home";
import Services from "./homepage/Services/Services";
import AboutUs from "./homepage/AboutUs/AboutUs";
import OurTeam from "./homepage/OurTeam/OurTeam";
import ContactUs from "./homepage/ContactUs/ContactUs";
import Login from "./homepage/Auth/Login";
import ParentDashboard from "./parent/components/Dashboard/ParentDashboard";
import StudentDashboard from "./stud/components/Dashboard/StudentDashboard";
import TeacherDashboard from "./teacher/components/Dashboard/TeacherDashboard";
import AdminDashboard from "./admin/components/Dashboard/AdminDashboard";
import StudentProfile from "./stud/components/Profile/StudentProfile";
import StudentCalendar from "./stud/components/Calendar/StudentCalendar";
import AdminUserCreator from "./admin/components/Student_Parent/AdminStudentParentCreation";
import AdminClassCreator from "./admin/components/Class/AdminClassCreator,";
import AdminTeacherCreator from "./admin/components/Teachers/AdminTeacherCreator";
import AdminScheduleCreator from "./admin/components/Creation/Schdule/AdminScheduleCreator";
import ClassScheduleCalendar from "./admin/components/Creation/Schdule/ClassScheduleCalendar";
import AdminDeleteTeacher from "./admin/components/Teachers/AdminDeleteTeacher";
import AdminTeacherEdit from "./admin/components/Teachers/AdminTeacherEdit";
import AdminTeacherView from "./admin/components/Teachers/AdminTeacherView";
import AdminClassesView from "./admin/components/Class/AdminClassView";
import AdminClassEdit from "./admin/components/Class/AdminClassEdit";
import AdminStudentView from "./admin/components/Student_Parent/AdminStudentView";
import AdminParentView from "./admin/components/Student_Parent/AdminParentView";
import AdminParentEdit from "./admin/components/Student_Parent/AdminParentEdit";
import AdmintStudentEdit from "./admin/components/Student_Parent/AdminStudentEdit";
import StudentGrades from "./stud/components/Grade/StudentGrade";
import TeacherStudentOverview from "./teacher/components/Students/TeacherStudentsOverview";
import TeacherWeeklySchedule from "./teacher/components/WeeklySchedule/TeacherWeeklySchedule";

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
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/stud/profile" element={<StudentProfile />} />
        <Route path="/stud/calendar" element={<StudentCalendar />} />
        <Route path="/admin/create-student" element={<AdminUserCreator />} />
        <Route path="/admin/create-class" element={<AdminClassCreator />} />
        <Route path="/admin/create-teacher" element={<AdminTeacherCreator />} />
        <Route path="/admin/create-schedule" element={<AdminScheduleCreator />} />
        <Route path="/admin/class-schedule" element={<ClassScheduleCalendar />} />
        <Route path="/admin/teachers/" element={<AdminTeacherView />} />
        <Route path="/admin/teachers/edit/:id" element={<AdminTeacherEdit />} />
        <Route path="/admin/teachers/delete/:id" element={<AdminDeleteTeacher />} />
        <Route path="/admin/classes/" element={<AdminClassesView />} />
        <Route path="/admin/classes/edit/:id" element={<AdminClassEdit />} />
        <Route path="/admin/students/" element={<AdminStudentView />} />
        <Route path="/admin/parents/" element={<AdminParentView />} /> 
        <Route path="/admin/parents/edit/:id" element={<AdminParentEdit />} />
        <Route path="/admin/students/edit/:id" element={<AdmintStudentEdit />} />
        <Route path="/stud/grades" element={<StudentGrades />} />
        <Route path="/teacher/students" element={<TeacherStudentOverview />} />
        <Route path="/teacher/schedule" element={<TeacherWeeklySchedule />} />
      </Routes>
    </Router>
  );
};

export default App;
