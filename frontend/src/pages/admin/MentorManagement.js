import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { API_URL } from '../../config';

const MentorManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [students, setStudents] = useState([]); // All students
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]); // Array of IDs
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            // Fetch Faculty Profiles
            const facRes = await axios.get(`${API_URL}/api/admin/faculty`, config);
            setFaculty(facRes.data);
            
            // Fetch Students
            const stuRes = await axios.get(`${API_URL}/api/faculty/students`, config);
            setStudents(stuRes.data);
        } catch (err) { console.error(err); }
    };

    const handleAssign = async () => {
        if(!selectedFaculty) { alert('Select a Faculty first'); return; }
        if(selectedStudents.length === 0) { alert('Select at least one student'); return; }

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            // Need User ID of faculty for the backend logic
            const targetFac = faculty.find(f => f._id === selectedFaculty);
            
            if(!targetFac || !targetFac.userId) {
                alert("Error: This faculty profile is not linked to a system user account. Please recreate the profile with a valid email.");
                return;
            }

            await axios.post(`${API_URL}/api/admin/mentor/assign`, {
                facultyId: targetFac.userId._id, 
                studentIds: selectedStudents
            }, config);

            setMsg({ text: `Successfully assigned ${selectedStudents.length} students to ${targetFac.firstName}!`, type: 'success' });
            setSelectedStudents([]);
            fetchData();
        } catch (err) {
            setMsg({ text: 'Assignment Failed', type: 'danger' });
        }
    };

    const toggleStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    return (
        <Layout title="Mentor Management">

                    <div className="row g-4">
                        
                        {/* LEFT: Controls */}
                        <div className="col-lg-4">
                            <div className="card shadow border-0 mb-4">
                                <div className="card-header bg-warning text-dark fw-bold">
                                    Assign Mentorship
                                </div>
                                <div className="card-body">
                                    {msg.text && <div className={`alert alert-${msg.type} small`}>{msg.text}</div>}
                                    
                                    <label className="form-label fw-bold">1. Select Faculty</label>
                                    <select className="form-select mb-3" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}>
                                        <option value="">-- Choose Faculty --</option>
                                        {faculty.map(f => (
                                            <option key={f._id} value={f._id}>
                                                {f.firstName} {f.lastName} {f.isMentor ? '(Already Mentor)' : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">2. Select Students</label>
                                        <p className="small text-muted mb-1">Check students from the list on the right.</p>
                                        <div className="p-2 bg-light border rounded text-center">
                                            <h3 className="fw-bold text-primary mb-0">{selectedStudents.length}</h3>
                                            <small>Students Selected</small>
                                        </div>
                                    </div>

                                    <button className="btn btn-dark w-100" onClick={handleAssign} disabled={!selectedFaculty}>
                                        Confirm Assignment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Student List */}
                        <div className="col-lg-8">
                             <div className="card shadow border-0 h-100">
                                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                    <h6 className="m-0 font-weight-bold text-primary">Unassigned Students</h6>
                                    {/* Mock Filter */}
                                    <span className="badge bg-light text-dark border">Showing All</span>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive" style={{maxHeight: '600px'}}>
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th className="ps-4" style={{width: '50px'}}>Select</th>
                                                    <th>Student Name</th>
                                                    <th>Enrollment</th>
                                                    <th>Current Mentor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center p-5 text-muted">
                                                            <i className="bi bi-people display-4 d-block mb-3"></i>
                                                            <h5>No Students Found</h5>
                                                            <p>Please upload student data in "Data Import/Export" first.</p>
                                                        </td>
                                                    </tr>
                                                ) : students.map(s => (
                                                    <tr key={s._id} className={selectedStudents.includes(s._id) ? 'table-primary' : ''}>
                                                        <td className="ps-4">
                                                            <input 
                                                                type="checkbox" 
                                                                className="form-check-input"
                                                                checked={selectedStudents.includes(s._id)}
                                                                onChange={() => toggleStudent(s._id)}
                                                            />
                                                        </td>
                                                        <td className="fw-bold">{s.firstName} {s.lastName}</td>
                                                        <td>{s.enrollmentNumber}</td>
                                                        <td>
                                                            {s.mentorId ? <span className="text-success small">Assigned</span> : <span className="text-danger small fw-bold">Unassigned</span>}
                                                        </td>
                                                    </tr>
                                                ))}
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

export default MentorManagement;
