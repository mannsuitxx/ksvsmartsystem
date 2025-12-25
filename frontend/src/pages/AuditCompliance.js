import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import moment from 'moment';

const AuditCompliance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hod/deep-analytics`, config);
                setLogs(res.data.audit);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <Layout title="Audit & Compliance">
                    <div className="card shadow border-0">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">System Activity Logs</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-striped mb-0 align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="ps-4">Timestamp</th>
                                            <th>Activity Type</th>
                                            <th>User</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? <tr><td colSpan="4" className="p-4 text-center">Fetching logs...</td></tr> : logs.map((log, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4 text-muted small">
                                                    {moment(log.date).format('YYYY-MM-DD HH:mm:ss')}
                                                </td>
                                                <td>
                                                    <span className={`badge ${log.type === 'Attendance Upload' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                                        {log.type}
                                                    </span>
                                                </td>
                                                <td>{log.user}</td>
                                                <td className="small">{log.detail}</td>
                                            </tr>
                                        ))}
                                         {logs.length === 0 && !loading && <tr><td colSpan="4" className="p-4 text-center">No activity recorded.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
        </Layout>
    );
};

export default AuditCompliance;