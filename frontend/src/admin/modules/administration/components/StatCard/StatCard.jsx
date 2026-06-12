import React from 'react';
import './StatCard.css';

const StatCard = ({ label, value, percentage, icon: Icon, color = "#3b82f6" }) => {
  const isNegative = String(percentage).startsWith('-');
  return (
    <div className="stat-card" style={{ "--sc-color": color }}>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <h2 className="stat-value">{value}</h2>
        <span className={`stat-percentage ${isNegative ? 'negative' : ''}`}>
          <Icon size={11} />
          {isNegative ? '' : '+'}{percentage}%
        </span>
      </div>
      <div className="stat-icon-wrap">
        <Icon size={20} />
      </div>
    </div>
  );
};

export default StatCard;
