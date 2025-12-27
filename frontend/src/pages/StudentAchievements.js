import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const StudentAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', description: '', date: '' });
    const [file, setFile] = useState(null);

    const fetchAchievements = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/achievements/my`, config);
            setAchievements(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('certificate', file);

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/achievements`, data, config);
            alert('Achievement uploaded successfully!');
            setFormData({ title: '', description: '', date: '' });
            setFile(null);
            fetchAchievements();
        } catch (error) {
            alert('Error uploading achievement');
        }
    };

    if (loading) return <Layout title="My Achievements"><div>Loading...</div></Layout>;

    return (
        <Layout title="My Achievements Portfolio">
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white fw-bold">Add New Achievement</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input type="text" className="form-control" required 
                                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" required 
                                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows="3" required 
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Certificate (Image/PDF)</label>
                                    <input type="file" className="form-control" required onChange={e => setFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Upload to Profile</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold">My Achievement History</div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Title</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Certificate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {achievements.map(a => (
                                        <tr key={a._id}>
                                            <td>
                                                <div className="fw-bold">{a.title}</div>
                                                <small className="text-muted">{a.description}</small>
                                            </td>
                                            <td>{new Date(a.date).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${a.status === 'approved' ? 'bg-success' : a.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                    {a.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <a href={`${API_URL}${a.certificateUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                                                    View
                                                </a>
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

export default StudentAchievements;
