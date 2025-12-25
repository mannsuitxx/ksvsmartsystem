import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RiskExplanation from '../components/RiskExplanation';
import AttendanceDrillDown from '../components/AttendanceDrillDown';
import MentorInterventionPanel from '../components/MentorInterventionPanel';

const StudentProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const url = `${process.env.REACT_APP_API_URL}/api/students/${id}`;
        console.log(`[FRONTEND] Requesting: ${url}`);
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.get(url, config);
        console.log("Student Profile Data:", res.data);
        setStudent(res.data);
      } catch (e) { 
        console.error("Error fetching student profile:", e);
        if (e.response) {
            console.error("Response Data Type:", typeof e.response.data);
            console.error("Response Data:", e.response.data);
            console.error("Response Status:", e.response.status);
            
            if (e.response.status === 404) {
                 setError('Student not found (404). Please check the ID.');
            } else {
                 setError(`Server Error: ${e.response.data?.message || e.response.statusText}`);
            }
        } else if (e.request) {
            console.error("No response received:", e.request);
            setError('Network Error: Server not reachable.');
        } else {
            console.error("Request setup error:", e.message);
            setError(`Request Error: ${e.message}`);
        }
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
    <div className="d-flex" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Sidebar role="faculty" />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar title={`Profile: ${student.firstName} ${student.lastName}`} />
        <div className="container-fluid p-4">
            
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
                                            src={`${process.env.REACT_APP_API_URL}/${student.profilePicture}`} 
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

        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;
