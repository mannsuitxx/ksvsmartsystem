import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Line } from 'react-chartjs-2';

const SemesterComparison = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hod/deep-analytics`, config);
                setData(res.data.semesters);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const chartData = {
        labels: data.map(d => `Sem ${d._id}`),
        datasets: [
            {
                label: 'Student Count',
                data: data.map(d => d.count),
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    return (
        <Layout title="Semester Comparison">
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-white py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Enrollment Trends</h6>
                                </div>
                                <div className="card-body">
                                    <div style={{height: '300px'}}>
                                        {loading ? <p className="text-center p-5">Loading...</p> : <Line data={chartData} options={{maintainAspectRatio: false}} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card shadow border-0 h-100 bg-primary text-white">
                                <div className="card-body">
                                    <h4 className="fw-bold">Institutional Health</h4>
                                    <p className="opacity-75">Comparative analysis shows stable enrollment in higher semesters.</p>
                                    <hr className="bg-white" />
                                    <div className="mb-3">
                                        <small className="text-uppercase opacity-75">Avg Retention Rate</small>
                                        <h2 className="fw-bold">94%</h2>
                                    </div>
                                    <div>
                                        <small className="text-uppercase opacity-75">Avg CGPA (All Sems)</small>
                                        <h2 className="fw-bold">7.4</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        </Layout>
    );
};

export default SemesterComparison;