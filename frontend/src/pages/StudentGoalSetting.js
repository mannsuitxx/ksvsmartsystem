import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Doughnut } from 'react-chartjs-2';

const StudentGoalSetting = () => {
    const [targetCGPA, setTargetCGPA] = useState(8.5);
    const [currentCGPA, setCurrentCGPA] = useState(7.2); // Mock initial
    const [requiredPerformance, setRequiredPerformance] = useState(0);

    useEffect(() => {
        // Load from local storage or default
        const saved = localStorage.getItem('studentTargetCGPA');
        if (saved) setTargetCGPA(parseFloat(saved));
    }, []);

    const calculateRequirements = () => {
        // Simple formula simulation: (Current * CompletedSemesters + Required * RemainingSemesters) / Total = Target
        // Assume 8 semesters total, currently in Sem 5 (so 4 completed)
        // (7.2 * 4 + X * 4) / 8 = Target
        // 28.8 + 4X = 8 * Target
        // 4X = 8*Target - 28.8
        // X = (8*Target - 28.8) / 4
        
        // Let's make it generic for "Next Semester Target"
        // Current Average = 7.2. To reach Target 8.0 overall, what do I need next sem?
        // It's harder to shift global CGPA.
        // Let's simplify: "To average X for this semester"
        
        // Let's use SPI gap.
        // Target SPI vs Current Average Internal Marks
        
        // Mock Calculation
        const gap = targetCGPA - currentCGPA;
        let effort = 0;
        if (gap <= 0) effort = 0; // Already there
        else effort = gap * 1.5; // Arbitrary difficulty multiplier

        // Normalized to 0-100% "Effort Boost" needed
        let boost = (gap / 10) * 100 * 2; 
        if (boost > 100) boost = 100;
        
        setRequiredPerformance(boost);
        localStorage.setItem('studentTargetCGPA', targetCGPA);
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar role="student" />
            <div className="flex-grow-1 d-flex flex-column">
                <Navbar title="Goal Setting" />
                <div className="container-fluid p-4">

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow border-0">
                                <div className="card-body p-5">
                                    <h2 className="text-center fw-bold text-primary mb-4">Where do you want to be?</h2>
                                    
                                    <div className="mb-5 px-5">
                                        <label className="form-label fw-bold">Set Your Target CGPA / SPI</label>
                                        <input 
                                            type="range" 
                                            className="form-range" 
                                            min="4.0" 
                                            max="10.0" 
                                            step="0.1" 
                                            value={targetCGPA} 
                                            onChange={(e) => setTargetCGPA(e.target.value)}
                                        />
                                        <div className="d-flex justify-content-between mt-2">
                                            <span className="text-muted">4.0 (Pass)</span>
                                            <span className="display-4 fw-bold text-primary">{targetCGPA}</span>
                                            <span className="text-muted">10.0 (Gold Medal)</span>
                                        </div>
                                    </div>

                                    <div className="text-center mb-5">
                                        <button className="btn btn-primary btn-lg px-5 rounded-pill shadow" onClick={calculateRequirements}>
                                            Calculate Roadmap
                                        </button>
                                    </div>

                                    <hr />

                                    {requiredPerformance > 0 && (
                                        <div className="row mt-5 align-items-center">
                                            <div className="col-md-6 text-center">
                                                <div style={{width: '200px', margin: '0 auto'}}>
                                                    <Doughnut 
                                                        data={{
                                                            labels: ['Current Effort', 'Gap'],
                                                            datasets: [{
                                                                data: [100 - requiredPerformance, requiredPerformance],
                                                                backgroundColor: ['#e9ecef', '#fd7e14'],
                                                                borderWidth: 0
                                                            }]
                                                        }}
                                                        options={{cutout: '70%'}}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <h4 className="fw-bold">Your Action Plan</h4>
                                                <p className="text-muted">To jump from <strong>{currentCGPA}</strong> to <strong>{targetCGPA}</strong>, you need to increase your academic output by approximately:</p>
                                                
                                                <h2 className="text-warning fw-bold mb-3">+{requiredPerformance.toFixed(0)}%</h2>

                                                <ul className="list-unstyled">
                                                    <li className="mb-2">✅ Attend at least <strong>90%</strong> of lectures.</li>
                                                    <li className="mb-2">✅ Score <strong>{(targetCGPA * 0.9 * 10).toFixed(0)}/100</strong> in internal exams.</li>
                                                    <li className="mb-2">✅ Submit all assignments <strong>2 days early</strong>.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {targetCGPA <= currentCGPA && (
                                        <div className="alert alert-success text-center">
                                            You are already achieving this target! Aim higher? 🚀
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

export default StudentGoalSetting;
