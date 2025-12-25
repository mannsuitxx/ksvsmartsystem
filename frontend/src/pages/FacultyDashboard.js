import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [mentees, setMentees] = useState([]); // Mentor Data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Forms State
  const [subject, setSubject] = useState('Java Programming');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [examType, setExamType] = useState('Mid-Sem');
  const [maxMarks, setMaxMarks] = useState(30);

  // CSV State
  const [csvFile, setCsvFile] = useState(null);

  // Manual Data Entry State
  const [attendanceData, setAttendanceData] = useState({});
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    fetchStudents();
    if (user && user.role === 'mentor') fetchMentees();
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/faculty/students`, config);
      setStudents(data);
      
      const initAtt = {};
      const initMarks = {};
      data.forEach(s => {
          initAtt[s._id] = 'P'; 
          initMarks[s._id] = ''; 
      });
      setAttendanceData(initAtt);
      setMarksData(initMarks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
      try {
          const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/mentor/mentees`, config);
          setMentees(res.data);
      } catch (err) { console.error(err); }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Submitting...', type: 'info' });
    
    // Check if CSV is selected
    if (csvFile) {
        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('subjectName', subject);
        formData.append('date', date);

        try {
            const config = { 
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/upload-csv`, formData, config);
            setMessage({ text: 'CSV Attendance Uploaded Successfully!', type: 'success' });
            setCsvFile(null);
        } catch (err) {
            setMessage({ text: 'CSV Upload Failed!', type: 'danger' });
        }
        return;
    }

    // Fallback to Manual JSON
    const records = students.map(s => ({
        studentId: s._id,
        status: attendanceData[s._id]
    }));

    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/attendance`, {
          subjectName: subject,
          date,
          records
      }, config);
      setMessage({ text: 'Manual Attendance Uploaded Successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Upload Failed!', type: 'danger' });
    }
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Submitting...', type: 'info' });

    const records = students
        .filter(s => marksData[s._id] !== '')
        .map(s => ({
            studentId: s._id,
            marksObtained: Number(marksData[s._id])
        }));

    if (records.length === 0) {
        setMessage({ text: 'Please enter marks for at least one student', type: 'warning' });
        return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/faculty/marks`, {
          subjectName: subject,
          examType,
          maxMarks,
          records
      }, config);
      setMessage({ text: 'Marks Uploaded Successfully!', type: 'success' });
      const newMarks = { ...marksData };
      Object.keys(newMarks).forEach(k => newMarks[k] = '');
      setMarksData(newMarks);
    } catch (err) {
      setMessage({ text: 'Upload Failed!', type: 'danger' });
    }
  };

  return (
    <Layout title={user?.role === 'mentor' ? "Faculty & Mentor Dashboard" : "Faculty Dashboard"}>

        <div className="container-fluid p-4">
          <h4 className="fw-bold mb-4">Academic Management</h4>

          {message.text && (
             <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
             </div>
          )}

          <div className="card shadow-sm border-0">
             <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'students' ? 'active fw-bold' : 'text-muted'}`}
                        onClick={() => setActiveTab('students')}
                    >
                        Student List
                    </button>
                  </li>
                  {user?.role === 'mentor' && (
                      <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'mentees' ? 'active fw-bold' : 'text-muted'}`}
                            onClick={() => setActiveTab('mentees')}
                        >
                            <i className="bi bi-people-fill me-1"></i>My Mentees
                        </button>
                      </li>
                  )}
                  <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'attendance' ? 'active fw-bold' : 'text-muted'}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        Upload Attendance
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'marks' ? 'active fw-bold' : 'text-muted'}`}
                        onClick={() => setActiveTab('marks')}
                    >
                        Upload Marks
                    </button>
                  </li>
                </ul>
             </div>
             
             <div className="card-body p-4">
               
               {activeTab === 'students' && (
                 <div className="table-responsive">
                    <table className="table table-hover align-middle">
                       <thead className="table-light">
                          <tr>
                             <th>Enrollment</th>
                             <th>Name</th>
                             <th>Department</th>
                             <th>Semester</th>
                             <th>Risk Status</th>
                          </tr>
                       </thead>
                       <tbody>
                          {students.map(s => (
                              <tr key={s._id}>
                                  <td>{s.enrollmentNumber}</td>
                                  <td>{s.firstName} {s.lastName}</td>
                                  <td>{s.department}</td>
                                  <td>{s.currentSemester}</td>
                                  <td>
                                    <span className={`badge ${s.riskProfile?.level === 'Safe' ? 'bg-success' : 'bg-danger'}`}>
                                        {s.riskProfile?.level || 'Unknown'}
                                    </span>
                                  </td>
                              </tr>
                          ))}
                          {students.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No students found</td></tr>}
                       </tbody>
                    </table>
                 </div>
               )}

               {activeTab === 'mentees' && (
                 <div className="table-responsive">
                     <div className="alert alert-info border-0 small">
                         <i className="bi bi-info-circle-fill me-2"></i>
                         You are assigned as Mentor for these students. Use the sidebar "Mentor Menu" for detailed analytics.
                     </div>
                    <table className="table table-hover align-middle">
                       <thead className="table-light">
                          <tr>
                             <th>Enrollment</th>
                             <th>Name</th>
                             <th>Risk Level</th>
                             <th>Action</th>
                          </tr>
                       </thead>
                       <tbody>
                          {mentees.map(s => (
                              <tr key={s._id}>
                                  <td>{s.enrollmentNumber}</td>
                                  <td>{s.firstName} {s.lastName}</td>
                                  <td>
                                      <span className={`badge ${
                                          s.riskProfile?.level === 'High Risk' ? 'bg-danger' : 
                                          s.riskProfile?.level === 'Moderate Risk' ? 'bg-warning text-dark' : 'bg-success'
                                      }`}>
                                        {s.riskProfile?.level || 'Safe'}
                                      </span>
                                  </td>
                                  <td>
                                      <a href="/mentor/dashboard" className="btn btn-sm btn-primary">
                                          Mentor Dashboard
                                      </a>
                                  </td>
                              </tr>
                          ))}
                          {mentees.length === 0 && <tr><td colSpan="4" className="text-center">No mentees assigned yet.</td></tr>}
                       </tbody>
                    </table>
                 </div>
               )}

               {activeTab === 'attendance' && (
                  <form onSubmit={handleAttendanceSubmit}>
                      <div className="row g-3 mb-4">
                          <div className="col-md-4">
                              <label className="form-label fw-bold">Subject</label>
                              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                                  <option>Java Programming</option>
                                  <option>Data Structures</option>
                                  <option>Web Technologies</option>
                              </select>
                          </div>
                          <div className="col-md-4">
                              <label className="form-label fw-bold">Date</label>
                              <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
                          </div>
                      </div>

                      <div className="mb-4 p-3 bg-light border rounded">
                        <label className="form-label fw-bold text-primary">Option 1: Bulk Upload via CSV</label>
                        <input 
                            type="file" 
                            className="form-control" 
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                        />
                        <div className="form-text">CSV Format: <code>enrollment, status</code> (e.g., KSV2025001, P)</div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold text-secondary">Option 2: Manual Entry (If no file selected)</label>
                      </div>

                      <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-bordered">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Enrollment</th>
                                    <th>Name</th>
                                    <th style={{ width: '150px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s._id} className={attendanceData[s._id] === 'A' ? 'table-danger' : ''}>
                                        <td>{s.enrollmentNumber}</td>
                                        <td>{s.firstName} {s.lastName}</td>
                                        <td>
                                            <div className="btn-group w-100" role="group">
                                                <input 
                                                    type="radio" 
                                                    className="btn-check" 
                                                    name={`att-${s._id}`} 
                                                    id={`p-${s._id}`} 
                                                    autoComplete="off"
                                                    checked={attendanceData[s._id] === 'P'}
                                                    onChange={() => setAttendanceData({...attendanceData, [s._id]: 'P'})}
                                                    disabled={!!csvFile}
                                                />
                                                <label className="btn btn-outline-success btn-sm" htmlFor={`p-${s._id}`}>P</label>

                                                <input 
                                                    type="radio" 
                                                    className="btn-check" 
                                                    name={`att-${s._id}`} 
                                                    id={`a-${s._id}`} 
                                                    autoComplete="off"
                                                    checked={attendanceData[s._id] === 'A'}
                                                    onChange={() => setAttendanceData({...attendanceData, [s._id]: 'A'})}
                                                    disabled={!!csvFile}
                                                />
                                                <label className="btn btn-outline-danger btn-sm" htmlFor={`a-${s._id}`}>A</label>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                      
                      <button type="submit" className="btn btn-primary w-100 mt-3">
                          {csvFile ? 'Upload CSV Attendance' : 'Submit Manual Attendance'}
                      </button>
                  </form>
               )}

               {activeTab === 'marks' && (
                   <form onSubmit={handleMarksSubmit}>
                      <div className="row g-3 mb-4">
                          <div className="col-md-3">
                              <label className="form-label fw-bold">Subject</label>
                              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                                  <option>Java Programming</option>
                                  <option>Data Structures</option>
                              </select>
                          </div>
                          <div className="col-md-3">
                              <label className="form-label fw-bold">Exam Type</label>
                              <select className="form-select" value={examType} onChange={(e) => setExamType(e.target.value)}>
                                  <option>Mid-Sem</option>
                                  <option>Quiz</option>
                              </select>
                          </div>
                          <div className="col-md-3">
                              <label className="form-label fw-bold">Max Marks</label>
                              <input type="number" className="form-control" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />
                          </div>
                          <div className="col-md-3 d-flex align-items-end">
                              <button type="submit" className="btn btn-success w-100">Upload Marks</button>
                          </div>
                      </div>

                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-bordered">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Enrollment</th>
                                    <th>Name</th>
                                    <th style={{ width: '200px' }}>Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s._id}>
                                        <td>{s.enrollmentNumber}</td>
                                        <td>{s.firstName} {s.lastName}</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                className={`form-control form-control-sm ${Number(marksData[s._id]) > maxMarks ? 'is-invalid' : ''}`} 
                                                placeholder={`0 - ${maxMarks}`}
                                                value={marksData[s._id]}
                                                onChange={(e) => setMarksData({...marksData, [s._id]: e.target.value})}
                                                min="0"
                                                max={maxMarks}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  </form>
               )}

             </div>
          </div>
        </div>

    </Layout>
  );
};

export default FacultyDashboard;