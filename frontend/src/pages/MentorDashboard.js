import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

ChartJS.register(ArcElement, Tooltip, Legend);

const MentorDashboard = () => {
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentees = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/mentor/mentees`, config);
                setMentees(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchMentees();
        const interval = setInterval(fetchMentees, 10000);
        return () => clearInterval(interval);
    }, []);

    const riskCounts = { Safe: 0, Moderate: 0, High: 0 };
    mentees.forEach(s => {
        const lvl = s.riskProfile?.level;
        if (lvl === 'High Risk') riskCounts.High++;
        else if (lvl === 'Moderate Risk') riskCounts.Moderate++;
        else riskCounts.Safe++;
    });

    const chartData = {
        labels: ['Safe', 'Moderate', 'Critical'],
        datasets: [{
            data: [riskCounts.Safe, riskCounts.Moderate, riskCounts.High],
            backgroundColor: ['#198754', '#ffc107', '#dc3545'],
            borderWidth: 0,
        }]
    };

    const handleIntervention = async (studentId, name) => {
        const note = prompt(`Enter intervention note for ${name}:`);
        if(!note) return;
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/mentor/intervention`, {
                studentId, type: 'Counseling', notes: note
            }, config);
            alert('Intervention Logged');
        } catch(e) { alert('Error logging intervention'); }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <Sidebar role="mentor" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Mentor Panel" />
                <div className="container-fluid p-4">
                    <div className="row g-4 mb-4">
                        <div className="col-md-8">
                            <h4 className="fw-bold mb-4">My Mentee Cohort</h4>
                            <div className="card shadow border-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light"><tr><th className="ps-4">Enrollment</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {mentees.map(s => (
                                                <tr key={s._id}>
                                                    <td className="ps-4 fw-bold">{s.enrollmentNumber}</td>
                                                    <td>{s.firstName} {s.lastName}</td>
                                                    <td>
                                                        <span className={`badge ${s.riskProfile?.level === 'High Risk' ? 'bg-danger' : s.riskProfile?.level === 'Moderate Risk' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                            {s.riskProfile?.level || 'Safe'}
                                                        </span>
                                                    </td>
                                                    <td><button onClick={() => handleIntervention(s._id, s.firstName)} className="btn btn-sm btn-outline-primary">Log Note</button></td>
                                                </tr>
                                            ))}
                                            {mentees.length === 0 && !loading && <tr><td colSpan="4" className="text-center">No mentees found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <h5 className="fw-bold mb-3">Risk Distribution</h5>
                            <div className="card shadow border-0 bg-white">
                                <div className="card-body d-flex justify-content-center">
                                    <div style={{ width: '250px', height: '250px' }}><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
