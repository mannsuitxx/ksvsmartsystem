import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMsg({ text: 'Temporary password sent to your email.', type: 'success' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Failed to request password reset', type: 'danger' });
        }
        setLoading(false);
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow border-0 p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h4 className="fw-bold text-center mb-3">Forgot Password</h4>
                <p className="text-muted text-center small mb-4">Enter your registered email to receive a temporary password.</p>
                
                {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <button className="btn btn-primary w-100 mb-3" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Temporary Password'}
                    </button>
                    <div className="text-center">
                        <button type="button" className="btn btn-link text-decoration-none" onClick={() => navigate('/login')}>Back to Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
