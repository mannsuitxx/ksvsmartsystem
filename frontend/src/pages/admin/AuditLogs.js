import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import moment from 'moment';
import { API_URL } from '../../config';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // In a real system, we'd fetch from a dedicated audit table
                // For now, we combine EmailLogs and ClassUpdate logs as "Activity Logs"
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const emailRes = await axios.get(`${API_URL}/api/email/logs`, config);
                const classRes = await axios.get(`${API_URL}/api/class-updates`, config);
                
                const emailLogs = emailRes.data.map(l => ({
                    date: l.createdAt,
                    type: 'EMAIL',
                    user: l.senderId?.name || 'System',
                    action: `Sent ${l.type} to ${l.recipientEmail}`,
                    ip: 'N/A'
                }));

                const classLogs = classRes.data.map(l => ({
                    date: l.date,
                    type: 'CLASS',
                    user: l.facultyId?.name || 'Faculty',
                    action: `${l.status.toUpperCase()}: ${l.subject} (${l.topic})`,
                    ip: 'N/A'
                }));

                const combined = [...emailLogs, ...classLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
                setLogs(combined);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    const handleExport = () => {
        const headers = "Timestamp,Type,User,Action Detail,IP\n";
        const rows = logs.map(l => 
            `"${moment(l.date).format('YYYY-MM-DD HH:mm:ss')}","${l.type}","${l.user}","${l.action}","${l.ip}"`
        ).join("\n");
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "system_activity_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <Layout title="Audit Logs"><div>Loading...</div></Layout>;

    return (
        <Layout title="Audit & Activity Logs">
                    <div className="d-flex justify-content-end mb-3">
                        <button onClick={handleExport} className="btn btn-outline-primary">
                            <i className="bi bi-download me-2"></i>Download CSV
                        </button>
                    </div>
                    <div className="card shadow border-0">
                        <div className="card-header bg-dark text-white py-3">
                            <h6 className="m-0 font-weight-bold">System Security & Activity Logs</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-striped mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">Timestamp</th>
                                            <th>Type</th>
                                            <th>User</th>
                                            <th>Action Detail</th>
                                            <th>IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log, i) => (
                                            <tr key={i}>
                                                <td className="ps-4 small text-muted">
                                                    {moment(log.date).format('YYYY-MM-DD HH:mm:ss')}
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        log.type === 'EMAIL' ? 'bg-info' : 
                                                        log.type === 'CLASS' ? 'bg-primary' : 'bg-secondary'
                                                    }`}>{log.type}</span>
                                                </td>
                                                <td className="fw-bold">{log.user}</td>
                                                <td>{log.action}</td>
                                                <td className="font-monospace small">{log.ip}</td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && <tr><td colSpan="5" className="text-center p-4">No activity logs found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
        </Layout>
    );
};

export default AuditLogs;