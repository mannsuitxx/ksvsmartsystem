import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ksvLogo from '../assets/ksv.png';
import ldrpLogo from '../assets/ldrp.png';

const Navbar = ({ title, onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      className="navbar navbar-expand-lg navbar-dark navbar-custom px-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <motion.button
            className="btn btn-link text-dark d-md-none me-2 p-0"
            onClick={onToggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="fs-2">&#8801;</span>
          </motion.button>
          <motion.img
            src={ksvLogo} alt="KSV"
            style={{ height: '36px' }}
            className="me-2 bg-light rounded p-0.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ rotate: -5, scale: 1.05 }}
          />
          <motion.img
            src={ldrpLogo} alt="LDRP"
            style={{ height: '36px' }}
            className="me-3 bg-light rounded p-0.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            whileHover={{ rotate: 5, scale: 1.05 }}
          />
          <motion.span
            className="navbar-brand fw-bold text-dark fs-5"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {title || 'KSV Smart System'}
          </motion.span>
        </div>
        
        <motion.div
          className="d-flex align-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <span className="text-dark me-3 d-none d-md-block fw-semibold" style={{ fontSize: '0.9rem' }}>
            Welcome, {user ? (user.name || user.email) : 'User'} <span className="badge bg-secondary ms-1">{user ? user.role.toUpperCase() : ''}</span>
          </span>
          <motion.button
            onClick={handleLogout}
            className="btn btn-outline-dark btn-sm px-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
