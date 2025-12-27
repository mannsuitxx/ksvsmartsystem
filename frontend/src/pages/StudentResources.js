import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_URL } from '../config';

const StudentResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ subject: '', semester: '', type: '' });

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                // Build query string
                const params = new URLSearchParams(filters);
                const res = await axios.get(`${API_URL}/api/resources?${params}`, config);
                setResources(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchResources();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    if (loading) return <Layout title="Academic Resources"><div>Loading...</div></Layout>;

    return (
        <Layout title="Old Exam Papers & Resources">
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <input type="text" className="form-control" placeholder="Filter by Subject" 
                                name="subject" value={filters.subject} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" name="semester" value={filters.semester} onChange={handleFilterChange}>
                                <option value="">All Semesters</option>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">All Types</option>
                                <option value="exam_paper">Exam Paper</option>
                                <option value="notes">Notes</option>
                                <option value="syllabus">Syllabus</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {resources.map(r => (
                    <div className="col-md-6 col-lg-4" key={r._id}>
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="badge bg-primary">{r.type.replace('_', ' ').toUpperCase()}</span>
                                    <span className="text-muted small">{r.year}</span>
                                </div>
                                <h5 className="card-title text-truncate" title={r.title}>{r.title}</h5>
                                <p className="card-text text-muted small mb-1">Subject: {r.subject}</p>
                                <p className="card-text text-muted small">Semester: {r.semester}</p>
                                <a href={`${API_URL}${r.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary w-100 mt-3">
                                    Download / View
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
                {resources.length === 0 && <div className="text-center text-muted mt-5">No resources found matching your filters.</div>}
            </div>
        </Layout>
    );
};

export default StudentResources;
