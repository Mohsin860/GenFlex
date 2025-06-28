import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FacultyHome from './pages/FacultyHome';
import StudentHome from './pages/StudentHome';
import CreateExam from './components/faculty/CreateExam';
import EvaluateExam from './components/faculty/EvaluateExam';
import CreateLecture from './components/faculty/CreateLecture';
import CreateCodingExam from './components/faculty/CreateCodingExam';
import TakeExam from './components/student/TakeExam';
import ProtectedRoute from './components/common/ProtectedRoute';
import TakeExamPage from './components/student/TakeExamPage';
import ExamResultsPage from './components/student/ExamResultsPage';
import ManageExams from './components/faculty/ManageExams';
import TeacherSolutionEditor from './components/faculty/TeacherSolutionEditor';
import ExamSubmissions from './components/faculty/ExamSubmissions';
import SubmissionDetails from './components/faculty/SubmissionDetails';
import QueryManagement from './components/faculty/QueryManagement';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Faculty Routes */}
        <Route path="/faculty" element={<ProtectedRoute><FacultyHome /></ProtectedRoute>} />
        <Route path="/faculty/create-exam" element={<ProtectedRoute><CreateExam /></ProtectedRoute>} />
        <Route path="/faculty/create-coding-exam" element={<ProtectedRoute><CreateCodingExam /></ProtectedRoute>} />
        <Route path="/faculty/evaluate-exam" element={<ProtectedRoute><EvaluateExam /></ProtectedRoute>} />
        <Route path="/faculty/create-lecture" element={<ProtectedRoute><CreateLecture /></ProtectedRoute>} />
        <Route path="/solution-editor/:examType/:examId" element={<ProtectedRoute><TeacherSolutionEditor /></ProtectedRoute>} />
        <Route path="/exam-submissions/:examType/:examId" element={<ProtectedRoute><ExamSubmissions /></ProtectedRoute>} />
        <Route path="/submission-details/:submissionId" element={<ProtectedRoute><SubmissionDetails /></ProtectedRoute>} />
        {/* Add this new route for query management */}
        <Route path="/exam-queries/:examType/:examId" element={<ProtectedRoute><QueryManagement /></ProtectedRoute>} />
        
        <Route path="/manage-exams" element={<ProtectedRoute><ManageExams /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute><StudentHome /></ProtectedRoute>} />
        <Route path="/student/take-exam" element={<ProtectedRoute><TakeExam /></ProtectedRoute>} />
        <Route path="/take-exam/:examType/:examId" element={<ProtectedRoute><TakeExamPage /></ProtectedRoute>} />
        <Route path="/exam-results/:attemptId" element={<ProtectedRoute><ExamResultsPage /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;