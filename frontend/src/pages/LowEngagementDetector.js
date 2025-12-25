import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const LowEngagementDetector = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/faculty/analytics`, config);
                setStudents(res.data.lowEngagement);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const notifyStudent = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/faculty/notify`, {
                studentId: id,
                message: "Faculty Reminder: Your attendance/engagement is low. Please report to the faculty cabin."
            }, config);
            alert(`Nudge sent successfully!`);
        } catch (err) {
            console.error(err);
            alert('Failed to send notification.');
        }
    };

    return (
        <Layout title="Low Engagement Detector">
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
                                <div className="card-body">
                                    <h5 className="card-title text-warning fw-bold"><i className="bi bi-eye-fill me-2"></i>Quiet Quitting Detector</h5>
                                    <p className="card-text mb-0">
                                        These students are technically enrolled but are showing signs of disengagement. 
                                        Early intervention is key.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow border-0">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">At-Risk Students List</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Student Name</th>
                                            <th>Subject</th>
                                            <th>Risk Pattern</th>
                                            <th>Metric</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? <tr><td colSpan="5" className="text-center p-4">Scanning records...</td></tr> : students.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center p-4 text-success">No engagement issues detected! Great job.</td></tr>
                                        ) : students.map((s, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4">
                                                    <div className="fw-bold">{s.name}</div>
                                                    <div className="small text-muted">{s.enrollment}</div>
                                                </td>
                                                <td><span className="badge bg-light text-dark border">{s.subject}</span></td>
                                                <td>
                                                    {s.riskType === 'Consecutive Absences' ? (
                                                        <span className="badge bg-danger">Consecutive Absences</span>
                                                    ) : (
                                                        <span className="badge bg-warning text-dark">Chronic Low Attendance</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {s.riskType === 'Consecutive Absences' ? (
                                                        <span className="fw-bold text-danger">{s.consecutiveAbsences} lectures missed in a row</span>
                                                    ) : (
                                                        <span className="fw-bold text-warning">{s.attendancePct}% overall</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => notifyStudent(s.studentId)}>
                                                        <i className="bi bi-bell-fill me-1"></i> Nudge
                                                    </button>
                                                </td>
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

export default LowEngagementDetector;
