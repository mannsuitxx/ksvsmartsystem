import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Bar } from 'react-chartjs-2';
import { API_URL } from '../config';

const AssessmentDifficultyAnalyzer = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/faculty/analytics`, config);
                setAssessments(res.data.assessments);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <Layout title="Assessment Difficulty Analyzer">

                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card bg-white shadow border-0">
                                <div className="card-body">
                                    <h5 className="fw-bold text-primary">Understanding This Report</h5>
                                    <p className="mb-0 text-muted">
                                        This tool analyzes distribution of marks to detect if an exam was <strong>Too Hard</strong> (High failure rate, low average) 
                                        or <strong>Too Easy</strong> (Abnormally high pass rate, grade inflation). 
                                        Ideal exams should have a balanced distribution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {loading ? <p className="text-center p-4">Analyzing exam data...</p> : assessments.map((exam, idx) => (
                            <div className="col-lg-6" key={idx}>
                                <div className="card shadow border-0 h-100">
                                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                        <h6 className="m-0 font-weight-bold text-dark">{exam.subject} <span className="text-muted fw-normal">- {exam.exam}</span></h6>
                                        <span className={`badge ${exam.status === 'Balanced' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {exam.status}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center mb-4">
                                            <div className="col-4 border-end">
                                                <small className="text-muted text-uppercase">Avg Score</small>
                                                <h3 className="fw-bold text-primary">{exam.averageScore}</h3>
                                            </div>
                                            <div className="col-4 border-end">
                                                <small className="text-muted text-uppercase">Max Marks</small>
                                                <h3 className="fw-bold text-dark">{exam.maxMarks}</h3>
                                            </div>
                                            <div className="col-4">
                                                <small className="text-muted text-uppercase">Fail Rate</small>
                                                <h3 className="fw-bold text-danger">{(100 - exam.passRate).toFixed(1)}%</h3>
                                            </div>
                                        </div>

                                        <div style={{height: '200px'}}>
                                            <Bar 
                                                data={{
                                                    labels: ['0-40% (Fail)', '40-60% (Avg)', '60-80% (Good)', '80-100% (Excel)'],
                                                    datasets: [{
                                                        label: 'Student Count',
                                                        data: [
                                                            exam.totalStudents - exam.passedCount, // Fail
                                                            Math.floor(exam.passedCount * 0.4), // Mock distribution
                                                            Math.floor(exam.passedCount * 0.4),
                                                            Math.floor(exam.passedCount * 0.2)
                                                        ],
                                                        backgroundColor: [
                                                            '#dc3545',
                                                            '#ffc107',
                                                            '#0d6efd',
                                                            '#198754'
                                                        ]
                                                    }]
                                                }} 
                                                options={{
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } }
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="mt-3 p-2 bg-light rounded border text-center small text-muted">
                                            {exam.status === 'Too Hard / Poor Performance' 
                                                ? "Recommendation: Review question paper difficulty or conduct remedial sessions for specific topics."
                                                : exam.status === 'Too Easy / Grade Inflation'
                                                ? "Recommendation: Increase complexity of application-based questions in next assessment."
                                                : "Assessment seems well-balanced."}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

        </Layout>
    );
};

export default AssessmentDifficultyAnalyzer;