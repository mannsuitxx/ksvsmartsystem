import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { API_URL } from '../../config';

const AdminResourceMgmt = () => {
    const [formData, setFormData] = useState({ title: '', subject: '', semester: '', year: '', type: 'exam_paper' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('file', file);

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`${API_URL}/api/resources`, data, config);
            alert('Resource uploaded successfully!');
            setFormData({ title: '', subject: '', semester: '', year: '', type: 'exam_paper' });
            setFile(null);
        } catch (error) {
            alert('Error uploading resource');
        }
        setUploading(false);
    };

    return (
        <Layout title="Resource Management">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold">Upload Old Exam Papers / Resources</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input type="text" className="form-control" required 
                                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                                        placeholder="e.g., Winter 2023 - Data Structures" />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Subject</label>
                                        <input type="text" className="form-control" required 
                                            value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Year</label>
                                        <input type="text" className="form-control" required 
                                            value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} 
                                            placeholder="e.g., 2023" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Semester</label>
                                        <select className="form-select" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                                            <option value="">Select</option>
                                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Type</label>
                                        <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option value="exam_paper">Old Exam Paper</option>
                                            <option value="notes">Lecture Notes</option>
                                            <option value="syllabus">Syllabus</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">File (PDF/Doc)</label>
                                    <input type="file" className="form-control" required onChange={e => setFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload Resource'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminResourceMgmt;
