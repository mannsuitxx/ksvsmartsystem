import React, { useState, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { pageTransition } from '../framerVariants';

const Layout = ({ title, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const role = user ? user.role : 'guest';

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Mobile Sidebar (Off-canvas style) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="d-md-none"
            style={{
              position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 1050, width: '280px',
            }}
          >
            <Sidebar role={role} onClose={() => setIsSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="d-md-none"
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040, cursor: 'pointer',
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Static) */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="d-none d-md-block"
        style={{ width: '250px', flexShrink: 0 }}
      >
        <Sidebar role={role} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-grow-1 d-flex flex-column"
        style={{ minWidth: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Navbar title={title} onToggleSidebar={toggleSidebar} />
        <div className="container-fluid p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Layout;
