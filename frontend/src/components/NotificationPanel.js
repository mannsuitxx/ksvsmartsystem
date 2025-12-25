import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/api/student/notifications`, config);
      setNotifications(res.data);
    } catch (e) {
      console.error("Error fetching notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/student/notifications/${id}/read`, {}, config);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Error marking as read", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="p-3 text-center small text-muted">Checking messages...</div>;

  return (
    <div className="card shadow border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h6 className="m-0 font-weight-bold text-primary">
          <i className="bi bi-bell-fill me-2"></i>
          Mentor Messages
        </h6>
        {unreadCount > 0 && <span className="badge bg-danger rounded-pill">{unreadCount} New</span>}
      </div>
      <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted">
            <i className="bi bi-chat-square-text fs-2 mb-2 d-block"></i>
            <p className="mb-0">No messages from your mentor yet.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`list-group-item list-group-item-action border-0 border-bottom p-3 ${!n.isRead ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => !n.isRead && markAsRead(n._id)}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className={`badge ${n.status === 'Open' ? 'bg-danger' : n.status === 'Closed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {n.type}
                  </span>
                  <small className="text-muted">{new Date(n.date).toLocaleDateString()}</small>
                </div>
                <h6 className={`mb-1 ${!n.isRead ? 'fw-bold' : ''}`}>{n.remarks}</h6>
                {n.actionPlan && (
                  <p className="mb-1 small text-primary">
                    <strong>Action Plan:</strong> {n.actionPlan}
                  </p>
                )}
                <div className="mt-2 d-flex justify-content-between align-items-center">
                  <small className="text-muted">From: Prof. {n.mentorId?.firstName} {n.mentorId?.lastName}</small>
                  {!n.isRead && <span className="small text-primary fw-bold">Mark as read</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;