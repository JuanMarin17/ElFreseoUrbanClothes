import React from 'react';
import './StatCard.css';

const StatCard = ({ label, value, percentage, icon: Icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <h2 className="stat-value">{value}</h2>
        <span className="stat-percentage">
          <Icon size={12} /> +{percentage}%
        </span>
      </div>
    </div>
  );
};

export default StatCard;