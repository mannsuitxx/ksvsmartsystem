import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const ClassUpdateLogs = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/class-updates`, config);
                setUpdates(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchUpdates();
    }, []);

    if (loading) return <Layout title="Class Update Logs"><div>Loading...</div></Layout>;

    return (
        <Layout title="Faculty Class Execution Logs">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white fw-bold">Daily Class Status Reports</div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Faculty Name</th>
                                <th>Subject</th>
                                <th>Topic</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {updates.map(u => (
                                <tr key={u._id}>
                                    <td>{new Date(u.date).toLocaleDateString()}</td>
                                    <td>{u.facultyId?.name}</td>
                                    <td>{u.subject}</td>
                                    <td>{u.topic}</td>
                                    <td>
                                        <span className={`badge ${u.status === 'conducted' ? 'bg-success' : 'bg-danger'}`}>
                                            {u.status.toUpperCase()}
                                        </span>
                                        {u.status === 'cancelled' && <div className="text-muted small">Reason: {u.remarks}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ClassUpdateLogs;
