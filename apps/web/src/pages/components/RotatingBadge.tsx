import React from 'react';
import './RotatingBadge.css';

interface RotatingBadgeProps {
  text: string;
  centerIcon?: string;
    size?: number;
}

export const RotatingBadge: React.FC<RotatingBadgeProps> = ({ text, centerIcon = '⚡' }) => {
  return (
    <div className="rotating-badge">
      <svg viewBox="0 0 200 200" className="rotating-badge-svg">
        <defs>
          <path id="badge-circle-path" d="M 100,100 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
        </defs>
        <text className="rotating-badge-text">
          <textPath href="#badge-circle-path">{text}</textPath>
        </text>
      </svg>
      <span className="rotating-badge-center">{centerIcon}</span>
    </div>
  );
};

export default RotatingBadge;