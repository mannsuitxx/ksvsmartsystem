import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const BacklogRiskAnalyzer = () => {
    const [riskReport, setRiskReport] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/dashboard`, config);
                
                // Group marks by subject
                const marksBySubject = {};
                res.data.metrics.marks.forEach(m => {
                    if (!marksBySubject[m.subjectName]) marksBySubject[m.subjectName] = [];
                    marksBySubject[m.subjectName].push(m);
                });

                const report = Object.keys(marksBySubject).map(subject => {
                    const exams = marksBySubject[subject];
                    const totalObtained = exams.reduce((sum, e) => sum + e.marksObtained, 0);
                    const totalMax = exams.reduce((sum, e) => sum + e.maxMarks, 0);
                    const percentage = (totalObtained / totalMax) * 100;
                    
                    // Simple logic: If < 40%, it's fail territory.
                    // Assume final internal passing requires 40% aggregate.
                    // Calculate deficit
                    const requiredForSafe = (0.40 * totalMax) - totalObtained;
                    
                    return {
                        subject,
                        average: percentage,
                        examsCount: exams.length,
                        riskLevel: percentage < 35 ? 'Critical' : percentage < 45 ? 'Moderate' : 'Low',
                        message: percentage < 40 ? `You are failing by ${(requiredForSafe).toFixed(1)} marks.` : 'You are currently passing.',
                        trend: exams.map(e => (e.marksObtained / e.maxMarks) * 100) // Array of percentages
                    };
                });

                setRiskReport(report);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <Layout title="Backlog Risk Analyzer">

                     <div className="row mb-4">
                        <div className="col-12">
                            <div className="card bg-danger text-white shadow border-0">
                                <div className="card-body d-flex align-items-center">
                                    <div className="me-3 fs-1">🛡️</div>
                                    <div>
                                        <h4 className="card-title fw-bold">Why use this?</h4>
                                        <p className="mb-0 opacity-75">
                                            This tool detects subjects where you are statistically likely to fail based on current internal marks.
                                            Act now to prevent a backlog in your final transcript.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {loading ? <div className="p-5 text-center text-muted">Loading Analysis...</div> : riskReport.map((item, idx) => (
                            <div className="col-lg-6" key={idx}>
                                <div className="card shadow border-0 h-100">
                                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                        <h5 className="m-0 font-weight-bold text-primary">{item.subject}</h5>
                                        {item.riskLevel === 'Critical' && <span className="badge bg-danger">HIGH RISK</span>}
                                        {item.riskLevel === 'Moderate' && <span className="badge bg-warning text-dark">AT RISK</span>}
                                        {item.riskLevel === 'Low' && <span className="badge bg-success">SAFE</span>}
                                    </div>
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-6 text-center border-end">
                                                <h6 className="text-muted text-uppercase small">Current Aggregate</h6>
                                                <h2 className={`fw-bold ${item.riskLevel === 'Critical' ? 'text-danger' : 'text-success'}`}>
                                                    {item.average.toFixed(1)}%
                                                </h2>
                                                <small className="text-muted">Pass Criteria: 40%</small>
                                            </div>
                                            <div className="col-6">
                                                <p className="mb-2 fw-bold small text-uppercase text-muted">Performance Insight</p>
                                                <p className="small mb-0">
                                                    {item.message}
                                                </p>
                                                {item.riskLevel === 'Critical' && (
                                                    <div className="mt-2 p-2 bg-danger bg-opacity-10 rounded border border-danger small text-danger">
                                                        <strong>Action Required:</strong> Meet your subject teacher immediately.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <label className="small text-muted mb-1">Performance Trend (Last {item.examsCount} Exams)</label>
                                            <div className="d-flex align-items-end" style={{height: '50px', gap: '5px'}}>
                                                {item.trend.map((t, i) => (
                                                    <div key={i} className="bg-primary rounded-top" style={{
                                                        width: '20px', 
                                                        height: `${t}%`, 
                                                        opacity: (i+1)/item.trend.length
                                                    }} title={`Exam ${i+1}: ${t.toFixed(0)}%`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

        </Layout>
    );
};

export default BacklogRiskAnalyzer;