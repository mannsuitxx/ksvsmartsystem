import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const DepartmentSetup = () => {
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [newDept, setNewDept] = useState({ name: '', code: '' });
    const [newSub, setNewSub] = useState({ name: '', code: '', department: 'Computer Engineering', semester: 1, credits: 4, type: 'Theory' });
    const [activeTab, setActiveTab] = useState('dept');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const dRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/departments`, config);
            const sRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/subjects`, config);
            setDepartments(dRes.data);
            setSubjects(sRes.data);
        } catch (err) { console.error(err); }
    };

    const handleAddDept = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/departments`, newDept, config);
            setNewDept({ name: '', code: '' });
            fetchData();
        } catch (err) { alert('Error adding department'); }
    };

    const handleAddSub = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/subjects`, newSub, config);
            setNewSub({ ...newSub, name: '', code: '' }); // Keep dept/sem for easier entry
            fetchData();
        } catch (err) { alert('Error adding subject'); }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar role="admin" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Academic Structure" />
                <div className="container-fluid p-4">

                    <ul className="nav nav-pills mb-4">
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'dept' ? 'active' : ''}`} onClick={() => setActiveTab('dept')}>Departments</button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === 'sub' ? 'active' : ''}`} onClick={() => setActiveTab('sub')}>Subjects</button>
                        </li>
                    </ul>

                    {activeTab === 'dept' && (
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card shadow border-0">
                                    <div className="card-header bg-white fw-bold">Add Department</div>
                                    <div className="card-body">
                                        <form onSubmit={handleAddDept}>
                                            <div className="mb-3">
                                                <label className="form-label">Dept Name</label>
                                                <input className="form-control" required value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Dept Code</label>
                                                <input className="form-control" required value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} />
                                            </div>
                                            <button className="btn btn-primary w-100">Save</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="card shadow border-0">
                                    <div className="card-body p-0">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light"><tr><th className="ps-4">Name</th><th>Code</th></tr></thead>
                                            <tbody>
                                                {departments.map(d => (
                                                    <tr key={d._id}><td className="ps-4 fw-bold">{d.name}</td><td>{d.code}</td></tr>
                                                ))}
                                                {departments.length === 0 && <tr><td colSpan="2" className="text-center p-3">No departments yet.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sub' && (
                        <div className="row">
                             <div className="col-md-4">
                                <div className="card shadow border-0">
                                    <div className="card-header bg-white fw-bold">Add Subject</div>
                                    <div className="card-body">
                                        <form onSubmit={handleAddSub}>
                                            <div className="mb-2">
                                                <label className="form-label small">Name</label>
                                                <input className="form-control" required value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label small">Code</label>
                                                <input className="form-control" required value={newSub.code} onChange={e => setNewSub({...newSub, code: e.target.value})} />
                                            </div>
                                            <div className="row">
                                                <div className="col">
                                                     <label className="form-label small">Sem</label>
                                                     <input type="number" className="form-control" required value={newSub.semester} onChange={e => setNewSub({...newSub, semester: e.target.value})} />
                                                </div>
                                                <div className="col">
                                                     <label className="form-label small">Credits</label>
                                                     <input type="number" className="form-control" required value={newSub.credits} onChange={e => setNewSub({...newSub, credits: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="mb-3 mt-2">
                                                <label className="form-label small">Type</label>
                                                <select className="form-select" value={newSub.type} onChange={e => setNewSub({...newSub, type: e.target.value})}>
                                                    <option>Theory</option>
                                                    <option>Practical</option>
                                                    <option>Project</option>
                                                </select>
                                            </div>
                                            <button className="btn btn-primary w-100">Save Subject</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                             <div className="col-md-8">
                                <div className="card shadow border-0">
                                    <div className="card-body p-0">
                                        <div className="table-responsive" style={{maxHeight: '500px'}}>
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light"><tr><th className="ps-4">Subject</th><th>Code</th><th>Sem</th><th>Credits</th></tr></thead>
                                                <tbody>
                                                    {subjects.map(s => (
                                                        <tr key={s._id}>
                                                            <td className="ps-4 fw-bold">{s.name} <span className="badge bg-light text-dark border ms-1">{s.type}</span></td>
                                                            <td>{s.code}</td>
                                                            <td>{s.semester}</td>
                                                            <td>{s.credits}</td>
                                                        </tr>
                                                    ))}
                                                    {subjects.length === 0 && <tr><td colSpan="4" className="text-center p-3">No subjects defined.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default DepartmentSetup;
