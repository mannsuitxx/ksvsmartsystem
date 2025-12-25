import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const EarlyDetentionPrediction = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hod/deep-analytics`, config);
                setData(res.data.detention);
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
            <Sidebar role="hod" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Early Detention Prediction" />
                <div className="container-fluid p-4">

                     <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm bg-danger text-white">
                                <div className="card-body">
                                    <h5 className="card-title fw-bold"><i className="bi bi-shield-exclamation me-2"></i>Detention Forecast</h5>
                                    <p className="card-text mb-0 opacity-75">
                                        Based on current trajectories, these students will NOT meet the 75% criteria by term end unless immediate action is taken.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow border-0">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Projected Detention List</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Student</th>
                                            <th>Current Attendance</th>
                                            <th>Status</th>
                                            <th>Recoverable?</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? <tr><td colSpan="5" className="p-4 text-center">Running simulations...</td></tr> : data.map((s, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4">
                                                    <div className="fw-bold">{s.name}</div>
                                                    <small className="text-muted">{s.enrollment}</small>
                                                </td>
                                                <td><span className="fw-bold">{s.currentPct}%</span></td>
                                                <td>
                                                    <span className={`badge ${s.status === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {s.status === 'Critical' ? <span className="text-danger fw-bold">Unlikely</span> : <span className="text-success fw-bold">Yes, with 100% Att.</span>}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger">
                                                        Prepare Notice
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {data.length === 0 && !loading && <tr><td colSpan="5" className="p-4 text-center text-success">No students projected for detention!</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EarlyDetentionPrediction;
