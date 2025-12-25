import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const HODDashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${API_URL}/api/hod/analytics`, config);
                setData(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleExportCSV = () => {
        if (!data) return;
        
        // Define CSV Headers
        const headers = ["Subject Code,Subject Name,Enrolled Students,Passed,Pass Rate (%),Avg Attendance (%)"];
        
        // Map Data to CSV Rows
        const rows = data.subjectPerformance.map(s => 
            `${s.code},${s.subject},${s.enrolled},${s.passed},${s.passRate},${s.avgAttendance}`
        );

        // Combine
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        
        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "department_analysis_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!data) return <div className="p-5 text-center text-muted">Loading Analytics...</div>;

    const chartData = {
        labels: data.subjectPerformance.map(s => s.subject),
        datasets: [
            {
                label: 'Pass Rate (%)',
                data: data.subjectPerformance.map(s => s.passRate),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Avg Attendance (%)',
                data: data.subjectPerformance.map(s => s.avgAttendance),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }
        ]
    };

    return (
        <Layout title="Department Analytics (HOD)">
                    
                    {/* Header with Export */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">Overview</h4>
                        <button onClick={handleExportCSV} className="btn btn-success">
                            <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export Report (CSV)
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0 bg-primary text-white">
                                <div className="card-body">
                                    <h3>Total Students</h3>
                                    <h1 className="display-4 fw-bold">{data.totalStudents}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0 bg-danger text-white">
                                <div className="card-body">
                                    <h3>Critical Risk</h3>
                                    <h1 className="display-4 fw-bold">{data.riskStats.critical}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0 bg-warning text-white">
                                <div className="card-body">
                                    <h3>Moderate Risk</h3>
                                    <h1 className="display-4 fw-bold">{data.riskStats.moderate}</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white fw-bold">Subject Performance Overview</div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis Table */}
                    <div className="card shadow-sm border-0">
                         <div className="card-header bg-white fw-bold">Detailed Performance Report</div>
                         <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Code</th>
                                        <th>Subject</th>
                                        <th>Enrolled</th>
                                        <th>Passed</th>
                                        <th>Pass Rate</th>
                                        <th>Avg Attendance</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.subjectPerformance.map((s, i) => (
                                        <tr key={i}>
                                            <td>{s.code}</td>
                                            <td>{s.subject}</td>
                                            <td>{s.enrolled}</td>
                                            <td>{s.passed}</td>
                                            <td className={s.passRate < 70 ? 'text-danger fw-bold' : 'text-success'}>{s.passRate}%</td>
                                            <td className={s.avgAttendance < 75 ? 'text-danger fw-bold' : 'text-dark'}>{s.avgAttendance}%</td>
                                            <td>
                                                {s.passRate < 70 ? 
                                                    <span className="badge bg-danger">Attention Needed</span> : 
                                                    <span className="badge bg-success">Healthy</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>

        </Layout>
    );
};

export default HODDashboard;
