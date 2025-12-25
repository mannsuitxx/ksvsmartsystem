import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ q: '', department: '', semester: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, params: filters };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students`, config);
      setStudents(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <Layout title="Student Directory">
            
            {/* Filters */}
            <div className="card shadow border-0 mb-4 p-3">
                <div className="row g-3">
                    <div className="col-md-4">
                        <input type="text" className="form-control" placeholder="Search Enrollment or Name..." value={filters.q} onChange={e=>setFilters({...filters, q: e.target.value})} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={filters.department} onChange={e=>setFilters({...filters, department: e.target.value})}>
                            <option value="">All Departments</option>
                            <option value="Computer Engineering">Computer Engineering</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                         <select className="form-select" value={filters.semester} onChange={e=>setFilters({...filters, semester: e.target.value})}>
                            <option value="">All Semesters</option>
                            <option value="1">Sem 1</option><option value="2">Sem 2</option><option value="3">Sem 3</option>
                            <option value="4">Sem 4</option><option value="5">Sem 5</option><option value="6">Sem 6</option>
                            <option value="7">Sem 7</option><option value="8">Sem 8</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary w-100" onClick={fetchStudents}>Refresh</button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Enrollment</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Sem</th>
                                    <th>Risk Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr> : 
                                students.length === 0 ? <tr><td colSpan="6" className="text-center py-4">No students found.</td></tr> :
                                students.map(s => (
                                    <tr key={s._id} style={{cursor: 'pointer'}} onClick={() => navigate(`/faculty/student/${s._id}`)}>
                                        <td className="fw-bold">{s.enrollmentNumber}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary text-white rounded-circle me-2 d-flex justify-content-center align-items-center" style={{width: '32px', height: '32px'}}>
                                                    {s.firstName.charAt(0)}
                                                </div>
                                                {s.firstName} {s.lastName}
                                            </div>
                                        </td>
                                        <td>{s.department}</td>
                                        <td>{s.currentSemester}</td>
                                        <td>
                                            <span className={`badge ${s.riskProfile?.level === 'High Risk' ? 'bg-danger' : s.riskProfile?.level === 'Moderate Risk' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                {s.riskProfile?.level || 'Safe'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary" onClick={(e) => {e.stopPropagation(); navigate(`/faculty/student/${s._id}`)}}>View Profile</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    </Layout>
  );
};

export default StudentDirectory;