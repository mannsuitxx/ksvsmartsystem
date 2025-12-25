import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Pie } from 'react-chartjs-2';
import { API_URL } from '../config';

const ClassHealthReport = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/faculty/analytics`, config);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const getRiskChartData = () => {
        if (!data) return {};
        const atRiskCount = data.lowEngagement.length;
        const totalEstimate = 60; 
        const safeCount = Math.max(0, totalEstimate - atRiskCount);

        return {
            labels: ['Safe / Active', 'At Risk / Disengaged'],
            datasets: [{
                data: [safeCount, atRiskCount],
                backgroundColor: ['#198754', '#dc3545'],
                borderWidth: 0
            }]
        };
    };

    return (
        <Layout title="Class Health Report">
                    {loading ? <p className="text-center p-5">Generating Report...</p> : (
                        <>
                            <div className="row g-4 mb-4">
                                <div className="col-md-6 col-lg-4">
                                    <div className="card shadow border-0 h-100">
                                        <div className="card-body">
                                            <h6 className="text-muted text-uppercase mb-2">Overall Risk Profile</h6>
                                            <div style={{height: '200px'}}>
                                                <Pie data={getRiskChartData()} options={{maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }}} />
                                            </div>
                                            <div className="text-center mt-3">
                                                <small className="text-muted">Based on attendance & engagement patterns</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-8">
                                    <div className="card shadow border-0 h-100">
                                        <div className="card-header bg-white py-3">
                                            <h6 className="m-0 font-weight-bold text-primary">Subject Performance Overview</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Subject</th>
                                                            <th>Total Lectures</th>
                                                            <th>Assessments Conducted</th>
                                                            <th>Avg. Pass Rate</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.classHealth.map((sub, i) => {
                                                            const subjectAssessments = data.assessments.filter(a => a.subject === sub.subject);
                                                            const avgPass = subjectAssessments.length > 0 
                                                                ? (subjectAssessments.reduce((sum, a) => sum + parseFloat(a.passRate), 0) / subjectAssessments.length).toFixed(1)
                                                                : 'N/A';

                                                            return (
                                                                <tr key={i}>
                                                                    <td className="fw-bold">{sub.subject}</td>
                                                                    <td>{sub.totalLectures}</td>
                                                                    <td>{subjectAssessments.length}</td>
                                                                    <td>
                                                                        {avgPass !== 'N/A' ? (
                                                                            <span className={`badge ${avgPass < 60 ? 'bg-danger' : 'bg-success'}`}>
                                                                                {avgPass}%
                                                                            </span>
                                                                        ) : '-'}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <div className="card shadow border-0">
                                        <div className="card-header bg-white py-3">
                                            <h6 className="m-0 font-weight-bold text-primary">Detailed Assessment Health</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                {data.assessments.map((exam, idx) => (
                                                    <div className="col-md-6 col-lg-4 mb-3" key={idx}>
                                                        <div className="border rounded p-3 bg-light">
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <strong>{exam.subject}</strong>
                                                                <span className="badge bg-secondary">{exam.exam}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="small text-muted">Pass Rate</span>
                                                                <span className={`fw-bold ${exam.passRate < 50 ? 'text-danger' : 'text-success'}`}>{exam.passRate}%</span>
                                                            </div>
                                                            <div className="progress mb-2" style={{height: '6px'}}>
                                                                <div className={`progress-bar ${exam.passRate < 50 ? 'bg-danger' : 'bg-success'}`} style={{width: `${exam.passRate}%`}}></div>
                                                            </div>
                                                            <small className="text-muted d-block">Avg Score: {exam.averageScore} / {exam.maxMarks}</small>
                                                            <small className={`fw-bold ${exam.status.includes('Too Hard') ? 'text-danger' : exam.status.includes('Too Easy') ? 'text-warning' : 'text-success'}`}>
                                                                {exam.status}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
        </Layout>
    );
};

export default ClassHealthReport;
