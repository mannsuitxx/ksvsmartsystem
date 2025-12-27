import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { API_URL } from '../../config';

const DataImportExport = () => {
    const [file, setFile] = useState(null);
    const [templateType, setTemplateType] = useState('Student Master');
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const downloadCSV = async (endpoint, filename) => {
        try {
            const config = { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob' // Important for file download
            };
            const res = await axios.get(`${API_URL}/api/export/${endpoint}`, config);
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Export failed. Please try again.');
        }
    };

    const handleDownloadTemplate = (type) => {
        // Simple CSV String Generation
        let csvContent = "data:text/csv;charset=utf-8,";
        if (type === 'Student Master') {
            csvContent += "enrollment,name,email,parentemail,department,semester";
        } else if (type === 'Marks') {
            csvContent += "enrollment,subject,examType,marksObtained,maxMarks";
        } else {
             csvContent += "enrollment,date,subject,status";
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type}_Template.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if(!file) { alert('Please select a file'); return; }
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        // Determine endpoint based on type
        // For now, assuming only Student Upload is fully supported via this generic page
        // But backend only has /api/students/upload implemented generically
        // If we want others, we need to implement them.
        // Prompt asked for "Export buttons working". 
        // I will stick to student upload for now or assume the backend endpoint handles others if implemented later.
        // But actually, student upload is the main one.
        
        let endpoint = '/api/students/upload'; 
        // If user selected "Marks", we might need another endpoint.
        // I'll stick to student upload for now as it's the most critical.
        
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } };
            const res = await axios.post(`${API_URL}${endpoint}`, formData, config);
            setMsg({ text: res.data.message || 'Upload Success', type: 'success' });
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Upload Failed', type: 'danger' });
        }
        setUploading(false);
    };

    return (
        <Layout title="Data Import / Export Center">
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white fw-bold">
                            <i className="bi bi-cloud-upload-fill me-2"></i>Bulk Data Upload
                        </div>
                        <div className="card-body">
                            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
                            
                            <div className="mb-3">
                                <label className="form-label">Select Data Type</label>
                                <select className="form-select" value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
                                    <option>Student Master</option>
                                    {/* <option>Marks</option> <option>Attendance</option> - If implemented later */}
                                </select>
                            </div>

                            <div className="mb-3 border p-3 bg-light rounded text-center">
                                <p className="mb-2 text-muted small">Need the format?</p>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDownloadTemplate(templateType)}>
                                    <i className="bi bi-file-earmark-arrow-down me-1"></i>Download {templateType} Template
                                </button>
                            </div>

                            <form onSubmit={handleUpload}>
                                <div className="mb-3">
                                    <label className="form-label">Upload CSV File</label>
                                    <input type="file" className="form-control" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
                                    {uploading ? 'Processing...' : 'Upload Data'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white fw-bold">
                            <i className="bi bi-cloud-download-fill me-2"></i>Data Export & Reports
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                                    onClick={() => downloadCSV('students', 'Student_Master_Data.csv')}>
                                    <div>
                                        <h6 className="mb-1">Student Master Data</h6>
                                        <small className="text-muted">Export all student profiles (CSV)</small>
                                    </div>
                                    <i className="bi bi-download text-primary"></i>
                                </button>

                                <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                                    onClick={() => downloadCSV('attendance', 'Attendance_Report.csv')}>
                                    <div>
                                        <h6 className="mb-1">Attendance Report</h6>
                                        <small className="text-muted">Consolidated attendance % (CSV)</small>
                                    </div>
                                    <i className="bi bi-download text-primary"></i>
                                </button>

                                <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                                    onClick={() => downloadCSV('risk', 'Risk_Analysis_Report.csv')}>
                                    <div>
                                        <h6 className="mb-1">Risk Analysis Report</h6>
                                        <small className="text-muted">At-risk students list (CSV)</small>
                                    </div>
                                    <i className="bi bi-download text-primary"></i>
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
