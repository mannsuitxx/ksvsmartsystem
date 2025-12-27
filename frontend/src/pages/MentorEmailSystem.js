import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const MentorEmailSystem = () => {
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('parent'); // 'parent' or 'student'
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchMentees = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/mentor/mentees`, config);
                setMentees(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchMentees();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const endpoint = activeTab === 'parent' ? '/api/email/parent' : '/api/email/student';
            
            await axios.post(`${API_URL}${endpoint}`, {
                studentId: selectedStudent,
                subject,
                message
            }, config);

            alert('Email sent successfully!');
            setSubject('');
            setMessage('');
            setSelectedStudent('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send email');
        }
        setSending(false);
    };

    if (loading) return <Layout title="Email System"><div>Loading...</div></Layout>;

    return (
        <Layout title="Communication Hub">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'parent' ? 'active' : ''}`}
                                onClick={() => setActiveTab('parent')}
                            >
                                Email Parent
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'student' ? 'active' : ''}`}
                                onClick={() => setActiveTab('student')}
                            >
                                Email Student
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="card-body p-4">
                    <h5 className="card-title mb-4">
                        {activeTab === 'parent' ? 'Send Official Update to Parent' : 'Direct Student Messaging'}
                    </h5>
                    
                    <form onSubmit={handleSend}>
                        <div className="mb-3">
                            <label className="form-label">Select Student</label>
                            <select 
                                className="form-select" 
                                value={selectedStudent} 
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Mentee --</option>
                                {mentees.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.enrollmentNumber} - {s.firstName} {s.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Subject</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={subject} 
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Message</label>
                            <textarea 
                                className="form-control" 
                                rows="6" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            ></textarea>
                            <div className="form-text">
                                {activeTab === 'parent' 
                                    ? 'This email will be logged officially in the parent communication history.' 
                                    : 'Use for academic guidance, warnings, or meeting scheduling.'}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={sending}>
                            {sending ? 'Sending...' : 'Send Email'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default MentorEmailSystem;
