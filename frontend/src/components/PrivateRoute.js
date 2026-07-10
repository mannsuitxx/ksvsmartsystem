import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { pageTransition } from '../framerVariants';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <motion.div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', background: '#f8fafc' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="d-flex flex-column align-items-center gap-3"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }} />
        <p className="text-muted fw-semibold">Loading your dashboard...</p>
      </motion.div>
    </motion.div>
  );
  
  return user ? (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
