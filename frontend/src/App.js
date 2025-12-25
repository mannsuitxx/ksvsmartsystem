import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

import StudentDashboard from './pages/StudentDashboard';
import StudentAcademicPlanner from './pages/StudentAcademicPlanner';
import AttendanceWarning from './pages/AttendanceWarning';
import BacklogRiskAnalyzer from './pages/BacklogRiskAnalyzer';
import StudentGoalSetting from './pages/StudentGoalSetting';
import MentorInteractionHistory from './pages/MentorInteractionHistory';

import FacultyStudentList from './pages/FacultyStudentList';
import { FacultyDashboardHome, FacultyHistory, FacultyAttendance, FacultyMarks } from './pages/FacultyPages'; 
import LowEngagementDetector from './pages/LowEngagementDetector';
import ClassHealthReport from './pages/ClassHealthReport';
import AssessmentDifficultyAnalyzer from './pages/AssessmentDifficultyAnalyzer';

import MentorDashboard from './pages/MentorDashboard'; 
import MentorWorkloadDashboard from './pages/MentorWorkloadDashboard';
import InterventionEffectivenessTracker from './pages/InterventionEffectivenessTracker';

import HODDashboard from './pages/HODDashboard';
import SubjectFailureAnalysis from './pages/SubjectFailureAnalysis';
import FacultyImpactReport from './pages/FacultyImpactReport';
import SemesterComparison from './pages/SemesterComparison';
import EarlyDetentionPrediction from './pages/EarlyDetentionPrediction';
import AuditCompliance from './pages/AuditCompliance';

import AdminDashboard from './pages/AdminDashboard';
import FacultyManagement from './pages/admin/FacultyManagement';
import MentorManagement from './pages/admin/MentorManagement';
import DepartmentSetup from './pages/admin/DepartmentSetup';
import AcademicCalendarManager from './pages/admin/AcademicCalendarManager';
import SystemConfigPage from './pages/admin/SystemConfigPage';
import DataImportExport from './pages/admin/DataImportExport';
import AuditLogs from './pages/admin/AuditLogs';

import StudentDirectory from './pages/StudentDirectory';
import StudentProfileView from './pages/StudentProfileView';
import WhatIfSimulator from './pages/WhatIfSimulator';
import StudentMyProfile from './pages/StudentMyProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/simulator" element={<PrivateRoute><WhatIfSimulator /></PrivateRoute>} />
          <Route path="/student/profile" element={<PrivateRoute><StudentMyProfile /></PrivateRoute>} />
          <Route path="/student/planner" element={<PrivateRoute><StudentAcademicPlanner /></PrivateRoute>} />
          <Route path="/student/attendance-recovery" element={<PrivateRoute><AttendanceWarning /></PrivateRoute>} />
          <Route path="/student/backlog-risk" element={<PrivateRoute><BacklogRiskAnalyzer /></PrivateRoute>} />
          <Route path="/student/goals" element={<PrivateRoute><StudentGoalSetting /></PrivateRoute>} />
          <Route path="/student/mentorship-log" element={<PrivateRoute><MentorInteractionHistory /></PrivateRoute>} />
          
          {/* Faculty Routes */}
          <Route path="/faculty/dashboard" element={<PrivateRoute><FacultyDashboardHome /></PrivateRoute>} />
          <Route path="/faculty/students" element={<PrivateRoute><FacultyStudentList /></PrivateRoute>} />
          <Route path="/faculty/directory" element={<PrivateRoute><StudentDirectory /></PrivateRoute>} />
          <Route path="/faculty/student/:id" element={<PrivateRoute><StudentProfileView /></PrivateRoute>} />
          <Route path="/faculty/history" element={<PrivateRoute><FacultyHistory /></PrivateRoute>} />
          <Route path="/faculty/attendance" element={<PrivateRoute><FacultyAttendance /></PrivateRoute>} />
          <Route path="/faculty/marks" element={<PrivateRoute><FacultyMarks /></PrivateRoute>} />
          <Route path="/faculty/engagement" element={<PrivateRoute><LowEngagementDetector /></PrivateRoute>} />
          <Route path="/faculty/class-health" element={<PrivateRoute><ClassHealthReport /></PrivateRoute>} />
          <Route path="/faculty/assessment-analysis" element={<PrivateRoute><AssessmentDifficultyAnalyzer /></PrivateRoute>} />

          {/* Mentor Routes */}
          <Route path="/mentor/dashboard" element={<PrivateRoute><MentorDashboard /></PrivateRoute>} />
          <Route path="/mentor/workload" element={<PrivateRoute><MentorWorkloadDashboard /></PrivateRoute>} />
          <Route path="/mentor/effectiveness" element={<PrivateRoute><InterventionEffectivenessTracker /></PrivateRoute>} />
          
          {/* HOD Routes */}
          <Route path="/hod/dashboard" element={<PrivateRoute><HODDashboard /></PrivateRoute>} />
          <Route path="/hod/failures" element={<PrivateRoute><SubjectFailureAnalysis /></PrivateRoute>} />
          <Route path="/hod/faculty-impact" element={<PrivateRoute><FacultyImpactReport /></PrivateRoute>} />
          <Route path="/hod/sem-comparison" element={<PrivateRoute><SemesterComparison /></PrivateRoute>} />
          <Route path="/hod/early-detention" element={<PrivateRoute><EarlyDetentionPrediction /></PrivateRoute>} />
          <Route path="/hod/compliance" element={<PrivateRoute><AuditCompliance /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/faculty" element={<PrivateRoute><FacultyManagement /></PrivateRoute>} />
          <Route path="/admin/mentors" element={<PrivateRoute><MentorManagement /></PrivateRoute>} />
          <Route path="/admin/academics" element={<PrivateRoute><DepartmentSetup /></PrivateRoute>} />
          <Route path="/admin/calendar" element={<PrivateRoute><AcademicCalendarManager /></PrivateRoute>} />
          <Route path="/admin/config" element={<PrivateRoute><SystemConfigPage /></PrivateRoute>} />
          <Route path="/admin/data" element={<PrivateRoute><DataImportExport /></PrivateRoute>} />
          <Route path="/admin/logs" element={<PrivateRoute><AuditLogs /></PrivateRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
