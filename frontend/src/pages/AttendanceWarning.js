import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AttendanceWarning = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/dashboard`, config);
                
                const subjectData = res.data.metrics.attendance.subjectWise;
                const processed = Object.keys(subjectData).map(sub => {
                    const total = subjectData[sub].total;
                    const present = subjectData[sub].present;
                    const percentage = total === 0 ? 0 : (present / total) * 100;
                    
                    // Logic for Recovery
                    // Target: 75%
                    // Formula: (P + x) / (T + x) >= 0.75  =>  x >= 3T - 4P
                    let lecturesNeeded = Math.ceil(3 * total - 4 * present);
                    if (lecturesNeeded < 0) lecturesNeeded = 0;

                    // Logic for Bunking (Safe to Skip)
                    // (P) / (T + y) >= 0.75 => y <= (P / 0.75) - T
                    let canSkip = Math.floor((present / 0.75) - total);
                    if (canSkip < 0) canSkip = 0;

                    return {
                        name: sub,
                        total,
                        present,
                        percentage,
                        lecturesNeeded,
                        canSkip,
                        status: percentage < 75 ? 'Danger' : 'Safe'
                    };
                });
                setSubjects(processed);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    return (
        <div className="d-flex" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar role="student" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Attendance Recovery" />
                <div className="container-fluid p-4">

                    <div className="alert alert-info shadow-sm border-0 mb-4">
                        <h5 className="alert-heading fw-bold"><i className="bi bi-info-circle-fill me-2"></i>How this works</h5>
                        <p className="mb-0">
                            The <strong>Recovery Plan</strong> tells you exactly how many upcoming lectures you 
                            MUST attend consecutively to hit 75%. The <strong>Safe Buffer</strong> tells you how many you can miss without falling into the danger zone.
                        </p>
                    </div>

                    <div className="row g-4">
                        {loading ? <p className="text-center p-5">Analyzing your attendance...</p> : subjects.map((sub, idx) => (
                            <div className="col-md-6 col-lg-4" key={idx}>
                                <div className={`card shadow border-0 h-100 ${sub.status === 'Danger' ? 'border-danger border-start border-5' : 'border-success border-start border-5'}`}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="card-title fw-bold text-dark mb-0">{sub.name}</h5>
                                            <span className={`badge ${sub.status === 'Danger' ? 'bg-danger' : 'bg-success'}`}>
                                                {sub.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        
                                        <div className="progress mb-3" style={{height: '10px'}}>
                                            <div 
                                                className={`progress-bar ${sub.status === 'Danger' ? 'bg-danger' : 'bg-success'}`} 
                                                role="progressbar" 
                                                style={{width: `${sub.percentage}%`}}
                                            ></div>
                                        </div>

                                        <div className="d-flex justify-content-between text-muted small mb-3">
                                            <span>Attended: <strong>{sub.present}/{sub.total}</strong></span>
                                            <span>Target: <strong>75%</strong></span>
                                        </div>

                                        <hr />

                                        {sub.status === 'Danger' ? (
                                            <div className="text-center">
                                                <p className="text-danger fw-bold mb-1">⚠️ CRITICAL WARNING</p>
                                                <p className="small text-muted mb-2">To reach 75%, you need to attend:</p>
                                                <h2 className="display-4 fw-bold text-danger mb-0">
                                                    {sub.lecturesNeeded}
                                                </h2>
                                                <span className="text-danger small">Next Consecutive Lectures</span>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-success fw-bold mb-1">✅ YOU ARE SAFE</p>
                                                <p className="small text-muted mb-2">You can afford to miss:</p>
                                                <h2 className="display-4 fw-bold text-success mb-0">
                                                    {sub.canSkip}
                                                </h2>
                                                <span className="text-success small">Lectures (Approx)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AttendanceWarning;
