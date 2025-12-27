import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';
import moment from 'moment';

const MentorMedicalLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/leaves/pending`, config);
            setLeaves(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleUpdate = async (id, status) => {
        const remarks = prompt("Enter remarks for decision:");
        if (remarks === null) return;

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.put(`${API_URL}/api/leaves/${id}`, { status, mentorRemarks: remarks }, config);
            fetchLeaves();
            alert(`Leave application ${status}`);
        } catch (error) {
            alert('Error updating status');
        }
    };

    if (loading) return <Layout title="Medical Leaves"><div>Loading...</div></Layout>;

    return (
        <Layout title="Medical Leave Management">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Pending Medical Leave Applications</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Student</th>
                                <th>Duration</th>
                                <th>Reason</th>
                                <th>Certificate</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map(l => (
                                <tr key={l._id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{l.studentId?.firstName} {l.studentId?.lastName}</div>
                                        <div className="text-muted small">{l.studentId?.enrollmentNumber}</div>
                                    </td>
                                    <td>
                                        {moment(l.startDate).format('DD MMM')} - {moment(l.endDate).format('DD MMM YYYY')}
                                        <div className="text-muted small">
                                            {moment(l.endDate).diff(moment(l.startDate), 'days') + 1} Days
                                        </div>
                                    </td>
                                    <td>{l.reason}</td>
                                    <td>
                                        <a href={`${API_URL}${l.certificateUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">
                                            View Doc
                                        </a>
                                    </td>
                                    <td>
                                        <button onClick={() => handleUpdate(l._id, 'approved')} className="btn btn-sm btn-success me-2">Approve</button>
                                        <button onClick={() => handleUpdate(l._id, 'rejected')} className="btn btn-sm btn-danger">Reject</button>
                                    </td>
                                </tr>
                            ))}
                            {leaves.length === 0 && <tr><td colSpan="5" className="text-center p-4">No pending leave applications.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default MentorMedicalLeaves;
