import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import moment from 'moment';

const InterventionEffectivenessTracker = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/mentor/analytics`, config);
                setData(res.data.effectiveness);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="d-flex" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar role="mentor" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Intervention Impact" />
                <div className="container-fluid p-4">

                    {loading ? <p>Calculating Impact...</p> : (
                        <>
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="card bg-success text-white shadow border-0">
                                        <div className="card-body d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="card-title fw-bold">Overall Success Rate</h5>
                                                <h1 className="display-3 fw-bold mb-0">{data.rate}%</h1>
                                                <p className="mb-0 opacity-75">of your interventions led to student improvement.</p>
                                            </div>
                                            <div className="d-none d-md-block fs-1">
                                                <i className="bi bi-graph-up-arrow"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow border-0">
                                <div className="card-header bg-white py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Recent Intervention Outcomes</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Student</th>
                                                    <th>Type</th>
                                                    <th>Current Status</th>
                                                    <th>Outcome</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.recentHistory.map((i, idx) => {
                                                    const risk = i.studentId && i.studentId.riskProfile ? i.studentId.riskProfile.level : 'Unknown';
                                                    const success = risk === 'Safe' || risk === 'Moderate Risk'; // Simplified success metric

                                                    return (
                                                        <tr key={idx}>
                                                            <td>{moment(i.date).format('MMM DD, YYYY')}</td>
                                                            <td>{i.studentId ? `${i.studentId.firstName} ${i.studentId.lastName}` : 'Unknown'}</td>
                                                            <td><span className="badge bg-light text-dark border">{i.type}</span></td>
                                                            <td>{risk}</td>
                                                            <td>
                                                                {success ? (
                                                                    <span className="text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i> Improved</span>
                                                                ) : (
                                                                    <span className="text-danger fw-bold"><i className="bi bi-exclamation-circle-fill me-1"></i> Needs Follow-up</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {data.recentHistory.length === 0 && <tr><td colSpan="5" className="text-center p-3">No interventions recorded.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default InterventionEffectivenessTracker;
