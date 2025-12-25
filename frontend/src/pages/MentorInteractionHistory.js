import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import moment from 'moment';

const MentorInteractionHistory = () => {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/notifications`, config);
                setInterventions(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/api/student/notifications/${id}/read`, {}, config);
            setInterventions(prev => prev.map(i => i._id === id ? { ...i, isRead: true } : i));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar role="student" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Mentor Interaction Log" />
                <div className="container-fluid p-4">

                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow border-0">
                                <div className="card-header bg-white py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Mentorship Timeline</h6>
                                </div>
                                <div className="card-body">
                                    {loading ? <p>Loading history...</p> : (
                                        <div className="timeline">
                                            {interventions.length === 0 && <p className="text-center text-muted">No interactions recorded yet.</p>}
                                            
                                            {interventions.map((item, index) => (
                                                <div className="row mb-4" key={item._id}>
                                                    <div className="col-auto text-center flex-column d-none d-sm-flex">
                                                        <div className="row h-50">
                                                            <div className={`col ${index !== 0 ? 'border-end' : ''}`}>&nbsp;</div>
                                                            <div className="col">&nbsp;</div>
                                                        </div>
                                                        <h5 className="m-2">
                                                            <span className={`badge rounded-pill ${item.type === 'Meeting' ? 'bg-primary' : item.type === 'Call' ? 'bg-info' : item.type === 'Nudge' ? 'bg-danger' : 'bg-warning'}`}>
                                                                <i className={`bi ${item.type === 'Meeting' ? 'bi-people-fill' : item.type === 'Call' ? 'bi-telephone-fill' : item.type === 'Nudge' ? 'bi-bell-fill' : 'bi-chat-left-text-fill'}`}></i>
                                                            </span>
                                                        </h5>
                                                        <div className="row h-50">
                                                            <div className={`col ${index !== interventions.length - 1 ? 'border-end' : ''}`}>&nbsp;</div>
                                                            <div className="col">&nbsp;</div>
                                                        </div>
                                                    </div>
                                                    <div className="col py-2">
                                                        <div className={`card border-0 shadow-sm ${!item.isRead ? 'border-start border-4 border-primary' : ''}`}>
                                                            <div className="card-body">
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <h6 className="card-title fw-bold mb-0">
                                                                        {item.type} with {item.mentorId ? `${item.mentorId.firstName} ${item.mentorId.lastName}` : 'Mentor'}
                                                                    </h6>
                                                                    <small className="text-muted">{moment(item.date).format('MMMM Do YYYY, h:mm a')}</small>
                                                                </div>
                                                                
                                                                <p className="card-text mb-2 bg-light p-3 rounded fst-italic">
                                                                    "{item.remarks}"
                                                                </p>
                                                                
                                                                {item.actionPlan && (
                                                                    <div className="alert alert-warning border-0 small">
                                                                        <strong>👉 Action Item:</strong> {item.actionPlan}
                                                                    </div>
                                                                )}

                                                                <div className="d-flex justify-content-between align-items-center mt-3">
                                                                    <span className={`badge ${item.status === 'Open' ? 'bg-danger' : 'bg-success'}`}>
                                                                        Status: {item.status}
                                                                    </span>
                                                                    {!item.isRead && (
                                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => markAsRead(item._id)}>
                                                                            Mark as Acknowledged
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MentorInteractionHistory;
