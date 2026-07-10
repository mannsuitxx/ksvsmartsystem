import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';
import { staggerContainer, staggerItem } from '../framerVariants';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ─── Custom Inline Styles ──────────────────────────────────────────────────────
const styles = {
  dashboardWrapper: {
    background: 'transparent',
    minHeight: 'calc(100vh - 100px)',
    borderRadius: '24px',
    padding: '16px 0px',
    color: '#1E293B',
    fontFamily: "'Inter', sans-serif",
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(10, 22, 40, 0.04)',
    color: '#1E293B',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '24px',
    padding: '32px 40px',
    color: '#fff',
    marginBottom: '28px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)',
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#64748B',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '2.4rem',
    fontWeight: 800,
    lineHeight: 1,
    color: '#0F172A',
  },
};

// ─── Extra Styles & Animations ────────────────────────────────────────────────
const extraCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-ring-red {
  0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
  70%  { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
  100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
}
@keyframes pulse-ring-orange {
  0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); }
  70%  { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
  100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
}
@keyframes pulse-ring-green {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
  70%  { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
@keyframes scoreCount {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}

.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  border-radius: 24px !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04) !important;
  color: #1E293B !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.glass-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
}
.ksd-table-row {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.ksd-table-row:hover {
  background-color: rgba(59, 130, 246, 0.04) !important;
}
.ksd-fade-in   { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.ksd-delay-1 { animation-delay: 0.05s; }
.ksd-delay-2 { animation-delay: 0.10s; }
.ksd-delay-3 { animation-delay: 0.15s; }
.ksd-delay-4 { animation-delay: 0.20s; }
.ksd-delay-5 { animation-delay: 0.25s; }
.ksd-delay-6 { animation-delay: 0.30s; }

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
`;

// ─── Shimmer Component ────────────────────────────────────────────────────────
const SkeletonBlock = ({ height = 20, width = '100%', borderRadius = 8, style = {} }) => (
  <div
    style={{
      height,
      width,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.6s infinite',
      ...style,
    }}
  />
);

// ─── Risk Level Configurations ─────────────────────────────────────────────────
const getRiskConfig = (level) => {
  if (level === 'High Risk')
    return {
      color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',
      icon: '🚨', label: 'HIGH RISK', pulse: 'pulse-ring-red',
      tip: 'Critical warning! Meet your academic mentor immediately to draw up an intervention plan.',
    };
  if (level === 'Moderate Risk')
    return {
      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
      icon: '⚠️', label: 'MODERATE RISK', pulse: 'pulse-ring-orange',
      tip: 'Caution is required. Attend lectures regularly and raise assessment scores to avoid critical alert status.',
    };
  return {
    color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',
    icon: '🛡️', label: 'SAFE', pulse: 'pulse-ring-green',
    tip: 'Splendid performance! You meet all guidelines and thresholds. Keep up the high standard.',
  };
};

// ─── Animated SVG Score Ring ────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
        <circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color, animation: 'scoreCount 0.8s ease' }}>
          {score}
        </span>
        <span style={{ fontSize: '0.6rem', color: '#64748B', letterSpacing: '0.1em' }}>SCORE</span>
      </div>
    </div>
  );
};

// ─── Inline Notification Section ───────────────────────────────────────────────
const NotificationSection = ({ notifications, onMarkAsRead, loading }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="glass-card p-4" style={{ height: '100%' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="m-0 fw-bold d-flex align-items-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <span style={{ position: 'relative', marginRight: '10px', fontSize: '1.25rem' }}>
            💬
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 9, height: 9, borderRadius: '50%',
                background: '#EF4444', border: '2px solid #fff',
                animation: 'pulse-ring-red 2s infinite'
              }} />
            )}
          </span>
          Mentor Communications
        </h5>
        {unreadCount > 0 && (
          <span className="badge bg-danger px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>
            {unreadCount} NEW
          </span>
        )}
      </div>

      <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '6px' }} className="custom-scrollbar">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary spinner-border-sm" role="status" />
            <div className="text-muted mt-2 small">Syncing messages...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📭</span>
            <div className="fw-semibold text-dark">No communications yet</div>
            <div className="small mt-1 text-secondary">Messages from your mentor will be posted here.</div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && onMarkAsRead(n._id)}
                style={{
                  background: n.isRead ? 'rgba(0, 0, 0, 0.01)' : 'rgba(59, 130, 246, 0.04)',
                  border: `1px solid ${n.isRead ? 'rgba(0, 0, 0, 0.05)' : 'rgba(59, 130, 246, 0.15)'}`,
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{
                    background: n.type === 'Academic Intervention' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: n.type === 'Academic Intervention' ? '#EF4444' : '#F59E0B',
                    border: `1px solid ${n.type === 'Academic Intervention' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {n.type}
                  </span>
                  <small style={{ color: '#64748B', fontSize: '0.7rem' }}>
                    {new Date(n.createdAt || n.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </small>
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#1E293B', fontWeight: !n.isRead ? 600 : 400 }}>
                  {n.remarks}
                </p>

                {n.actionPlan && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderLeft: '3px solid #3B82F6',
                    padding: '8px 12px',
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '10px',
                    fontSize: '0.78rem',
                    color: '#475569'
                  }}>
                    <strong style={{ color: '#3B82F6' }}>Action Plan:</strong> {n.actionPlan}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <small style={{ color: '#64748B', fontSize: '0.72rem' }}>
                    ✍️ Mentor: <strong style={{ color: '#0F172A' }}>Prof. {n.mentorId?.firstName} {n.mentorId?.lastName}</strong>
                  </small>
                  {!n.isRead && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3B82F6' }} className="text-uppercase">
                      • Mark as Read
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Student Dashboard Component ──────────────────────────────────────────
const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.get(`${API_URL}/api/student/dashboard`, config);
      setData(prev => {
        if (prev && JSON.stringify(prev) === JSON.stringify(res.data)) {
          return prev;
        }
        return res.data;
      });
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.get(`${API_URL}/api/student/notifications`, config);
      setNotifications(prev => {
        if (JSON.stringify(prev) === JSON.stringify(res.data)) {
          return prev;
        }
        return res.data;
      });
    } catch (e) {
      console.error("Error fetching notifications", e);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markNotificationAsRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.put(`${API_URL}/api/student/notifications/${id}/read`, {}, config);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Error marking notification as read", e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
    
    // Poll data every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchData();
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchData, fetchNotifications]);

  // ── Compute Visual Elements Memo ───────────────────────────────────────────
  const chartData = React.useMemo(() => {
    if (!data) return null;

    const attPct = parseFloat(data.metrics.attendance.percentage) || 0;
    const subjectMap = data.metrics.attendance.subjectWise || {};
    const subjectNames = Object.keys(subjectMap);
    const subjectPcts = subjectNames.map(s =>
      subjectMap[s].total > 0
        ? parseFloat(((subjectMap[s].present / subjectMap[s].total) * 100).toFixed(1))
        : 0
    );

    const barColors = subjectPcts.map(p =>
      p >= 75 ? 'rgba(16,185,129,0.85)' : p >= 60 ? 'rgba(245,158,11,0.85)' : 'rgba(239,68,68,0.85)'
    );
    const barBorders = subjectPcts.map(p =>
      p >= 75 ? '#10B981' : p >= 60 ? '#F59E0B' : '#EF4444'
    );

    const doughnut = {
      labels: ['Present', 'Absent'],
      datasets: [{
        data: [attPct, Math.max(0, 100 - attPct)],
        backgroundColor: ['#10B981', 'rgba(255,255,255,0.06)'],
        borderColor: ['#10B981', 'rgba(255,255,255,0.05)'],
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };

    const bar = {
      labels: subjectNames.length > 0 ? subjectNames : ['No Data'],
      datasets: [{
        label: 'Attendance %',
        data: subjectPcts.length > 0 ? subjectPcts : [0],
        backgroundColor: barColors.length > 0 ? barColors : ['rgba(59,130,246,0.5)'],
        borderColor: barBorders.length > 0 ? barBorders : ['#3B82F6'],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }],
    };

    return { doughnut, bar, subjectNames, subjectPcts, attPct };
  }, [data]);

  return (
    <Layout title="Student Academic Monitoring">
      <style>{extraCSS}</style>

      <div style={styles.dashboardWrapper}>
        
        {/* ── Loading Skeletons ──────────────────────────────────────────────── */}
        {loading && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ ...styles.welcomeBanner, padding: '32px 40px', marginBottom: '28px' }}>
              <SkeletonBlock height={18} width="20%" style={{ marginBottom: 14 }} />
              <SkeletonBlock height={36} width="40%" style={{ marginBottom: 10 }} />
              <SkeletonBlock height={14} width="30%" />
            </div>
            
            <div className="glass-card p-4 mb-4" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <SkeletonBlock height={110} width="110px" borderRadius={55} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <SkeletonBlock height={14} width="15%" style={{ marginBottom: 10 }} />
                <SkeletonBlock height={32} width="35%" style={{ marginBottom: 10 }} />
                <SkeletonBlock height={14} width="60%" />
              </div>
            </div>

            <div className="row g-4 mb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="col-md-4">
                  <div className="glass-card p-4">
                    <SkeletonBlock height={12} width="40%" style={{ marginBottom: 16 }} />
                    <SkeletonBlock height={42} width="55%" style={{ marginBottom: 8 }} />
                    <SkeletonBlock height={12} width="70%" />
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-8">
                <div className="glass-card p-4">
                  <SkeletonBlock height={14} width="25%" style={{ marginBottom: 20 }} />
                  <SkeletonBlock height={280} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="glass-card p-4 text-center">
                  <SkeletonBlock height={14} width="40%" style={{ marginBottom: 20, margin: '0 auto 20px' }} />
                  <SkeletonBlock height={200} width="200px" borderRadius={100} style={{ margin: '0 auto' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Error State ────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="glass-card p-5 text-center" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⚠️</div>
            <h4 style={{ color: '#EF4444', fontWeight: 800, marginBottom: 8 }}>Failed to Load Dashboard</h4>
            <p style={{ color: '#94A3B8', marginBottom: 28, maxWidth: 420, margin: '0 auto 24px' }}>{error}</p>
            <button
              onClick={() => { setLoading(true); fetchData(); fetchNotifications(); }}
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                border: 'none', color: '#fff', padding: '12px 32px',
                borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
              }}
            >
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* ── Main Dashboard ─────────────────────────────────────────────────── */}
        {!loading && !error && data && chartData && (() => {
          const risk = data.metrics.risk;
          const riskConfig = getRiskConfig(risk.level);
          const { attPct, subjectNames, subjectPcts, doughnut, bar } = chartData;
          const marks = data.metrics.marks || [];

          // Active backlogs: marks where percentage < 40
          const activeBacklogs = marks.filter(m => m.maxMarks > 0 && (m.marksObtained / m.maxMarks) * 100 < 40).length;

          // Best attended subject from subjectWise data
          const subjectEntries = Object.entries(data.metrics.attendance.subjectWise || {});
          const bestSubject = subjectEntries.length > 0
            ? subjectEntries.reduce((best, [name, val]) => {
                const pct = val.total > 0 ? (val.present / val.total) * 100 : 0;
                return pct > best.pct ? { name, pct } : best;
              }, { name: '—', pct: 0 })
            : { name: '—', pct: 0 };

          return (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              
              {/* Welcome Banner */}
              <motion.div
                variants={staggerItem}
                style={styles.welcomeBanner}
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -60, right: -40 }} />
                <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -30, right: 80 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                    🎓 KSV Academic Monitoring Dashboard
                  </div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '2.2rem', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                    Welcome back, {data.profile.name}!
                  </h2>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    <span>🆔 Enrollment: <strong style={{ color: '#fff' }}>{data.profile.enrollment}</strong></span>
                    <span>📅 Semester: <strong style={{ color: '#fff' }}>Semester {data.profile.semester}</strong></span>
                    <span>🕐 Last Sync: <strong style={{ color: '#fff' }}>{new Date().toLocaleTimeString()}</strong></span>
                  </div>
                </div>
              </motion.div>

              {/* Animated Risk Card */}
              <motion.div
                variants={staggerItem}
                className="glass-card p-4 mb-4 d-flex align-items-center gap-4 flex-wrap"
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(31, 38, 135, 0.1)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: riskConfig.bg,
                  borderColor: riskConfig.border,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxShadow: `0 0 20px ${riskConfig.bg}`
                }}
              >
                {/* Pulsing ring animation */}
                <div style={{ borderRadius: '50%', display: 'inline-block' }} className={riskConfig.pulse}>
                  <ScoreRing score={risk.score} color={riskConfig.color} />
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <span style={{ ...styles.statLabel, color: riskConfig.color }}>ACADEMIC RISK ASSESSMENT</span>
                  <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                    <span style={{ fontSize: '1.8rem' }}>{riskConfig.icon}</span>
                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.7rem', color: riskConfig.color, fontFamily: "'Outfit', sans-serif" }}>
                      {riskConfig.label}
                    </h3>
                  </div>
                  <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {riskConfig.tip}
                  </p>
                  
                  {risk.factors && risk.factors.length > 0 ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {risk.factors.map((f, i) => (
                        <span key={i} style={{
                          background: 'rgba(0,0,0,0.04)', 
                          border: '1px solid rgba(0,0,0,0.08)',
                          color: '#475569', fontSize: '0.72rem', fontWeight: 600,
                          padding: '4px 12px', borderRadius: '20px',
                        }}>⚠️ {f}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      🛡️ All criteria met successfully. No threat factors registered.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }} className="w-100 w-md-auto">
                  <a href="/student/simulator" className="btn btn-primary btn-sm py-2 px-3 fw-bold" style={{ borderRadius: '10px', fontSize: '0.8rem', background: '#3B82F6', border: 'none' }}>
                    🔬 What-If Simulator
                  </a>
                  <a href="/student/attendance-recovery" className="btn btn-outline-primary btn-sm py-2 px-3 fw-bold" style={{ borderRadius: '10px', fontSize: '0.8rem', borderWidth: '1.5px' }}>
                    📈 Attendance Recovery
                  </a>
                </div>
              </motion.div>

              {/* Stats Cards Row */}
              <motion.div variants={staggerItem} className="row g-4 mb-4">
                {/* Attendance stat card */}
                <div className="col-md-4">
                  <motion.div
                    className="glass-card p-4 d-flex flex-column justify-content-between"
                    style={{ height: '100%' }}
                    variants={staggerItem}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div>
                      <div style={styles.statLabel}>Global Lecture Attendance</div>
                      <div className="d-flex align-items-center justify-content-between mb-3 mt-1">
                        <div style={{ ...styles.statValue, color: attPct >= 75 ? '#10B981' : attPct >= 60 ? '#F59E0B' : '#EF4444' }}>
                          {attPct.toFixed(1)}%
                        </div>
                        <div style={{ width: 62, height: 62, flexShrink: 0 }}>
                          <Doughnut
                            data={doughnut}
                            options={{
                              maintainAspectRatio: false, cutout: '72%',
                              plugins: { legend: { display: false }, tooltip: { enabled: false } },
                              animation: { animateRotate: true, duration: 1000 },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.02)', borderRadius: '10px',
                      padding: '10px 14px', fontSize: '0.78rem', color: '#475569',
                    }}>
                      {attPct >= 75
                        ? '🟢 Safe: You meet the university standards.'
                        : `🔴 Alert: You are ${(75 - attPct).toFixed(1)}% below the 75% required attendance.`}
                    </div>
                  </motion.div>
                </div>

                {/* Backlogs card */}
                <div className="col-md-4">
                  <motion.div
                    className="glass-card p-4 d-flex flex-column justify-content-between"
                    style={{ height: '100%' }}
                    variants={staggerItem}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div>
                      <div style={styles.statLabel}>Active Academic Backlogs</div>
                      <div style={{ ...styles.statValue, color: activeBacklogs === 0 ? '#10B981' : '#EF4444', margin: '14px 0' }}>
                        {activeBacklogs}
                      </div>
                    </div>
                    <div>
                      {activeBacklogs === 0 ? (
                        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>
                          🎉 Academic Standings Clean: 0 Failures
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.78rem', color: '#EF4444', fontWeight: 600 }}>
                          ⚠️ Critical: Failures in {activeBacklogs} assessment(s)
                        </div>
                      )}
                      <a href="/student/backlog-risk" style={{ display: 'block', marginTop: '12px', fontSize: '0.75rem', color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>
                        Analyze Backlog Risk →
                      </a>
                    </div>
                  </motion.div>
                </div>

                {/* Best subject card */}
                <div className="col-md-4">
                  <motion.div
                    className="glass-card p-4 d-flex flex-column justify-content-between"
                    style={{ height: '100%' }}
                    variants={staggerItem}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div>
                      <div style={styles.statLabel}>Top Attended Class</div>
                      {bestSubject.name !== '—' ? (
                        <>
                          <div style={{ ...styles.statValue, color: '#3B82F6', fontSize: '1.4rem', margin: '12px 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {bestSubject.name}
                          </div>
                          <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>
                            ⭐ {bestSubject.pct.toFixed(1)}% Attendance
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#64748B', fontSize: '0.85rem', margin: '14px 0' }}>
                          No lecture logs documented.
                        </div>
                      )}
                    </div>
                    <div>
                      <a href="/student/goals" style={{ fontSize: '0.75rem', color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>
                        Formulate Semester Goals →
                      </a>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Attendance Analytics Section */}
              <motion.div variants={staggerItem} className="row g-4 mb-4">
                {/* Subject wise chart */}
                <div className="col-md-8">
                  <motion.div
                    className="glass-card p-4"
                    style={{ height: '100%' }}
                    variants={staggerItem}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h5 className="m-0 fw-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Subject Attendance Breakdown</h5>
                        <p style={{ color: '#64748B', fontSize: '0.78rem', margin: '4px 0 0' }}>
                          Individual requirements: green ≥75%, orange 60-75%, red &lt;60%
                        </p>
                      </div>
                    </div>

                    {subjectNames.length === 0 ? (
                      <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                        <span style={{ fontSize: '2.5rem', marginBottom: 8 }}>📊</span>
                        <div className="fw-semibold text-dark">No Lecture Logs Found</div>
                        <div className="small mt-1">Attendance records will show once updated by faculty.</div>
                      </div>
                    ) : (
                      <div style={{ height: 260 }}>
                        <Bar
                          data={bar}
                          options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: '#ffffff',
                                titleColor: '#0F172A',
                                bodyColor: '#475569',
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1,
                                padding: 12,
                                callbacks: {
                                  label: (ctx) => ` ${ctx.raw.toFixed(1)}% attendance`,
                                  afterLabel: (ctx) => {
                                    const s = data.metrics.attendance.subjectWise[ctx.label];
                                    return s ? ` ${s.present} / ${s.total} lectures attended` : '';
                                  },
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                                ticks: { callback: v => `${v}%`, color: '#64748B', font: { size: 10 } },
                              },
                              x: {
                                grid: { display: false },
                                ticks: { color: '#475569', font: { size: 10, weight: '600' } },
                              },
                            },
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Overall Attendance summary doughnut */}
                <div className="col-md-4">
                  <motion.div
                    className="glass-card p-4"
                    style={{ height: '100%' }}
                    variants={staggerItem}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h5 className="mb-1 fw-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Overview Summary</h5>
                    <p style={{ color: '#64748B', fontSize: '0.78rem', marginBottom: '20px' }}>Total academic lectures</p>
                    
                    <div style={{ height: 180, position: 'relative' }} className="mb-3">
                      <Doughnut
                        data={doughnut}
                        options={{
                          maintainAspectRatio: false, cutout: '70%',
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: '#ffffff',
                              titleColor: '#0F172A', bodyColor: '#475569', padding: 10,
                              borderColor: 'rgba(0, 0, 0, 0.1)', borderWidth: 1
                            },
                          },
                        }}
                      />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: attPct >= 75 ? '#10B981' : attPct >= 60 ? '#F59E0B' : '#EF4444' }}>
                          {attPct.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>
                          AGGREGATE
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px' }}>
                      {[
                        { label: 'Enrolled Subjects', value: subjectNames.length },
                        { label: 'Attained Threshold (≥75%)', value: subjectPcts.filter(p => p >= 75).length, color: '#10B981' },
                        { label: 'Underrepresented (<60%)', value: subjectPcts.filter(p => p < 60).length, color: '#EF4444' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: 'flex', justifycontent: 'space-between', padding: '6px 0', fontSize: '0.8rem' }}>
                          <span style={{ color: '#64748B' }}>{label}</span>
                          <span style={{ fontWeight: 700, color: color || '#0F172A' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Assessment Breakdown Table */}
              <motion.div variants={staggerItem} className="row mb-4">
                <div className="col-12">
                  <motion.div
                    className="glass-card p-0"
                    style={{ overflow: 'hidden' }}
                    variants={staggerItem}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h5 className="m-0 fw-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Internal Assessment Performance</h5>
                        <p style={{ color: '#64748B', fontSize: '0.78rem', margin: '4px 0 0' }}>
                          Performance brackets: green ≥70%, orange 40-70%, red &lt;40% (backlog trigger)
                        </p>
                      </div>
                      <span className="badge bg-primary px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.7rem' }}>
                        {marks.length} Assessments Registered
                      </span>
                    </div>

                    {marks.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>📝</span>
                        <div className="fw-semibold text-dark">No Test Grades Available</div>
                        <div className="small mt-1 text-secondary">Grades will appear here when entries are made by instructors.</div>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.01)' }}>
                              {['Subject', 'Assessment Type', 'Obtained Score', 'Progress / Percentage', 'Standing Status'].map(h => (
                                <th key={h} style={{
                                  padding: '16px 24px', textAlign: 'left',
                                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                                  textTransform: 'uppercase', color: '#64748B',
                                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {marks.map((m, i) => {
                              const pct = m.maxMarks > 0 ? (m.marksObtained / m.maxMarks) * 100 : 0;
                              
                              let statusBadge = { label: 'Good Standing', bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.2)' };
                              if (pct < 40) {
                                statusBadge = { label: 'Backlog Risk', bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.2)' };
                              } else if (pct < 70) {
                                statusBadge = { label: 'Satisfactory', bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)' };
                              }

                              return (
                                <tr key={i} className="ksd-table-row">
                                  <td style={{ padding: '16px 24px', fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>
                                    {m.subjectName}
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <span style={{ 
                                      background: 'rgba(99,102,241,0.08)', color: '#4F46E5', 
                                      padding: '4px 12px', borderRadius: '12px', 
                                      fontSize: '0.7rem', fontWeight: 700, 
                                      border: '1px solid rgba(99,102,241,0.15)' 
                                    }}>
                                      {m.examType}
                                    </span>
                                  </td>
                                  <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{m.marksObtained}</span>
                                    <span style={{ color: '#64748B' }}> / {m.maxMarks}</span>
                                  </td>
                                  <td style={{ padding: '16px 24px', minWidth: '180px' }}>
                                    <div className="d-flex align-items-center gap-2">
                                      <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{
                                          width: `${Math.min(100, pct)}%`, height: '100%',
                                          background: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444',
                                          transition: 'width 1s ease',
                                        }} />
                                      </div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', width: 35, textAlign: 'right' }}>
                                        {pct.toFixed(0)}%
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                      background: statusBadge.bg, color: statusBadge.color,
                                      border: `1px solid ${statusBadge.border}`,
                                      padding: '4px 12px', borderRadius: '20px',
                                      fontSize: '0.7rem', fontWeight: 700,
                                    }}>
                                      {statusBadge.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Notification & Communications Panel */}
              <motion.div variants={staggerItem} className="row mb-4">
                <div className="col-12">
                  <motion.div variants={staggerItem}>
                    <NotificationSection
                      notifications={notifications}
                      onMarkAsRead={markNotificationAsRead}
                      loading={notificationsLoading}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Quick Navigation Deck */}
              <motion.div variants={staggerItem} className="row g-3">
                {[
                  { href: '/student/simulator', icon: '🔬', label: 'What-If Simulator', desc: 'Forecast grades & risk standing' },
                  { href: '/student/leaves',    icon: '🏥', label: 'Medical Leave',     desc: 'Submit doctor certificates' },
                  { href: '/student/achievements', icon: '🏆', label: 'Achievements Portfolio', desc: 'Submit certs for verification' },
                  { href: '/student/profile',   icon: '👤', label: 'Student Profile',      desc: 'Verify contact details' },
                ].map(({ href, icon, label, desc }, index) => (
                  <div key={href} className="col-6 col-md-3">
                    <a
                      href={href}
                      className={`glass-card ksd-fade-in ksd-delay-${index + 3}`}
                      style={{ display: 'block', padding: '24px 20px', textDecoration: 'none', textAlign: 'center', height: '100%' }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: 10 }}>{icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>{desc}</div>
                    </a>
                  </div>
                ))}
              </motion.div>

            </motion.div>
          );
        })()}
        
      </div>
    </Layout>
  );
};

export default StudentDashboard;
