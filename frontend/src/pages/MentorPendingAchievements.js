import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const MentorPendingAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/achievements/pending`, config);
            setAchievements(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    const handleUpdate = async (id, status, currentRemarks) => {
        const remarks = prompt("Enter remarks (optional):", currentRemarks || "");
        if (remarks === null) return;

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.put(`${API_URL}/api/achievements/${id}`, { status, remarks }, config);
            fetchAchievements();
            alert(`Achievement ${status}`);
        } catch (error) {
            alert('Error updating status');
        }
    };

    if (loading) return <Layout title="Pending Achievements"><div>Loading...</div></Layout>;

    return (
        <Layout title="Verification Queue">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Pending Student Achievements</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Student</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Proof</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {achievements.map(a => (
                                <tr key={a._id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{a.studentId?.firstName} {a.studentId?.lastName}</div>
                                        <div className="text-muted small">{a.studentId?.enrollmentNumber}</div>
                                    </td>
                                    <td>{a.title}</td>
                                    <td>{a.description}</td>
                                    <td>
                                        <a href={`${API_URL}${a.certificateUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">
                                            View Cert
                                        </a>
                                    </td>
                                    <td>{new Date(a.date).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => handleUpdate(a._id, 'approved', a.remarks)} className="btn btn-sm btn-success me-2">Approve</button>
                                        <button onClick={() => handleUpdate(a._id, 'rejected', a.remarks)} className="btn btn-sm btn-danger">Reject</button>
                                    </td>
                                </tr>
                            ))}
                            {achievements.length === 0 && <tr><td colSpan="6" className="text-center p-4">No pending achievements to verify.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default MentorPendingAchievements;
