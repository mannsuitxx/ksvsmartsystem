import React, { useState, useContext } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ title, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const role = user ? user.role : 'guest';

  return (
    <div className="d-flex" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Mobile Sidebar (Off-canvas style) */}
      <div 
        className={`bg-white shadow-lg`}
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100%',
            zIndex: 1050,
            transition: 'transform 0.3s ease-in-out',
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            width: '280px'
        }}
      >
        <Sidebar role={role} onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
            className="d-md-none"
            style={{
                position: 'fixed',
                top: 0, 
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1040
            }}
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar (Static) */}
      <div className="d-none d-md-block" style={{ width: '250px', flexShrink: 0 }}>
         <Sidebar role={role} />
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Navbar title={title} onToggleSidebar={toggleSidebar} />
        <div className="container-fluid p-4">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
