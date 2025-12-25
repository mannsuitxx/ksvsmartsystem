import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// --- 1. DASHBOARD OVERVIEW ---
export const FacultyDashboardHome = () => {
    const [stats, setStats] = useState({ 
        students: 0, 
        lectures: 0,
        riskDist: [0, 0, 0], // Safe, Moderate, High
        weeklyActivity: [0, 0, 0, 0, 0, 0] // Mon-Sat
    });

    useEffect(() => {
        const fetchStats = async () => {
             const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
             try {
                const studentsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/students`, config);
                const historyRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/history`, config);
                
                let safe = 0, mod = 0, high = 0;
                studentsRes.data.forEach(s => {
                    const lvl = s.riskProfile?.level;
                    if (lvl === 'High Risk') high++;
                    else if (lvl === 'Moderate Risk') mod++;
                    else safe++;
                });

                const weekCounts = [0, 0, 0, 0, 0, 0];
                historyRes.data.forEach(h => {
                    const day = new Date(h.date).getDay();
                    if (day >= 1 && day <= 6) weekCounts[day - 1]++;
                });

                setStats({ 
                    students: studentsRes.data.length, 
                    lectures: historyRes.data.length,
                    riskDist: [safe, mod, high],
                    weeklyActivity: weekCounts
                });
             } catch (e) { console.error(e); }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const lectureData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Lectures',
            data: stats.weeklyActivity,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderRadius: 4,
        }]
    };

    const studentDistData = {
        labels: ['Safe', 'Moderate Risk', 'High Risk'],
        datasets: [{
            data: stats.riskDist,
            backgroundColor: ['#198754', '#ffc107', '#dc3545'],
            borderWidth: 1,
        }]
    };

    return (
        <Layout title="Faculty Overview">
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card shadow border-0 bg-primary text-white h-100">
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="h5 text-white-50">Total Students</h3>
                                <h1 className="fw-bold display-4 mb-0">{stats.students}</h1>
                            </div>
                            <div className="fs-1 opacity-25">🎓</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow border-0 bg-success text-white h-100">
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="h5 text-white-50">Lectures Conducted</h3>
                                <h1 className="fw-bold display-4 mb-0">{stats.lectures}</h1>
                            </div>
                             <div className="fs-1 opacity-25">📊</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-8">
                     <div className="card shadow border-0 h-100">
                        <div className="card-header bg-white fw-bold py-3">Weekly Schedule Activity</div>
                        <div className="card-body">
                             <div style={{ height: '300px' }}>
                                <Bar data={lectureData} options={{ maintainAspectRatio: false }} />
                             </div>
                        </div>
                     </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100">
                        <div className="card-header bg-white fw-bold py-3">Student Risk Overview</div>
                        <div className="card-body d-flex justify-content-center align-items-center">
                             <div style={{ height: '250px', width: '250px' }}>
                                <Pie data={studentDistData} />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// --- 2. UPLOAD HISTORY ---
export const FacultyHistory = () => {
    const [history, setHistory] = useState([]);
    useEffect(() => {
        const fetchHistory = async () => {
             const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
             const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/history`, config);
             setHistory(res.data);
        };
        fetchHistory();
    }, []);

    return (
        <Layout title="Attendance History">
            <div className="card shadow border-0">
                <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0 align-middle">
                        <thead className="table-primary"><tr><th>Date</th><th>Subject</th><th>Total Records</th><th>Status</th></tr></thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h._id}>
                                    <td>{new Date(h.date).toLocaleDateString()}</td>
                                    <td>{h.subjectName}</td>
                                    <td>{h.records.length}</td>
                                    <td><span className="badge bg-success">Uploaded</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

// --- 3. UPLOAD ATTENDANCE ---
export const FacultyAttendance = () => {
    const [students, setStudents] = useState([]);
    const [subject, setSubject] = useState('Java Programming');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [csvFile, setCsvFile] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchS = async () => {
             const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
             const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/students`, config);
             setStudents(res.data);
             const init = {}; res.data.forEach(s => init[s._id] = 'P');
             setAttendanceData(init);
        };
        fetchS();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        try {
            if (csvFile) {
                const fd = new FormData();
                fd.append('file', csvFile);
                fd.append('subjectName', subject);
                fd.append('date', date);
                const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/upload-csv`, fd, {headers: {...config.headers, 'Content-Type': 'multipart/form-data'}});
                setMsg(res.data.message);
            } else {
                const records = students.map(s => ({ studentId: s._id, status: attendanceData[s._id] }));
                const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/attendance`, { subjectName: subject, date, records }, config);
                setMsg(res.data.message);
            }
        } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    };

    return (
        <Layout title="Upload Attendance">
             {msg && <div className="alert alert-info">{msg}</div>}
             <div className="card shadow border-0 p-4">
                 <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6"><label>Subject</label><input className="form-control" value={subject} onChange={e=>setSubject(e.target.value)} /></div>
                        <div className="col-md-6"><label>Date</label><input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} /></div>
                    </div>
                    <div className="mb-3"><label>CSV Upload</label><input type="file" className="form-control" onChange={e=>setCsvFile(e.target.files[0])}/></div>
                    {!csvFile && (
                        <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                            <table className="table">
                                <thead><tr><th>Name</th><th>Status</th></tr></thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s._id}>
                                            <td>{s.firstName} {s.lastName}</td>
                                            <td>
                                                <button type="button" onClick={()=>setAttendanceData({...attendanceData, [s._id]: 'P'})} className={`btn btn-sm me-1 ${attendanceData[s._id]==='P'?'btn-success':'btn-outline-success'}`}>P</button>
                                                <button type="button" onClick={()=>setAttendanceData({...attendanceData, [s._id]: 'A'})} className={`btn btn-sm ${attendanceData[s._id]==='A'?'btn-danger':'btn-outline-danger'}`}>A</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <button className="btn btn-primary w-100 mt-3">Submit</button>
                 </form>
             </div>
        </Layout>
    );
};

// --- 4. UPLOAD MARKS ---
export const FacultyMarks = () => {
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [subject, setSubject] = useState('Java');
    const [max, setMax] = useState(30);
    const [csvFile, setCsvFile] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchS = async () => {
             const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
             const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/students`, config);
             setStudents(res.data);
             const init = {}; res.data.forEach(s => init[s._id] = '');
             setMarks(init);
        };
        fetchS();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        try {
            if (csvFile) {
                const fd = new FormData();
                fd.append('file', csvFile);
                fd.append('subjectName', subject);
                fd.append('maxMarks', max);
                fd.append('examType', 'Mid-Sem');
                const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/marks/csv`, fd, {headers: {...config.headers, 'Content-Type': 'multipart/form-data'}});
                setMsg(res.data.message);
            } else {
                const records = students.filter(s => marks[s._id] !== '').map(s => ({ studentId: s._id, marksObtained: Number(marks[s._id]) }));
                await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/marks`, { subjectName: subject, examType: 'Mid-Sem', maxMarks: max, records }, config);
                setMsg('Marks Uploaded Successfully');
            }
        } catch (e) { setMsg(e.response?.data?.message || 'Error'); }
    };

    return (
        <Layout title="Upload Marks">
            {msg && <div className="alert alert-info">{msg}</div>}
            <div className="card shadow border-0 p-4">
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6"><label>Subject</label><input className="form-control" value={subject} onChange={e=>setSubject(e.target.value)} /></div>
                        <div className="col-md-6"><label>Max Marks</label><input type="number" className="form-control" value={max} onChange={e=>setMax(e.target.value)} /></div>
                    </div>

                    <div className="mb-3">
                        <label>CSV Upload (Columns: enrollment, marks)</label>
                        <input type="file" className="form-control" onChange={e=>setCsvFile(e.target.files[0])}/>
                    </div>

                    {!csvFile && (
                        <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                            <table className="table">
                                <thead><tr><th>Name</th><th>Marks</th></tr></thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s._id}>
                                            <td>{s.firstName} {s.lastName}</td>
                                            <td><input type="number" className="form-control form-control-sm" value={marks[s._id]} onChange={e=>setMarks({...marks, [s._id]: e.target.value})} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <button className="btn btn-success w-100 mt-3">Upload</button>
                </form>
            </div>
        </Layout>
    );
};