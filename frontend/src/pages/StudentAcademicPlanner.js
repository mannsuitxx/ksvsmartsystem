import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const StudentAcademicPlanner = () => {
    const [events, setEvents] = useState([]);
    const [toDoList, setToDoList] = useState([]);

    useEffect(() => {
        const mockCalendar = [
            {
                title: 'Mid-Sem Exam: Advanced Java',
                start: new Date(moment().add(2, 'days').toDate()),
                end: new Date(moment().add(2, 'days').add(2, 'hours').toDate()),
                type: 'exam',
                priority: 'high'
            },
            {
                title: 'Submission: Data Science Project',
                start: new Date(moment().add(5, 'days').toDate()),
                end: new Date(moment().add(5, 'days').toDate()),
                type: 'deadline',
                priority: 'medium'
            },
            {
                title: 'Remedial Class: Mathematics',
                start: new Date(moment().add(1, 'days').hour(14).toDate()),
                end: new Date(moment().add(1, 'days').hour(16).toDate()),
                type: 'class',
                priority: 'low'
            },
            {
                title: 'Final Exam Start',
                start: new Date(moment().add(20, 'days').toDate()),
                end: new Date(moment().add(20, 'days').toDate()),
                type: 'exam',
                priority: 'critical'
            }
        ];

        setEvents(mockCalendar);

        const tasks = mockCalendar.map(event => ({
            id: Math.random(),
            task: `Prepare for ${event.title}`,
            dueDate: moment(event.start).fromNow(),
            priority: event.priority
        }));
        setToDoList(tasks);

    }, []);

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad';
        if (event.priority === 'critical') backgroundColor = '#dc3545';
        if (event.priority === 'high') backgroundColor = '#fd7e14';
        if (event.priority === 'medium') backgroundColor = '#ffc107';
        if (event.priority === 'low') backgroundColor = '#198754';

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <Layout title="Academic Planner">
                    <div className="row g-4">
                        {/* Calendar Section */}
                        <div className="col-lg-8">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                    <h6 className="m-0 font-weight-bold text-primary">Academic Calendar</h6>
                                    <span className="badge bg-info text-dark">Fall 2025</span>
                                </div>
                                <div className="card-body">
                                    <div style={{ height: '500px' }}>
                                        <Calendar
                                            localizer={localizer}
                                            events={events}
                                            startAccessor="start"
                                            endAccessor="end"
                                            eventPropGetter={eventStyleGetter}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel: To-Do & Countdown */}
                        <div className="col-lg-4">
                            
                            {/* Priority Countdown */}
                            <div className="card shadow border-0 mb-4 bg-primary text-white">
                                <div className="card-body text-center">
                                    <h5 className="card-title text-white-50 text-uppercase small">Next Major Deadline</h5>
                                    <h3 className="fw-bold mt-2">Mid-Sem Exam: Advanced Java</h3>
                                    <div className="display-4 fw-bold my-3">
                                        {moment().to(moment().add(2, 'days'), true)}
                                    </div>
                                    <p className="mb-0 small text-white-50">Don't panic! You have time.</p>
                                </div>
                            </div>

                            {/* Auto-Generated To-Do List */}
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-white py-3">
                                    <h6 className="m-0 font-weight-bold text-primary">Your Action Plan</h6>
                                </div>
                                <div className="card-body p-0">
                                    <ul className="list-group list-group-flush">
                                        {toDoList.map(item => (
                                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold">{item.task}</div>
                                                    <small className="text-muted">Due {item.dueDate}</small>
                                                </div>
                                                <span className={`badge rounded-pill ${
                                                    item.priority === 'critical' ? 'bg-danger' : 
                                                    item.priority === 'high' ? 'bg-warning text-dark' : 'bg-success'
                                                }`}>
                                                    {item.priority}
                                                </span>
                                            </li>
                                        ))}
                                        {toDoList.length === 0 && <li className="list-group-item">No upcoming tasks! Relax.</li>}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
        </Layout>
    );
};

export default StudentAcademicPlanner;