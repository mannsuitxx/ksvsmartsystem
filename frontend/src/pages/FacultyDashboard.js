import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AnimatePresence, motion } from 'framer-motion';

// Register Chart.js elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Custom styles for visual premium aesthetics
const dashboardStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(10, 22, 40, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .glass-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px 0 rgba(10, 22, 40, 0.1);
  }

  .navy-header {
    background: rgba(255, 255, 255, 0.75) !important;
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    color: #1d1d1f !important;
    border-radius: 16px;
  }

  .accent-text {
    color: #3B82F6;
  }

  .nav-tabs-premium {
    border-bottom: 2px solid rgba(10, 22, 40, 0.05);
  }

  .nav-tabs-premium .nav-link {
    border: none;
    color: #64748B;
    font-weight: 500;
    padding: 12px 20px;
    position: relative;
    transition: color 0.2s ease;
    background: transparent;
  }

  .nav-tabs-premium .nav-link:hover {
    color: #3B82F6;
  }

  .nav-tabs-premium .nav-link.active {
    color: #0A1628;
    font-weight: 700;
  }

  .nav-tabs-premium .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #3B82F6;
    border-radius: 3px 3px 0 0;
  }

  .metric-card-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
  }

  .btn-premium-primary {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
  }

  .btn-premium-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
    color: white;
  }

  .btn-premium-secondary {
    background: #ffffff;
    color: #0A1628;
    border: 1px solid rgba(10, 22, 40, 0.15);
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .btn-premium-secondary:hover {
    background: #F8FAFC;
    border-color: rgba(10, 22, 40, 0.3);
  }

  .activity-item {
    position: relative;
    padding-left: 24px;
    margin-bottom: 16px;
  }

  .activity-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #3B82F6;
  }

  .activity-item::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 16px;
    width: 2px;
    height: calc(100% - 10px);
    background: rgba(10, 22, 40, 0.08);
  }

  .activity-item:last-child::after {
    display: none;
  }

  .search-input-group {
    background: #ffffff;
    border: 1px solid rgba(10, 22, 40, 0.1);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s ease;
  }

  .search-input-group:focus-within {
    border-color: #3B82F6;
  }

  .tab-pane {
    opacity: 0;
    visibility: hidden;
    height: 0;
    overflow: hidden;
    transition: opacity 0.22s ease-out, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(8px);
  }
  .tab-pane.active {
    opacity: 1;
    visibility: visible;
    height: auto;
    overflow: visible;
    transform: translateY(0);
  }
`;

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [allStudents, setAllStudents] = useState([]); // complete class list for attendance/marks
  const [students, setStudents] = useState([]);       // searchable/filtered list
  const [mentees, setMentees] = useState([]);         // Mentor Data
  const [analytics, setAnalytics] = useState({ lowEngagement: [], classHealth: [], assessments: [] });
  const [history, setHistory] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchSem, setSearchSem] = useState('');

  // Nudge Modal State
  const [nudgeModalOpen, setNudgeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [nudgeSending, setNudgeSending] = useState(false);

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
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [marksSearch, setMarksSearch] = useState('');

  // 1. Fetch initial dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

      // Get initial full student list
      const studentsRes = await axios.get(`${API_URL}/api/students`, config);
      const studentData = studentsRes.data;
      setAllStudents(studentData);
      setStudents(studentData);

      // Initialize attendance and marks mappings
      const initAtt = {};
      const initMarks = {};
      studentData.forEach(s => {
          initAtt[s._id] = 'P'; 
          initMarks[s._id] = ''; 
      });
      setAttendanceData(initAtt);
      setMarksData(initMarks);

      // Fetch analytics
      try {
        const analyticsRes = await axios.get(`${API_URL}/api/faculty/analytics`, config);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Error fetching analytics data", err);
      }

      // Fetch uploads history
      try {
        const historyRes = await axios.get(`${API_URL}/api/faculty/history`, config);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Error fetching history data", err);
      }

      // Fetch mentees if role is mentor
      if (user && (user.role === 'mentor' || user.role === 'faculty')) {
        try {
          const menteesRes = await axios.get(`${API_URL}/api/mentor/mentees`, config);
          setMentees(menteesRes.data);
        } catch (err) {
          console.error("Error fetching mentees", err);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please make sure the backend server is running and accessible.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // 2. Debounced Student Search & Filters
  useEffect(() => {
    if (!user) return;
    const delayDebounce = setTimeout(async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (searchDept) params.append('department', searchDept);
        if (searchSem) params.append('semester', searchSem);

        const { data } = await axios.get(`${API_URL}/api/students?${params.toString()}`, config);
        setStudents(data);
      } catch (err) {
        console.error("Error searching students", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchDept, searchSem, user]);

  // 3. Handle Attendance Submission
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Submitting attendance...', type: 'info' });
    
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
            await axios.post(`${API_URL}/api/faculty/upload-csv`, formData, config);
            setMessage({ text: 'CSV Attendance Uploaded Successfully!', type: 'success' });
            setCsvFile(null);
            
            // Refresh dashboard data
            const configGeneral = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const historyRes = await axios.get(`${API_URL}/api/faculty/history`, configGeneral);
            setHistory(historyRes.data);
            const analyticsRes = await axios.get(`${API_URL}/api/faculty/analytics`, configGeneral);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'CSV Attendance Upload Failed!', type: 'danger' });
        }
        return;
    }

    // Manual Upload
    const records = allStudents.map(s => ({
        studentId: s._id,
        status: attendanceData[s._id] || 'P'
    }));

    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.post(`${API_URL}/api/faculty/attendance`, {
          subjectName: subject,
          date,
          records
      }, config);
      setMessage({ text: 'Manual Attendance Uploaded Successfully!', type: 'success' });
      
      // Refresh dashboard data
      const historyRes = await axios.get(`${API_URL}/api/faculty/history`, config);
      setHistory(historyRes.data);
      const analyticsRes = await axios.get(`${API_URL}/api/faculty/analytics`, config);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Attendance Upload Failed!', type: 'danger' });
    }
  };

  // 4. Handle Marks Submission
  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Submitting marks...', type: 'info' });

    const records = allStudents
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
      await axios.post(`${API_URL}/api/faculty/marks`, {
          subjectName: subject,
          examType,
          maxMarks,
          records
      }, config);
      setMessage({ text: 'Marks Uploaded Successfully!', type: 'success' });
      
      const newMarks = { ...marksData };
      allStudents.forEach(s => newMarks[s._id] = '');
      setMarksData(newMarks);

      // Refresh dashboard analytics
      const analyticsRes = await axios.get(`${API_URL}/api/faculty/analytics`, config);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Marks Upload Failed!', type: 'danger' });
    }
  };

  // 5. Handle Nudge Submission
  const handleSendNudge = async () => {
    if (!selectedStudent || !nudgeMessage) return;
    setNudgeSending(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const studentId = selectedStudent._id || selectedStudent.studentId;
      await axios.post(`${API_URL}/api/faculty/notify`, {
        studentId,
        message: nudgeMessage
      }, config);
      
      setMessage({ 
        text: `Nudge sent successfully to ${selectedStudent.firstName || selectedStudent.name || 'student'}!`, 
        type: 'success' 
      });
      setNudgeModalOpen(false);
      setNudgeMessage('');
      setSelectedStudent(null);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to send nudge notification.', type: 'danger' });
    } finally {
      setNudgeSending(false);
    }
  };

  // 6. Generate Risk Chart Data
  let safeCount = 0;
  let modCount = 0;
  let highCount = 0;

  allStudents.forEach(s => {
    const level = s.riskProfile?.level || 'Safe';
    if (level === 'High Risk') {
      highCount++;
    } else if (level === 'Moderate Risk') {
      modCount++;
    } else {
      safeCount++;
    }
  });

  const riskChartData = {
    labels: ['Safe / Low Risk', 'Moderate Risk', 'High Risk'],
    datasets: [
      {
        label: 'Students',
        data: [safeCount, modCount, highCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)', // Success green
          'rgba(245, 158, 11, 0.75)', // Warning amber
          'rgba(239, 68, 68, 0.75)'  // Danger red
        ],
        borderColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444'
        ],
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  };

  const riskChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0A1628',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(10, 22, 40, 0.05)'
        },
        ticks: {
          precision: 0,
          color: '#64748B'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748B'
        }
      }
    }
  };

  // 7. Compute engagement and performance helper statistics
  const averagePassRate = analytics.assessments && analytics.assessments.length > 0
    ? (analytics.assessments.reduce((sum, a) => sum + parseFloat(a.passRate), 0) / analytics.assessments.length).toFixed(1) + '%'
    : 'N/A';

  const totalLectures = analytics.classHealth && analytics.classHealth.length > 0
    ? analytics.classHealth.reduce((sum, ch) => sum + ch.totalLectures, 0)
    : history.length;

  const lowEngEnrollments = new Set(analytics.lowEngagement?.map(le => le.enrollment) || []);

  if (loading) {
    return (
      <Layout title="Faculty Dashboard">
        <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="mt-3 fw-semibold text-secondary">Loading academic insights...</h5>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={user?.role === 'mentor' ? "Faculty & Mentor Command" : "Faculty Command Center"}>
        
        {/* Inject Custom Style Block */}
        <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />

        <div className="container-fluid p-3">
          
          {/* Welcome Banner */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-4 navy-header shadow-sm border-0">
            <div>
              <h3 className="fw-bold mb-1 text-dark"><i className="bi bi-shield-check me-2 text-dark"></i>Welcome, {user?.name || 'Professor'}!</h3>
              <p className="mb-0 text-muted small">Monitor student risk profiles, upload academic progress, and send immediate nudges from your central console.</p>
            </div>
            <div className="mt-3 mt-md-0">
              <span className="badge bg-dark px-3 py-2 fs-6 rounded-pill text-uppercase">Role: {user?.role || 'Faculty'}</span>
            </div>
          </div>

          {/* Global Messaging & Error Banners */}
          {error && (
             <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div className="flex-grow-1">{error}</div>
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
             </div>
          )}

          {message.text && (
             <div className={`alert alert-${message.type} alert-dismissible border-0 shadow-sm fade show mb-4`} role="alert">
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : message.type === 'danger' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill'} me-2`}></i>
                <strong>{message.text}</strong>
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
             </div>
          )}

          {/* Premium Glassmorphic Cards Tabbed Layout */}
          <div className="card shadow-sm border-0 bg-transparent mb-4">
             <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                <ul className="nav nav-tabs card-header-tabs nav-tabs-premium">
                  <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="bi bi-grid-fill me-2"></i>Dashboard Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        <i className="bi bi-person-lines-fill me-2"></i>Student Directory
                    </button>
                  </li>
                  {user?.role === 'mentor' && (
                      <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'mentees' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mentees')}
                        >
                            <i className="bi bi-people-fill me-2"></i>My Mentees
                        </button>
                      </li>
                  )}
                  <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        <i className="bi bi-calendar-check-fill me-2"></i>Upload Attendance
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'marks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('marks')}
                    >
                        <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>Upload Marks
                    </button>
                  </li>
                </ul>
             </div>
             
             <div className="card-body p-0 mt-3">
               {/* ----------------- TAB: OVERVIEW ----------------- */}
               <div className={`tab-pane ${activeTab === 'overview' ? 'active' : ''}`}>
                   {/* Metrics Cards Grid */}
                   <div className="row g-4 mb-4">
                     <div className="col-md-6 col-lg-3">
                       <div className="card border-0 shadow-sm glass-card h-100">
                         <div className="metric-card-inner">
                           <div>
                             <h6 className="text-muted text-uppercase mb-1 small fw-bold">Total Students</h6>
                             <h2 className="fw-bold mb-0 text-dark">{allStudents.length}</h2>
                             <small className="text-muted">Enrolled Profiles</small>
                           </div>
                           <div className="p-3 bg-light rounded-circle">
                             <i className="bi bi-people-fill text-primary fs-3"></i>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="col-md-6 col-lg-3">
                       <div className="card border-0 shadow-sm glass-card h-100" style={{ borderLeft: analytics.lowEngagement?.length > 0 ? '4px solid #EF4444' : 'none' }}>
                         <div className="metric-card-inner">
                           <div>
                             <h6 className="text-muted text-uppercase mb-1 small fw-bold">Disengaged Students</h6>
                             <h2 className={`fw-bold mb-0 ${analytics.lowEngagement?.length > 0 ? 'text-danger' : 'text-success'}`}>
                               {analytics.lowEngagement?.length || 0}
                             </h2>
                             <small className="text-muted">Critically Flagged</small>
                           </div>
                           <div className={`p-3 rounded-circle ${analytics.lowEngagement?.length > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                             <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="col-md-6 col-lg-3">
                       <div className="card border-0 shadow-sm glass-card h-100">
                         <div className="metric-card-inner">
                           <div>
                             <h6 className="text-muted text-uppercase mb-1 small fw-bold">Lectures Logged</h6>
                             <h2 className="fw-bold mb-0 text-dark">{totalLectures}</h2>
                             <small className="text-muted">Active Sessions</small>
                           </div>
                           <div className="p-3 bg-light rounded-circle">
                             <i className="bi bi-calendar-event-fill text-success fs-3"></i>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="col-md-6 col-lg-3">
                       <div className="card border-0 shadow-sm glass-card h-100">
                         <div className="metric-card-inner">
                           <div>
                             <h6 className="text-muted text-uppercase mb-1 small fw-bold">Avg. Pass Rate</h6>
                             <h2 className="fw-bold mb-0 text-dark">{averagePassRate}</h2>
                             <small className="text-muted">Class Assessment Health</small>
                           </div>
                           <div className="p-3 bg-light rounded-circle">
                             <i className="bi bi-bookmark-star-fill text-warning fs-3"></i>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Main Analytics Layout */}
                   <div className="row g-4">
                     
                     {/* Left Column: Risk Dist & Low Engagement Alerts */}
                     <div className="col-lg-8">
                       
                       {/* Chart Card */}
                       <div className="card border-0 shadow-sm glass-card p-4 mb-4">
                         <h5 className="fw-bold text-dark mb-4">Student Risk Distribution</h5>
                         <div style={{ height: '260px', position: 'relative' }}>
                           <Bar data={riskChartData} options={riskChartOptions} />
                         </div>
                         <div className="text-center mt-3">
                           <small className="text-muted">
                             Risk factors computed based on consolidated marks and lecture attendance patterns.
                           </small>
                         </div>
                       </div>

                       {/* Highlighted Low Engagement List */}
                       <div className="card border-0 shadow-sm glass-card p-4" style={{ borderLeft: '4px solid #EF4444' }}>
                         <div className="d-flex justify-content-between align-items-center mb-3">
                           <h5 className="fw-bold text-danger m-0">
                             <i className="bi bi-exclamation-octagon-fill me-2"></i>Critical Attendance Alerts
                           </h5>
                           <span className="badge bg-danger rounded-pill px-3 py-1.5">{analytics.lowEngagement?.length || 0} Flagged</span>
                         </div>
                         
                         {analytics.lowEngagement?.length === 0 ? (
                           <div className="text-center py-5 text-success">
                             <i className="bi bi-patch-check-fill fs-1 mb-2 d-block text-success"></i>
                             <h6 className="fw-semibold">All clear!</h6>
                             <p className="text-muted small mb-0">Every student meets the standard class engagement threshold.</p>
                           </div>
                         ) : (
                           <div className="table-responsive">
                             <table className="table table-hover align-middle mb-0">
                               <thead className="table-light">
                                 <tr>
                                   <th>Enrollment</th>
                                   <th>Name</th>
                                   <th>Subject</th>
                                   <th>Attendance</th>
                                   <th className="text-end">Actions</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {analytics.lowEngagement.map((student, idx) => (
                                   <tr key={idx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
                                     <td className="fw-semibold text-danger">{student.enrollment}</td>
                                     <td className="fw-bold text-dark">{student.name}</td>
                                     <td>{student.subject}</td>
                                     <td>
                                       <span className="fw-bold text-danger">{student.attendancePct}%</span>
                                       {student.consecutiveAbsences >= 3 && (
                                         <span className="badge bg-warning text-dark ms-2 small">
                                           {student.consecutiveAbsences} days consecutive absent
                                         </span>
                                       )}
                                     </td>
                                     <td className="text-end">
                                       <button 
                                         className="btn btn-sm btn-danger px-3 rounded-pill shadow-sm"
                                         onClick={() => {
                                           setSelectedStudent(student);
                                           setNudgeMessage(`Hi ${student.name}, I notice your attendance in ${student.subject} is currently at ${student.attendancePct}%, with ${student.consecutiveAbsences} consecutive absences. Please discuss this with me today.`);
                                           setNudgeModalOpen(true);
                                         }}
                                       >
                                         <i className="bi bi-chat-dots-fill me-1"></i> Nudge
                                       </button>
                                     </td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           </div>
                         )}
                       </div>
                     </div>

                     {/* Right Column: Quick Actions & Recent Uploads */}
                     <div className="col-lg-4">
                       
                       {/* Quick Actions Card */}
                       <div className="card border-0 shadow-sm glass-card p-4 mb-4">
                         <h5 className="fw-bold text-dark mb-3">Quick Actions</h5>
                         <div className="d-grid gap-3">
                           <button className="btn btn-premium-primary text-start p-3 shadow-sm" onClick={() => setActiveTab('attendance')}>
                             <i className="bi bi-calendar-check me-2"></i> Record Attendance
                           </button>
                           <button className="btn btn-premium-secondary text-start p-3" onClick={() => setActiveTab('marks')}>
                             <i className="bi bi-file-earmark-spreadsheet me-2"></i> Upload Mid-Sem Marks
                           </button>
                           <button className="btn btn-premium-secondary text-start p-3" onClick={() => {
                             setSelectedStudent(null);
                             setNudgeMessage('');
                             setNudgeModalOpen(true);
                           }}>
                             <i className="bi bi-send me-2"></i> Send Student Nudge
                           </button>
                         </div>
                       </div>

                       {/* Recent Activity Card */}
                       <div className="card border-0 shadow-sm glass-card p-4">
                         <h5 className="fw-bold text-dark mb-3">Recent Activity Log</h5>
                         <div style={{ maxHeight: '310px', overflowY: 'auto' }} className="pe-1">
                           {history.length === 0 ? (
                             <div className="text-center py-4 text-muted">
                               <i className="bi bi-clock-history fs-3 mb-2 d-block"></i>
                               <p className="small mb-0">No attendance history logged yet.</p>
                             </div>
                           ) : (
                             history.slice(0, 6).map((item, idx) => (
                               <div key={item._id || idx} className="activity-item">
                                 <div className="d-flex justify-content-between align-items-center mb-1">
                                   <span className="small fw-bold text-dark">{item.subjectName}</span>
                                   <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                                     {new Date(item.date).toLocaleDateString()}
                                   </span>
                                 </div>
                                 <p className="small text-muted mb-0">
                                   Uploaded attendance for <span className="fw-semibold text-primary">{item.records?.length || 0}</span> students.
                                 </p>
                               </div>
                             ))
                           )}
                         </div>
                       </div>
                     </div>

                   </div>
                </div>

                {/* ----------------- TAB: STUDENTS (SEARCHABLE DIRECTORY) ----------------- */}
                <div className={`tab-pane ${activeTab === 'students' ? 'active' : ''} px-3`}>
                    {/* Live Student Search Bar */}
                    <div className="card border-0 shadow-sm glass-card p-3 mb-4">
                      <div className="row g-3">
                        <div className="col-md-5">
                          <div className="input-group search-input-group p-1">
                            <span className="input-group-text bg-transparent border-0 text-muted">
                              <i className="bi bi-search"></i>
                            </span>
                            <input 
                              type="text" 
                              className="form-control border-0 shadow-none" 
                              placeholder="Search by name or enrollment number..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <select className="form-select border-light-subtle py-2.5 rounded-3" value={searchDept} onChange={(e) => setSearchDept(e.target.value)}>
                            <option value="">All Departments</option>
                            <option>Computer Engineering</option>
                            <option>Information Technology</option>
                            <option>Civil Engineering</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <select className="form-select border-light-subtle py-2.5 rounded-3" value={searchSem} onChange={(e) => setSearchSem(e.target.value)}>
                            <option value="">All Semesters</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                          </select>
                        </div>
                        <div className="col-md-1 d-flex align-items-center">
                          <button className="btn btn-premium-secondary w-100 py-2.5 rounded-3" onClick={() => { setSearchQuery(''); setSearchDept(''); setSearchSem(''); }}>
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Students Directory Table */}
                    <div className="card border-0 shadow-sm glass-card overflow-hidden">
                       <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                             <thead className="table-light text-uppercase font-monospace small">
                                <tr>
                                   <th className="ps-4">Enrollment</th>
                                   <th>Name</th>
                                   <th>Department</th>
                                   <th>Semester</th>
                                   <th>Risk Status</th>
                                   <th className="text-end pe-4">Actions</th>
                                </tr>
                             </thead>
                             <tbody>
                                {students.map(s => {
                                    const isLowEngagement = lowEngEnrollments.has(s.enrollmentNumber) || s.riskProfile?.level === 'High Risk';
                                    const riskLevel = s.riskProfile?.level || (isLowEngagement ? 'High Risk' : 'Safe');

                                    return (
                                        <tr key={s._id} style={isLowEngagement ? { borderLeft: '4px solid #EF4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' } : {}}>
                                            <td className="ps-4 fw-semibold">{s.enrollmentNumber}</td>
                                            <td className="fw-bold text-dark">{s.firstName} {s.lastName}</td>
                                            <td>{s.department}</td>
                                            <td>Sem {s.currentSemester}</td>
                                            <td>
                                              <span className={`badge ${
                                                  riskLevel === 'High Risk' ? 'bg-danger' : 
                                                  riskLevel === 'Moderate Risk' ? 'bg-warning text-dark' : 
                                                  'bg-success'
                                              }`}>
                                                  {riskLevel}
                                              </span>
                                            </td>
                                            <td className="text-end pe-4">
                                              <div className="d-flex gap-2 justify-content-end">
                                                <a href={`/faculty/student/${s.enrollmentNumber}`} className="btn btn-sm btn-premium-secondary py-1.5 px-3">
                                                  <i className="bi bi-eye"></i> Profile
                                                </a>
                                                <button 
                                                  className="btn btn-sm btn-premium-primary py-1.5 px-3"
                                                  onClick={() => {
                                                    setSelectedStudent(s);
                                                    setNudgeMessage(`Hi ${s.firstName}, I noticed you might need support with your academic engagement/performance. Let's schedule a brief meeting to discuss how we can help you improve.`);
                                                    setNudgeModalOpen(true);
                                                  }}
                                                >
                                                  <i className="bi bi-bell"></i> Nudge
                                                </button>
                                              </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {students.length === 0 && (
                                   <tr>
                                      <td colSpan="6" className="text-center py-5 text-muted">
                                         <i className="bi bi-search fs-3 mb-2 d-block"></i>
                                         No students found matching your criteria.
                                      </td>
                                   </tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>
                </div>

               {/* ----------------- TAB: MENTEES ----------------- */}
               <div className={`tab-pane ${activeTab === 'mentees' ? 'active' : ''} px-3`}>
                    <div className="alert alert-info border-0 shadow-sm p-3 mb-4 rounded-3 d-flex align-items-center">
                        <i className="bi bi-info-circle-fill me-3 fs-4 text-info"></i>
                        <div>
                          <strong>Mentor Assignments:</strong> You are assigned as Mentor for these students. To view detailed analytics and logs, navigate to the 
                          <a href="/mentor/dashboard" className="alert-link ms-1">Mentor Dashboard</a>.
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm glass-card overflow-hidden">
                       <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                             <tr>
                                <th className="ps-4">Enrollment</th>
                                <th>Name</th>
                                <th>Risk Level</th>
                                <th className="text-end pe-4">Action</th>
                             </tr>
                          </thead>
                          <tbody>
                             {mentees.map(s => (
                                 <tr key={s._id}>
                                     <td className="ps-4 fw-bold">{s.enrollmentNumber}</td>
                                     <td className="fw-bold text-dark">{s.firstName} {s.lastName}</td>
                                     <td>
                                         <span className={`badge ${
                                             s.riskProfile?.level === 'High Risk' ? 'bg-danger' : 
                                             s.riskProfile?.level === 'Moderate Risk' ? 'bg-warning text-dark' : 'bg-success'
                                         }`}>
                                           {s.riskProfile?.level || 'Safe'}
                                         </span>
                                     </td>
                                     <td className="text-end pe-4">
                                         <a href="/mentor/dashboard" className="btn btn-sm btn-premium-primary">
                                             Go to Mentor Panel
                                         </a>
                                     </td>
                                 </tr>
                             ))}
                             {mentees.length === 0 && (
                                <tr>
                                  <td colSpan="4" className="text-center py-5 text-muted">
                                    <i className="bi bi-people fs-3 mb-2 d-block"></i>
                                    No mentees assigned yet.
                                  </td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                </div>

               {/* ----------------- TAB: ATTENDANCE UPLOAD ----------------- */}
               <div className={`tab-pane ${activeTab === 'attendance' ? 'active' : ''} px-3`}>
                   <div className="card border-0 shadow-sm glass-card p-4">
                     <form onSubmit={handleAttendanceSubmit}>
                         <div className="row g-3 mb-4">
                             <div className="col-md-6">
                                 <label className="form-label fw-bold text-dark">Subject Name</label>
                                 <select className="form-select py-2.5" value={subject} onChange={(e) => setSubject(e.target.value)}>
                                     <option>Java Programming</option>
                                     <option>Data Structures</option>
                                     <option>Web Technologies</option>
                                     <option>Computer Networks</option>
                                     <option>Software Engineering</option>
                                     <option>Database Management Systems</option>
                                 </select>
                             </div>
                             <div className="col-md-6">
                                 <label className="form-label fw-bold text-dark">Lecture Date</label>
                                 <input type="date" className="form-control py-2.5" value={date} onChange={(e) => setDate(e.target.value)} required />
                             </div>
                         </div>

                         {/* Bulk Upload Section */}
                         <div className="mb-4 p-4 border rounded-3 bg-light">
                           <label className="form-label fw-bold text-primary fs-5 mb-2"><i className="bi bi-file-earmark-arrow-up me-2"></i>Option 1: Bulk CSV Upload</label>
                           <input 
                               type="file" 
                               className="form-control py-2" 
                               accept=".csv"
                               onChange={(e) => setCsvFile(e.target.files[0])}
                           />
                           <div className="form-text mt-2">
                             CSV Header Format: <code>enrollment, status</code> (e.g. <code>KSV2025001, P</code> or <code>KSV2025002, A</code>).
                           </div>
                         </div>

                          {/* Manual Upload Header */}
                          <div className="mb-3">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                              <label className="form-label fw-bold text-secondary m-0">Option 2: Manual Student Entry (Fallback)</label>
                              {csvFile && <span className="badge bg-warning text-dark">CSV Selected - manual input disabled</span>}
                              {!csvFile && (
                                <div className="btn-group shadow-sm" role="group">
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-outline-success px-3" 
                                    onClick={() => {
                                      const bulk = {};
                                      allStudents.forEach(s => { bulk[s._id] = 'P'; });
                                      setAttendanceData(bulk);
                                    }}
                                  >
                                    <i className="bi bi-check-all me-1"></i> Mark All Present
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-outline-danger px-3" 
                                    onClick={() => {
                                      const bulk = {};
                                      allStudents.forEach(s => { bulk[s._id] = 'A'; });
                                      setAttendanceData(bulk);
                                    }}
                                  >
                                    <i className="bi bi-x me-1"></i> Mark All Absent
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {!csvFile && (
                              <div className="input-group search-input-group p-1 mb-3 shadow-sm">
                                <span className="input-group-text bg-transparent border-0 text-muted">
                                  <i className="bi bi-search"></i>
                                </span>
                                <input 
                                  type="text" 
                                  className="form-control border-0 shadow-none py-1" 
                                  placeholder="Quick filter students for marking..." 
                                  value={attendanceSearch}
                                  onChange={(e) => setAttendanceSearch(e.target.value)}
                                />
                                {attendanceSearch && (
                                  <button type="button" className="btn btn-link text-muted p-0 pe-2" onClick={() => setAttendanceSearch('')}>
                                    <i className="bi bi-x-circle-fill"></i>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="table-responsive border rounded-3" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                            <table className="table table-striped align-middle mb-0">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th className="ps-3">Enrollment</th>
                                        <th>Name</th>
                                        <th className="text-center" style={{ width: '180px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStudents
                                      .filter(s => {
                                        if (!attendanceSearch) return true;
                                        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                                        const enrollment = s.enrollmentNumber.toLowerCase();
                                        const term = attendanceSearch.toLowerCase();
                                        return fullName.includes(term) || enrollment.includes(term);
                                      })
                                      .map(s => (
                                        <tr key={s._id} className={attendanceData[s._id] === 'A' ? 'table-danger' : ''}>
                                            <td className="ps-3">{s.enrollmentNumber}</td>
                                            <td className="fw-bold text-dark">{s.firstName} {s.lastName}</td>
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
                                                    <label className="btn btn-outline-success btn-sm" htmlFor={`p-${s._id}`}>Present</label>

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
                                                    <label className="btn btn-outline-danger btn-sm" htmlFor={`a-${s._id}`}>Absent</label>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {allStudents.filter(s => {
                                        if (!attendanceSearch) return true;
                                        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                                        const enrollment = s.enrollmentNumber.toLowerCase();
                                        const term = attendanceSearch.toLowerCase();
                                        return fullName.includes(term) || enrollment.includes(term);
                                      }).length === 0 && (
                                        <tr>
                                          <td colSpan="3" className="text-center py-4 text-muted">
                                            No matching students found
                                          </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                          </div>
                         
                         <button type="submit" className="btn btn-premium-primary w-100 mt-4 py-2.5">
                             {csvFile ? 'Upload CSV Attendance File' : 'Submit Manual Attendance Log'}
                         </button>
                     </form>
                   </div>
                </div>

                {/* ----------------- TAB: MARKS UPLOAD ----------------- */}
                <div className={`tab-pane ${activeTab === 'marks' ? 'active' : ''} px-3`}>
                   <div className="card border-0 shadow-sm glass-card p-4">
                      <form onSubmit={handleMarksSubmit}>
                         <div className="row g-3 mb-4">
                             <div className="col-md-3">
                                 <label className="form-label fw-bold text-dark">Subject</label>
                                 <select className="form-select py-2.5" value={subject} onChange={(e) => setSubject(e.target.value)}>
                                     <option>Java Programming</option>
                                     <option>Data Structures</option>
                                     <option>Web Technologies</option>
                                     <option>Computer Networks</option>
                                     <option>Software Engineering</option>
                                     <option>Database Management Systems</option>
                                 </select>
                             </div>
                             <div className="col-md-3">
                                 <label className="form-label fw-bold text-dark">Exam Type</label>
                                 <select className="form-select py-2.5" value={examType} onChange={(e) => setExamType(e.target.value)}>
                                     <option>Mid-Sem</option>
                                     <option>Quiz</option>
                                     <option>Assignment</option>
                                 </select>
                             </div>
                             <div className="col-md-3">
                                 <label className="form-label fw-bold text-dark">Max Marks</label>
                                 <input type="number" className="form-control py-2.5" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} />
                             </div>
                             <div className="col-md-3 d-flex align-items-end">
                                 <button type="submit" className="btn btn-premium-primary w-100 py-2.5 shadow-sm">
                                   Submit All Marks
                                 </button>
                             </div>
                         </div>

                         <div className="table-responsive border rounded-3 shadow-none" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                           <table className="table table-hover align-middle mb-0">
                               <thead className="table-light sticky-top">
                                   <tr>
                                       <th className="ps-3">Enrollment</th>
                                       <th>Name</th>
                                       <th style={{ width: '240px' }}>Marks Obtained</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {allStudents.map(s => (
                          <div className="input-group search-input-group p-1 mb-3 shadow-sm">
                            <span className="input-group-text bg-transparent border-0 text-muted">
                              <i className="bi bi-search"></i>
                            </span>
                            <input 
                              type="text" 
                              className="form-control border-0 shadow-none py-1" 
                              placeholder="Quick filter students by name/enrollment..." 
                              value={marksSearch}
                              onChange={(e) => setMarksSearch(e.target.value)}
                            />
                            {marksSearch && (
                              <button type="button" className="btn btn-link text-muted p-0 pe-2" onClick={() => setMarksSearch('')}>
                                <i className="bi bi-x-circle-fill"></i>
                              </button>
                            )}
                          </div>

                          <div className="table-responsive border rounded-3 shadow-none" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th className="ps-3">Enrollment</th>
                                        <th>Name</th>
                                        <th style={{ width: '240px' }}>Marks Obtained (Press Enter to go to next)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStudents
                                      .filter(s => {
                                        if (!marksSearch) return true;
                                        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                                        const enrollment = s.enrollmentNumber.toLowerCase();
                                        const term = marksSearch.toLowerCase();
                                        return fullName.includes(term) || enrollment.includes(term);
                                      })
                                      .map((s, idx) => (
                                        <tr key={s._id}>
                                            <td className="ps-3">{s.enrollmentNumber}</td>
                                            <td className="fw-bold text-dark">{s.firstName} {s.lastName}</td>
                                            <td>
                                                <input 
                                                    id={`marks-input-${idx}`}
                                                    type="number" 
                                                    className={`form-control form-control-sm py-2 ${Number(marksData[s._id]) > maxMarks ? 'is-invalid' : ''}`} 
                                                    placeholder={`0 - ${maxMarks}`}
                                                    value={marksData[s._id] || ''}
                                                    onChange={(e) => setMarksData({...marksData, [s._id]: e.target.value})}
                                                    min="0"
                                                    max={maxMarks}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const nextInput = document.getElementById(`marks-input-${idx + 1}`);
                                                        if (nextInput) {
                                                          nextInput.focus();
                                                          nextInput.select();
                                                        }
                                                      }
                                                    }}
                                                />
                                                {Number(marksData[s._id]) > maxMarks && (
                                                  <div className="invalid-feedback">Cannot exceed max marks!</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {allStudents.filter(s => {
                                        if (!marksSearch) return true;
                                        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                                        const enrollment = s.enrollmentNumber.toLowerCase();
                                        const term = marksSearch.toLowerCase();
                                        return fullName.includes(term) || enrollment.includes(term);
                                      }).length === 0 && (
                                        <tr>
                                          <td colSpan="3" className="text-center py-4 text-muted">
                                            No matching students found
                                          </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                          </div>
                      </form>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* ----------------- INTERVENTION NUDGE MODAL ----------------- */}
        {nudgeModalOpen && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(10, 22, 40, 0.65)', zIndex: 1060 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="modal-header text-white border-bottom-0" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E293B 100%)', borderRadius: '16px 16px 0 0' }}>
                  <h5 className="modal-title fw-bold"><i className="bi bi-bell-fill me-2 text-warning"></i>Send Intervention Nudge</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setNudgeModalOpen(false)}></button>
                </div>
                <div className="modal-body p-4">
                  
                  {/* Student Selector */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Target Student</label>
                    {selectedStudent ? (
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 fw-semibold" 
                        value={`${selectedStudent.firstName || selectedStudent.name} (${selectedStudent.enrollmentNumber || selectedStudent.enrollment})`} 
                        readOnly 
                      />
                    ) : (
                      <select 
                        className="form-select border-secondary-subtle" 
                        onChange={(e) => {
                          const student = allStudents.find(s => s._id === e.target.value);
                          setSelectedStudent(student);
                        }}
                        required
                      >
                        <option value="">-- Select Student to Nudge --</option>
                        {allStudents.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.firstName} {s.lastName} ({s.enrollmentNumber})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Nudge Message Content */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Nudge Remarks / Warning Message</label>
                    <textarea 
                      className="form-control border-light-subtle" 
                      rows="4" 
                      placeholder="Type a constructive notification message to encourage engagement or schedule a meeting..."
                      value={nudgeMessage}
                      onChange={(e) => setNudgeMessage(e.target.value)}
                      required
                    ></textarea>
                    <div className="form-text">
                      This warning will appear directly in the student's dashboard notification center.
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer border-top-0 px-4 pb-4">
                  <button type="button" className="btn btn-premium-secondary" onClick={() => setNudgeModalOpen(false)}>Cancel</button>
                  <button 
                    type="button" 
                    className="btn btn-premium-primary" 
                    onClick={handleSendNudge} 
                    disabled={nudgeSending || !selectedStudent || !nudgeMessage}
                  >
                    {nudgeSending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : 'Send Nudge Alert'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

    </Layout>
  );
};

export default FacultyDashboard;
