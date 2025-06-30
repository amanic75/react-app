import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`bg-slate-800 rounded-lg border border-slate-600 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 