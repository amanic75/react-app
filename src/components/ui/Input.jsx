import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  className = '', 
  rightIcon,
  onRightIconClick,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-200 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          className={`w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-md shadow-sm 
                     placeholder-slate-400 focus:outline-none focus:ring-2 
                     focus:ring-primary-500 focus:border-primary-500 
                     transition-colors duration-200 ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input; 