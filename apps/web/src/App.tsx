import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Home from './pages/Home/Home';
import Profile from './pages/Auth/Profile';
import ChangePassword from './pages/Auth/ChangePassword';
import ComingSoon from './pages/ComingSoon/ComingSoon';

// Import từ nhánh feature/module4-8
import ExamManagement from "./pages/ExamManagement/ExamManagement";
import NotificationPage from "./pages/Notification/NotificationPage";

// Import từ nhánh main
import Exam from './pages/Exam/Exam';
import { ExamDataProvider } from './context/ExamDataContext';
import TakeExam from './pages/Exam/TakeExam';
import LearnerExams from './pages/Exam/LearnerExams';

export default function App() {
  return (
    <ExamDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          
          {/* Các Route Quản lý & Thi trắc nghiệm */}
          <Route path="/subjects" element={<ComingSoon title="Môn học" />} />
          <Route path="/exams" element={<Exam />} />
          <Route path="/exam-management" element={<ExamManagement />} />
          <Route path="/take-exam/:setId" element={<TakeExam />} />
          <Route path="/practice" element={<LearnerExams />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/history" element={<ComingSoon title="Lịch sử" />} />
        </Routes>
      </BrowserRouter>
    </ExamDataProvider>
  );
}