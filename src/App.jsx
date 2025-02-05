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
import AdminDeleteClass from "./admin/components/Class/AdminDeleteClass";
import AdminStudentView from "./admin/components/Student_Parent/AdminStudentView";
import AdminParentView from "./admin/components/Student_Parent/AdminParentView";
import AdminParentEdit from "./admin/components/Student_Parent/AdminParentEdit";
import AdmintStudentEdit from "./admin/components/Student_Parent/AdminStudentEdit";
import AdminChefCreator from "./admin/components/Chef/AdminChefCreator";
import AdminChefEdit from "./admin/components/Chef/AdminChefEdit";
import AdminChefView from "./admin/components/Chef/AdminChefView";
import AdminChefDelete from "./admin/components/Chef/AdminChefDelete";
import StudentGrades from "./stud/components/Grade/StudentGrade";
import TeacherStudentOverview from "./teacher/components/Students/TeacherStudentsOverview";
import TeacherWeeklySchedule from "./teacher/components/WeeklySchedule/TeacherWeeklySchedule";
import OurServices from "./homepage/OurServices/OurServices";
import GradeEntry from "./teacher/components/Grade/GradeEntry";
import AbsenceEntry from "./teacher/components/Absence/AbsenceEntry";
import StudentAbsences from "./stud/components/Absences/StudentAbsences ";
import ViewPastStudents from "./admin/components/PastStudents/ViewPastStudents";
import ChefDashboard from "./chef/components/Dashboard/ChefDashboard";
import AddFood from "./chef/components/AddFood/AddFood";
import MenuList from "./Cafeteria/MenuList";
import ParentProfile from "./Cafeteria/Profile/ParentProfile";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Layout cu Navbar */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/services" element={<MainLayout><OurServices /></MainLayout>} />
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
        <Route path="/admin/classes/delete/:id" element={<AdminDeleteClass />} />
        <Route path="/admin/students/" element={<AdminStudentView />} />
        <Route path="/admin/parents/" element={<AdminParentView />} /> 
        <Route path="/admin/parents/edit/:id" element={<AdminParentEdit />} />
        <Route path="/admin/students/edit/:id" element={<AdmintStudentEdit />} />
        <Route path="/admin/past-students" element={<ViewPastStudents />} />
        <Route path="/admin/create-chef" element={<AdminChefCreator />} />
        <Route path="/admin/edit-chef/:id" element={<AdminChefEdit />} />
        <Route path="/admin/chefs/" element={<AdminChefView />} />
        <Route path="/admin/delete-chef/:id" element={<AdminChefDelete />} />
        <Route path="/stud/grades" element={<StudentGrades />} />
        <Route path="/stud/absences" element={<StudentAbsences />} />
        <Route path="/teacher/students" element={<TeacherStudentOverview />} />
        <Route path="/teacher/schedule" element={<TeacherWeeklySchedule />} />
        <Route path="/teacher/grades" element={<GradeEntry />} />
        <Route path="/teacher/absence" element={<AbsenceEntry />} />
        <Route path="/chef" element={<ChefDashboard />} />
        <Route path="/add-food" element={<AddFood />} />
        <Route path="/cafeteria" element={<MenuList />} />
        <Route path="/cafeteria/profile" element={<ParentProfile />} />

      </Routes>
    </Router>
  );
};

export default App;
