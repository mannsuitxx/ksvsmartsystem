import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { API_URL } from '../config';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement, Filler
);

// ─── Inline Premium Glassmorphism Styles ───────────────────────────────────
const glassCard = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 8px 30px rgba(10, 22, 40, 0.04)',
  color: '#1E293B',
};

const kpiCard = (accent) => ({
  background: `linear-gradient(135deg, ${accent}0e 0%, ${accent}02 100%)`,
  border: `1px solid ${accent}25`,
  borderRadius: '16px',
  padding: '22px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'default',
  boxShadow: '0 4px 20px rgba(10, 22, 40, 0.02)',
});

const badgeStyle = (color) => ({
  background: `${color}10`,
  color,
  border: `1px solid ${color}25`,
  borderRadius: '20px',
  padding: '4px 12px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px'
});

const btnStyle = (variant) => ({
  background:
    variant === 'success' ? 'linear-gradient(135deg, #10B981, #059669)'
    : variant === 'danger'  ? 'linear-gradient(135deg, #EF4444, #DC2626)'
    : variant === 'warning' ? 'linear-gradient(135deg, #F59E0B, #D97706)'
    : variant === 'primary' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
    : 'rgba(0, 0, 0, 0.04)',
  color: variant === 'ghost' ? '#1E293B' : '#fff',
  border: variant === 'ghost' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: 650,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  boxShadow: variant !== 'ghost' ? '0 4px 12px rgba(59,130,246,0.12)' : 'none'
});

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#0F172A',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '10px'
};

const TH_STYLE = {
  padding: '16px 20px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#64748B',
  borderBottom: '2px solid rgba(0,0,0,0.06)',
  background: '#F8FAFC'
};

const TD_STYLE = { 
  padding: '14px 20px', 
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  fontSize: '13px',
  color: '#334155'
};

// ─── Chart Options ─────────────────────────────────────────────────────────
const chartOpts = (titleY) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#64748B', font: { family: 'Inter', size: 11, weight: '500' } } },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#1E293B',
      bodyColor: '#64748B',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 14,
      shadowColor: 'rgba(0,0,0,0.1)',
    },
  },
  scales: {
    x: { 
      ticks: { color: '#64748B', font: { size: 11, family: 'Inter' } }, 
      grid: { display: false } 
    },
    y: { 
      ticks: { color: '#64748B', font: { size: 11, family: 'Inter' } }, 
      grid: { color: 'rgba(0,0,0,0.05)' },
      title: titleY ? { display: true, text: titleY, color: '#64748B', font: { size: 11 } } : undefined
    },
  },
});

// ─── Auxiliary Sub-components ──────────────────────────────────────────────
const Skeleton = ({ h = '20px', w = '100%' }) => (
  <div style={{
    width: w, height: h, borderRadius: '8px',
    background: 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.6s infinite ease-in-out',
  }} />
);

const ProgressBar = ({ value, color }) => (
  <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '99px', height: '6px', flex: 1, overflow: 'hidden', display: 'flex' }}>
    <div style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
  </div>
);

const RiskBadge = ({ level }) => {
  const map = { 
    Critical: ['#EF4444', '🔴 Critical'], 
    Warning: ['#F59E0B', '🟡 Warning'], 
    Safe: ['#10B981', '🟢 Safe'],
    'High Risk': ['#EF4444', '🔴 High Risk'],
    'Moderate Risk': ['#F59E0B', '🟡 Moderate']
  };
  const [color, label] = map[level] || ['#94A3B8', level];
  return <span style={badgeStyle(color)}>{label}</span>;
};

const KPICard = ({ icon, label, value, sub, accent, loading }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...kpiCard(accent),
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? `0 16px 40px ${accent}15` : '0 4px 20px rgba(10,22,40,0.02)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '90px', height: '90px', borderRadius: '50%', background: `${accent}18`, filter: 'blur(20px)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ zIndex: 1 }}>
          <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
          {loading ? <Skeleton h="36px" w="90px" /> : <h2 style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{value ?? '—'}</h2>}
          {loading ? <Skeleton h="12px" w="110px" /> : <p style={{ margin: 0, color: '#64748B', fontSize: '11px', fontWeight: 550 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: '30px', opacity: 0.65, zIndex: 1 }}>{icon}</span>
      </div>
    </div>
  );
};

// ─── Main HOD Dashboard ───────────────────────────────────────────────────
const HODDashboard = () => {
  const [analytics, setAnalytics]         = useState(null);
  const [deepAnalytics, setDeepAnalytics] = useState(null);
  const [loadingA, setLoadingA]           = useState(true);
  const [loadingD, setLoadingD]           = useState(true);
  const [errorA, setErrorA]               = useState(null);
  const [errorD, setErrorD]               = useState(null);
  const [activeTab, setActiveTab]         = useState('overview');
  const [searchQuery, setSearchQuery]     = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const token = () => localStorage.getItem('token');

  const fetchAnalytics = useCallback(async () => {
    setErrorA(null);
    try {
      const res = await fetch(`${API_URL}/api/hod/analytics`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalytics(prev => {
        if (prev && JSON.stringify(prev) === JSON.stringify(data)) {
          return prev;
        }
        return data;
      });
    } catch (err) {
      setErrorA('Failed to load summary analytics: ' + err.message);
    } finally {
      setLoadingA(false);
    }
  }, []);

  const fetchDeep = useCallback(async () => {
    setErrorD(null);
    try {
      const res = await fetch(`${API_URL}/api/hod/deep-analytics`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDeepAnalytics(prev => {
        if (prev && JSON.stringify(prev) === JSON.stringify(data)) {
          return prev;
        }
        return data;
      });
    } catch (err) {
      setErrorD('Failed to load deep reports: ' + err.message);
    } finally {
      setLoadingD(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchDeep();
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchDeep();
      setLastRefreshed(new Date());
    }, 60000); // Silent refresh every 60s
    return () => clearInterval(interval);
  }, [fetchAnalytics, fetchDeep]);

  const handleRefresh = () => {
    setLoadingA(true); 
    setLoadingD(true);
    fetchAnalytics(); 
    fetchDeep();
    setLastRefreshed(new Date());
  };

  // ── CSV Helpers ──
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const today = () => new Date().toISOString().split('T')[0];

  const exportSubjectCSV = () => {
    if (!analytics?.subjectPerformance) return;
    const rows = [
      'Code,Subject,Enrolled,Passed,Pass Rate (%),Avg Attendance (%)',
      ...analytics.subjectPerformance.map(s => `${s.code},${s.subject},${s.enrolled},${s.passed},${s.passRate},${s.avgAttendance}`),
    ];
    downloadCSV(rows.join('\n'), `hod_subject_performance_${today()}.csv`);
  };

  const exportDetentionCSV = () => {
    if (!deepAnalytics?.detention) return;
    const rows = [
      'Student Name,Enrollment Number,Current Attendance (%),Status,Recoverable',
      ...deepAnalytics.detention.map(s => `"${s.name}",${s.enrollment},${s.currentPct},${s.status},${s.status === 'Critical' ? 'No' : 'Yes'}`),
    ];
    downloadCSV(rows.join('\n'), `detention_forecast_${today()}.csv`);
  };

  const exportAssessmentCSV = () => {
    if (!deepAnalytics?.assessmentDifficulty) return;
    const rows = [
      'Subject,Exam,Total Students,Passed,Max Marks,Avg Score,Pass Rate (%),Status',
      ...deepAnalytics.assessmentDifficulty.map(a => `"${a.subject}","${a.exam}",${a.totalStudents},${a.passedCount},${a.maxMarks},${a.averageScore},${a.passRate},"${a.status}"`),
    ];
    downloadCSV(rows.join('\n'), `assessment_difficulty_report_${today()}.csv`);
  };

  const exportInterventionsCSV = () => {
    if (!deepAnalytics?.interventionEffectiveness?.recent) return;
    const rows = [
      'Date,Student Name,Intervention Type,Status,Remarks',
      ...deepAnalytics.interventionEffectiveness.recent.map(i => `${i.date ? new Date(i.date).toISOString().split('T')[0] : ''},"${i.studentName}",${i.type},${i.status},"${i.remarks ? i.remarks.replace(/"/g, '""') : ''}"`),
    ];
    downloadCSV(rows.join('\n'), `intervention_effectiveness_tracker_${today()}.csv`);
  };

  const exportFacultyComplianceCSV = () => {
    if (!deepAnalytics?.facultyImpact) return;
    const rows = [
      'Faculty Email,Subject,Avg Class Attendance (%),Pass Rate (%)',
      ...deepAnalytics.facultyImpact.map(f => `"${f.name}","${f.subject || ''}",${f.avgAttendance},${f.passRate}`),
    ];
    downloadCSV(rows.join('\n'), `faculty_impact_report_${today()}.csv`);
  };

  // ── Derived Data calculations ──
  const avgPassRate = analytics?.subjectPerformance?.length
    ? (analytics.subjectPerformance.reduce((a, s) => a + s.passRate, 0) / analytics.subjectPerformance.length).toFixed(1)
    : null;

  const avgAttendance = analytics?.subjectPerformance?.length
    ? (analytics.subjectPerformance.reduce((a, s) => a + s.avgAttendance, 0) / analytics.subjectPerformance.length).toFixed(1)
    : null;

  const detentionList = deepAnalytics?.detention || [];
  const filteredDetention = detentionList.filter(
    s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.enrollment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Chart Configurations ──

  // 1. Subject Performance Overview Chart
  const subjectChartData = analytics?.subjectPerformance ? {
    labels: analytics.subjectPerformance.map(s => s.subject.length > 15 ? s.code : s.subject),
    datasets: [
      { label: 'Pass Rate (%)', data: analytics.subjectPerformance.map(s => s.passRate), backgroundColor: 'rgba(59, 130, 246, 0.75)', borderColor: '#3B82F6', borderWidth: 2, borderRadius: 6 },
      { label: 'Avg Attendance (%)', data: analytics.subjectPerformance.map(s => s.avgAttendance), backgroundColor: 'rgba(16, 185, 129, 0.65)', borderColor: '#10B981', borderWidth: 2, borderRadius: 6 },
    ],
  } : null;

  // 2. Semester Comparison - Risk Distribution Grouped Bar Chart
  const semRiskChartData = (() => {
    const riskSem = deepAnalytics?.riskBySemester || {};
    const sortedSems = Object.keys(riskSem).sort();
    if (!sortedSems.length) return null;
    return {
      labels: sortedSems,
      datasets: [
        { label: 'Safe', data: sortedSems.map(s => riskSem[s].Safe || 0), backgroundColor: 'rgba(16, 185, 129, 0.75)', borderColor: '#10B981', borderWidth: 1, borderRadius: 5 },
        { label: 'Moderate', data: sortedSems.map(s => riskSem[s].Moderate || 0), backgroundColor: 'rgba(245, 158, 11, 0.75)', borderColor: '#F59E0B', borderWidth: 1, borderRadius: 5 },
        { label: 'Critical', data: sortedSems.map(s => riskSem[s].Critical || 0), backgroundColor: 'rgba(239, 68, 68, 0.75)', borderColor: '#EF4444', borderWidth: 1, borderRadius: 5 }
      ]
    };
  })();

  // 3. Overall Risk Doughnut
  const riskDoughnutData = analytics?.riskStats ? {
    labels: ['Critical Risk', 'Moderate Risk', 'Safe'],
    datasets: [{
      data: [
        analytics.riskStats.critical,
        analytics.riskStats.moderate,
        Math.max(0, analytics.totalStudents - analytics.riskStats.critical - analytics.riskStats.moderate),
      ],
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      borderWidth: 0, hoverOffset: 8,
    }],
  } : null;

  // 4. Intervention Types Breakdown Doughnut
  const interventionTypesChartData = deepAnalytics?.interventionEffectiveness?.typeCounts ? {
    labels: ['Meetings', 'Calls', 'Emails', 'Nudges', 'Others'],
    datasets: [{
      data: [
        deepAnalytics.interventionEffectiveness.typeCounts.Meeting || 0,
        deepAnalytics.interventionEffectiveness.typeCounts.Call || 0,
        deepAnalytics.interventionEffectiveness.typeCounts.Email || 0,
        deepAnalytics.interventionEffectiveness.typeCounts.Nudge || 0,
        deepAnalytics.interventionEffectiveness.typeCounts.Other || 0,
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderWidth: 0, hoverOffset: 6,
    }]
  } : null;

  // 5. Assessment Difficulty - Average Marks Trend (Line Chart)
  const assessmentLineData = (() => {
    const diffs = deepAnalytics?.assessmentDifficulty || [];
    if (!diffs.length) return null;
    return {
      labels: diffs.map(a => `${a.subject.split(' ')[0]} - ${a.exam}`),
      datasets: [
        {
          label: 'Pass Rate (%)',
          data: diffs.map(a => parseFloat(a.passRate)),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#10B981'
        },
        {
          label: 'Avg Score (%)',
          data: diffs.map(a => ((parseFloat(a.averageScore) / a.maxMarks) * 100).toFixed(1)),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#3B82F6'
        }
      ]
    };
  })();

  const TABS = [
    { id: 'overview',     label: '📊 Overview' },
    { id: 'detention',    label: '🚨 Detention Forecast' },
    { id: 'assessments',  label: '📝 Assessment Analyzer' },
    { id: 'interventions',label: '🎯 Intervention Impact' },
    { id: 'faculty',      label: '👨‍🏫 Faculty Performance' },
    { id: 'compliance',   label: '🛡️ Compliance' },
    { id: 'audit',        label: '📋 System Audit' },
  ];

  return (
    <Layout title="HOD Academic Control Center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;755;800&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        
        .hod-root { 
          animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1); 
          font-family: 'Inter', sans-serif; 
          color: #E2E8F0; 
        }
        
        .hod-tab { 
          cursor: pointer; 
          padding: 10px 18px; 
          border-radius: 10px; 
          font-size: 13px; 
          font-weight: 600;
          color: #94A3B8; 
          background: transparent; 
          border: 1px solid transparent;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hod-tab:hover { 
          color: #F1F5F9; 
          background: rgba(255, 255, 255, 0.05); 
        }
        .hod-tab.active { 
          color: #3B82F6; 
          background: rgba(59, 130, 246, 0.12); 
          border: 1px solid rgba(59, 130, 246, 0.3); 
        }
        
        .hod-tr {
          transition: background-color 0.15s ease;
        }
        .hod-tr:hover td { 
          background: rgba(255, 255, 255, 0.03) !important; 
          color: #F8FAFC !important;
        }
        
        .hod-btn:hover { 
          opacity: 0.9; 
          transform: translateY(-2px); 
        }
        .hod-btn:active {
          transform: translateY(0);
        }
        
        .hod-search { 
          background: rgba(15, 23, 42, 0.6); 
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px; 
          color: #F1F5F9; 
          padding: 10px 16px; 
          font-size: 13px; 
          outline: none; 
          min-width: 260px; 
          transition: all 0.2s ease;
        }
        .hod-search::placeholder { color: #64748B; }
        .hod-search:focus { 
          border-color: #3B82F6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); 
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>

      <div className="hod-root">

        {/* ── Header ─────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: '26px', fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(135deg, #F8FAFC, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Academic Control Center
            </h1>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '12px' }}>
              Last synchronized: {lastRefreshed.toLocaleTimeString()} &nbsp;•&nbsp; Automated background sync active
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="hod-btn" style={btnStyle('ghost')} onClick={handleRefresh}>
              🔄 Sync Now
            </button>
            <button className="hod-btn" style={btnStyle('success')} onClick={exportSubjectCSV}>
              📥 Export Reports
            </button>
          </div>
        </div>

        {/* ── Error Banners ──────────────────────────────── */}
        {errorA && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', color: '#FCA5A5', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {errorA}</span>
            <button onClick={() => { setLoadingA(true); fetchAnalytics(); }} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontWeight: 600 }}>Retry Sync</button>
          </div>
        )}
        {errorD && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', color: '#FCA5A5', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {errorD}</span>
            <button onClick={() => { setLoadingD(true); fetchDeep(); }} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontWeight: 600 }}>Retry Deep Sync</button>
          </div>
        )}

        {/* ── KPI Row ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <KPICard icon="🎓" label="Total Students" value={analytics?.totalStudents} sub="Active Enrolment" accent="#3B82F6" loading={loadingA} />
          <KPICard icon="🔴" label="Critical Cases" value={analytics?.riskStats?.critical} sub="Immediate Attention" accent="#EF4444" loading={loadingA} />
          <KPICard icon="🟡" label="Moderate Risk" value={analytics?.riskStats?.moderate} sub="Under Observation" accent="#F59E0B" loading={loadingA} />
          <KPICard icon="📈" label="Avg Pass Rate" value={avgPassRate ? `${avgPassRate}%` : null} sub="All Subject Metrics" accent="#10B981" loading={loadingA} />
          <KPICard icon="📅" label="Class Attendance" value={avgAttendance ? `${avgAttendance}%` : null} sub="Aggregate Roll Call" accent="#8B5CF6" loading={loadingA} />
          <KPICard icon="🛡️" label="Faculty Compliance" value={loadingD ? null : `${deepAnalytics?.facultyCompliance?.complianceRate}%`} sub="Data Upload Regularity" accent="#06B6D4" loading={loadingD} />
        </div>

        {/* ── Tab Navigation ─────────────────────────────── */}
        <div style={{ ...glassCard, padding: '6px', display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} className={`hod-tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════ OVERVIEW TAB ════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '24px' }}>

            {/* Risk Distribution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Semester Risk Distribution Bar Chart */}
              <div style={glassCard}>
                <div style={sectionTitle}>
                  <span>📊 Semester Risk Profile</span>
                  <span style={badgeStyle('#3B82F6')}>Multi-dataset analysis</span>
                </div>
                {loadingD ? <Skeleton h="260px" /> : semRiskChartData ? (
                  <div style={{ height: '260px' }}>
                    <Bar data={semRiskChartData} options={{
                      ...chartOpts('Students'),
                      scales: {
                        x: { stacked: true, ticks: { color: '#64748B', font: { size: 11 } }, grid: { display: false } },
                        y: { stacked: true, ticks: { color: '#64748B', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                      }
                    }} />
                  </div>
                ) : <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No Semester Risk Data</div>}
              </div>

              {/* Overall Risk Distribution Doughnut */}
              <div style={glassCard}>
                <div style={sectionTitle}>
                  <span>🎯 Aggregate Risk Share</span>
                  <span style={badgeStyle('#10B981')}>Department Metrics</span>
                </div>
                {loadingA ? <Skeleton h="260px" /> : riskDoughnutData ? (
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '220px', gap: '15px' }}>
                    <div style={{ flex: 1.2, height: '100%' }}>
                      <Doughnut data={riskDoughnutData} options={{ 
                        ...chartOpts(), 
                        cutout: '70%', 
                        scales: undefined,
                        plugins: { legend: { display: false } }
                      }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        ['Critical Risk', analytics.riskStats.critical, '#EF4444'], 
                        ['Moderate Risk', analytics.riskStats.moderate, '#F59E0B'], 
                        ['Safe Status', Math.max(0, analytics.totalStudents - analytics.riskStats.critical - analytics.riskStats.moderate), '#10B981']
                      ].map(([lbl, val, col]) => (
                        <div key={lbl} style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                          <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col, display: 'inline-block' }} />{lbl}
                          </span>
                          <span style={{ color: col, fontWeight: 800, fontSize: '18px', marginLeft: '14px' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No risk sharing data</div>}
              </div>
            </div>

            {/* Subject performance Bar Chart */}
            <div style={glassCard}>
              <div style={sectionTitle}>
                <span>📊 Core Subject Health Comparison</span>
                <span style={badgeStyle('#8B5CF6')}>Attendance vs Pass Rates</span>
              </div>
              {loadingA ? <Skeleton h="280px" /> : subjectChartData ? (
                <div style={{ height: '280px' }}><Bar data={subjectChartData} options={chartOpts('Percentage')} /></div>
              ) : <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No subject data</div>}
            </div>

            {/* Subject Summary table */}
            <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>📋 Subject Performance Matrix</h5>
                <button className="hod-btn" style={btnStyle('ghost')} onClick={exportSubjectCSV}>📥 Export Table</button>
              </div>
              {loadingA ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3].map(i => <Skeleton key={i} h="40px" />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Subject Code', 'Course Title', 'Enrolled Students', 'Passed Count', 'Final Pass Rate', 'Average Roll Attendance', 'Compliance Status'].map(h => (
                          <th key={h} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.subjectPerformance || []).map((s, idx) => (
                        <tr key={idx} className="hod-tr">
                          <td style={{ ...TD_STYLE, color: '#3B82F6', fontWeight: 700 }}>{s.code}</td>
                          <td style={{ ...TD_STYLE, color: '#F1F5F9', fontWeight: 600 }}>{s.subject}</td>
                          <td style={{ ...TD_STYLE, textAlign: 'center' }}>{s.enrolled}</td>
                          <td style={{ ...TD_STYLE, textAlign: 'center' }}>{s.passed}</td>
                          <td style={TD_STYLE}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: 750, color: s.passRate < 70 ? '#EF4444' : '#10B981', minWidth: '40px' }}>{s.passRate}%</span>
                              <ProgressBar value={s.passRate} color={s.passRate < 70 ? '#EF4444' : '#10B981'} />
                            </div>
                          </td>
                          <td style={TD_STYLE}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: 750, color: s.avgAttendance < 75 ? '#F59E0B' : '#10B981', minWidth: '40px' }}>{s.avgAttendance}%</span>
                              <ProgressBar value={s.avgAttendance} color={s.avgAttendance < 75 ? '#F59E0B' : '#10B981'} />
                            </div>
                          </td>
                          <td style={TD_STYLE}>
                            {s.passRate < 70 ? (
                              <span style={badgeStyle('#EF4444')}>⚠️ Review Required</span>
                            ) : (
                              <span style={badgeStyle('#10B981')}>✓ compliant</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!analytics?.subjectPerformance?.length && (
                        <tr>
                          <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No subject records matching.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════ DETENTION FORECAST TAB ════════════════ */}
        {activeTab === 'detention' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '18px 22px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <h5 style={{ margin: '0 0 6px', fontWeight: 700, color: '#FCA5A5', fontSize: '15px' }}>Proactive Semester Detention Warnings</h5>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '13px', lineHeight: 1.5 }}>
                  The students listed below are forecast to fall short of the university statutory minimum of 75% attendance. Review current attendance percentages, status profiles, and intervention feasibility. Mentors should be nudge-prompted immediately.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <KPICard icon="🚨" label="Total Projected Detentions" value={loadingD ? null : detentionList.length} sub="Under 65% aggregate attendance" accent="#EF4444" loading={loadingD} />
              <KPICard icon="🔴" label="Critical Escalations" value={loadingD ? null : detentionList.filter(s => s.status === 'Critical').length} sub="Under 50% attendance (Severe)" accent="#DC2626" loading={loadingD} />
              <KPICard icon="🟡" label="Warning States" value={loadingD ? null : detentionList.filter(s => s.status === 'Warning').length} sub="50% to 65% attendance range" accent="#F59E0B" loading={loadingD} />
            </div>

            <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>Projected Detention Registry</h5>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    className="hod-search" 
                    placeholder="🔍 Filter by student name or roll..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                  />
                  <button className="hod-btn" style={btnStyle('danger')} onClick={exportDetentionCSV}>
                    📥 Export Registry
                  </button>
                </div>
              </div>

              {loadingD ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3,4].map(i => <Skeleton key={i} h="44px" />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['#', 'Student Identification', 'Enrollment Number', 'Current Attendance', 'Status Tier', 'Recovery Potential', 'Notice Operations'].map(h => (
                          <th key={h} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDetention.map((s, idx) => (
                        <tr key={idx} className="hod-tr">
                          <td style={{ ...TD_STYLE, color: '#64748B', width: '50px' }}>{idx + 1}</td>
                          <td style={{ ...TD_STYLE, fontWeight: 700, color: '#F8FAFC' }}>{s.name}</td>
                          <td style={{ ...TD_STYLE, fontFamily: 'monospace', color: '#3B82F6', fontWeight: 600 }}>{s.enrollment}</td>
                          <td style={TD_STYLE}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '130px' }}>
                              <span style={{ fontWeight: 800, color: parseFloat(s.currentPct) < 50 ? '#EF4444' : '#F59E0B', minWidth: '42px' }}>{s.currentPct}%</span>
                              <ProgressBar value={parseFloat(s.currentPct)} color={parseFloat(s.currentPct) < 50 ? '#EF4444' : '#F59E0B'} />
                            </div>
                          </td>
                          <td style={TD_STYLE}><RiskBadge level={s.status} /></td>
                          <td style={TD_STYLE}>
                            {s.status === 'Critical' ? (
                              <span style={{ color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>✕ Unlikely</span>
                            ) : (
                              <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>✓ Feasible (100% Att.)</span>
                            )}
                          </td>
                          <td style={TD_STYLE}>
                            <button className="hod-btn" style={{ ...btnStyle('ghost'), padding: '6px 12px', fontSize: '11px' }}>
                              📝 Send Notice
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredDetention.length && (
                        <tr>
                          <td colSpan="7" style={{ padding: '50px', textAlign: 'center', color: '#64748B' }}>
                            {detentionList.length === 0 ? '🎉 All student roll call percentages comply with academic rules.' : '🔍 No results matching query filters.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════ ASSESSMENT DIFFICULTY ANALYZER TAB ════════════════ */}
        {activeTab === 'assessments' && (
          <div style={{ display: 'grid', gap: '24px' }}>

            <div style={{ ...glassCard, padding: '22px' }}>
              <div style={sectionTitle}>
                <span>📝 Mid-Semester & Internal Difficulty Trends</span>
                <span style={badgeStyle('#10B981')}>Skewness & Grade Inflation</span>
              </div>
              <p style={{ marginTop: '-12px', color: '#94A3B8', fontSize: '13px', lineHeight: 1.5 }}>
                Ideal assessments follow a standard bell curve. Metrics with pass rates under 50% represent potential curricular gaps or over-complex questions. Pass rates over 95% highlight possible grade inflation.
              </p>
              {loadingD ? <Skeleton h="250px" /> : assessmentLineData ? (
                <div style={{ height: '250px' }}>
                  <Line data={assessmentLineData} options={chartOpts('Percentage Value')} />
                </div>
              ) : <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>No assessment trends available</div>}
            </div>

            <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>📋 Internal Assessment Matrix</h5>
                <button className="hod-btn" style={btnStyle('ghost')} onClick={exportAssessmentCSV}>📥 Export Assessment Report</button>
              </div>
              {loadingD ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3].map(i => <Skeleton key={i} h="48px" />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Course Code/Title', 'Assessment Type', 'Enrolled Size', 'Passed Students', 'Average Score', 'Fail Rate', 'Evaluation Status', 'Intervention Action'].map(h => (
                          <th key={h} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(deepAnalytics?.assessmentDifficulty || []).map((exam, idx) => {
                        const fr = (100 - parseFloat(exam.passRate)).toFixed(1);
                        const statusColor = exam.status.includes('Balanced') ? '#10B981' : exam.status.includes('Inflation') ? '#F59E0B' : '#EF4444';
                        return (
                          <tr key={idx} className="hod-tr">
                            <td style={{ ...TD_STYLE, fontWeight: 700, color: '#F8FAFC' }}>{exam.subject}</td>
                            <td style={{ ...TD_STYLE, color: '#94A3B8' }}>{exam.exam}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'center' }}>{exam.totalStudents}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'center' }}>{exam.passedCount}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'center', fontWeight: 700, color: '#3B82F6' }}>{exam.averageScore} / {exam.maxMarks}</td>
                            <td style={{ ...TD_STYLE, color: '#EF4444', fontWeight: 600 }}>{fr}%</td>
                            <td style={TD_STYLE}>
                              <span style={badgeStyle(statusColor)}>{exam.status}</span>
                            </td>
                            <td style={TD_STYLE}>
                              {exam.status.includes('Hard') ? (
                                <span style={{ color: '#EF4444', fontSize: '12px', fontWeight: 550 }}>Remedial Session Triggered</span>
                              ) : exam.status.includes('Inflation') ? (
                                <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 550 }}>Increase Complexity</span>
                              ) : (
                                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 550 }}>Curriculum Calibrated</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {!deepAnalytics?.assessmentDifficulty?.length && (
                        <tr>
                          <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No assessment scores logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════ INTERVENTION IMPACT TAB ════════════════ */}
        {activeTab === 'interventions' && (
          <div style={{ display: 'grid', gap: '24px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
              
              {/* Effectiveness Metrics card */}
              <div style={glassCard}>
                <div style={sectionTitle}>
                  <span>🎯 Intervention Effectiveness Summary</span>
                  <span style={badgeStyle('#10B981')}>Live Database aggregates</span>
                </div>
                {loadingD ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <Skeleton h="60px" />
                    <Skeleton h="20px" />
                    <Skeleton h="20px" />
                  </div>
                ) : deepAnalytics?.interventionEffectiveness ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Success Rate</h4>
                        <p style={{ margin: 0, color: '#10B981', fontSize: '38px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                          {deepAnalytics.interventionEffectiveness.successRate}%
                        </p>
                      </div>
                      <span style={{ fontSize: '36px' }}>🚀</span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
                      <p style={{ margin: '0 0 8px' }}>
                        👉 <strong>Success Rate Metric calculation:</strong> The percentage of student outreach records (emails, meetings, calls, nudges) that led to the student transitioning to a non-critical risk profile.
                      </p>
                      <p style={{ margin: 0 }}>
                        Total Interventions Tracked: <strong style={{ color: '#F1F5F9' }}>{deepAnalytics.interventionEffectiveness.totalCount}</strong>
                      </p>
                    </div>
                  </div>
                ) : <div style={{ textAlign: 'center', color: '#64748B' }}>No effectiveness summaries.</div>}
              </div>

              {/* Intervention Type Distribution */}
              <div style={glassCard}>
                <div style={sectionTitle}>
                  <span>📊 Outreach Types</span>
                  <span style={badgeStyle('#3B82F6')}>Communication Modes</span>
                </div>
                {loadingD ? <Skeleton h="200px" /> : interventionTypesChartData ? (
                  <div style={{ display: 'flex', alignItems: 'center', height: '190px', gap: '15px' }}>
                    <div style={{ flex: 1.2, height: '100%' }}>
                      <Doughnut data={interventionTypesChartData} options={{
                        ...chartOpts(),
                        cutout: '60%',
                        scales: undefined,
                        plugins: { legend: { display: false } }
                      }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#94A3B8' }}>
                      {Object.entries(deepAnalytics.interventionEffectiveness.typeCounts || {}).map(([type, val], idx) => {
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                        return (
                          <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }} /> {type}
                            </span>
                            <span style={{ color: '#F1F5F9', fontWeight: 700 }}>{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>No Outreach Logs</div>}
              </div>

            </div>

            {/* Recent Interventions Log Table */}
            <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>📋 Recent Intervention Activity</h5>
                <button className="hod-btn" style={btnStyle('ghost')} onClick={exportInterventionsCSV}>📥 Export Intervention Log</button>
              </div>
              {loadingD ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3].map(i => <Skeleton key={i} h="40px" />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Date', 'Student Name', 'Intervention Type', 'Current Status', 'Action Summary Remarks'].map(h => (
                          <th key={h} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(deepAnalytics?.interventionEffectiveness?.recent || []).map((log, idx) => (
                        <tr key={idx} className="hod-tr">
                          <td style={{ ...TD_STYLE, color: '#94A3B8', fontSize: '12px' }}>
                            {log.date ? new Date(log.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                          </td>
                          <td style={{ ...TD_STYLE, fontWeight: 700, color: '#F8FAFC' }}>{log.studentName}</td>
                          <td style={TD_STYLE}><span style={badgeStyle('#3B82F6')}>{log.type}</span></td>
                          <td style={TD_STYLE}>
                            <span style={badgeStyle(log.status === 'Closed' ? '#10B981' : '#F59E0B')}>{log.status}</span>
                          </td>
                          <td style={{ ...TD_STYLE, fontSize: '12px', color: '#94A3B8', maxWidth: '350px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {log.remarks || 'No remarks recorded.'}
                          </td>
                        </tr>
                      ))}
                      {!deepAnalytics?.interventionEffectiveness?.recent?.length && (
                        <tr>
                          <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No interventions recorded in system database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════ FACULTY PERFORMANCE TAB ════════════════ */}
        {activeTab === 'faculty' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            
            <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>👨‍🏫 Faculty Impact & Performance Registry</h5>
                <button className="hod-btn" style={btnStyle('ghost')} onClick={exportFacultyComplianceCSV}>📥 Export Performance</button>
              </div>
              {loadingD ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3,4].map(i => <Skeleton key={i} h="44px" />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Faculty Member', 'Assigned subject', 'Avg Student attendance', 'Student pass rate', 'Compliance Rating'].map(h => (
                          <th key={h} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(deepAnalytics?.facultyImpact || []).map((f, idx) => {
                        const pr = typeof f.passRate === 'number' ? f.passRate : parseFloat(f.passRate) || 0;
                        const rating = pr >= 85 ? 5 : pr >= 75 ? 4 : pr >= 65 ? 3 : pr >= 50 ? 2 : 1;
                        const rateColor = rating >= 4 ? '#10B981' : rating >= 3 ? '#F59E0B' : '#EF4444';
                        return (
                          <tr key={idx} className="hod-tr">
                            <td style={TD_STYLE}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#fff' }}>
                                  {(f.name || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 650, color: '#F8FAFC', display: 'block' }}>{f.name}</span>
                                  <span style={{ fontSize: '11px', color: '#64748B' }}>Department Lecturer</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ ...TD_STYLE, color: '#94A3B8', fontWeight: 600 }}>{f.subject || '—'}</td>
                            <td style={TD_STYLE}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '130px' }}>
                                <span style={{ fontWeight: 750, color: f.avgAttendance < 75 ? '#F59E0B' : '#10B981', minWidth: '40px' }}>{f.avgAttendance}%</span>
                                <ProgressBar value={f.avgAttendance} color={f.avgAttendance < 75 ? '#F59E0B' : '#10B981'} />
                              </div>
                            </td>
                            <td style={TD_STYLE}>
                              <span style={badgeStyle(pr < 70 ? '#F59E0B' : '#10B981')}>
                                {pr.toFixed(1)}%
                              </span>
                            </td>
                            <td style={{ ...TD_STYLE, color: rateColor, fontSize: '16px', letterSpacing: '3px' }}>
                              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                            </td>
                          </tr>
                        );
                      })}
                      {!deepAnalytics?.facultyImpact?.length && (
                        <tr>
                          <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No performance indicators logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════ COMPLIANCE TAB ════════════════ */}
        {activeTab === 'compliance' && (
          <div style={{ display: 'grid', gap: '24px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={glassCard}>
                <h5 style={{ margin: '0 0 14px', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compliance Rate</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <h1 style={{ margin: 0, fontSize: '46px', fontWeight: 800, color: '#06B6D4', fontFamily: 'Outfit, sans-serif' }}>
                    {loadingD ? '—' : `${deepAnalytics?.facultyCompliance?.complianceRate}%`}
                  </h1>
                  <span style={{ fontSize: '32px' }}>🛡️</span>
                </div>
                <ProgressBar value={loadingD ? 0 : parseFloat(deepAnalytics?.facultyCompliance?.complianceRate || 0)} color="#06B6D4" />
                <p style={{ margin: '14px 0 0', color: '#64748B', fontSize: '11px', lineHeight: 1.5 }}>
                  The percentage of system-assigned lecturers who have uploaded student roll call or marks records within the current academic session.
                </p>
              </div>

              <div style={glassCard}>
                <h5 style={{ margin: '0 0 14px', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faculty Enrolments</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Total Assigned Faculty</span>
                    <h3 style={{ margin: '4px 0 0', fontWeight: 800, color: '#F8FAFC' }}>{loadingD ? '—' : deepAnalytics?.facultyCompliance?.totalFaculty}</h3>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Active Faculty</span>
                    <h3 style={{ margin: '4px 0 0', fontWeight: 800, color: '#10B981' }}>{loadingD ? '—' : deepAnalytics?.facultyCompliance?.activeFaculty}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>📋 Latest Compliance Activity Log</h5>
              </div>
              {loadingD ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[1,2].map(i => <Skeleton key={i} h="36px" />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Date & Time', 'Faculty Member', 'Activity Type', 'Verification Details'].map(h => (
                          <th key={h} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(deepAnalytics?.facultyCompliance?.recentUploads || []).map((log, idx) => (
                        <tr key={idx} className="hod-tr">
                          <td style={{ ...TD_STYLE, color: '#94A3B8', fontSize: '12px', width: '180px' }}>
                            {log.date ? new Date(log.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                          </td>
                          <td style={{ ...TD_STYLE, fontWeight: 700, color: '#F8FAFC' }}>{log.user}</td>
                          <td style={TD_STYLE}>
                            <span style={badgeStyle(log.type === 'Attendance Upload' ? '#06B6D4' : '#8B5CF6')}>{log.type}</span>
                          </td>
                          <td style={{ ...TD_STYLE, fontSize: '12px', color: '#94A3B8' }}>{log.detail}</td>
                        </tr>
                      ))}
                      {!deepAnalytics?.facultyCompliance?.recentUploads?.length && (
                        <tr>
                          <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No compliance updates.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════ SYSTEM AUDIT TAB ════════════════ */}
        {activeTab === 'audit' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            
            <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>📋 Master System Audit Trail (Last 20 operations)</h5>
              </div>
              {loadingD ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3,4,5].map(i => <Skeleton key={i} h="42px" />)}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Operation timestamp', 'Authorized User', 'Activity Tier', 'Transaction Details'].map(h => (
                          <th key={h} style={TH_STYLE}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(deepAnalytics?.audit || []).map((log, idx) => (
                        <tr key={idx} className="hod-tr">
                          <td style={{ ...TD_STYLE, color: '#94A3B8', fontSize: '12px', width: '200px' }}>
                            {log.date ? new Date(log.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                          </td>
                          <td style={{ ...TD_STYLE, fontWeight: 700, color: '#F8FAFC' }}>{log.user}</td>
                          <td style={TD_STYLE}>
                            <span style={badgeStyle(log.type === 'Attendance Upload' ? '#3B82F6' : '#8B5CF6')}>
                              {log.type === 'Attendance Upload' ? '📅' : '📝'} {log.type}
                            </span>
                          </td>
                          <td style={{ ...TD_STYLE, fontSize: '12px', color: '#94A3B8' }}>{log.detail}</td>
                        </tr>
                      ))}
                      {!deepAnalytics?.audit?.length && (
                        <tr>
                          <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No transaction logs available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Footer ─── */}
        <div style={{ marginTop: '40px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
          KSV Smart Academic Monitoring System &nbsp;•&nbsp; Head of Department Dashboard &nbsp;•&nbsp; Secure API Port 5000
        </div>

      </div>
    </Layout>
  );
};

export default HODDashboard;
