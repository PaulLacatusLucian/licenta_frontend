import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./homepage/Layouts/MainLayout";
import AuthLayout from "./homepage/Layouts/AuthLayout";
import Home from "./homepage/Home/Home";
import Services from "./homepage/Services/Services";
import AboutUs from "./homepage/AboutUs/AboutUs";
import OurTeam from "./homepage/OurTeam/OurTeam";
import ContactUs from "./homepage/ContactUs/ContactUs";
import Login from "./homepage/Auth/Login";
import ParentDashboard from "./parent/components/Dashboard/ParentDashboard";
import AcademicReport from "./parent/components/Academic_Report/AcademicReport";
import ParentProfile from "./parent/components/Profile/Profile.jsx";
import StudentDashboard from "./stud/components/Dashboard/StudentDashboard";
import TeacherMeeting from "./teacher/components/Meeting/TeacherMeeting";
import TeacherDashboard from "./teacher/components/Dashboard/TeacherDashboard";
import ClassCatalog from "./teacher/components/Catalog/DigitalCatalog.jsx";
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
import ChefDashboard from "./chef/components/Dashboard/ChefDashboard";
import AddFood from "./chef/components/AddFood/AddFood";
import MenuList from "./Cafeteria/MenuList";
import ParentProfileCafeteria from "./Cafeteria/Profile/ParentProfile";
import ParentCalendar from "./parent/components/Calendar/ParentTimetable.jsx";
import StudentFoodOrders from "./stud/components/Food/StudentFoodOrders.jsx";
import EditMenuItem from "./chef/components/EditFood/EditMenuItem.jsx";
import JustifyAbsences from "./teacher/components/Absence/JustifyAbsences.jsx";
import AdminGradeView from "./admin/components/Grade/AdminGradeView";
import AdminGradeCreate from "./admin/components/Grade/AdminGradeCreate";
import AdminGradeEdit from "./admin/components/Grade/AdminGradeEdit";
import AdminGradeDelete from "./admin/components/Grade/AdminGradeDelete.jsx";
import AdminAbsenceView from "./admin/components/Absence/AdminAbsenceView";
import AdminAbsenceCreate from "./admin/components/Absence/AdminAbsenceCreate";
import AdminAbsenceEdit from "./admin/components/Absence/AdminAbsenceEdit";
import AdminJustifyAbsences from "./admin/components/Absence/AdminJustifyAbsence.jsx";
import AdminCatalog from "./admin/components/Catalog/AdminCatalog";

const App = () => {
  return (
    <Router basename="/LTG/">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/services" element={<MainLayout><OurServices /></MainLayout>} />
        <Route path="/about-us" element={<MainLayout><AboutUs /></MainLayout>} />
        <Route path="/our-team" element={<MainLayout><OurTeam /></MainLayout>} />
        <Route path="/contact-us" element={<MainLayout><ContactUs /></MainLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        {/* Protected Routes */}
        {/* Parent Routes */}
        <Route path="/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/academic-report" element={<ProtectedRoute><AcademicReport /></ProtectedRoute>} />
        <Route path="/parent/profile" element={<ProtectedRoute><ParentProfile /></ProtectedRoute>} />
        <Route path="/parent/calendar" element={<ProtectedRoute><ParentCalendar /></ProtectedRoute>} />
        <Route path="/cafeteria/profile" element={<ProtectedRoute><ParentProfileCafeteria /></ProtectedRoute>} />

        
        {/* Student Routes */}
        <Route path="/stud" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/stud/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
        <Route path="/stud/calendar" element={<ProtectedRoute><StudentCalendar /></ProtectedRoute>} />
        <Route path="/stud/grades" element={<ProtectedRoute><StudentGrades /></ProtectedRoute>} />
        <Route path="/stud/absences" element={<ProtectedRoute><StudentAbsences /></ProtectedRoute>} />
        <Route path="/stud/food-orders" element={<ProtectedRoute><StudentFoodOrders /></ProtectedRoute>} />
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute><TeacherStudentOverview /></ProtectedRoute>} />
        <Route path="/teacher/schedule" element={<ProtectedRoute><TeacherWeeklySchedule /></ProtectedRoute>} />
        <Route path="/teacher/grades" element={<ProtectedRoute><GradeEntry /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute><AbsenceEntry /></ProtectedRoute>} />
        <Route path="/teacher/meetings/new" element={<ProtectedRoute><TeacherMeeting /></ProtectedRoute>} />  
        <Route path="/teacher/catalog/:classId?" element={<ProtectedRoute><ClassCatalog /></ProtectedRoute>} />
        <Route path="/teacher/justify" element={<ProtectedRoute><JustifyAbsences /></ProtectedRoute>} />


        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-student" element={<ProtectedRoute><AdminUserCreator /></ProtectedRoute>} />
        <Route path="/admin/create-class" element={<ProtectedRoute><AdminClassCreator /></ProtectedRoute>} />
        <Route path="/admin/create-teacher" element={<ProtectedRoute><AdminTeacherCreator /></ProtectedRoute>} />
        <Route path="/admin/create-schedule" element={<ProtectedRoute><AdminScheduleCreator /></ProtectedRoute>} />
        <Route path="/admin/class-schedule" element={<ProtectedRoute><ClassScheduleCalendar /></ProtectedRoute>} />
        <Route path="/admin/teachers/" element={<ProtectedRoute><AdminTeacherView /></ProtectedRoute>} />
        <Route path="/admin/teachers/edit/:id" element={<ProtectedRoute><AdminTeacherEdit /></ProtectedRoute>} />
        <Route path="/admin/teachers/delete/:id" element={<ProtectedRoute><AdminDeleteTeacher /></ProtectedRoute>} />
        <Route path="/admin/classes/" element={<ProtectedRoute><AdminClassesView /></ProtectedRoute>} />
        <Route path="/admin/classes/edit/:id" element={<ProtectedRoute><AdminClassEdit /></ProtectedRoute>} />
        <Route path="/admin/classes/delete/:id" element={<ProtectedRoute><AdminDeleteClass /></ProtectedRoute>} />
        <Route path="/admin/students/" element={<ProtectedRoute><AdminStudentView /></ProtectedRoute>} />
        <Route path="/admin/parents/" element={<ProtectedRoute><AdminParentView /></ProtectedRoute>} />
        <Route path="/admin/parents/edit/:id" element={<ProtectedRoute><AdminParentEdit /></ProtectedRoute>} />
        <Route path="/admin/students/edit/:id" element={<ProtectedRoute><AdmintStudentEdit /></ProtectedRoute>} />
        <Route path="/admin/create-chef" element={<ProtectedRoute><AdminChefCreator /></ProtectedRoute>} />
        <Route path="/admin/edit-chef/:id" element={<ProtectedRoute><AdminChefEdit /></ProtectedRoute>} />
        <Route path="/admin/chefs/" element={<ProtectedRoute><AdminChefView /></ProtectedRoute>} />
        <Route path="/admin/delete-chef/:id" element={<ProtectedRoute><AdminChefDelete /></ProtectedRoute>} />
        {/* Grade routes */}
        <Route path="admin/grades" element={<AdminGradeView />} />
        <Route path="admin/grades/create" element={<AdminGradeCreate />} />
        <Route path="admin/grades/edit/:id" element={<AdminGradeEdit />} />
        <Route path="/admin/grades/delete/:id" element={<ProtectedRoute><AdminGradeDelete /></ProtectedRoute>} />

      
       {/* Absence routes */}
        <Route path="admin/absences" element={<AdminAbsenceView />} />
        <Route path="admin/absences/create" element={<AdminAbsenceCreate />} />
        <Route path="admin/absences/edit/:id" element={<AdminAbsenceEdit />} />
        <Route path="admin/absences/justify" element={<AdminJustifyAbsences />} />
      
        {/* Catalog routes */}
        <Route path="admin/catalog" element={<AdminCatalog />} />
        <Route path="admin/catalog/:classId" element={<AdminCatalog />} />

        
        {/* Chef Routes */}
        <Route path="/chef" element={<ProtectedRoute><ChefDashboard /></ProtectedRoute>} />
        <Route path="/add-food" element={<ProtectedRoute><AddFood /></ProtectedRoute>} />
        <Route path="/edit-food/:id" element={<ProtectedRoute><EditMenuItem /> </ProtectedRoute>} />

        
        {/* Cafeteria Routes */}
        <Route path="/cafeteria" element={<ProtectedRoute><MenuList /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
