import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const StudentMyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [editData, setEditData] = useState({ firstName: '', lastName: '', currentSemester: '' });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/dashboard`, config);
            const p = res.data.profile;
            setProfile(p);
            
            const names = p.name.split(' ');
            setEditData({
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                currentSemester: p.semester || ''
            });
        } catch (e) { 
            console.error("[DEBUG] Fetch Profile Error:", e.response?.data || e.message);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (file) {
                const fd = new FormData();
                fd.append('image', file);
                await axios.post(`${process.env.REACT_APP_API_URL}/api/student/profile-picture`, fd, config);
            }

            await axios.put(`${process.env.REACT_APP_API_URL}/api/student/profile`, editData, config);
            
            setMsg('Profile updated successfully!');
            setFile(null);
            setPreviewUrl(null);
            fetchProfile();
        } catch (e) {
            console.error("Update Error:", e.response?.data || e.message);
            setMsg(`Error: ${e.response?.data?.message || e.message || 'Failed to update profile'}`);
        }
        setLoading(false);
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <Sidebar role="student" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Edit Profile" />
                <div className="container-fluid p-4">
                    <div className="card shadow border-0" style={{maxWidth: '700px', margin: '0 auto'}}>
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-4 text-center">My Academic Profile</h4>
                            
                            <form onSubmit={handleUpdateProfile}>
                                <div className="text-center mb-4">
                                    <div className="d-inline-block position-relative">
                                        <div style={{width: '180px', height: '180px', borderRadius: '50%', backgroundColor: '#e9ecef', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 0 15px rgba(0,0,0,0.1)'}}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-100 h-100" style={{objectFit: 'cover'}} />
                                            ) : profile?.profilePicture ? (
                                                <img 
                                                    src={`${process.env.REACT_APP_API_URL}/${profile.profilePicture}`} 
                                                    alt="Profile" 
                                                    className="w-100 h-100" 
                                                    style={{objectFit: 'cover'}}
                                                />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                                    <i className="bi bi-person" style={{fontSize: '5rem'}}></i>
                                                </div>
                                            )}
                                        </div>
                                        <label className="btn btn-primary position-absolute shadow-lg d-flex align-items-center justify-content-center" 
                                               style={{
                                                   cursor: 'pointer', 
                                                   bottom: '5px', 
                                                   right: '5px', 
                                                   width: '50px', 
                                                   height: '50px', 
                                                   borderRadius: '50%',
                                                   fontSize: '1.5rem'
                                               }}>
                                            <i className="bi bi-camera-fill"></i>
                                            <input type="file" className="d-none" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                    </div>
                                    {file && <div className="mt-2 fw-bold text-success">New Photo Selected! Click Save to upload.</div>}
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">First Name</label>
                                        <input type="text" className="form-control" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Last Name</label>
                                        <input type="text" className="form-control" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Enrollment (Read-only)</label>
                                        <input type="text" className="form-control bg-light" value={profile?.enrollment || ''} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Current Semester</label>
                                        <select className="form-select" value={editData.currentSemester} onChange={e => setEditData({...editData, currentSemester: e.target.value})}>
                                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-success w-100 mt-4 py-2 fw-bold" disabled={loading}>
                                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                                
                                {msg && (
                                    <div className={`mt-3 alert ${msg.startsWith('Error') ? 'alert-danger' : 'alert-success'} text-center fw-bold`}>
                                        {msg}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentMyProfile;
