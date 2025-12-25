import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const FacultyStudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // View Mode: 'list', 'upload', 'add'
    const [view, setView] = useState('list'); 

    // Search & Filter State
    const [query, setQuery] = useState('');
    const [dept, setDept] = useState('');
    const [sem, setSem] = useState('');

    // Bulk Upload State
    const [csvFile, setCsvFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [uploadMsg, setUploadMsg] = useState({ text: '', type: '' });

    // Single Add State
    const [formData, setFormData] = useState({
        enrollmentNumber: '', firstName: '', lastName: '', email: '', department: 'Computer Engineering', currentSemester: 1
    });

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (dept) params.append('department', dept);
            if (sem) params.append('semester', sem);

            const res = await axios.get(`${API_URL}/api/students?${params.toString()}`, config);
            setStudents(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, [query, dept, sem]);

    useEffect(() => {
        if(view === 'list') fetchStudents();
    }, [view, fetchStudents]);

    // --- BULK CSV LOGIC ---
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setCsvFile(file);
        setPreviewData([]);
        setUploadMsg({ text: '', type: '' });

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').slice(0, 11);
                const parsed = lines.map(line => line.split(','));
                setPreviewData(parsed.filter(row => row.length > 1));
            };
            reader.readAsText(file);
        }
    };

    const handleUploadSubmit = async () => {
        if (!csvFile) return;
        setUploadMsg({ text: 'Uploading...', type: 'info' });
        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } };
            await axios.post(`${API_URL}/api/students/upload`, formData, config);
            setUploadMsg({ text: 'Success!', type: 'success' });
            setTimeout(() => setView('list'), 1500);
        } catch (err) {
            const msg = err.response?.data?.message || 'Upload Failed';
            setUploadMsg({ text: msg, type: 'danger' });
        }
    };

    // --- SINGLE ADD LOGIC ---
    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        setUploadMsg({ text: 'Creating Student & User Account...', type: 'info' });

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/students/add`, formData, config);
            setUploadMsg({ text: 'Student Account Created! Default Pass: 123456', type: 'success' });
            setFormData({ enrollmentNumber: '', firstName: '', lastName: '', email: '', department: 'Computer Engineering', currentSemester: 1 });
            setTimeout(() => setView('list'), 2000);
        } catch (err) {
             const msg = err.response?.data?.message || 'Creation Failed';
             setUploadMsg({ text: msg, type: 'danger' });
        }
    };

    // --- DELETE LOGIC ---
    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This will remove their login access as well.`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                await axios.delete(`${API_URL}/api/students/${id}`, config);
                setUploadMsg({ text: 'Student Deleted Successfully', type: 'success' });
                fetchStudents(); // Refresh list
            } catch (err) {
                setUploadMsg({ text: 'Delete Failed', type: 'danger' });
            }
        }
    };

    return (
        <Layout title="Student Management">
                    
                    {/* ACTION BAR */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">Student Directory</h4>
                        <div className="d-flex flex-wrap gap-2">
                            <button className={`btn ${view === 'list' ? 'btn-outline-primary' : 'btn-light'}`} onClick={() => setView('list')}>
                                Directory
                            </button>
                            <button className={`btn ${view === 'add' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('add')}> 
                                + Add Student
                            </button>
                            <button className={`btn ${view === 'upload' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setView('upload')}> 
                                Bulk Upload
                            </button>
                        </div>
                    </div>
                    
                    {/* Global Message */}
                    {uploadMsg.text && view === 'list' && (
                         <div className={`alert alert-${uploadMsg.type} alert-dismissible fade show`} role="alert">
                            {uploadMsg.text}
                            <button type="button" className="btn-close" onClick={() => setUploadMsg({ text: '', type: '' })}></button>
                         </div>
                    )}

                    {/* 1. SINGLE ADD FORM */}
                    {view === 'add' && (
                        <div className="card shadow-sm border-0 mb-4">
                             <div className="card-header bg-primary text-white">Add New Student & Grant Access</div>
                             <div className="card-body p-4">
                                {uploadMsg.text && <div className={`alert alert-${uploadMsg.type}`}>{uploadMsg.text}</div>}
                                <form onSubmit={handleSingleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Enrollment No.</label>
                                            <input type="text" className="form-control" required 
                                                value={formData.enrollmentNumber} onChange={e=>setFormData({...formData, enrollmentNumber: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email (Login ID)</label>
                                            <input type="email" className="form-control" required 
                                                value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">First Name</label>
                                            <input type="text" className="form-control" required 
                                                value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Last Name</label>
                                            <input type="text" className="form-control" required 
                                                value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Department</label>
                                            <select className="form-select" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})}>
                                                <option>Computer Engineering</option>
                                                <option>Information Technology</option>
                                                <option>Civil Engineering</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Semester</label>
                                            <select className="form-select" value={formData.currentSemester} onChange={e=>setFormData({...formData, currentSemester: e.target.value})}>
                                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-12 mt-4">
                                            <button className="btn btn-primary w-100 py-2">Create Account</button>
                                        </div>
                                    </div>
                                </form>
                             </div>
                        </div>
                    )}

                    {/* 2. BULK UPLOAD FORM */}
                    {view === 'upload' && (
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-success text-white">Bulk CSV Upload</div>
                            <div className="card-body p-4">
                                {uploadMsg.text && <div className={`alert alert-${uploadMsg.type}`}>{uploadMsg.text}</div>}
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <input type="file" className="form-control" accept=".csv" onChange={handleFileSelect} />
                                        <div className="form-text">Format: enrollment, name, department, semester, email</div>
                                    </div>
                                    <div className="col-md-6">
                                        <button className="btn btn-success w-100" disabled={!csvFile} onClick={handleUploadSubmit}>Upload CSV</button>
                                    </div>
                                </div>
                                {previewData.length > 0 && (
                                    <div className="mt-3 table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <tbody>
                                                {previewData.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. STUDENT LIST */}
                    {view === 'list' && (
                        <>
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-3">
                                <div className="row g-2">
                                    <div className="col-md-4">
                                        <input type="text" className="form-control" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <select className="form-select" value={dept} onChange={(e) => setDept(e.target.value)}>
                                            <option value="">All Depts</option>
                                            <option>Computer Engineering</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <select className="form-select" value={sem} onChange={(e) => setSem(e.target.value)}>
                                            <option value="">All Sems</option>
                                            <option value="5">Sem 5</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card shadow-sm border-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Enrollment</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Dept</th>
                                            <th>Sem</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">Loading students...</td>
                                            </tr>
                                        ) : students.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">No students found.</td>
                                            </tr>
                                        ) : (
                                            students.map(s => (
                                                <tr key={s._id}>
                                                    <td className="ps-4 fw-bold text-primary">{s.enrollmentNumber}</td>
                                                    <td>{s.firstName} {s.lastName}</td>
                                                    <td>{s.email}</td>
                                                    <td>{s.department}</td>
                                                    <td>{s.currentSemester}</td>
                                                    <td className="text-end pe-4">
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() => navigate(`/faculty/student/${s.enrollmentNumber}`)}
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(s._id, s.firstName)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </>
                    )}
        </Layout>
    );
};

export default FacultyStudentList;
