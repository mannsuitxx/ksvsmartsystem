import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import moment from 'moment';

const AuditLogs = () => {
    // Reusing the HOD audit logic or creating a specific Admin one.
    // Since HOD logic exists, we can create an Admin specific one or reuse.
    // Let's create a dedicated one for Admin that might show MORE info (like Login logs).
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Simulated Logs for Admin view since backend doesn't have a dedicated "Admin Audit" table yet
        // In real app: axios.get('/api/admin/audit-logs')
        const mockLogs = [
            { type: 'Login', user: 'admin@ksv.ac.in', action: 'System Login', ip: '192.168.1.10', date: new Date() },
            { type: 'Data Import', user: 'admin@ksv.ac.in', action: 'Uploaded 120 Students', ip: '192.168.1.10', date: new Date(Date.now() - 3600000) },
            { type: 'Config Change', user: 'hod.ce@ksv.ac.in', action: 'Changed Detention Rule', ip: '10.0.0.5', date: new Date(Date.now() - 86400000) },
            { type: 'User Created', user: 'admin@ksv.ac.in', action: 'Added Faculty: Dr. Smith', ip: '192.168.1.10', date: new Date(Date.now() - 172800000) },
        ];
        setLogs(mockLogs);
    }, []);

    return (
        <Layout title="Audit & Activity Logs">

                    <div className="card shadow border-0">

                        <div className="card-header bg-dark text-white py-3">
                            <h6 className="m-0 font-weight-bold">System Security Logs</h6>
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
                                                        log.type === 'Login' ? 'bg-info' : 
                                                        log.type === 'Config Change' ? 'bg-warning text-dark' : 'bg-secondary'
                                                    }`}>{log.type}</span>
                                                </td>
                                                <td className="fw-bold">{log.user}</td>
                                                <td>{log.action}</td>
                                                <td className="font-monospace small">{log.ip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

        </Layout>
    );
};

export default AuditLogs;