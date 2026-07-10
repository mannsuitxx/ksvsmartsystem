import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import autoceptLogo from '../assets/autocept.jpeg';

const Sidebar = ({ role, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } },
  };

  const NavItem = ({ path, label, onClick }) => (
    <motion.li className="nav-item mb-2" variants={itemVariants}>
      <button
        onClick={() => { navigate(path); if (onClose) onClose(); }}
        className={`nav-link w-100 text-start ${isActive(path)}`}
      >
        {label}
      </button>
    </motion.li>
  );

  return (
    <motion.div
      className="sidebar-container h-100 d-flex flex-column p-3"
      style={{ minHeight: '100vh' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="d-flex flex-column align-items-start mb-4 w-100 position-relative px-2">
        <div className="d-flex justify-content-between align-items-center w-100">
          <motion.h5
            className="mb-0 text-start"
            style={{ 
              fontFamily: 'var(--ksv-font-heading)',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #1d1d1f 30%, #515154 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            KSV SMART SYSTEM
          </motion.h5>
          <button type="button" className="btn-close d-md-none position-absolute end-0 top-50 translate-middle-y" aria-label="Close" onClick={onClose}></button>
        </div>
        <small className="text-muted mt-1 ps-1" style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}>Powered by Autocept</small>
      </div>
      
      {/* FACULTY MENU (Standard) */}
      {(role === 'faculty' || role === 'mentor') && (
        <motion.ul
          className="nav nav-pills flex-column mb-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.li className="nav-item mb-2 px-3 text-muted small fw-bold" variants={itemVariants}>FACULTY MENU</motion.li>
          <NavItem path="/faculty/dashboard" label="Dashboard Overview" />
          <NavItem path="/faculty/directory" label="Student Directory" />
          <NavItem path="/faculty/students" label="Manage Students" />
          <NavItem path="/faculty/engagement" label="Low Engagement" />
          <NavItem path="/faculty/class-health" label="Class Health" />
          <NavItem path="/faculty/assessment-analysis" label="Assessment Analysis" />
          <NavItem path="/faculty/history" label="Attendance History" />
          <NavItem path="/faculty/attendance" label="Upload Attendance" />
          <NavItem path="/faculty/marks" label="Upload Marks" />
          <NavItem path="/faculty/class-updates" label="Class Updates" />
        </motion.ul>
      )}

      {/* MENTOR MENU (Standard) */}
      {role === 'mentor' && (
        <motion.ul
          className="nav nav-pills flex-column mb-auto pt-3 border-top mt-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.li className="nav-item mb-2 px-3 text-muted small fw-bold" variants={itemVariants}>MENTOR MENU</motion.li>
          <NavItem path="/mentor/dashboard" label="Mentee List" />
          <NavItem path="/mentor/email" label="Email System" />
          <NavItem path="/mentor/achievements" label="Pending Achievements" />
          <NavItem path="/mentor/leaves" label="Medical Leaves" />
          <NavItem path="/mentor/workload" label="Workload Dashboard" />
          <NavItem path="/mentor/effectiveness" label="Effectiveness Tracker" />
        </motion.ul>
      )}

      {/* STUDENT MENU */}
      {role === 'student' && (
        <motion.ul
          className="nav nav-pills flex-column mb-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.li className="nav-item mb-2 px-3 text-muted small fw-bold" variants={itemVariants}>STUDENT MENU</motion.li>
          <NavItem path="/student/dashboard" label="My Dashboard" />
          <NavItem path="/student/achievements" label="My Achievements" />
          <NavItem path="/student/resources" label="Exam Resources" />
          <NavItem path="/student/leaves" label="Medical Leave" />
          <NavItem path="/student/planner" label="Academic Planner" />
          <NavItem path="/student/attendance-recovery" label="Attendance Recovery" />
          <NavItem path="/student/backlog-risk" label="Backlog Risk" />
          <NavItem path="/student/goals" label="Goal Setting" />
          <NavItem path="/student/mentorship-log" label="Mentorship Log" />
          <NavItem path="/student/profile" label="My Profile" />
          <NavItem path="/student/simulator" label="What-If Simulator" />
        </motion.ul>
      )}

      {/* HOD MENU */}
      {role === 'hod' && (
        <motion.ul
          className="nav nav-pills flex-column mb-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.li className="nav-item mb-2 px-3 text-muted small fw-bold" variants={itemVariants}>HOD MENU</motion.li>
          <NavItem path="/hod/dashboard" label="Dept Analytics" />
          <NavItem path="/hod/failures" label="Subject Failures" />
          <NavItem path="/hod/faculty-impact" label="Faculty Impact" />
          <NavItem path="/hod/sem-comparison" label="Sem Comparison" />
          <NavItem path="/hod/early-detention" label="Early Detention" />
          <NavItem path="/hod/compliance" label="Audit & Compliance" />
          <NavItem path="/hod/class-logs" label="Class Logs" />
        </motion.ul>
      )}

      {/* ADMIN MENU */}
      {role === 'admin' && (
        <motion.ul
          className="nav nav-pills flex-column mb-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.li className="nav-item mb-2 px-3 text-muted small fw-bold" variants={itemVariants}>ADMIN MENU</motion.li>
          <NavItem path="/admin/dashboard" label="System Admin" />
          <NavItem path="/admin/faculty" label="Faculty Mgmt" />
          <NavItem path="/admin/mentors" label="Mentor Assignment" />
          <NavItem path="/admin/academics" label="Academic Structure" />
          <NavItem path="/admin/resources" label="Resource Mgmt" />
          <NavItem path="/admin/calendar" label="Academic Calendar" />
          <NavItem path="/admin/config" label="System Config" />
          <NavItem path="/admin/data" label="Data Import/Export" />
          <NavItem path="/admin/email-logs" label="Email Logs" />
          <NavItem path="/admin/logs" label="Audit Logs" />
        </motion.ul>
      )}

      <motion.div
        className="mt-auto d-flex flex-column align-items-center gap-1 p-2 text-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <span className="small text-muted" style={{ fontSize: '0.72rem', color: '#86868b' }}>&copy; 2026 KSV University</span>
        <motion.div
          className="d-flex align-items-center gap-2 mt-1 justify-content-center"
          style={{ fontSize: '0.72rem', color: '#515154' }}
          whileHover={{ scale: 1.02 }}
        >
          <span>Powered by</span>
          <span style={{ fontFamily: "'Akira Expanded', sans-serif", fontSize: '0.65rem', color: '#1d1d1f', letterSpacing: '0.05em' }}>AUTOCEPT</span>
          <motion.img
            src={autoceptLogo} alt="Autocept"
            style={{ height: '18px', width: 'auto', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
