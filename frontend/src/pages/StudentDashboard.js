import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import NotificationPanel from '../components/NotificationPanel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.get(`${API_URL}/api/student/dashboard`, config);
        setData(res.data);
    } catch (err) { console.error("Polling error", err); }
  };

  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-5 text-center text-muted">Loading Dashboard...</div>;

  // --- CHART DATA PREPARATION ---
  
  // 1. Attendance Doughnut
  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [data.metrics.attendance.percentage, 100 - data.metrics.attendance.percentage],
        backgroundColor: ['#198754', '#dc3545'], // Success Green, Danger Red
        hoverOffset: 4,
      },
    ],
  };

  // 2. Subject-wise Attendance Bar Chart
  const subjects = Object.keys(data.metrics.attendance.subjectWise || {});
  const subAttValues = Object.values(data.metrics.attendance.subjectWise || {}).map(s => (s.present / s.total * 100));
  
  const subjectBarData = {
    labels: subjects.length > 0 ? subjects : ['No Data'],
    datasets: [{
      label: 'Subject Attendance %',
      data: subAttValues.length > 0 ? subAttValues : [0],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  // 3. Simulated Semester Performance (Line Chart)
  const performanceData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
    datasets: [
      {
        label: 'SPI Progress',
        data: [6.5, 7.2, 7.0, 7.8, 8.1], // Mock trend
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <Layout title="Student Dashboard">
            
            {/* Risk Banner */}
            <div className={`alert ${data.metrics.risk.level === 'High Risk' ? 'alert-danger shadow-sm' : data.metrics.risk.level === 'Moderate Risk' ? 'alert-warning shadow-sm' : 'alert-success shadow-sm'} mb-4 border-0 d-flex align-items-center`}>
                <div className="fs-1 me-3">
                    {data.metrics.risk.level === 'High Risk' ? '⚠️' : data.metrics.risk.level === 'Moderate Risk' ? '⚖️' : '🛡️'}
                </div>
                <div>
                    <h4 className="alert-heading fw-bold mb-0">Status: {data.metrics.risk.level}</h4>
                    <p className="mb-0">Risk Score: <strong>{data.metrics.risk.score}/100</strong></p>
                </div>
            </div>

            {/* Notification Panel */}
            <div className="row mb-4">
                <div className="col-12">
                    <NotificationPanel />
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 card-hover">
                        <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="text-muted text-uppercase mb-1">Global Attendance</h6>
                                <h2 className="fw-bold text-primary mb-0">{data.metrics.attendance.percentage}%</h2>
                            </div>
                            <div style={{ width: '80px', height: '80px' }}>
                                <Doughnut data={attendanceData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 card-hover">
                         <div className="card-body">
                            <h6 className="text-muted text-uppercase mb-1">Active Backlogs</h6>
                            <h2 className="fw-bold text-danger mb-0">0</h2>
                            <small className="text-success">You are clear!</small>
                         </div>
                    </div>
                </div>
                <div className="col-md-4">
                     <div className="card shadow border-0 h-100 card-hover">
                         <div className="card-body">
                            <h6 className="text-muted text-uppercase mb-1">Current CGPA</h6>
                            <h2 className="fw-bold text-success mb-0">7.8</h2>
                            <small className="text-muted">Top 15% of class</small>
                         </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-4">
                <div className="col-md-8">
                    <div className="card shadow border-0 h-100">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Attendance by Subject</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <Bar data={subjectBarData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100">
                         <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Academic Trend</h6>
                        </div>
                        <div className="card-body">
                             <div style={{ height: '250px' }}>
                                <Line data={performanceData} options={{ maintainAspectRatio: false }} />
                            </div>
                            <hr />
                            <p className="small text-muted text-center mb-0">Based on previous semester SPI results.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Marks */}
            <div className="row mt-4">
                <div className="col-12">
                     <div className="card shadow border-0">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Recent Assessment Marks</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Subject</th>
                                            <th>Exam Type</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.metrics.marks.map((m, i) => {
                                            const pct = (m.marksObtained / m.maxMarks) * 100;
                                            return (
                                                <tr key={i}>
                                                    <td className="ps-4 fw-bold">{m.subjectName}</td>
                                                    <td><span className="badge bg-light text-dark border">{m.examType}</span></td>
                                                    <td>
                                                        <span className="fw-bold">{m.marksObtained}</span> <span className="text-muted">/ {m.maxMarks}</span>
                                                    </td>
                                                    <td>
                                                        {pct < 40 ? 
                                                            <span className="badge bg-danger">Fail</span> : 
                                                            pct < 70 ? <span className="badge bg-warning text-dark">Average</span> : 
                                                            <span className="badge bg-success">Good</span>
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {data.metrics.marks.length === 0 && <tr><td colSpan="4" className="text-center py-3">No marks available.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

    </Layout>
  );
};
export default StudentDashboard;
