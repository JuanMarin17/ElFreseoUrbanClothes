import React from 'react';
import { Info, Sparkles, AlertCircle } from 'lucide-react';
import './InfoCard.css';

const InfoCard = ({ color, title, desc }) => {
  // Elegimos el icono según el color o título
  const getIcon = () => {
    if (color === 'blue') return <Info size={18} />;
    if (color === 'purple') return <Sparkles size={18} />;
    return <AlertCircle size={18} />;
  };

  return (
    <div className={`info-card ${color}`}>
      <div className="info-icon-wrapper">
        {getIcon()}
      </div>
      <div className="info-text">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
};

export default InfoCard;