import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Doughnut } from 'react-chartjs-2';
import { API_URL } from '../config';

const MentorWorkloadDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/mentor/analytics`, config);
                setData(res.data.workload);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const getRiskDistribution = () => {
        if (!data) return {};
        const safe = data.menteeList.filter(m => m.riskLevel === 'Safe').length;
        const mod = data.menteeList.filter(m => m.riskLevel.includes('Moderate')).length;
        const crit = data.menteeList.filter(m => m.riskLevel.includes('High') || m.riskLevel.includes('Critical')).length;

        return {
            labels: ['Safe', 'Moderate', 'Critical'],
            datasets: [{
                data: [safe, mod, crit],
                backgroundColor: ['#198754', '#ffc107', '#dc3545'],
                borderWidth: 0
            }]
        };
    };

    return (
        <Layout title="Mentor Workload">
                    {loading ? <p className="text-center p-5">Loading Workload...</p> : (
                        <>
                            <div className="row g-4 mb-4">
                                <div className="col-md-4">
                                    <div className="card shadow border-0 h-100 border-start border-primary border-5">
                                        <div className="card-body">
                                            <h6 className="text-muted text-uppercase mb-1">Total Mentees</h6>
                                            <h2 className="display-4 fw-bold text-dark">{data.totalMentees}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card shadow border-0 h-100 border-start border-danger border-5">
                                        <div className="card-body">
                                            <h6 className="text-muted text-uppercase mb-1">Critical Cases</h6>
                                            <h2 className="display-4 fw-bold text-danger">{data.criticalRisk}</h2>
                                            <small className="text-danger">Needs Immediate Attention</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card shadow border-0 h-100 border-start border-warning border-5">
                                        <div className="card-body">
                                            <h6 className="text-muted text-uppercase mb-1">Pending Interventions</h6>
                                            <h2 className="display-4 fw-bold text-warning">{data.pendingInterventions}</h2>
                                            <small className="text-muted">Open Tasks</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-lg-8">
                                    <div className="card shadow border-0 h-100">
                                        <div className="card-header bg-white py-3">
                                            <h6 className="m-0 font-weight-bold text-primary">Mentee Priority List</h6>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="table-responsive">
                                                <table className="table table-hover mb-0 align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="ps-4">Student</th>
                                                            <th>Status</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.menteeList
                                                            .sort((a, b) => (a.riskLevel === 'High Risk' ? -1 : 1)) // Sort Critical first
                                                            .map((m, i) => (
                                                            <tr key={i}>
                                                                <td className="ps-4">
                                                                    <div className="fw-bold">{m.name}</div>
                                                                    <div className="small text-muted">{m.enrollment}</div>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${
                                                                        m.riskLevel === 'High Risk' || m.riskLevel === 'Critical' ? 'bg-danger' : 
                                                                        m.riskLevel === 'Moderate Risk' ? 'bg-warning text-dark' : 'bg-success'
                                                                    }`}>
                                                                        {m.riskLevel}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-outline-primary">
                                                                        View Profile
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4">
                                    <div className="card shadow border-0 h-100">
                                        <div className="card-header bg-white py-3">
                                            <h6 className="m-0 font-weight-bold text-primary">Risk Distribution</h6>
                                        </div>
                                        <div className="card-body d-flex align-items-center justify-content-center">
                                            <div style={{ width: '250px', height: '250px' }}>
                                                <Doughnut data={getRiskDistribution()} options={{maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }}} />
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

export default MentorWorkloadDashboard;
