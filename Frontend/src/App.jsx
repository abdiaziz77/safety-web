import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";

//layout
import AdminLayout from "./layout/AdminLayout";
import UserLayout from './layout/UserLayout';
import PublicLayout from './layout/PublicLayout';



// User pages
import Dashboard from './pages/user_pages/Dashboard';
import Report from "./pages/user_pages/Reports";
import AlertsList from './pages/user_pages/Alerts';
import Settings from "./pages/user_pages/Setting";
import Help from './pages/user_pages/Help';
import UserChat from "./pages/user_pages/UserChat";
import MyReportsPage from "./pages/user_pages/MyReports";
import UserNotifications from "./pages/user_pages/Notification";


// Admin pages
import AdminDashboard from "./pages/Admin_pages/AdminDashboard";
import ReportList from "./pages/Admin_pages/AdminReports";
import AdminAlertsList from "./pages/Admin_pages/AdminAlerts";
import AdminUserManagement from "./pages/Admin_pages/UserManagement";
import AdminAnalytics from "./pages/Admin_pages/Analytics";
import AlertFormPage from "./pages/Admin_pages/AlertForm";
import AdminChat from "./pages/Admin_pages/AdminChat";
import AdminNotifications from "./pages/Admin_pages/AdminNotification";
import AdminReportDetails from "./pages/Admin_pages/AdminReportsDetail";



//auth pages
import Login from "./auth/Login";
import SignUp from "./auth/SignUp";
import AdminLogin from "./auth/AdminLogin";
import ForgotPassword from "./auth/ForgotPassword";
import VerifyOTP from "./auth/VerifyOTP";
import ResetPassword from "./auth/ResetPassword";

//public pages
import Home from "./pages/public_pages/Home";
import About from "./pages/public_pages/About";
import SafetyTips from "./pages/public_pages/SafetyTips";
import EmergencyPage from "./pages/public_pages/Emergency";
import CommunityPage from "./pages/public_pages/Comunity";
import FaqPage from "./pages/public_pages/Faqs";
import FeedbackPage from "./pages/public_pages/FeedBack";
import ContactUsPage from "./pages/public_pages/ContactUs";
import ProtectedRoute from "./auth/ProtectedRoute";
import CalendarPage from "./pages/user_pages/Calender";
import MessagePage from "./pages/user_pages/Message";
import AdminMessages from "./pages/Admin_pages/AdminMessage";








function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/*public routes*/}
         <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/safety-tips" element={<SafetyTips />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
             <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/verify" element={<VerifyOTP />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin" element={<AdminLogin />} />
          </Route>

       {/* User routes (protected) */}
<Route element={<ProtectedRoute requiredRole="citizen" />}>
  <Route path="/dashboard" element={<UserLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="reports" element={<Report />} />
    <Route path="alerts" element={<AlertsList />} />
    <Route path="settings" element={<Settings />} />
    <Route path="chat" element={<UserChat />} />
    <Route path="help" element={<Help />} />
    <Route path="myreports" element={<MyReportsPage />} />
    <Route path="notification" element={<UserNotifications />} />
    <Route path="calendar" element={<CalendarPage />} />
    <Route path="messages" element={<MessagePage />} />
  </Route>
</Route>

{/* Admin routes (protected) */}
<Route element={<ProtectedRoute requiredRole="admin" />}>
  <Route path="/admin/dashboard" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="reports" element={<ReportList />} />
    <Route path="alerts" element={<AdminAlertsList />} />
    <Route path="chats" element={<AdminChat />} />
    <Route path="usermanagement" element={<AdminUserManagement />} />
    <Route path="analytics" element={<AdminAnalytics />} />
    <Route path="alertsform" element={<AlertFormPage />} />
    <Route path="/admin/dashboard/notification" element={<AdminNotifications />} />
    <Route path="reports/:id" element={<AdminReportDetails />} />
    <Route path="messages" element={<AdminMessages />} />
  </Route>
</Route>

       


        

        {/* Fallback route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default App;