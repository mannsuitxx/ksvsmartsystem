import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active bg-primary text-white' : 'text-dark';

  return (
    <div className="bg-white border-end h-100 d-flex flex-column p-3" style={{ minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-primary fw-bold mb-0 mx-auto">KSV System</h5>
        <button type="button" className="btn-close d-md-none" aria-label="Close" onClick={onClose}></button>
      </div>
      
      {/* FACULTY MENU (Standard) */}
      {(role === 'faculty' || role === 'mentor') && (
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2 px-3 text-muted small fw-bold">FACULTY MENU</li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/faculty/dashboard')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/dashboard')}`}
            >
              Dashboard Overview
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/faculty/directory')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/directory')}`}
            >
              Student Directory
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/faculty/students')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/students')}`}
            >
              Manage Students
            </button>
          </li>
          <li className="nav-item mb-2">
             <button 
              onClick={() => navigate('/faculty/engagement')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/engagement')}`}
            >
              Low Engagement
            </button>
          </li>
           <li className="nav-item mb-2">
             <button 
              onClick={() => navigate('/faculty/class-health')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/class-health')}`}
            >
              Class Health
            </button>
          </li>
           <li className="nav-item mb-2">
             <button 
              onClick={() => navigate('/faculty/assessment-analysis')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/assessment-analysis')}`}
            >
              Assessment Analysis
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/faculty/history')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/history')}`}
            >
              Attendance History
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/faculty/attendance')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/attendance')}`}
            >
              Upload Attendance
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/faculty/marks')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/marks')}`}
            >
              Upload Marks
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/faculty/class-updates')} 
              className={`nav-link w-100 text-start ${isActive('/faculty/class-updates')}`}
            >
              Class Updates
            </button>
          </li>
        </ul>
      )}

      {/* MENTOR MENU (Standard) */}
      {role === 'mentor' && (
        <ul className="nav nav-pills flex-column mb-auto pt-3 border-top mt-3">
          <li className="nav-item mb-2 px-3 text-muted small fw-bold">MENTOR MENU</li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/mentor/dashboard')} 
              className={`nav-link w-100 text-start ${isActive('/mentor/dashboard')}`}
            >
              Mentee List
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/mentor/email')} 
              className={`nav-link w-100 text-start ${isActive('/mentor/email')}`}
            >
              Email System
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/mentor/achievements')} 
              className={`nav-link w-100 text-start ${isActive('/mentor/achievements')}`}
            >
              Pending Achievements
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/mentor/leaves')} 
              className={`nav-link w-100 text-start ${isActive('/mentor/leaves')}`}
            >
              Medical Leaves
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/mentor/workload')} 
              className={`nav-link w-100 text-start ${isActive('/mentor/workload')}`}
            >
              Workload Dashboard
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/mentor/effectiveness')} 
              className={`nav-link w-100 text-start ${isActive('/mentor/effectiveness')}`}
            >
              Effectiveness Tracker
            </button>
          </li>
        </ul>
      )}

      {/* STUDENT MENU */}
      {role === 'student' && (
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2 px-3 text-muted small fw-bold">STUDENT MENU</li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/dashboard')} 
              className={`nav-link w-100 text-start ${isActive('/student/dashboard')}`}
            >
              My Dashboard
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/achievements')} 
              className={`nav-link w-100 text-start ${isActive('/student/achievements')}`}
            >
              My Achievements
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/resources')} 
              className={`nav-link w-100 text-start ${isActive('/student/resources')}`}
            >
              Exam Resources
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/leaves')} 
              className={`nav-link w-100 text-start ${isActive('/student/leaves')}`}
            >
              Medical Leave
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/planner')} 
              className={`nav-link w-100 text-start ${isActive('/student/planner')}`}
            >
              Academic Planner
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/attendance-recovery')} 
              className={`nav-link w-100 text-start ${isActive('/student/attendance-recovery')}`}
            >
              Attendance Recovery
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/backlog-risk')} 
              className={`nav-link w-100 text-start ${isActive('/student/backlog-risk')}`}
            >
              Backlog Risk
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/goals')} 
              className={`nav-link w-100 text-start ${isActive('/student/goals')}`}
            >
              Goal Setting
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/mentorship-log')} 
              className={`nav-link w-100 text-start ${isActive('/student/mentorship-log')}`}
            >
              Mentorship Log
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/profile')} 
              className={`nav-link w-100 text-start ${isActive('/student/profile')}`}
            >
              My Profile
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/student/simulator')} 
              className={`nav-link w-100 text-start ${isActive('/student/simulator')}`}
            >
              What-If Simulator
            </button>
          </li>
        </ul>
      )}

      {/* HOD MENU */}
      {role === 'hod' && (
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2 px-3 text-muted small fw-bold">HOD MENU</li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/hod/dashboard')} 
              className={`nav-link w-100 text-start ${isActive('/hod/dashboard')}`}
            >
              Dept Analytics
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/hod/failures')} 
              className={`nav-link w-100 text-start ${isActive('/hod/failures')}`}
            >
              Subject Failures
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/hod/faculty-impact')} 
              className={`nav-link w-100 text-start ${isActive('/hod/faculty-impact')}`}
            >
              Faculty Impact
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/hod/sem-comparison')} 
              className={`nav-link w-100 text-start ${isActive('/hod/sem-comparison')}`}
            >
              Sem Comparison
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/hod/early-detention')} 
              className={`nav-link w-100 text-start ${isActive('/hod/early-detention')}`}
            >
              Early Detention
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/hod/compliance')} 
              className={`nav-link w-100 text-start ${isActive('/hod/compliance')}`}
            >
              Audit & Compliance
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/hod/class-logs')} 
              className={`nav-link w-100 text-start ${isActive('/hod/class-logs')}`}
            >
              Class Logs
            </button>
          </li>
        </ul>
      )}

      {/* ADMIN MENU */}
      {role === 'admin' && (
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-2 px-3 text-muted small fw-bold">ADMIN MENU</li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className={`nav-link w-100 text-start ${isActive('/admin/dashboard')}`}
            >
              System Admin
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/faculty')} 
              className={`nav-link w-100 text-start ${isActive('/admin/faculty')}`}
            >
              Faculty Mgmt
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/mentors')} 
              className={`nav-link w-100 text-start ${isActive('/admin/mentors')}`}
            >
              Mentor Assignment
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/academics')} 
              className={`nav-link w-100 text-start ${isActive('/admin/academics')}`}
            >
              Academic Structure
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/resources')} 
              className={`nav-link w-100 text-start ${isActive('/admin/resources')}`}
            >
              Resource Mgmt
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/calendar')} 
              className={`nav-link w-100 text-start ${isActive('/admin/calendar')}`}
            >
              Academic Calendar
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/config')} 
              className={`nav-link w-100 text-start ${isActive('/admin/config')}`}
            >
              System Config
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/data')} 
              className={`nav-link w-100 text-start ${isActive('/admin/data')}`}
            >
              Data Import/Export
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/email-logs')} 
              className={`nav-link w-100 text-start ${isActive('/admin/email-logs')}`}
            >
              Email Logs
            </button>
          </li>
          <li className="nav-item mb-2">
            <button 
              onClick={() => navigate('/admin/logs')} 
              className={`nav-link w-100 text-start ${isActive('/admin/logs')}`}
            >
              Audit Logs
            </button>
          </li>
        </ul>
      )}

      <div className="mt-auto p-2 bg-light rounded text-center small text-muted">
        &copy; 2025 KSV University
      </div>
    </div>
  );
};

export default Sidebar;
