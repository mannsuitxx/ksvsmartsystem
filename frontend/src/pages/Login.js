import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ksvLogo from '../assets/ksv.png';
import ldrpLogo from '../assets/ldrp.png';
import autoceptLogo from '../assets/autocept.jpeg';
import { staggerContainer, staggerItem } from '../framerVariants';

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

  const demoAccounts = [
    { label: '🎓 Student', id: 'rahul.patel@ksv.ac.in' },
    { label: '👩‍🏫 Faculty', id: 'amit.desai@ksv.ac.in' },
    { label: '🤝 Mentor', id: 'priya.shah@ksv.ac.in' },
    { label: '💼 HOD', id: 'hod.ce@ksv.ac.in' },
    { label: '⚙️ Admin', id: 'admin@ksv.ac.in' },
  ];

  return (
    <motion.div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center login-bg position-relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="d-flex flex-column align-items-center w-100" style={{ maxWidth: '900px', zIndex: 10 }}>
        
        {/* Upper Logo Area */}
        <motion.div
          className="d-flex justify-content-center w-100 mb-4 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img
            src={ksvLogo} alt="KSV Logo"
            style={{ width: '90px', height: 'auto' }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <motion.img
            src={ldrpLogo} alt="LDRP Logo"
            style={{ width: '90px', height: 'auto' }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </motion.div>

        <motion.div
          className="row w-100"
          style={{ borderRadius: '24px', overflow: 'hidden' }}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left Side - Branding (glassmorphism-enhanced) */}
          <motion.div
            className="col-md-5 d-none d-md-block p-5 text-white d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              position: 'relative', overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div style={{
              position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.h2
                className="fw-bold mb-4 glass-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                KSV Smart System
              </motion.h2>
              <motion.p
                className="lead"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                Academic Monitoring & Student Support
              </motion.p>
              <motion.hr
                className="my-4"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
              <motion.p
                className="small mb-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
              >
                Kadi Sarva Vishwavidyalaya
              </motion.p>
            </div>
            <motion.div
              className="d-flex align-items-center gap-2 mt-4 text-white-50"
              style={{ fontSize: '0.8rem', position: 'relative', zIndex: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <span>Powered by</span>
              <span style={{ fontFamily: "'Akira Expanded', sans-serif", fontSize: '0.72rem', color: '#ffffff', letterSpacing: '0.05em' }}>AUTOCEPT</span>
              <motion.img
                src={autoceptLogo} alt="Autocept"
                style={{ height: '18px', width: 'auto', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
                whileHover={{ rotate: 10, scale: 1.1 }}
              />
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form with glass effect */}
          <motion.div
            className="col-md-7 p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(25px) saturate(180%)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div className="text-center mb-4" variants={staggerItem}>
              <h3 className="fw-bold" style={{ color: '#0f172a' }}>Sign In</h3>
              <p className="text-muted">Access your academic dashboard</p>
            </motion.div>

            {error && (
              <motion.div
                className="alert alert-danger"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <motion.div className="mb-3" variants={staggerItem}>
                <label className="form-label">Email / Enrollment No</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter ID or Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </motion.div>
              
              <motion.div className="mb-3" variants={staggerItem}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div className="d-grid gap-2" variants={staggerItem}>
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Authenticating...' : 'Login'}
                </motion.button>
              </motion.div>
            </form>

            <motion.div className="text-center mt-3" variants={staggerItem}>
              <motion.button
                type="button"
                className="btn btn-link text-decoration-none small text-muted p-0"
                onClick={() => navigate('/forgot-password')}
                whileHover={{ scale: 1.05 }}
              >
                Forgot Password?
              </motion.button>
            </motion.div>

            <motion.div
              className="mt-4 pt-3 border-top"
              variants={staggerItem}
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <p className="text-muted small text-center mb-2 fw-semibold">Quick Demo Login (Click to Auto-fill):</p>
              <motion.div
                className="d-flex flex-wrap justify-content-center gap-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {demoAccounts.map((acc) => (
                  <motion.button
                    key={acc.label}
                    type="button"
                    className="btn btn-sm px-2 py-1"
                    style={{
                      fontSize: '0.8rem', borderRadius: '20px',
                      background: 'rgba(79, 70, 229, 0.06)',
                      border: '1px solid rgba(79, 70, 229, 0.15)',
                      color: '#4f46e5', fontWeight: 600,
                    }}
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, background: 'rgba(79, 70, 229, 0.12)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIdentifier(acc.id); setPassword('123456'); }}
                  >
                    {acc.label}
                  </motion.button>
                ))}
              </motion.div>
              <div className="text-center mt-2">
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Default Password: <strong>123456</strong></span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;