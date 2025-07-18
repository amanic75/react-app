import React from 'react';

const DualLogo = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <img
        src="/capacity%20chemical.png"
        alt="Capacity Chemical"
        className="h-8 w-auto"
      />
      <div className="h-6 w-px bg-slate-500"></div>
      <img
        src="/nsight.png"
        alt="NSight"
        className="h-8 w-auto"
      />
    </div>
  );
};

export default DualLogo; 