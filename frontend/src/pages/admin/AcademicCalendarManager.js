import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import moment from 'moment';
import { API_URL } from '../../config';

const AcademicCalendarManager = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', type: 'Event', startDate: '', endDate: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`${API_URL}/api/admin/calendar`, config);
            setEvents(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/admin/calendar`, newEvent, config);
            fetchData();
            setNewEvent({ title: '', type: 'Event', startDate: '', endDate: '', description: '' });
        } catch (err) { alert('Failed to add event'); }
    };

    return (
        <Layout title="Academic Calendar">

                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="card shadow border-0">
                                <div className="card-header bg-white fw-bold">Schedule Event</div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Event Title</label>
                                            <input className="form-control" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Type</label>
                                            <select className="form-select" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                                                <option>Exam</option>
                                                <option>Holiday</option>
                                                <option>Event</option>
                                                <option>Deadline</option>
                                            </select>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col">
                                                <label className="form-label">Start</label>
                                                <input type="date" className="form-control" required value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} />
                                            </div>
                                            <div className="col">
                                                <label className="form-label">End</label>
                                                <input type="date" className="form-control" required value={newEvent.endDate} onChange={e => setNewEvent({...newEvent, endDate: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description (Optional)</label>
                                            <textarea className="form-control" rows="2" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                                        </div>
                                        <button className="btn btn-primary w-100">Add to Calendar</button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-white py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Upcoming Events</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-4">Date</th>
                                                    <th>Event</th>
                                                    <th>Type</th>
                                                    <th>Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {events.map((ev, i) => (
                                                    <tr key={i}>
                                                        <td className="ps-4 text-nowrap">
                                                            {moment(ev.startDate).format('MMM DD')} 
                                                            {ev.startDate !== ev.endDate && ` - ${moment(ev.endDate).format('MMM DD')}`}
                                                        </td>
                                                        <td className="fw-bold">{ev.title}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                ev.type === 'Exam' ? 'bg-danger' : 
                                                                ev.type === 'Holiday' ? 'bg-success' : 
                                                                ev.type === 'Deadline' ? 'bg-warning text-dark' : 'bg-secondary'
                                                            }`}>
                                                                {ev.type}
                                                            </span>
                                                        </td>
                                                        <td className="small text-muted">{ev.description || '-'}</td>
                                                    </tr>
                                                ))}
                                                {events.length === 0 && <tr><td colSpan="4" className="text-center p-3">No events scheduled.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

        </Layout>
    );
};

export default AcademicCalendarManager;