import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const WhatIfSimulator = () => {
  const [inputs, setInputs] = useState({
    lecturesTotal: 100,
    lecturesPresent: 80,
    marksObtained: 25,
    maxMarks: 30
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/student/simulate`, inputs, config);
        
        console.log("Simulation Result:", res.data);
        setResult(res.data);
    } catch (error) {
        console.error("Simulation failed", error);
        alert("Failed to run simulation");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Sidebar role="student" />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar title="What-If Simulator" />
        <div className="container-fluid p-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow border-0">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Risk Simulator</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">Adjust the values below to see how they impact your Academic Risk Profile. This data is <strong>NOT saved</strong>.</p>
                            
                            <form onSubmit={calculateRisk} className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Total Lectures</label>
                                    <input type="number" className="form-control" value={inputs.lecturesTotal} onChange={e=>setInputs({...inputs, lecturesTotal: Number(e.target.value)})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Lectures Present</label>
                                    <input type="number" className="form-control" value={inputs.lecturesPresent} onChange={e=>setInputs({...inputs, lecturesPresent: Number(e.target.value)})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Max Marks (Exam)</label>
                                    <input type="number" className="form-control" value={inputs.maxMarks} onChange={e=>setInputs({...inputs, maxMarks: Number(e.target.value)})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Marks Obtained</label>
                                    <input type="number" className="form-control" value={inputs.marksObtained} onChange={e=>setInputs({...inputs, marksObtained: Number(e.target.value)})} />
                                </div>
                                <div className="col-12 mt-4">
                                    <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                                        {loading ? 'Calculating...' : 'Simulate Outcome'}
                                    </button>
                                </div>
                            </form>

                            {result && (
                                <div className={`mt-4 alert ${result.risk.level === 'High Risk' ? 'alert-danger' : result.risk.level === 'Moderate Risk' ? 'alert-warning' : 'alert-success'}`}>
                                    <h4 className="alert-heading fw-bold">{result.risk.level}</h4>
                                    <hr />
                                    <div className="row text-center mb-3">
                                        <div className="col-4 border-end">
                                            <h2 className="mb-0">{Number(result.metrics.attPct).toFixed(1)}%</h2>
                                            <small>Attendance</small>
                                        </div>
                                        <div className="col-4 border-end">
                                            <h2 className="mb-0">{Number(result.metrics.marksPct).toFixed(1)}%</h2>
                                            <small>Marks</small>
                                        </div>
                                        <div className="col-4">
                                            <h2 className="mb-0">{result.metrics.projectedSPI}</h2>
                                            <small>Proj. SPI</small>
                                        </div>
                                    </div>
                                    {result.risk.factors.length > 0 && (
                                        <div className="mt-3">
                                            <strong>Risk Factors:</strong>
                                            <ul>{result.risk.factors.map((f,i) => <li key={i}>{f}</li>)}</ul>
                                        </div>
                                    )}
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

export default WhatIfSimulator;
