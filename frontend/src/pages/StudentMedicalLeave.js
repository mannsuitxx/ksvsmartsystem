import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';
import moment from 'moment';

const StudentMedicalLeave = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });
    const [file, setFile] = useState(null);

    const fetchLeaves = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/leaves/my`, config);
            setLeaves(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        data.append('reason', formData.reason);
        data.append('certificate', file);

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/leaves`, data, config);
            alert('Medical leave application submitted!');
            setFormData({ startDate: '', endDate: '', reason: '' });
            setFile(null);
            fetchLeaves();
        } catch (error) {
            alert('Error submitting application');
        }
    };

    if (loading) return <Layout title="Medical Leave"><div>Loading...</div></Layout>;

    return (
        <Layout title="Medical Leave Application">
            <div className="row">
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white fw-bold">New Application</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Start Date</label>
                                        <input type="date" className="form-control" required 
                                            value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">End Date</label>
                                        <input type="date" className="form-control" required 
                                            value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Reason</label>
                                    <textarea className="form-control" rows="3" required 
                                        value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Medical Certificate</label>
                                    <input type="file" className="form-control" required onChange={e => setFile(e.target.files[0])} />
                                    <div className="form-text">Upload valid doctor's certificate (PDF/Image).</div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Submit Application</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-7">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold">Application History</div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date Range</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map(l => (
                                        <tr key={l._id}>
                                            <td>
                                                <div>{moment(l.startDate).format('DD MMM')} - {moment(l.endDate).format('DD MMM')}</div>
                                                <small className="text-muted">{l.reason}</small>
                                            </td>
                                            <td>
                                                <span className={`badge ${l.status === 'approved' ? 'bg-success' : l.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                    {l.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="small text-muted">{l.mentorRemarks || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentMedicalLeave;
