import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ksvLogo from '../assets/ksv.png';
import ldrpLogo from '../assets/ldrp.png';

const Navbar = ({ title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{ backgroundColor: '#003366' }}>
      <div className="container-fluid">
        <div className="d-flex align-items-center">
            <img src={ksvLogo} alt="KSV" style={{height: '40px'}} className="me-2 bg-white rounded-circle p-1" />
            <img src={ldrpLogo} alt="LDRP" style={{height: '40px'}} className="me-3 bg-white rounded-circle p-1" />
            <span className="navbar-brand fw-bold">{title || 'KSV Smart System'}</span>
        </div>
        
        <div className="d-flex align-items-center">
          <span className="text-white me-3 d-none d-md-block">
            Welcome, {user ? (user.name || user.email) : 'User'}
          </span>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
