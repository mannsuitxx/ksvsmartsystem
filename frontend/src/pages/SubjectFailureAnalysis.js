import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const SubjectFailureAnalysis = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hod/deep-analytics`, config);
                setData(res.data.failures);
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
                <Navbar title="Subject Failure RCA" />
                <div className="container-fluid p-4">

                    <div className="alert alert-danger shadow-sm border-0 mb-4">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Critical Insight:</strong> Subjects with >40% Failure Rate require immediate syllabus review.
                    </div>

                    <div className="row g-4">
                        {loading ? <p>Analyzing Failure Patterns...</p> : data.map((sub, idx) => (
                            <div className="col-lg-6" key={idx}>
                                <div className="card shadow border-0 h-100">
                                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                        <h5 className="m-0 font-weight-bold text-dark">{sub.subject}</h5>
                                        <span className={`badge ${parseFloat(sub.failRate) > 20 ? 'bg-danger' : 'bg-success'}`}>
                                            {sub.failRate}% Fail Rate
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            <div>
                                                <small className="text-muted">Avg Score</small>
                                                <h3 className="fw-bold">{sub.avgScore}</h3>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-muted">Correlation</small>
                                                <div className="badge bg-light text-dark border d-block mt-1">
                                                    {parseFloat(sub.failRate) > 30 ? 'Difficulty / Teaching Issue' : 'Student Attendance Issue'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <h6 className="small fw-bold text-uppercase text-muted mb-2">Root Cause Analysis</h6>
                                        <p className="small mb-0">
                                            {parseFloat(sub.failRate) > 30 
                                                ? "High failure rate despite moderate attendance suggests the exam was too difficult or the syllabus was not covered effectively." 
                                                : "Failure rate is within normal limits. Failures likely due to individual student negligence (Low Attendance)."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {data.length === 0 && !loading && <div className="p-4">No marks data found to analyze.</div>}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SubjectFailureAnalysis;
