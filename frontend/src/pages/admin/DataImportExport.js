import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { API_URL } from '../../config';

const DataImportExport = () => {
    const [file, setFile] = useState(null);
    const [type, setType] = useState('student'); // 'student' or 'faculty'
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleUpload = async (e) => {
        e.preventDefault();
        if(!file) { alert('Please select a file'); return; }

        const formData = new FormData();
        formData.append('file', file);

        setMsg({ text: 'Uploading...', type: 'info' });

        try {
            const config = { headers: { 
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }};
            
            let url = `${API_URL}/api/students/upload`;
            if (type === 'faculty') {
                 setMsg({ text: 'Faculty Bulk Upload simulated (Backend pending)', type: 'warning' });
                 return;
            }

            const res = await axios.post(url, formData, config);
            setMsg({ text: res.data.message || 'Upload Successful', type: 'success' });
        } catch (err) {
            setMsg({ text: 'Upload Failed: ' + (err.response?.data?.message || err.message), type: 'danger' });
        }
    };

    const handleDownloadTemplate = (templateType) => {
        alert(`Downloading ${templateType} CSV Template...`);
    };

    return (
        <Layout title="Data Import / Export Center">

                    <div className="row g-4">
                        {/* IMPORT SECTION */}
                        <div className="col-lg-6">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-primary text-white fw-bold">
                                    <i className="bi bi-cloud-upload-fill me-2"></i>Bulk Data Import
                                </div>
                                <div className="card-body">
                                    <p className="text-muted small">
                                        Upload CSV files to bulk create records. This will automatically generate user accounts (default password: 123456).
                                    </p>
                                    
                                    {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

                                    <form onSubmit={handleUpload}>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Select Data Type</label>
                                            <div className="d-flex gap-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="dtype" checked={type === 'student'} onChange={() => setType('student')} />
                                                    <label className="form-check-label">Student List</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="dtype" checked={type === 'faculty'} onChange={() => setType('faculty')} />
                                                    <label className="form-check-label">Faculty List</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Upload CSV File</label>
                                            <input type="file" className="form-control" accept=".csv" onChange={e => setFile(e.target.files[0])} />
                                        </div>

                                        <button className="btn btn-primary w-100 mb-3">
                                            Process Import
                                        </button>

                                        <hr />
                                        <div className="d-flex justify-content-between">
                                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleDownloadTemplate('Student')}>
                                                <i className="bi bi-file-earmark-arrow-down me-1"></i> Student Template
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleDownloadTemplate('Faculty')}>
                                                <i className="bi bi-file-earmark-arrow-down me-1"></i> Faculty Template
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* EXPORT SECTION */}
                        <div className="col-lg-6">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-success text-white fw-bold">
                                    <i className="bi bi-cloud-download-fill me-2"></i>Data Export & Reports
                                </div>
                                <div className="card-body">
                                    <p className="text-muted small">
                                        Download system reports and raw data for offline analysis or compliance audits.
                                    </p>
                                    
                                    <div className="list-group">
                                        <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => alert('Exporting Student Master Data...')}>
                                            <div>
                                                <div className="fw-bold">Master Student List</div>
                                                <small className="text-muted">Includes Profile, Contact, & Mentor Info</small>
                                            </div>
                                            <i className="bi bi-download"></i>
                                        </button>
                                        <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => alert('Exporting Attendance Report...')}>
                                             <div>
                                                <div className="fw-bold">Global Attendance Report</div>
                                                <small className="text-muted">Consolidated attendance % by Department</small>
                                            </div>
                                            <i className="bi bi-download"></i>
                                        </button>
                                        <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => alert('Exporting Risk Report...')}>
                                             <div>
                                                <div className="fw-bold">At-Risk Student Report</div>
                                                <small className="text-muted">List of detained/critical students</small>
                                            </div>
                                            <i className="bi bi-download"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        </Layout>
    );
};

export default DataImportExport;
