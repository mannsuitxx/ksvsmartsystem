import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { API_URL } from '../config';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        mentors: 0,
        hods: 0,
        admins: 0,
        totalUsers: 0,
        activeSessions: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'calendar', 'logs'
    
    // User search & filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    
    // Add User Form State
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'faculty' });
    const [userMsg, setUserMsg] = useState({ text: '', type: '' });
    const [submittingUser, setSubmittingUser] = useState(false);

    // Calendar state
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [newCalendarEvent, setNewCalendarEvent] = useState({ title: '', type: 'Event', startDate: '', endDate: '', description: '' });
    const [calendarLoading, setCalendarLoading] = useState(true);

    // Backup state
    const [backupInfo, setBackupInfo] = useState({ lastBackupTime: null, status: 'never_backed_up', fileName: null, fileSize: 0 });
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupMsg, setBackupMsg] = useState({ text: '', type: '' });

    // Audit logs state
    const [auditLogs, setAuditLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);

    // Semester Reset Modal
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchUsers(),
                fetchCalendarEvents(),
                fetchBackupStatus(),
                fetchAuditLogs()
            ]);
            setLoading(false);
        };
        init();

        const interval = setInterval(fetchStats, 60000); // Silent sync every 60s
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/admin/stats`, config);
            setStats(prev => {
                if (prev && JSON.stringify(prev) === JSON.stringify(res.data)) {
                    return prev;
                }
                return res.data;
            });
        } catch (err) {
            console.error('Error fetching system stats', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/admin/users`, config);
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users', err);
        }
    };

    const fetchCalendarEvents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/admin/calendar`, config);
            setCalendarEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch calendar events', err);
        } finally {
            setCalendarLoading(false);
        }
    };

    const fetchBackupStatus = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/admin/system/backup/status`, config);
            setBackupInfo(res.data);
        } catch (err) {
            console.error('Failed to fetch backup status', err);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const emailRes = await axios.get(`${API_URL}/api/email/logs`, config);
            const classRes = await axios.get(`${API_URL}/api/class-updates`, config);
            
            const emailLogs = emailRes.data.map(l => ({
                date: l.createdAt,
                type: 'EMAIL',
                user: l.senderId?.name || 'System',
                action: `Sent ${l.type.replace('_', ' ').toUpperCase()} to ${l.recipientEmail}`,
                details: `Subject: ${l.subject}`
            }));

            const classLogs = classRes.data.map(l => ({
                date: l.date,
                type: 'CLASS',
                user: l.facultyId?.name || 'Faculty',
                action: `${l.status.toUpperCase()}: ${l.subject}`,
                details: `Topic: ${l.topic || 'N/A'}`
            }));

            const combined = [...emailLogs, ...classLogs]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 20); // Last 20 entries
            setAuditLogs(combined);
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLogsLoading(false);
        }
    };

    // Chart Settings
    const userDistData = {
        labels: ['Students', 'Faculty', 'Mentors', 'HODs', 'Admins'],
        datasets: [{
            data: [stats.students, stats.faculty, stats.mentors, stats.hods, stats.admins],
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'],
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            hoverOffset: 4
        }]
    };

    const pieOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#64748B',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 11
                    }
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1E293B',
                bodyColor: '#64748B',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }
        },
        maintainAspectRatio: false
    };

    // User Operations
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmittingUser(true);
        setUserMsg({ text: 'Registering user...', type: 'info' });
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/admin/users`, newUser, config);
            setUserMsg({ text: 'User Registered Successfully!', type: 'success' });
            setNewUser({ email: '', password: '', role: 'faculty' });
            fetchUsers();
            fetchStats();
        } catch (err) {
            setUserMsg({ text: err.response?.data?.message || 'Registration Failed', type: 'danger' });
        } finally {
            setSubmittingUser(false);
        }
    };

    const handleDeleteUser = async (id, email) => {
        if (window.confirm(`Are you sure you want to permanently delete the user ${email}? This will also delete their profile details.`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                await axios.delete(`${API_URL}/api/admin/users/${id}`, config);
                fetchUsers();
                fetchStats();
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.put(`${API_URL}/api/admin/users/${id}/role`, { role: newRole }, config);
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            fetchStats();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleToggleActiveStatus = async (id, currentStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.put(`${API_URL}/api/admin/users/${id}/status`, {}, config);
            setUsers(users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle user status');
        }
    };

    // Calendar Operations
    const handleCreateCalendarEvent = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/admin/calendar`, newCalendarEvent, config);
            fetchCalendarEvents();
            setNewCalendarEvent({ title: '', type: 'Event', startDate: '', endDate: '', description: '' });
            alert('Event added successfully!');
        } catch (err) {
            alert('Failed to add event');
        }
    };

    // System Operations
    const handleSemesterReset = async () => {
        setResetting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.post(`${API_URL}/api/admin/system/reset-semester`, {}, config);
            alert(`Semester Reset Successful! ${res.data.affected} students promoted.`);
            setShowResetModal(false);
            fetchStats();
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Semester reset failed.');
        } finally {
            setResetting(false);
        }
    };

    const handleTriggerReports = async () => {
        if (window.confirm('Run monthly academic reports for all students immediately? Emails will be sent.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                await axios.post(`${API_URL}/api/admin/system/trigger-reports`, {}, config);
                alert('Monthly report trigger request sent.');
            } catch (err) {
                alert('Failed to trigger reports');
            }
        }
    };

    const handleTriggerBackup = async () => {
        setBackupLoading(true);
        setBackupMsg({ text: 'Starting database backup...', type: 'info' });
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.post(`${API_URL}/api/system/backup`, {}, config);
            setBackupInfo(res.data);
            setBackupMsg({ text: 'Backup completed successfully!', type: 'success' });
        } catch (err) {
            // Retry directly through admin system context in case endpoint mapped differently
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.post(`${API_URL}/api/admin/system/backup`, {}, config);
                setBackupInfo(res.data);
                setBackupMsg({ text: 'Backup completed successfully!', type: 'success' });
            } catch (innerErr) {
                setBackupMsg({ text: innerErr.response?.data?.message || 'Backup failed', type: 'danger' });
            }
        } finally {
            setBackupLoading(false);
        }
    };

    const handleDownloadLogs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, responseType: 'blob' };
            const res = await axios.get(`${API_URL}/api/admin/system/logs`, config);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'system_audit_logs.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Download Failed');
        }
    };

    // Generic CSV Downloads
    const downloadCSV = async (endpoint, filename) => {
        try {
            const config = { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob'
            };
            const res = await axios.get(`${API_URL}/api/export/${endpoint}`, config);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Export failed. Please try again.');
        }
    };

    // Filtering users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <Layout title="System Administration">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading Control Center...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="System Administration">
            {/* Inject premium glassmorphism styling */}
            <style>{`
                .admin-dashboard-container {
                    color: #1E293B;
                    font-family: 'Inter', sans-serif;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 16px;
                    box-shadow: 0 8px 30px rgba(10, 22, 40, 0.04);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #1E293B;
                }
                .glass-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(59, 130, 246, 0.3);
                    box-shadow: 0 12px 40px rgba(31, 38, 135, 0.08);
                }
                .custom-nav-link {
                    background: none !important;
                    border: none !important;
                    color: #64748B !important;
                    font-weight: 500;
                    padding: 10px 16px;
                    position: relative;
                    transition: color 0.3s ease;
                    border-radius: 8px;
                }
                .custom-nav-link:hover {
                    color: #0F172A !important;
                    background-color: rgba(0, 0, 0, 0.04) !important;
                }
                .custom-nav-link.active {
                    color: #3B82F6 !important;
                    background-color: rgba(59, 130, 246, 0.08) !important;
                    font-weight: 600;
                }
                .dark-input, .dark-select {
                    background-color: #ffffff !important;
                    border: 1px solid rgba(0, 0, 0, 0.15) !important;
                    color: #1E293B !important;
                    border-radius: 8px !important;
                    transition: border-color 0.2s, box-shadow 0.2s !important;
                }
                .dark-input:focus, .dark-select:focus {
                    border-color: #3B82F6 !important;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                    background-color: #ffffff !important;
                }
                .dark-input::placeholder {
                    color: #94A3B8;
                }
                .dark-table {
                    color: #1E293B !important;
                    background-color: transparent !important;
                }
                .dark-table th {
                    background-color: #F8FAFC !important;
                    border-bottom: 2px solid rgba(0, 0, 0, 0.06) !important;
                    color: #64748B !important;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    padding: 12px 16px !important;
                }
                .dark-table td {
                    background-color: transparent !important;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
                    padding: 12px 16px !important;
                    color: #334155 !important;
                }
                .dark-table tr:hover td {
                    background-color: rgba(59, 130, 246, 0.04) !important;
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="admin-dashboard-container animate-fade-in">
                {/* Navigation Tabs */}
                <div className="glass-card p-2 mb-4 d-flex">
                    <ul className="nav nav-pills w-100 gap-2 border-0">
                        <li className="nav-item">
                            <button 
                                className={`custom-nav-link ${activeTab === 'overview' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('overview')}
                            >
                                <i className="bi bi-speedometer2 me-2"></i>Overview
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`custom-nav-link ${activeTab === 'users' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('users')}
                            >
                                <i className="bi bi-people-fill me-2"></i>User Mgmt
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`custom-nav-link ${activeTab === 'calendar' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('calendar')}
                            >
                                <i className="bi bi-calendar3 me-2"></i>Academic Calendar
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`custom-nav-link ${activeTab === 'logs' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('logs')}
                            >
                                <i className="bi bi-shield-lock-fill me-2"></i>Audit & Exports
                            </button>
                        </li>
                    </ul>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <>
                        {/* Health Overview Cards */}
                        <div className="row g-3 mb-4 animate-fade-in">
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="glass-card p-3 text-center h-100 d-flex flex-column justify-content-center">
                                    <div className="text-primary fs-3 mb-2">
                                        <i className="bi bi-people-fill"></i>
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Total Users</h6>
                                    <h3 className="fw-bold mb-0 text-white">{stats.totalUsers}</h3>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="glass-card p-3 text-center h-100 d-flex flex-column justify-content-center">
                                    <div className="text-success fs-3 mb-2">
                                        <i className="bi bi-mortarboard-fill"></i>
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Students</h6>
                                    <h3 className="fw-bold mb-0 text-white">{stats.students}</h3>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="glass-card p-3 text-center h-100 d-flex flex-column justify-content-center">
                                    <div className="text-info fs-3 mb-2">
                                        <i className="bi bi-person-workspace"></i>
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Faculty</h6>
                                    <h3 className="fw-bold mb-0 text-white">{stats.faculty}</h3>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="glass-card p-3 text-center h-100 d-flex flex-column justify-content-center">
                                    <div className="text-warning fs-3 mb-2">
                                        <i className="bi bi-person-check-fill"></i>
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Mentors</h6>
                                    <h3 className="fw-bold mb-0 text-white">{stats.mentors}</h3>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="glass-card p-3 text-center h-100 d-flex flex-column justify-content-center">
                                    <div className="text-purple fs-3 mb-2" style={{ color: '#8B5CF6' }}>
                                        <i className="bi bi-person-badge-fill"></i>
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>HODs</h6>
                                    <h3 className="fw-bold mb-0 text-white">{stats.hods}</h3>
                                </div>
                            </div>
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="glass-card p-3 text-center h-100 d-flex flex-column justify-content-center">
                                    <div className="text-danger fs-3 mb-2">
                                        <i className="bi bi-activity"></i>
                                    </div>
                                    <h6 className="text-muted small text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Active Sessions</h6>
                                    <h3 className="fw-bold mb-0 text-white">{stats.activeSessions}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Chart & System Backups */}
                        <div className="row g-4 mb-4">
                            <div className="col-lg-5">
                                <div className="glass-card p-4 h-100 d-flex flex-column">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center text-white">
                                        <i className="bi bi-pie-chart-fill me-2 text-primary"></i> User Distribution
                                    </h5>
                                    <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '260px' }}>
                                        <div style={{ width: '220px', height: '220px' }}>
                                            <Pie data={userDistData} options={pieOptions} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-7">
                                <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="fw-bold mb-3 d-flex align-items-center text-white">
                                            <i className="bi bi-hdd-network-fill me-2 text-info"></i> Backup & Recovery
                                        </h5>
                                        
                                        {backupMsg.text && (
                                            <div className={`alert alert-${backupMsg.type} border-0 bg-${backupMsg.type} bg-opacity-10 text-${backupMsg.type} p-3 rounded mb-3`}>
                                                {backupMsg.text}
                                            </div>
                                        )}

                                        <div className="p-3 rounded mb-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                            <div className="row g-2 align-items-center">
                                                <div className="col-sm-6">
                                                    <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>BACKUP INTEGRITY STATUS</span>
                                                    <span className={`badge mt-1 ${
                                                        backupInfo.status === 'success' ? 'bg-success' :
                                                        backupInfo.status === 'failed' ? 'bg-danger' : 'bg-secondary'
                                                    }`}>
                                                        {backupInfo.status.replace(/_/g, ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>LAST BACKUP AT</span>
                                                    <span className="text-white fw-bold small">
                                                        {backupInfo.lastBackupTime ? moment(backupInfo.lastBackupTime).calendar() : 'Never Backed Up'}
                                                    </span>
                                                </div>
                                                {backupInfo.fileName && (
                                                    <div className="col-12 mt-2 pt-2 border-top border-secondary border-opacity-25 small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                                                        <i className="bi bi-file-earmark-code me-1"></i> {backupInfo.fileName} ({backupInfo.fileSize ? (backupInfo.fileSize / 1024).toFixed(2) + ' KB' : '0 KB'})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            <button 
                                                className="btn btn-outline-info flex-grow-1" 
                                                onClick={handleTriggerBackup}
                                                disabled={backupLoading}
                                            >
                                                {backupLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Running Backup...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-shield-fill-check me-2"></i>Backup Now
                                                    </>
                                                )}
                                            </button>

                                            <button 
                                                className="btn btn-outline-danger flex-grow-1" 
                                                onClick={() => setShowResetModal(true)}
                                            >
                                                <i className="bi bi-arrow-counterclockwise me-2"></i>Semester Reset
                                            </button>

                                            <button 
                                                className="btn btn-outline-primary flex-grow-1" 
                                                onClick={handleTriggerReports}
                                            >
                                                <i className="bi bi-send-fill me-2"></i>Run Monthly Reports
                                            </button>
                                        </div>
                                        <p className="text-muted small mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                                            * Security measures automatically backup all critical tables: users, students, faculties, configs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick exports row */}
                        <div className="glass-card p-4 mb-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center">
                                <i className="bi bi-file-earmark-arrow-down-fill me-2 text-success"></i> Direct CSV Export Downloads
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="p-3 rounded d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                        <div>
                                            <h6 className="mb-0 text-dark font-weight-bold" style={{ fontSize: '0.85rem' }}>Student Master Data</h6>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Export student directories</small>
                                        </div>
                                        <button className="btn btn-sm btn-success" onClick={() => downloadCSV('students', 'Student_Master_Data.csv')}>
                                            <i className="bi bi-download"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 rounded d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                        <div>
                                            <h6 className="mb-0 text-dark font-weight-bold" style={{ fontSize: '0.85rem' }}>Attendance Report</h6>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Global attendance statistics</small>
                                        </div>
                                        <button className="btn btn-sm btn-success" onClick={() => downloadCSV('attendance', 'Attendance_Reports.csv')}>
                                            <i className="bi bi-download"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 rounded d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                        <div>
                                            <h6 className="mb-0 text-dark font-weight-bold" style={{ fontSize: '0.85rem' }}>Risk Analysis Profile</h6>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>At-risk student flags list</small>
                                        </div>
                                        <button className="btn btn-sm btn-success" onClick={() => downloadCSV('risk', 'Risk_Analysis_Report.csv')}>
                                            <i className="bi bi-download"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* TAB 2: USER MANAGEMENT */}
                {activeTab === 'users' && (
                    <div className="row g-4 animate-fade-in">
                        {/* Add User Form */}
                        <div className="col-lg-4">
                            <div className="glass-card p-4">
                                <h5 className="fw-bold mb-3 text-white">Create New User Account</h5>
                                {userMsg.text && (
                                    <div className={`alert alert-${userMsg.type} border-0 bg-${userMsg.type} bg-opacity-10 text-${userMsg.type} p-3 rounded mb-3`}>
                                        {userMsg.text}
                                    </div>
                                )}
                                <form onSubmit={handleCreateUser}>
                                    <div className="mb-3">
                                        <label className="form-label text-slate-300 small">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-control dark-input" 
                                            required 
                                            value={newUser.email} 
                                            onChange={e => setNewUser({...newUser, email: e.target.value})} 
                                            placeholder="username@ksv.ac.in"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-slate-300 small">Default Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control dark-input" 
                                            required 
                                            value={newUser.password} 
                                            onChange={e => setNewUser({...newUser, password: e.target.value})} 
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-slate-300 small">System Role</label>
                                        <select 
                                            className="form-select dark-select" 
                                            value={newUser.role} 
                                            onChange={e => setNewUser({...newUser, role: e.target.value})}
                                        >
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="hod">HOD</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 py-2 mt-2" disabled={submittingUser}>
                                        {submittingUser ? 'Registering...' : 'Register User'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Users Directory Table */}
                        <div className="col-lg-8">
                            <div className="glass-card p-4">
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                                    <h5 className="fw-bold mb-0 text-white">System User Directory</h5>
                                    <span className="badge bg-primary px-3 py-2">{filteredUsers.length} Registered Users</span>
                                </div>
                                
                                {/* Search and Filter */}
                                <div className="row g-2 mb-3">
                                    <div className="col-md-7">
                                        <div className="input-group">
                                            <span className="input-group-text dark-input border-end-0 text-muted">
                                                <i className="bi bi-search"></i>
                                            </span>
                                            <input 
                                                type="text" 
                                                className="form-control dark-input border-start-0" 
                                                placeholder="Search by email..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <select 
                                            className="form-select dark-select"
                                            value={roleFilter}
                                            onChange={e => setRoleFilter(e.target.value)}
                                        >
                                            <option value="all">All Roles</option>
                                            <option value="student">Students</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="mentor">Mentors</option>
                                            <option value="hod">HODs</option>
                                            <option value="admin">Admins</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    <table className="table table-hover align-middle mb-0 dark-table">
                                        <thead>
                                            <tr>
                                                <th className="ps-3">Email Address</th>
                                                <th>System Role</th>
                                                <th>Active Status</th>
                                                <th>Joined Date</th>
                                                <th className="text-end pe-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(u => (
                                                <tr key={u._id}>
                                                    <td className="ps-3 fw-bold text-white small">{u.email}</td>
                                                    <td>
                                                        <select 
                                                            className="form-select form-select-sm dark-select py-1" 
                                                            style={{ width: '120px', fontSize: '0.85rem' }}
                                                            value={u.role}
                                                            onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                                            disabled={u.email === 'admin@ksv.ac.in'}
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="faculty">Faculty</option>
                                                            <option value="mentor">Mentor</option>
                                                            <option value="hod">HOD</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={`btn btn-sm px-2 py-1 border-0 fw-bold ${
                                                                u.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'
                                                            }`}
                                                            style={{ fontSize: '0.8rem' }}
                                                            onClick={() => handleToggleActiveStatus(u._id, u.isActive)}
                                                            disabled={u.email === 'admin@ksv.ac.in'}
                                                        >
                                                            ● {u.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td className="text-end pe-3">
                                                        {u.email !== 'admin@ksv.ac.in' && (
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger border-0 p-1 px-2 text-danger"
                                                                onClick={() => handleDeleteUser(u._id, u.email)}
                                                            >
                                                                <i className="bi bi-trash-fill"></i>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-muted p-4">No users match criteria.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: CALENDAR */}
                {activeTab === 'calendar' && (
                    <div className="row g-4 animate-fade-in">
                        {/* Event Scheduler */}
                        <div className="col-lg-4">
                            <div className="glass-card p-4">
                                <h5 className="fw-bold mb-3 text-white">Schedule Event</h5>
                                <form onSubmit={handleCreateCalendarEvent}>
                                    <div className="mb-3">
                                        <label className="form-label text-slate-300 small">Event Title</label>
                                        <input 
                                            className="form-control dark-input" 
                                            required 
                                            value={newCalendarEvent.title} 
                                            onChange={e => setNewCalendarEvent({...newCalendarEvent, title: e.target.value})} 
                                            placeholder="e.g. Mid-Term Semester Examinations"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-slate-300 small">Event Type</label>
                                        <select 
                                            className="form-select dark-select" 
                                            value={newCalendarEvent.type} 
                                            onChange={e => setNewCalendarEvent({...newCalendarEvent, type: e.target.value})}
                                        >
                                            <option value="Exam">Exam</option>
                                            <option value="Holiday">Holiday</option>
                                            <option value="Event">Event</option>
                                            <option value="Deadline">Deadline</option>
                                        </select>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col">
                                            <label className="form-label text-slate-300 small">Start Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control dark-input" 
                                                required 
                                                value={newCalendarEvent.startDate} 
                                                onChange={e => setNewCalendarEvent({...newCalendarEvent, startDate: e.target.value})} 
                                            />
                                        </div>
                                        <div className="col">
                                            <label className="form-label text-slate-300 small">End Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control dark-input" 
                                                required 
                                                value={newCalendarEvent.endDate} 
                                                onChange={e => setNewCalendarEvent({...newCalendarEvent, endDate: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-slate-300 small">Description</label>
                                        <textarea 
                                            className="form-control dark-input" 
                                            rows="3" 
                                            value={newCalendarEvent.description} 
                                            onChange={e => setNewCalendarEvent({...newCalendarEvent, description: e.target.value})}
                                            placeholder="Add details (e.g. syllabus or holiday terms)"
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 py-2">Add to Calendar</button>
                                </form>
                            </div>
                        </div>

                        {/* Calendar View */}
                        <div className="col-lg-8">
                            <div className="glass-card p-4">
                                <h5 className="fw-bold mb-3 text-white">Upcoming Academic Calendar Events</h5>
                                {calendarLoading ? (
                                    <div className="text-center text-muted py-4">Loading academic calendar...</div>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                                        <table className="table align-middle mb-0 dark-table">
                                            <thead>
                                                <tr>
                                                    <th className="ps-3">Dates</th>
                                                    <th>Event Name</th>
                                                    <th>Type</th>
                                                    <th>Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {calendarEvents.map((ev, i) => (
                                                    <tr key={ev._id || i}>
                                                        <td className="ps-3 text-nowrap small text-muted">
                                                            <i className="bi bi-calendar-event me-2 text-info"></i>
                                                            {moment(ev.startDate).format('MMM DD, YYYY')} 
                                                            {ev.startDate !== ev.endDate && ` - ${moment(ev.endDate).format('MMM DD, YYYY')}`}
                                                        </td>
                                                        <td className="fw-bold text-white small">{ev.title}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                ev.type === 'Exam' ? 'bg-danger text-white' : 
                                                                ev.type === 'Holiday' ? 'bg-success text-white' : 
                                                                ev.type === 'Deadline' ? 'bg-warning text-dark' : 'bg-secondary text-white'
                                                            }`}>
                                                                {ev.type}
                                                            </span>
                                                        </td>
                                                        <td className="small text-muted">{ev.description || '-'}</td>
                                                    </tr>
                                                ))}
                                                {calendarEvents.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted p-4">No academic events scheduled yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: AUDIT LOGS & EXPORTS */}
                {activeTab === 'logs' && (
                    <div className="glass-card p-4 animate-fade-in">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                            <div>
                                <h5 className="fw-bold mb-1 text-white">System Audit & Security Logs</h5>
                                <p className="text-muted small mb-0">Showing last 20 operations logged by the monitoring engines</p>
                            </div>
                            <button onClick={handleDownloadLogs} className="btn btn-outline-info">
                                <i className="bi bi-file-earmark-arrow-down-fill me-2"></i>Download Full CSV Audit Log
                            </button>
                        </div>

                        {logsLoading ? (
                            <div className="text-center text-muted py-5">Loading security audit...</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0 dark-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-3">Timestamp</th>
                                            <th>Category</th>
                                            <th>User / Actor</th>
                                            <th>Action Description</th>
                                            <th>Associated Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map((log, i) => (
                                            <tr key={i}>
                                                <td className="ps-3 small text-muted font-monospace" style={{ fontSize: '0.8rem' }}>
                                                    {moment(log.date).format('YYYY-MM-DD HH:mm:ss')}
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        log.type === 'EMAIL' ? 'bg-info bg-opacity-20 text-info' : 
                                                        log.type === 'CLASS' ? 'bg-primary bg-opacity-20 text-primary' : 'bg-secondary bg-opacity-20 text-slate-300'
                                                    }`}>
                                                        {log.type}
                                                    </span>
                                                </td>
                                                <td className="fw-bold text-white small">{log.user}</td>
                                                <td className="small text-slate-200">{log.action}</td>
                                                <td className="small text-muted">{log.details}</td>
                                            </tr>
                                        ))}
                                        {auditLogs.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted p-4">No audit logs found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Glassmorphic Semester Reset Modal */}
            {showResetModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(5, 10, 20, 0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div className="glass-card p-4" style={{
                        maxWidth: '500px',
                        width: '90%',
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        <h4 className="text-danger mb-3 d-flex align-items-center font-weight-bold">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i> Confirm Semester Reset
                        </h4>
                        <p className="text-slate-300 small">
                            Are you absolutely sure you want to reset the academic semester for KSV University?
                        </p>
                        <div className="alert alert-warning border-0 bg-warning bg-opacity-10 text-warning small p-3 rounded mb-4" style={{ fontSize: '0.8rem' }}>
                            <strong>Warning:</strong> This will promote every active student count to their next subsequent semester. This action is recursive and cannot be undone.
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-secondary border-0 px-4" style={{ backgroundColor: '#1E293B' }} onClick={() => setShowResetModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger px-4" onClick={handleSemesterReset} disabled={resetting}>
                                {resetting ? 'Resetting...' : 'Confirm Reset & Promote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;
