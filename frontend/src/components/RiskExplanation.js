import React from 'react';

const RiskExplanation = ({ risk }) => {
  if (!risk) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'High Risk': return 'alert-danger';
      case 'Moderate Risk': return 'alert-warning';
      default: return 'alert-success';
    }
  };

  return (
    <div className={`alert ${getRiskColor(risk.level)} shadow-sm`}>
      <h5 className="alert-heading fw-bold">
        <i className="bi bi-shield-exclamation me-2"></i>
        Risk Analysis: {risk.level}
      </h5>
      <hr />
      <p className="mb-2"><strong>Risk Score:</strong> {risk.score} / 100</p>
      
      {risk.factors && risk.factors.length > 0 ? (
        <div>
          <h6 className="fw-bold">Contributing Factors:</h6>
          <ul className="mb-0">
            {risk.factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-0">Student is currently in a safe zone. Maintain current performance.</p>
      )}
    </div>
  );
};

export default RiskExplanation;
