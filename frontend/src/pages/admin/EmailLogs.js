import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { API_URL } from '../../config';

const EmailLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/email/logs`, config);
                setLogs(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    if (loading) return <Layout title="Email Audit Logs"><div>Loading...</div></Layout>;

    return (
        <Layout title="Communication Audit Logs">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white fw-bold">System Email History</div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Sender</th>
                                <th>Recipient</th>
                                <th>Subject</th>
                                <th>Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id}>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td>{log.senderId?.name || 'System'}</td>
                                    <td>{log.recipientEmail}</td>
                                    <td>{log.subject}</td>
                                    <td>{log.type.replace('_', ' ').toUpperCase()}</td>
                                    <td>
                                        <span className={`badge ${log.status === 'sent' ? 'bg-success' : 'bg-danger'}`}>
                                            {log.status.toUpperCase()}
                                        </span>
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

export default EmailLogs;
