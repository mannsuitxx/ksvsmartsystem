import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const MentorInterventionPanel = ({ studentId }) => {
  const [interventions, setInterventions] = useState([]);
  const [form, setForm] = useState({ type: 'Meeting', remarks: '', status: 'Open', actionPlan: '' });
  const [loading, setLoading] = useState(false);

  const fetchInterventions = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.get(`${API_URL}/api/mentor/intervention/${studentId}`, config);
      setInterventions(res.data);
    } catch (e) { console.error(e); }
  }, [studentId]);

  useEffect(() => {
    if (studentId) fetchInterventions();
  }, [studentId, fetchInterventions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.post(`${API_URL}/api/mentor/intervention`, { ...form, studentId }, config);
      setForm({ type: 'Meeting', remarks: '', status: 'Open', actionPlan: '' });
      fetchInterventions();
    } catch (e) { alert('Error logging intervention'); }
    setLoading(false);
  };

  return (
    <div className="card shadow border-0 h-100">
      <div className="card-header bg-white fw-bold text-primary">
        Mentor Interventions
      </div>
      <div className="card-body d-flex flex-column">
        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3">Log New Intervention</h6>
            <div className="row g-2">
                <div className="col-md-6">
                    <select className="form-select form-select-sm" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                        <option>Meeting</option><option>Call</option><option>Email</option><option>Other</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <select className="form-select form-select-sm" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                        <option>Open</option><option>In Progress</option><option>Closed</option>
                    </select>
                </div>
                <div className="col-12">
                    <textarea className="form-control form-control-sm" placeholder="Remarks / Discussion Points" value={form.remarks} onChange={e=>setForm({...form, remarks: e.target.value})} required></textarea>
                </div>
                <div className="col-12">
                    <input type="text" className="form-control form-control-sm" placeholder="Action Plan (Optional)" value={form.actionPlan} onChange={e=>setForm({...form, actionPlan: e.target.value})} />
                </div>
                <div className="col-12">
                    <button className="btn btn-primary btn-sm w-100" disabled={loading}>{loading ? 'Saving...' : 'Log Intervention'}</button>
                </div>
            </div>
        </form>

        {/* History List */}
        <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: '400px' }}>
            <h6 className="fw-bold text-muted small">HISTORY</h6>
            {interventions.length === 0 ? <p className="text-muted small">No interventions recorded.</p> : (
                <div className="list-group list-group-flush">
                    {interventions.map(i => (
                        <div key={i._id} className="list-group-item px-0">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className={`badge ${i.status === 'Open' ? 'bg-danger' : i.status === 'Closed' ? 'bg-success' : 'bg-warning text-dark'}`}>{i.status}</span>
                                <small className="text-muted">{new Date(i.date).toLocaleDateString()}</small>
                            </div>
                            <h6 className="mb-1">{i.type}</h6>
                            <p className="mb-1 small text-dark">{i.remarks}</p>
                            {i.actionPlan && <p className="mb-0 small text-muted"><strong>Plan:</strong> {i.actionPlan}</p>}
                            <small className="text-muted" style={{fontSize: '0.75rem'}}>By: {i.mentorId?.firstName} {i.mentorId?.lastName}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MentorInterventionPanel;