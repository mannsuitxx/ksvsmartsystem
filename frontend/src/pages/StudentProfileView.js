import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';
import RiskExplanation from '../components/RiskExplanation';
import AttendanceDrillDown from '../components/AttendanceDrillDown';
import MentorInterventionPanel from '../components/MentorInterventionPanel';

const StudentProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const url = `${API_URL}/api/students/${id}`;
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.get(url, config);
        setStudent(res.data);
        
        // Fetch leaves
        const leaveRes = await axios.get(`${API_URL}/api/leaves/student/${id}`, config);
        setLeaves(leaveRes.data.filter(l => l.status === 'approved'));

      } catch (e) { 
        console.error("Error fetching student profile:", e);
        setError(e.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id, navigate]);

  if (loading) return <div className="p-5 text-center">Loading Profile...</div>;
  if (error) return <div className="p-5 text-center text-danger">Error: {error}</div>;
  if (!student) return <div className="p-5 text-center">Student not found.</div>;

  return (
    <Layout title={`Profile: ${student.firstName} ${student.lastName}`}>
            
            <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate(-1)}>&larr; Back to Directory</button>

            {/* Top Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <div className="mb-3 d-flex justify-content-center">
                                <div style={{width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e9ecef', overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 0 5px rgba(0,0,0,0.1)'}}>
                                    {student.profilePicture ? (
                                        <img 
                                            src={`${API_URL}/${student.profilePicture}`} 
                                            alt="Profile" 
                                            className="w-100 h-100" 
                                            style={{objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                            <i className="bi bi-person fs-1"></i>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h5 className="fw-bold text-primary mb-3">Student Details</h5>
                            <ul className="list-group list-group-flush text-start">
                                <li className="list-group-item px-0"><strong>Enrollment:</strong> {student.enrollmentNumber}</li>
                                <li className="list-group-item px-0"><strong>Department:</strong> {student.department}</li>
                                <li className="list-group-item px-0"><strong>Semester:</strong> {student.currentSemester}</li>
                                <li className="list-group-item px-0"><strong>Email:</strong> {student.email}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <RiskExplanation risk={student.riskProfile} />
                    
                    {/* Approved Medical Leaves */}
                    {leaves.length > 0 && (
                        <div className="card shadow border-0 mt-3">
                            <div className="card-header bg-success text-white small fw-bold">Approved Medical Leaves (Exempted)</div>
                            <ul className="list-group list-group-flush small">
                                {leaves.map(l => (
                                    <li key={l._id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>
                                            {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                                            <span className="text-muted ms-2">({l.reason})</span>
                                        </span>
                                        <span className="badge bg-success">Approved</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Drill Down & Interventions */}
            <div className="row g-4">
                <div className="col-lg-7">
                    <AttendanceDrillDown studentId={student._id} />
                </div>
                <div className="col-lg-5">
                    <MentorInterventionPanel studentId={student._id} />
                </div>
            </div>
    </Layout>
  );
};

export default StudentProfileView;
