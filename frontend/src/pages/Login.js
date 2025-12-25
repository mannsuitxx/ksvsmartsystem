import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ksvLogo from '../assets/ksv.png';
import ldrpLogo from '../assets/ldrp.png';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(identifier, password);
    
    if (result.success) {
      // Redirect based on role
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'faculty' || user.role === 'mentor') navigate('/faculty/dashboard');
      else if (user.role === 'hod') navigate('/hod/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light position-relative">
      
      <div className="d-flex flex-column align-items-center w-100" style={{ maxWidth: '900px', zIndex: 10 }}>
        
        {/* Upper Logo Area */}
        <div className="d-flex justify-content-center w-100 mb-4 gap-4">
            <img 
                src={ksvLogo} 
                alt="KSV Logo" 
                style={{ 
                width: '90px', 
                height: 'auto', 
                animation: 'slideInLeft 1s ease-out forwards'
                }} 
            />
            <img 
                src={ldrpLogo} 
                alt="LDRP Logo" 
                style={{ 
                width: '90px', 
                height: 'auto', 
                animation: 'slideInRight 1s ease-out forwards'
                }} 
            />
        </div>

        <div className="row w-100 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            {/* Left Side - Branding */}
            <div className="col-md-5 d-none d-md-block p-5 text-white d-flex flex-column justify-content-center" style={{ backgroundColor: '#003366' }}>
            <h2 className="fw-bold mb-4">KSV Smart System</h2>
          <p className="lead">Academic Monitoring & Student Support</p>
          <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <p className="small">Kadi Sarva Vishwavidyalaya</p>
        </div>

        {/* Right Side - Login Form */}
        <div className="col-md-7 bg-white p-5">
          <div className="text-center mb-4">
             <h3 className="fw-bold text-dark">Sign In</h3>
             <p className="text-muted">Access your academic dashboard</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email / Enrollment No</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter ID or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ backgroundColor: '#003366', borderColor: '#003366' }}>
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none small text-muted">Forgot Password?</a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;