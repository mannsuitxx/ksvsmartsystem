import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ students: 0, faculty: 0, mentors: 0, totalUsers: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'users'
    
    // Add User Form State
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'faculty' });
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const statsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`, config);
            const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, config);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setLoading(false);
        } catch (err) { console.error(err); }
    };

    const userDistData = {
        labels: ['Students', 'Faculty', 'Mentors'],
        datasets: [{
            data: [stats.students, stats.faculty, stats.mentors],
            backgroundColor: ['#198754', '#0d6efd', '#ffc107'],
            hoverOffset: 4
        }]
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMsg({ text: 'Creating...', type: 'info' });
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/users`, newUser, config);
            setMsg({ text: 'User Created Successfully!', type: 'success' });
            setNewUser({ email: '', password: '', role: 'faculty' });
            fetchData(); // Refresh list
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Creation Failed', type: 'danger' });
        }
    };

    const handleDeleteUser = async (id, email) => {
        if(window.confirm(`Are you sure you want to delete ${email}?`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`, config);
                fetchData(); // Refresh
            } catch (err) { alert('Delete Failed'); }
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}/role`, { role: newRole }, config);
            // Optimistic update or refresh
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role');
        }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <Sidebar role="admin" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="System Administration" />
                <div className="container-fluid p-4">
                    
                    {/* Navigation Tabs */}
                    <ul className="nav nav-tabs mb-4">
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'dashboard' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('dashboard')}>
                                Dashboard Overview
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'users' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('users')}>
                                User Management
                            </button>
                        </li>
                    </ul>

                    {/* TAB 1: DASHBOARD STATS */}
                    {activeTab === 'dashboard' && (
                        <div className="row g-4">
                            {/* Stats Column */}
                            <div className="col-md-8">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="card shadow border-0 h-100 bg-white">
                                            <div className="card-body text-center p-4">
                                                <h6 className="text-muted text-uppercase">Total Users</h6>
                                                <h1 className="fw-bold text-primary display-4 mb-0">{stats.totalUsers}</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card shadow border-0 h-100 bg-white">
                                            <div className="card-body text-center p-4">
                                                <h6 className="text-muted text-uppercase">Students</h6>
                                                <h1 className="fw-bold text-success display-4 mb-0">{stats.students}</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card shadow border-0 h-100 bg-white">
                                            <div className="card-body text-center p-4">
                                                <h6 className="text-muted text-uppercase">Faculty</h6>
                                                <h1 className="fw-bold text-info display-4 mb-0">{stats.faculty}</h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card shadow border-0 h-100 bg-white">
                                            <div className="card-body text-center p-4">
                                                <h6 className="text-muted text-uppercase">Mentors</h6>
                                                <h1 className="fw-bold text-warning display-4 mb-0">{stats.mentors}</h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="card shadow border-0">
                                        <div className="card-header bg-danger text-white fw-bold">System Actions</div>
                                        <div className="card-body">
                                            <p className="text-muted small">Critical actions for system maintenance.</p>
                                            <button className="btn btn-outline-danger me-2" onClick={() => alert('Feature simulated: Semester Reset')}>
                                                <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Semester Data
                                            </button>
                                            <button className="btn btn-outline-dark" onClick={() => alert('Feature simulated: System Logs Downloaded')}>
                                                <i className="bi bi-download me-2"></i>Download Logs
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Column */}
                            <div className="col-md-4">
                                <div className="card shadow border-0 h-100">
                                    <div className="card-header bg-white fw-bold">User Distribution</div>
                                    <div className="card-body d-flex justify-content-center align-items-center">
                                        <div style={{ width: '280px', height: '280px' }}>
                                            <Pie data={userDistData} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: USER MANAGEMENT */}
                    {activeTab === 'users' && (
                        <>
                        {/* ADD USER FORM */}
                        <div className="card shadow-sm border-0 mb-4 bg-light">
                            <div className="card-header bg-primary text-white fw-bold">Create New User</div>
                            <div className="card-body">
                                {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
                                <form onSubmit={handleCreateUser} className="row g-3 align-items-end">
                                    <div className="col-md-4">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" required 
                                            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} 
                                            placeholder="user@ksv.ac.in"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Password</label>
                                        <input type="text" className="form-control" required 
                                            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} 
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Role</label>
                                        <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                            <option value="faculty">Faculty</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="hod">HOD</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <button className="btn btn-success w-100">Add User</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* USER LIST */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                                <span>System User Directory</span>
                                <span className="badge bg-secondary">{users.length} Users</span>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Email (ID)</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id}>
                                                <td className="ps-4 fw-bold">{u.email}</td>
                                                <td>
                                                    <select 
                                                        className="form-select form-select-sm" 
                                                        style={{ width: '120px' }}
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
                                                <td>{u.isActive ? <span className="text-success small">● Active</span> : <span className="text-danger small">● Inactive</span>}</td>
                                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="text-end pe-4">
                                                    {u.role !== 'admin' && (
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteUser(u._id, u.email)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
