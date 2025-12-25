import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const SystemConfigPage = () => {
    const [configs, setConfigs] = useState([]);
    
    // Default form states for common configs
    const [attendanceThreshold, setAttendanceThreshold] = useState(75);
    const [passMarks, setPassMarks] = useState(40);
    const [detentionStrictness, setDetentionStrictness] = useState('Standard');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/config`, config);
            setConfigs(res.data);
            
            // Hydrate local state if exists
            const att = res.data.find(c => c.key === 'attendance_threshold');
            if(att) setAttendanceThreshold(att.value);
            
            const pass = res.data.find(c => c.key === 'pass_marks_internal');
            if(pass) setPassMarks(pass.value);

        } catch (err) { console.error(err); }
    };

    const updateConfig = async (key, value, description) => {
        try {
            const configHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/config`, { key, value, description }, configHeader);
            alert(`Updated ${key} successfully!`);
            fetchData();
        } catch (err) { alert('Update failed'); }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar role="admin" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="System Configuration" />
                <div className="container-fluid p-4">

                    <div className="row">
                        <div className="col-lg-6">
                            <div className="card shadow border-0 mb-4">
                                <div className="card-header bg-dark text-white fw-bold">Academic Policies</div>
                                <div className="card-body">
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Min. Attendance Threshold (%)</label>
                                        <div className="d-flex">
                                            <input type="number" className="form-control me-2" value={attendanceThreshold} onChange={e => setAttendanceThreshold(e.target.value)} />
                                            <button className="btn btn-primary" onClick={() => updateConfig('attendance_threshold', attendanceThreshold, 'Minimum attendance percentage required')}>Update</button>
                                        </div>
                                        <small className="text-muted">Students below this will be flagged as Risk.</small>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Internal Pass Marks (%)</label>
                                        <div className="d-flex">
                                            <input type="number" className="form-control me-2" value={passMarks} onChange={e => setPassMarks(e.target.value)} />
                                            <button className="btn btn-primary" onClick={() => updateConfig('pass_marks_internal', passMarks, 'Passing percentage for internal exams')}>Update</button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Detention Rules Mode</label>
                                        <select className="form-select" value={detentionStrictness} onChange={e => { setDetentionStrictness(e.target.value); updateConfig('detention_mode', e.target.value, 'Strictness level of automated detention'); }}>
                                            <option>Lenient (Allow medical)</option>
                                            <option>Standard (Strict 75%)</option>
                                            <option>Strict (No exceptions)</option>
                                        </select>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card shadow border-0 mb-4">
                                <div className="card-header bg-danger text-white fw-bold">Notifications & Alerts</div>
                                <div className="card-body">
                                    <div className="form-check form-switch mb-3">
                                        <input className="form-check-input" type="checkbox" defaultChecked />
                                        <label className="form-check-label">Enable Automated Risk Alerts (Email)</label>
                                    </div>
                                    <div className="form-check form-switch mb-3">
                                        <input className="form-check-input" type="checkbox" defaultChecked />
                                        <label className="form-check-label">Enable Parent Notifications (SMS)</label>
                                    </div>
                                    <hr />
                                    <label className="form-label fw-bold">Broadcast System Announcement</label>
                                    <textarea className="form-control mb-2" rows="3" placeholder="Type message for all users..."></textarea>
                                    <button className="btn btn-danger w-100"><i className="bi bi-megaphone-fill me-2"></i>Send Broadcast</button>
                                </div>
                            </div>

                             <div className="card shadow border-0">
                                <div className="card-header bg-white fw-bold">Current Raw Config</div>
                                <div className="card-body p-0">
                                    <ul className="list-group list-group-flush">
                                        {configs.map((c, i) => (
                                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="font-monospace small">{c.key}</span>
                                                <span className="badge bg-light text-dark border">{c.value.toString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SystemConfigPage;
