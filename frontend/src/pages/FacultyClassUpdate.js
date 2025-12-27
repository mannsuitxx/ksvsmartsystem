import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const FacultyClassUpdate = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ subject: '', date: '', topic: '', status: 'conducted', remarks: '' });

    const fetchUpdates = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/class-updates`, config);
            setUpdates(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        fetchUpdates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/class-updates`, formData, config);
            alert('Class update logged successfully!');
            setFormData({ subject: '', date: '', topic: '', status: 'conducted', remarks: '' });
            fetchUpdates();
        } catch (error) {
            alert('Error logging update');
        }
    };

    if (loading) return <Layout title="Class Updates"><div>Loading...</div></Layout>;

    return (
        <Layout title="Daily Class Updates">
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white fw-bold">Log Class Entry</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Subject</label>
                                    <input type="text" className="form-control" required 
                                        value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" required 
                                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Topic Covered</label>
                                    <input type="text" className="form-control" required 
                                        value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="conducted">Conducted</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                {formData.status === 'cancelled' && (
                                    <div className="mb-3">
                                        <label className="form-label">Reason for Cancellation</label>
                                        <input type="text" className="form-control" required 
                                            value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                                    </div>
                                )}
                                <button type="submit" className="btn btn-primary w-100">Log Update</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold">My Class Logs</div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Subject</th>
                                        <th>Topic</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {updates.map(u => (
                                        <tr key={u._id}>
                                            <td>{new Date(u.date).toLocaleDateString()}</td>
                                            <td>{u.subject}</td>
                                            <td>{u.topic}</td>
                                            <td>
                                                <span className={`badge ${u.status === 'conducted' ? 'bg-success' : 'bg-danger'}`}>
                                                    {u.status.toUpperCase()}
                                                </span>
                                                {u.status === 'cancelled' && <div className="text-muted small">{u.remarks}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FacultyClassUpdate;
