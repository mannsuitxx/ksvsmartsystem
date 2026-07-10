import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config';

ChartJS.register(ArcElement, Tooltip, Legend, PieController);

/* ─────────────────────────────────────────────
   INLINE STYLES  (premium glassmorphism theme)
───────────────────────────────────────────── */
const theme = {
    bg: 'transparent',
    glass: {
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(10, 22, 40, 0.04)',
    },
    glassLight: {
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '12px',
    },
    colors: {
        primary:  '#3B82F6',
        success:  '#10B981',
        warning:  '#F59E0B',
        danger:   '#EF4444',
        purple:   '#8B5CF6',
        textMain: '#1E293B',
        textSub:  '#64748B',
    },
};

const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
.mentor-dash * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.mentor-dash { min-height: 100vh; }

@keyframes shimmer {
  0%   { background-position: -800px 0 }
  100% { background-position:  800px 0 }
}
.skeleton {
  background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.6s infinite;
  border-radius: 8px;
}

.glass-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: default; }
.glass-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(31,38,135,0.08) !important; }

@keyframes countUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
.stat-num { animation: countUp 0.6s ease forwards; display: inline-block; }

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
  50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
}
.pulse-badge { animation: pulse-red 2s infinite; }

.mentor-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.50);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
.mentor-modal {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { transform: translateY(30px); opacity:0 } to { transform: translateY(0); opacity:1 } }

.refresh-btn { transition: all 0.2s ease; }
.refresh-btn:hover { transform: rotate(180deg) scale(1.1); }

.mentee-row { transition: background 0.2s ease; }
.mentee-row:hover { background: rgba(59,130,246,0.08) !important; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }

.mentor-input {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 8px;
  color: #1E293B;
  padding: 10px 14px;
  width: 100%;
  font-size: 14px;
  transition: border-color 0.2s;
}
.mentor-input:focus { outline: none; border-color: #3B82F6; background: rgba(59,130,246,0.04); }
.mentor-input option { background: #ffffff; color: #1E293B; }

@keyframes toastIn  { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
.toast-msg { animation: toastIn 0.3s ease; border-radius: 10px; font-size:14px; font-weight:500; }
`;

/* ─────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────── */

const Skel = ({ h = 20, w = '100%', mb = 8, br = 8 }) => (
    <div className="skeleton" style={{ height: h, width: w, marginBottom: mb, borderRadius: br }} />
);

const RiskBadge = ({ level }) => {
    const map = {
        'High Risk':     { bg: '#EF4444', label: 'High Risk',  cls: 'pulse-badge' },
        'Critical':      { bg: '#EF4444', label: 'Critical',   cls: 'pulse-badge' },
        'Moderate Risk': { bg: '#F59E0B', label: 'Moderate',   cls: '' },
        'Safe':          { bg: '#10B981', label: 'Safe',       cls: '' },
    };
    const cfg = map[level] || map['Safe'];
    return (
        <span className={cfg.cls} style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            background: cfg.bg + '22', border: `1px solid ${cfg.bg}66`,
            color: cfg.bg, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
        }}>
            {cfg.label}
        </span>
    );
};

const Avatar = ({ name = '', color = '#3B82F6' }) => {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: color + '33', border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color, flexShrink: 0,
        }}>
            {initials}
        </div>
    );
};

const StatCard = ({ icon, label, value, sub, accent, loading }) => (
    <div className="glass-card" style={{ ...theme.glass, padding: '22px 24px', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                {loading ? (
                    <>
                        <Skel h={13} w={90} mb={10} />
                        <Skel h={40} w={60} mb={8} />
                        <Skel h={11} w={120} mb={0} />
                    </>
                ) : (
                    <>
                        <div style={{ color: theme.colors.textSub, fontSize: 11, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                            {label}
                        </div>
                        <div className="stat-num" style={{ fontSize: 38, fontWeight: 800, color: accent, lineHeight: 1 }}>
                            {value}
                        </div>
                        {sub && <div style={{ color: theme.colors.textSub, fontSize: 12, marginTop: 6 }}>{sub}</div>}
                    </>
                )}
            </div>
            <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: accent + '22', border: `1px solid ${accent}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
            }}>
                {icon}
            </div>
        </div>
    </div>
);

const SectionHead = ({ title, count, accent = '#3B82F6' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: accent }} />
        <h6 style={{ color: theme.colors.textMain, fontWeight: 700, fontSize: 15, margin: 0 }}>
            {title}
        </h6>
        {count !== undefined && (
            <span style={{
                background: accent + '33', border: `1px solid ${accent}55`,
                color: accent, borderRadius: 20, fontSize: 11, fontWeight: 700,
                padding: '2px 8px', marginLeft: 4,
            }}>
                {count}
            </span>
        )}
    </div>
);

const Toast = ({ msg, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6' };
    const c = colors[type] || colors.info;
    return (
        <div className="toast-msg" style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 99999,
            background: '#0F2347', border: `1.5px solid ${c}66`,
            padding: '12px 20px', color: theme.colors.textMain,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: `0 8px 32px ${c}33`,
        }}>
            <span style={{ fontSize: 18 }}>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            {msg}
        </div>
    );
};

/* ─────────────────────────────────────────
   QUICK INTERVENTION MODAL
───────────────────────────────────────── */
const InterventionModal = ({ mentees, preselectedStudentId, onClose, onSuccess }) => {
    const [form, setForm] = useState({ studentId: preselectedStudentId || '', type: 'Counseling', remarks: '', actionPlan: '' });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const typeOptions = ['Counseling', 'Parent Meeting', 'Remedial Class', 'Performance Review', 'Academic Warning', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.studentId || !form.remarks.trim()) {
            setErr('Please select a mentee and enter remarks.'); return;
        }
        setSaving(true); setErr('');
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/mentor/intervention`, {
                studentId: form.studentId,
                type: form.type,
                remarks: form.remarks,
                actionPlan: form.actionPlan,
            }, config);
            onSuccess('Intervention logged successfully!');
            onClose();
        } catch (ex) {
            setErr(ex.response?.data?.message || 'Failed to log intervention.');
        } finally { setSaving(false); }
    };

    const inp = (field) => ({
        className: 'mentor-input',
        value: form[field],
        onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
    });

    return (
        <div className="mentor-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="mentor-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h5 style={{ color: theme.colors.textMain, fontWeight: 700, margin: 0 }}>📋 Log Intervention</h5>
                        <p style={{ color: theme.colors.textSub, fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                            Record a mentorship interaction or follow-up action
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94A3B8',
                        width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16
                    }}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: theme.colors.textSub, fontSize: 12, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
                            Select Mentee *
                        </label>
                        <select {...inp('studentId')}>
                            <option value="">— Choose mentee —</option>
                            {mentees.map(m => (
                                <option key={m._id} value={m._id}>
                                    {m.firstName} {m.lastName} ({m.enrollmentNumber})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: theme.colors.textSub, fontSize: 12, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
                            Intervention Type *
                        </label>
                        <select {...inp('type')}>
                            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: theme.colors.textSub, fontSize: 12, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
                            Notes / Remarks *
                        </label>
                        <textarea {...inp('remarks')} rows={3} style={{ resize: 'vertical' }}
                            placeholder="Describe the interaction, observations, or concerns..." />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ color: theme.colors.textSub, fontSize: 12, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
                            Action Plan (optional)
                        </label>
                        <input {...inp('actionPlan')} type="text"
                            placeholder="e.g. Schedule follow-up next week, contact parents..." />
                    </div>

                    {err && (
                        <div style={{ background: '#EF444422', border: '1px solid #EF444466',
                            borderRadius: 8, padding: '10px 14px', color: '#EF4444',
                            fontSize: 13, marginBottom: 16 }}>
                            {err}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '11px 0', borderRadius: 10,
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                            color: theme.colors.textSub, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{
                            flex: 2, padding: '11px 0', borderRadius: 10,
                            background: saving ? '#1E3A5F' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: 700, fontSize: 14,
                            boxShadow: saving ? 'none' : '0 4px 16px rgba(59,130,246,0.4)',
                        }}>
                            {saving ? '⏳ Saving…' : '✅ Log Intervention'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   REMARKS CONFIRM MODAL
───────────────────────────────────────── */
const RemarksModal = ({ title, description, onConfirm, onClose, actionLabel = 'Confirm', accentColor = '#10B981' }) => {
    const [remarks, setRemarks] = useState('');
    const [saving, setSaving] = useState(false);

    const handleConfirm = async () => {
        setSaving(true);
        await onConfirm(remarks);
        setSaving(false);
    };

    return (
        <div className="mentor-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="mentor-modal" style={{ maxWidth: 440 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h5 style={{ color: theme.colors.textMain, fontWeight: 700, margin: 0 }}>{title}</h5>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94A3B8',
                        width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16
                    }}>✕</button>
                </div>
                {description && (
                    <p style={{ color: theme.colors.textSub, fontSize: 13, marginBottom: 18 }}>{description}</p>
                )}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ color: theme.colors.textSub, fontSize: 12, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>
                        Remarks (optional)
                    </label>
                    <textarea
                        className="mentor-input" rows={3} style={{ resize: 'vertical' }}
                        value={remarks} onChange={e => setRemarks(e.target.value)}
                        placeholder="Add any remarks or reason for this decision..."
                    />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '10px 0', borderRadius: 10,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                        color: theme.colors.textSub, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                    }}>Cancel</button>
                    <button onClick={handleConfirm} disabled={saving} style={{
                        flex: 2, padding: '10px 0', borderRadius: 10,
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: 700, fontSize: 14,
                        boxShadow: `0 4px 16px ${accentColor}44`,
                    }}>
                        {saving ? '⏳ Processing…' : actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
const MentorDashboard = () => {
    const navigate = useNavigate();

    const [mentees, setMentees]           = useState([]);
    const [analytics, setAnalytics]       = useState(null);
    const [leaves, setLeaves]             = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading]           = useState({ mentees: true, analytics: true, leaves: true, achievements: true });
    const [errors, setErrors]             = useState({});
    const [lastRefresh, setLastRefresh]   = useState(null);
    const [filter, setFilter]             = useState('All');
    const [viewMode, setViewMode]         = useState('cards'); // 'cards' or 'table'
    const [preselectedStudentId, setPreselectedStudentId] = useState('');

    const [showInterventionModal, setShowInterventionModal] = useState(false);
    const [remarksModal, setRemarksModal] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

    const authCfg = useCallback(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }), []);

    const fetchMentees = useCallback(async () => {
        setLoading(p => ({ ...p, mentees: true }));
        try {
            const res = await axios.get(`${API_URL}/api/mentor/mentees`, authCfg());
            setMentees(res.data || []);
            setErrors(p => ({ ...p, mentees: null }));
        } catch (e) {
            setErrors(p => ({ ...p, mentees: e.response?.data?.message || 'Failed to load mentees.' }));
        } finally {
            setLoading(p => ({ ...p, mentees: false }));
        }
    }, [authCfg]);

    const fetchAnalytics = useCallback(async () => {
        setLoading(p => ({ ...p, analytics: true }));
        try {
            const res = await axios.get(`${API_URL}/api/mentor/analytics`, authCfg());
            setAnalytics(res.data || null);
            setErrors(p => ({ ...p, analytics: null }));
        } catch (e) {
            setErrors(p => ({ ...p, analytics: e.response?.data?.message || 'Failed to load analytics.' }));
        } finally {
            setLoading(p => ({ ...p, analytics: false }));
        }
    }, [authCfg]);

    const fetchLeaves = useCallback(async () => {
        setLoading(p => ({ ...p, leaves: true }));
        try {
            const res = await axios.get(`${API_URL}/api/leaves/pending`, authCfg());
            setLeaves(res.data || []);
            setErrors(p => ({ ...p, leaves: null }));
        } catch (e) {
            setErrors(p => ({ ...p, leaves: e.response?.data?.message || 'Failed to load leaves.' }));
        } finally {
            setLoading(p => ({ ...p, leaves: false }));
        }
    }, [authCfg]);

    const fetchAchievements = useCallback(async () => {
        setLoading(p => ({ ...p, achievements: true }));
        try {
            const res = await axios.get(`${API_URL}/api/achievements/pending`, authCfg());
            setAchievements(res.data || []);
            setErrors(p => ({ ...p, achievements: null }));
        } catch (e) {
            setErrors(p => ({ ...p, achievements: e.response?.data?.message || 'Failed to load achievements.' }));
        } finally {
            setLoading(p => ({ ...p, achievements: false }));
        }
    }, [authCfg]);

    const fetchAll = useCallback(async () => {
        await Promise.all([fetchMentees(), fetchAnalytics(), fetchLeaves(), fetchAchievements()]);
        setLastRefresh(new Date());
    }, [fetchMentees, fetchAnalytics, fetchLeaves, fetchAchievements]);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 60000); // Sync every 60s
        return () => clearInterval(interval);
    }, [fetchAll]);

    // Computed risk counts
    const riskCounts = { Safe: 0, Moderate: 0, High: 0 };
    mentees.forEach(s => {
        const lvl = s.riskProfile?.level;
        if (lvl === 'High Risk' || lvl === 'Critical') riskCounts.High++;
        else if (lvl === 'Moderate Risk') riskCounts.Moderate++;
        else riskCounts.Safe++;
    });

    const workload     = analytics?.workload     || {};
    const effectiveness = analytics?.effectiveness || {};
    const pendingInterventionsList = workload.pendingList || [];

    const filteredMentees = filter === 'All' ? mentees : mentees.filter(s => {
        const lvl = s.riskProfile?.level || 'Safe';
        if (filter === 'High')     return lvl === 'High Risk' || lvl === 'Critical';
        if (filter === 'Moderate') return lvl === 'Moderate Risk';
        if (filter === 'Safe')     return lvl === 'Safe';
        return true;
    });

    const riskOrder = { 'High Risk': 0, 'Critical': 0, 'Moderate Risk': 1, 'Safe': 2 };
    const sortedMentees = [...filteredMentees].sort((a, b) =>
        (riskOrder[a.riskProfile?.level] ?? 2) - (riskOrder[b.riskProfile?.level] ?? 2)
    );

    const avatarColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
    const getColor = (i) => avatarColors[i % avatarColors.length];

    const chartData = {
        labels: ['Safe', 'Moderate', 'High Risk'],
        datasets: [{
            data: [riskCounts.Safe, riskCounts.Moderate, riskCounts.High],
            backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)'],
            borderColor: ['#10B981', '#F59E0B', '#EF4444'],
            borderWidth: 2,
            hoverOffset: 8,
        }],
    };
    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#64748B', font: { size: 12, family: 'Inter' }, padding: 16, boxWidth: 12, boxHeight: 12 },
            },
            tooltip: {
                backgroundColor: '#ffffff',
                borderColor: 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                titleColor: '#1E293B',
                bodyColor: '#64748B',
                padding: 10,
            },
        },
    };

    const handleLeaveUpdate = (id, status) => {
        const leaf = leaves.find(l => l._id === id);
        const name = `${leaf?.studentId?.firstName || ''} ${leaf?.studentId?.lastName || ''}`.trim();
        setRemarksModal({
            type: 'leave', id, action: status,
            title: status === 'approved' ? '✅ Approve Leave' : '❌ Reject Leave',
            description: `Student: ${name || 'Unknown'}`,
            actionLabel: status === 'approved' ? 'Approve Leave' : 'Reject Leave',
            accentColor: status === 'approved' ? '#10B981' : '#EF4444',
        });
    };

    const handleAchievementUpdate = (id, status) => {
        const ach = achievements.find(a => a._id === id);
        const name = `${ach?.studentId?.firstName || ''} ${ach?.studentId?.lastName || ''}`.trim();
        setRemarksModal({
            type: 'achievement', id, action: status,
            title: status === 'approved' ? '✅ Approve Achievement' : '❌ Reject Achievement',
            description: `${name}: "${ach?.title}"`,
            actionLabel: status === 'approved' ? 'Approve Achievement' : 'Reject Achievement',
            accentColor: status === 'approved' ? '#10B981' : '#EF4444',
        });
    };

    const handleCloseIntervention = async (id) => {
        const confirmClose = window.confirm("Are you sure you want to mark this intervention as Closed/Resolved?");
        if (!confirmClose) return;

        try {
            await axios.put(`${API_URL}/api/mentor/intervention/${id}`, { status: 'Closed' }, authCfg());
            showToast("Intervention marked as Closed.", "success");
            fetchAnalytics(); // Refresh list
        } catch (e) {
            showToast(e.response?.data?.message || "Failed to update intervention status.", "error");
        }
    };

    const confirmRemarksAction = async (remarks) => {
        if (!remarksModal) return;
        try {
            const { type, id, action } = remarksModal;
            if (type === 'leave') {
                await axios.put(`${API_URL}/api/leaves/${id}`, { status: action, mentorRemarks: remarks }, authCfg());
                setLeaves(p => p.filter(l => l._id !== id));
                showToast(`Leave ${action} successfully.`, 'success');
            } else {
                await axios.put(`${API_URL}/api/achievements/${id}`, { status: action, remarks }, authCfg());
                setAchievements(p => p.filter(a => a._id !== id));
                showToast(`Achievement ${action} successfully.`, 'success');
            }
        } catch (e) {
            showToast(e.response?.data?.message || 'Action failed.', 'error');
        } finally {
            setRemarksModal(null);
        }
    };

    const formatRefresh = (d) => d
        ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '';

    /* ── RENDER ── */
    return (
        <>
            <style>{globalCSS}</style>
            <Layout title="Mentor Command Centre">
                <div className="mentor-dash" style={{
                    background: theme.bg,
                    minHeight: '100vh', padding: '24px',
                    marginLeft: '-24px', marginRight: '-24px',
                    marginTop: '-24px', paddingTop: '28px',
                }}>
                    {/* PAGE HEADER */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
                        <div>
                            <h3 style={{ color: '#1E293B', fontWeight: 800, margin: 0, fontSize: 24 }}>
                                🎓 Mentor Command Centre
                            </h3>
                            <p style={{ color: '#64748B', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
                                Real-time overview of your mentee cohort, pending approvals, and interventions
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            {lastRefresh && (
                                <span style={{ color: '#64748B', fontSize: 12 }}>
                                    🔄 Last updated: {formatRefresh(lastRefresh)}
                                </span>
                            )}
                            <button className="refresh-btn" onClick={fetchAll} style={{
                                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
                                color: '#3B82F6', borderRadius: 10, padding: '8px 16px',
                                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                ↻ Refresh
                            </button>
                            <button onClick={() => { setPreselectedStudentId(''); setShowInterventionModal(true); }} style={{
                                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                border: 'none', borderRadius: 10, padding: '8px 20px',
                                color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                                boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                + Log Intervention
                            </button>
                        </div>
                    </div>

                    {/* STAT CARDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                        <StatCard icon="👥" label="Total Mentees"
                            value={loading.mentees ? '—' : mentees.length}
                            sub="Assigned to your cohort" accent={theme.colors.primary}
                            loading={loading.mentees} />
                        <StatCard icon="🔴" label="High Risk"
                            value={loading.mentees ? '—' : riskCounts.High}
                            sub={riskCounts.High > 0 ? 'Needs immediate attention' : 'No critical cases'}
                            accent={theme.colors.danger} loading={loading.mentees} />
                        <StatCard icon="⚡" label="Pending Interventions"
                            value={loading.analytics ? '—' : (workload.pendingInterventions ?? '—')}
                            sub="Open action items" accent={theme.colors.warning}
                            loading={loading.analytics} />
                        <StatCard icon="📈" label="Effectiveness"
                            value={loading.analytics ? '—' : `${effectiveness.rate ?? 0}%`}
                            sub={`${effectiveness.totalInterventions ?? 0} interventions logged`}
                            accent={theme.colors.success} loading={loading.analytics} />
                        <StatCard icon="🏥" label="Pending Leaves"
                            value={loading.leaves ? '—' : leaves.length}
                            sub="Medical leave applications" accent={theme.colors.purple}
                            loading={loading.leaves} />
                        <StatCard icon="🏆" label="Pending Achievements"
                            value={loading.achievements ? '—' : achievements.length}
                            sub="Awaiting your verification" accent="#EC4899"
                            loading={loading.achievements} />
                    </div>

                    {/* MENTEE TABLE + PIE CHART */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>

                        {/* Mentee List Card */}
                        <div style={{ ...theme.glass, padding: 24, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                                <SectionHead title="My Mentee Cohort" count={filteredMentees.length} accent={theme.colors.primary} />
                                
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    {/* View Toggle */}
                                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
                                        <button onClick={() => setViewMode('cards')} style={{
                                            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            cursor: 'pointer', border: 'none',
                                            background: viewMode === 'cards' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            color: viewMode === 'cards' ? '#fff' : '#94A3B8',
                                            transition: 'all 0.2s',
                                        }}>🎴 Cards</button>
                                        <button onClick={() => setViewMode('table')} style={{
                                            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            cursor: 'pointer', border: 'none',
                                            background: viewMode === 'table' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            color: viewMode === 'table' ? '#fff' : '#94A3B8',
                                            transition: 'all 0.2s',
                                        }}>📋 Table</button>
                                    </div>

                                    {/* Risk filter */}
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {['All', 'High', 'Moderate', 'Safe'].map(f => (
                                            <button key={f} onClick={() => setFilter(f)} style={{
                                                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                cursor: 'pointer', border: 'none',
                                                background: filter === f
                                                    ? (f === 'High' ? '#EF4444' : f === 'Moderate' ? '#F59E0B' : f === 'Safe' ? '#10B981' : '#3B82F6')
                                                    : 'rgba(255,255,255,0.07)',
                                                color: filter === f ? '#fff' : '#94A3B8',
                                                transition: 'all 0.2s',
                                            }}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {loading.mentees ? (
                                <div style={{ padding: '8px 0' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                            <Skel h={36} w={36} br={50} mb={0} />
                                            <div style={{ flex: 1 }}>
                                                <Skel h={14} w="60%" mb={6} />
                                                <Skel h={11} w="40%" mb={0} />
                                            </div>
                                            <Skel h={22} w={70} br={20} mb={0} />
                                            <Skel h={30} w={90} br={8} mb={0} />
                                        </div>
                                    ))}
                                </div>
                            ) : errors.mentees ? (
                                <div style={{ textAlign: 'center', padding: '32px 0', color: theme.colors.danger }}>
                                    ⚠️ {errors.mentees}
                                    <button onClick={fetchMentees} style={{
                                        display: 'block', margin: '12px auto 0',
                                        background: 'none', border: '1px solid #EF444466',
                                        color: '#EF4444', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
                                    }}>Retry</button>
                                </div>
                            ) : sortedMentees.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: theme.colors.textSub }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
                                    <p style={{ margin: 0, fontSize: 14 }}>
                                        {filter === 'All' ? 'No mentees assigned yet.' : `No ${filter.toLowerCase()}-risk mentees.`}
                                    </p>
                                </div>
                            ) : viewMode === 'cards' ? (
                                /* Cards View Grid */
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {sortedMentees.map((m, i) => {
                                        const fullName = `${m.firstName} ${m.lastName}`;
                                        const riskLvl = m.riskProfile?.level || 'Safe';
                                        const colorMap = {
                                            'High Risk': theme.colors.danger,
                                            'Critical': theme.colors.danger,
                                            'Moderate Risk': theme.colors.warning,
                                            'Safe': theme.colors.success
                                        };
                                        const accent = colorMap[riskLvl] || theme.colors.success;
                                        return (
                                            <div key={m._id} className="glass-card" style={{
                                                ...theme.glassLight,
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                borderLeft: `4px solid ${accent}`,
                                                gap: 12,
                                                minHeight: 140
                                            }}>
                                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                    <Avatar name={fullName} color={getColor(i)} />
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ color: theme.colors.textMain, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {fullName}
                                                        </div>
                                                        <div style={{ color: theme.colors.textSub, fontSize: 11 }}>
                                                            {m.department || 'N/A'} · Sem {m.currentSemester || m.semester || '?'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 11, color: '#64748B' }}>
                                                    <strong>Enrollment:</strong> {m.enrollmentNumber}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <RiskBadge level={riskLvl} />
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button onClick={() => navigate(`/faculty/student/${m._id}`)} style={{
                                                            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                                                            color: '#3B82F6', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                                        }}>👁 Profile</button>
                                                        <button onClick={() => { setPreselectedStudentId(m._id); setShowInterventionModal(true); }} style={{
                                                            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                                                            color: '#8B5CF6', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                                        }}>📋 Note</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Table View */
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {['Mentee', 'Enrollment', 'Risk Level', 'Actions'].map(h => (
                                                    <th key={h} style={{
                                                        color: '#64748B', fontSize: 11, fontWeight: 700,
                                                        textTransform: 'uppercase', letterSpacing: 0.8,
                                                        paddingBottom: 10, paddingRight: 16, textAlign: 'left',
                                                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                                                    }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedMentees.map((m, i) => {
                                                const fullName = `${m.firstName} ${m.lastName}`;
                                                return (
                                                    <tr key={m._id} className="mentee-row" style={{
                                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                    }}>
                                                        <td style={{ padding: '12px 16px 12px 0' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                 <Avatar name={fullName} color={getColor(i)} />
                                                                 <div>
                                                                     <div style={{ color: theme.colors.textMain, fontWeight: 600, fontSize: 14 }}>
                                                                         {fullName}
                                                                     </div>
                                                                     <div style={{ color: theme.colors.textSub, fontSize: 11 }}>
                                                                         {m.department || 'N/A'} · Sem {m.currentSemester || m.semester || '?'}
                                                                     </div>
                                                                 </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ color: '#64748B', fontSize: 13, paddingRight: 16 }}>
                                                            {m.enrollmentNumber}
                                                        </td>
                                                        <td style={{ paddingRight: 16 }}>
                                                            <RiskBadge level={m.riskProfile?.level || 'Safe'} />
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <button onClick={() => navigate(`/faculty/student/${m._id}`)} style={{
                                                                    background: 'rgba(59,130,246,0.12)',
                                                                    border: '1px solid rgba(59,130,246,0.3)',
                                                                    color: '#3B82F6', borderRadius: 7, padding: '5px 10px',
                                                                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                                }}>
                                                                    👁 Profile
                                                                </button>
                                                                <button onClick={() => { setPreselectedStudentId(m._id); setShowInterventionModal(true); }} style={{
                                                                    background: 'rgba(139,92,246,0.12)',
                                                                    border: '1px solid rgba(139,92,246,0.3)',
                                                                    color: '#8B5CF6', borderRadius: 7, padding: '5px 10px',
                                                                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                                }}>
                                                                    📋 Note
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pie Chart */}
                        <div style={{ ...theme.glass, padding: 24, display: 'flex', flexDirection: 'column' }}>
                            <SectionHead title="Risk Distribution" accent={theme.colors.primary} />
                            {loading.mentees ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Skel h={180} w={180} br={180} mb={16} />
                                    <Skel h={12} w={140} mb={8} />
                                    <Skel h={12} w={120} mb={8} />
                                    <Skel h={12} w={130} mb={0} />
                                </div>
                            ) : (
                                <>
                                    <div style={{ position: 'relative', width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
                                        <Pie data={chartData} options={chartOptions} />
                                    </div>
                                    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {[
                                            { label: 'Safe', count: riskCounts.Safe, color: '#10B981' },
                                            { label: 'Moderate Risk', count: riskCounts.Moderate, color: '#F59E0B' },
                                            { label: 'High Risk', count: riskCounts.High, color: '#EF4444' },
                                        ].map(r => (
                                            <div key={r.label} style={{ display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
                                                    <span style={{ color: theme.colors.textSub, fontSize: 12 }}>{r.label}</span>
                                                </div>
                                                <span style={{ color: r.color, fontWeight: 700, fontSize: 14 }}>{r.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ACTION QUEUES: LEAVES + ACHIEVEMENTS + INTERVENTIONS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>

                        {/* Pending Medical Leaves */}
                        <div style={{ ...theme.glass, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: 16 }}>
                                <SectionHead title="Pending Medical Leaves" count={leaves.length} accent={theme.colors.purple} />
                                <button onClick={() => navigate('/mentor/leaves')} style={{
                                    background: 'none', border: 'none', color: theme.colors.primary,
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}>View All →</button>
                            </div>

                            {loading.leaves ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <Skel h={14} w="70%" mb={6} />
                                        <Skel h={11} w="50%" mb={0} />
                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />
                                    </div>
                                ))
                            ) : errors.leaves ? (
                                <div style={{ color: theme.colors.danger, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                                    ⚠️ {errors.leaves}
                                </div>
                            ) : leaves.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '28px 0', color: theme.colors.textSub }}>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
                                    <p style={{ margin: 0, fontSize: 13 }}>No pending leave applications.</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {leaves.slice(0, 6).map(l => {
                                        const start = new Date(l.startDate);
                                        const end   = new Date(l.endDate);
                                        const days  = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                        const fmt   = d => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                                        return (
                                            <div key={l._id} style={{ padding: '12px 0',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'flex-start', marginBottom: 8 }}>
                                                    <div>
                                                        <div style={{ color: theme.colors.textMain, fontWeight: 600, fontSize: 14 }}>
                                                            {l.studentId?.firstName} {l.studentId?.lastName}
                                                        </div>
                                                        <div style={{ color: theme.colors.textSub, fontSize: 12, marginTop: 2 }}>
                                                            {l.studentId?.enrollmentNumber} · {fmt(start)} – {fmt(end)} ({days}d)
                                                        </div>
                                                        <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 3 }}>
                                                            {l.reason || 'No reason specified'}
                                                        </div>
                                                    </div>
                                                    {l.certificateUrl && (
                                                        <a href={`${API_URL}${l.certificateUrl}`} target="_blank" rel="noreferrer"
                                                            style={{ color: '#3B82F6', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                                                            📄 Doc
                                                        </a>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => handleLeaveUpdate(l._id, 'approved')} style={{
                                                        background: 'rgba(16,185,129,0.15)',
                                                        border: '1px solid rgba(16,185,129,0.4)',
                                                        color: '#10B981', borderRadius: 7, padding: '4px 12px',
                                                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                    }}>✅ Approve</button>
                                                    <button onClick={() => handleLeaveUpdate(l._id, 'rejected')} style={{
                                                        background: 'rgba(239,68,68,0.12)',
                                                        border: '1px solid rgba(239,68,68,0.3)',
                                                        color: '#EF4444', borderRadius: 7, padding: '4px 12px',
                                                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                    }}>❌ Reject</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pending Achievements */}
                        <div style={{ ...theme.glass, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: 16 }}>
                                <SectionHead title="Pending Achievements" count={achievements.length} accent="#EC4899" />
                                <button onClick={() => navigate('/mentor/achievements')} style={{
                                    background: 'none', border: 'none', color: theme.colors.primary,
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}>View All →</button>
                            </div>

                            {loading.achievements ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <Skel h={14} w="80%" mb={6} />
                                        <Skel h={11} w="55%" mb={0} />
                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />
                                    </div>
                                ))
                            ) : errors.achievements ? (
                                <div style={{ color: theme.colors.danger, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                                    ⚠️ {errors.achievements}
                                </div>
                            ) : achievements.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '28px 0', color: theme.colors.textSub }}>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
                                    <p style={{ margin: 0, fontSize: 13 }}>No pending achievements to verify.</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {achievements.slice(0, 6).map(a => (
                                        <div key={a._id} style={{ padding: '12px 0',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <div>
                                                    <div style={{ color: theme.colors.textMain, fontWeight: 600, fontSize: 14 }}>
                                                        {a.title}
                                                    </div>
                                                    <div style={{ color: theme.colors.textSub, fontSize: 12, marginTop: 2 }}>
                                                        {a.studentId?.firstName} {a.studentId?.lastName} · {a.studentId?.enrollmentNumber}
                                                    </div>
                                                    {a.description && (
                                                        <div style={{ color: '#64748B', fontSize: 11, marginTop: 3,
                                                            maxWidth: 240, overflow: 'hidden',
                                                            textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {a.description}
                                                        </div>
                                                    )}
                                                </div>
                                                {a.certificateUrl && (
                                                    <a href={`${API_URL}${a.certificateUrl}`} target="_blank" rel="noreferrer"
                                                        style={{ color: '#3B82F6', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                                                        📜 Cert
                                                    </a>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => handleAchievementUpdate(a._id, 'approved')} style={{
                                                    background: 'rgba(16,185,129,0.15)',
                                                    border: '1px solid rgba(16,185,129,0.4)',
                                                    color: '#10B981', borderRadius: 7, padding: '4px 12px',
                                                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                }}>✅ Approve</button>
                                                <button onClick={() => handleAchievementUpdate(a._id, 'rejected')} style={{
                                                    background: 'rgba(239,68,68,0.12)',
                                                    border: '1px solid rgba(239,68,68,0.3)',
                                                    color: '#EF4444', borderRadius: 7, padding: '4px 12px',
                                                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                }}>❌ Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pending Interventions List */}
                        <div style={{ ...theme.glass, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: 16 }}>
                                <SectionHead title="Pending Interventions" count={pendingInterventionsList.length} accent={theme.colors.warning} />
                                <button onClick={() => navigate('/mentor/workload')} style={{
                                    background: 'none', border: 'none', color: theme.colors.primary,
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}>View Workload →</button>
                            </div>

                            {loading.analytics ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <Skel h={14} w="75%" mb={6} />
                                        <Skel h={11} w="45%" mb={0} />
                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />
                                    </div>
                                ))
                            ) : errors.analytics ? (
                                <div style={{ color: theme.colors.danger, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                                    ⚠️ {errors.analytics}
                                </div>
                            ) : pendingInterventionsList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '28px 0', color: theme.colors.textSub }}>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
                                    <p style={{ margin: 0, fontSize: 13 }}>No pending open interventions.</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {pendingInterventionsList.slice(0, 6).map(i => {
                                        const dateStr = i.date ? new Date(i.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A';
                                        return (
                                            <div key={i._id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                    <div>
                                                        <div style={{ color: theme.colors.textMain, fontWeight: 600, fontSize: 14 }}>
                                                            {i.studentId?.firstName} {i.studentId?.lastName || 'Student'}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                                            <span style={{
                                                                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                                                                color: '#F59E0B', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700
                                                            }}>{i.type}</span>
                                                            <span style={{ color: theme.colors.textSub, fontSize: 11 }}>{dateStr}</span>
                                                        </div>
                                                        <div style={{ color: theme.colors.textSub, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>
                                                            "{i.remarks}"
                                                        </div>
                                                        {i.actionPlan && (
                                                            <div style={{ color: '#F59E0B', fontSize: 11, marginTop: 4, fontWeight: 500 }}>
                                                                👉 Plan: {i.actionPlan}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span style={{
                                                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                                        color: '#EF4444', borderRadius: 12, padding: '2px 8px', fontSize: 10, fontWeight: 700
                                                    }}>{i.status}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                    <button onClick={() => handleCloseIntervention(i._id)} style={{
                                                        background: 'rgba(16,185,129,0.15)',
                                                        border: '1px solid rgba(16,185,129,0.4)',
                                                        color: '#10B981', borderRadius: 7, padding: '4px 12px',
                                                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                    }}>✅ Close / Resolve</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QUICK LINKS BAR */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                        {[
                            { icon: '📊', label: 'Workload Report',    path: '/mentor/workload',       color: '#3B82F6' },
                            { icon: '📋', label: 'Effectiveness',      path: '/mentor/effectiveness',  color: '#8B5CF6' },
                            { icon: '✉️', label: 'Email Mentees',      path: '/mentor/email',          color: '#10B981' },
                            { icon: '🏥', label: 'Medical Leaves',     path: '/mentor/leaves',         color: '#F59E0B' },
                            { icon: '🏆', label: 'Achievements Queue', path: '/mentor/achievements',   color: '#EC4899' },
                        ].map(link => (
                            <button key={link.path} onClick={() => navigate(link.path)} style={{
                                ...theme.glassLight,
                                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
                                cursor: 'pointer', border: `1px solid ${link.color}22`,
                                background: `${link.color}11`, transition: 'all 0.2s',
                            }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = `${link.color}22`;
                                    e.currentTarget.style.borderColor = `${link.color}55`;
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = `${link.color}11`;
                                    e.currentTarget.style.borderColor = `${link.color}22`;
                                }}
                            >
                                <span style={{ fontSize: 20 }}>{link.icon}</span>
                                <span style={{ color: theme.colors.textMain, fontSize: 13, fontWeight: 600 }}>{link.label}</span>
                                <span style={{ marginLeft: 'auto', color: link.color, fontSize: 14 }}>→</span>
                            </button>
                        ))}
                    </div>

                </div>
            </Layout>

            {/* INTERVENTION MODAL */}
            {showInterventionModal && (
                <InterventionModal
                    mentees={mentees}
                    preselectedStudentId={preselectedStudentId}
                    onClose={() => {
                        setShowInterventionModal(false);
                        setPreselectedStudentId('');
                    }}
                    onSuccess={(msg) => { showToast(msg, 'success'); fetchAnalytics(); }}
                />
            )}

            {/* REMARKS CONFIRM MODAL */}
            {remarksModal && (
                <RemarksModal
                    title={remarksModal.title}
                    description={remarksModal.description}
                    actionLabel={remarksModal.actionLabel}
                    accentColor={remarksModal.accentColor}
                    onClose={() => setRemarksModal(null)}
                    onConfirm={confirmRemarksAction}
                />
            )}

            {/* TOAST */}
            {toast && (
                <Toast
                    msg={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default MentorDashboard;
