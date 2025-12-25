import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const FacultyImpactReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hod/deep-analytics`, config);
                setData(res.data.facultyImpact);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <Layout title="Faculty Impact Report">
                    <div className="card shadow border-0">
                        <div className="card-header bg-white py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Faculty Performance Matrix</h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Faculty Name</th>
                                            <th>Subject</th>
                                            <th>Class Attendance</th>
                                            <th>Student Pass Rate</th>
                                            <th>Impact Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? <tr><td colSpan="5" className="text-center p-4">Calculating Impact...</td></tr> : data.map((f, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4 fw-bold">{f.name}</td>
                                                <td>{f.subject}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">{f.avgAttendance}%</span>
                                                        <div className="progress flex-grow-1" style={{height: '5px', width: '100px'}}>
                                                            <div className="progress-bar" style={{width: `${f.avgAttendance}%`}}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${f.passRate < 70 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                        {typeof f.passRate === 'number' ? f.passRate.toFixed(1) : f.passRate}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-warning">
                                                        ★★★★☆
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {data.length === 0 && !loading && <tr><td colSpan="5" className="text-center p-4">No faculty data available.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
        </Layout>
    );
};

export default FacultyImpactReport;