import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    // Removed userId, added email
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', employeeId: '', department: 'Computer Engineering', designation: 'Assistant Professor' });
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const facultyRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/faculty`, config);
            setFaculty(facultyRes.data);
            setLoading(false);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/faculty`, formData, config);
            
            setMsg({ text: `Success! Login created for ${res.data.credentials.email}`, type: 'success' });
            fetchData();
            setFormData({ firstName: '', lastName: '', email: '', employeeId: '', department: 'Computer Engineering', designation: 'Assistant Professor' }); 
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error Adding Profile', type: 'danger' });
        }
    };

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} and their login access?`)) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`, config);
            setMsg({ text: 'Faculty removed successfully', type: 'success' });
            fetchData();
        } catch (err) {
            setMsg({ text: 'Delete failed', type: 'danger' });
        }
    };

    return (
        <Layout title="Faculty Management">

                    <div className="row">
                        {/* FORM */}
                        <div className="col-lg-4">
                            <div className="card shadow border-0">
                                <div className="card-header bg-primary text-white">
                                    <h6 className="m-0 fw-bold">Add New Faculty</h6>
                                </div>
                                <div className="card-body">
                                    {msg.text && <div className={`alert alert-${msg.type} small`}>{msg.text}</div>}
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Official Email (Login ID)</label>
                                            <input type="email" className="form-control" required placeholder="faculty@ksv.ac.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                            <div className="form-text">System will auto-create login with password '123456'.</div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Employee ID</label>
                                            <input type="text" className="form-control" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col">
                                                <label className="form-label small fw-bold">First Name</label>
                                                <input type="text" className="form-control" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                            </div>
                                            <div className="col">
                                                <label className="form-label small fw-bold">Last Name</label>
                                                <input type="text" className="form-control" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Department</label>
                                            <select className="form-select" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                                <option>Computer Engineering</option>
                                                <option>Information Technology</option>
                                                <option>Civil Engineering</option>
                                                <option>Mechanical Engineering</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Designation</label>
                                            <input type="text" className="form-control" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                                        </div>
                                        <button className="btn btn-primary w-100">Create Faculty & Login</button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="col-lg-8">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-white py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Faculty Directory</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-4">Name / ID</th>
                                                    <th>Department</th>
                                                    <th>Designation</th>
                                                    <th>Role</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr> : faculty.map((f, i) => (
                                                    <tr key={i}>
                                                        <td className="ps-4">
                                                            <div className="fw-bold">{f.firstName} {f.lastName}</div>
                                                            <small className="text-muted">{f.employeeId}</small>
                                                        </td>
                                                        <td>{f.department}</td>
                                                        <td>{f.designation}</td>
                                                        <td>
                                                            {f.isMentor ? <span className="badge bg-warning text-dark">Mentor</span> : <span className="badge bg-secondary">Faculty</span>}
                                                        </td>
                                                        <td>{f.isActive ? <span className="text-success small">Active</span> : <span className="text-danger small">Inactive</span>}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger" 
                                                                onClick={() => handleDelete(f.userId?._id, f.firstName)}
                                                                disabled={!f.userId}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {faculty.length === 0 && !loading && <tr><td colSpan="6" className="p-4 text-center">No faculty profiles found.</td></tr>}
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

export default FacultyManagement;
