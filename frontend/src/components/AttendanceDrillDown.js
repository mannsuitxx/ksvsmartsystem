import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Bar } from 'react-chartjs-2';

const AttendanceDrillDown = ({ studentId }) => {
  const [data, setData] = useState({ history: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('summary'); // 'summary' or 'history'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.get(`${API_URL}/api/student/attendance/${studentId}`, config);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching attendance details", error);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchData();
  }, [studentId]);

  if (loading) return <div>Loading detailed attendance...</div>;

  const chartData = {
    labels: Object.keys(data.stats),
    datasets: [
      {
        label: 'Attendance %',
        data: Object.values(data.stats).map(s => (s.present / s.total) * 100),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }
    ]
  };

  return (
    <div className="card shadow border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h6 className="m-0 font-weight-bold text-primary">Attendance Drill-Down</h6>
        <div className="btn-group btn-group-sm">
          <button className={`btn ${view === 'summary' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('summary')}>Subject Wise</button>
          <button className={`btn ${view === 'history' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('history')}>Date Wise</button>
        </div>
      </div>
      <div className="card-body">
        {view === 'summary' ? (
          <div>
            <div style={{ height: '250px' }}>
              <Bar 
                data={chartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, max: 100 } }
                }} 
              />
            </div>
            <div className="table-responsive mt-3">
              <table className="table table-sm table-bordered">
                <thead><tr><th>Subject</th><th>Total</th><th>Present</th><th>%</th></tr></thead>
                <tbody>
                  {Object.entries(data.stats).map(([sub, stat]) => (
                    <tr key={sub}>
                      <td>{sub}</td>
                      <td>{stat.total}</td>
                      <td>{stat.present}</td>
                      <td className={((stat.present/stat.total)*100) < 75 ? 'text-danger fw-bold' : 'text-success'}>
                        {((stat.present/stat.total)*100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table table-striped table-sm">
              <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {data.history.map((rec, idx) => (
                  <tr key={idx}>
                    <td>{new Date(rec.date).toLocaleDateString()}</td>
                    <td>{rec.subject}</td>
                    <td>
                      <span className={`badge ${rec.status === 'P' ? 'bg-success' : 'bg-danger'}`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDrillDown;