import React from 'react';
import { clearAllMockData } from '../../utils/clearMockData';

const ClearDataButton = ({ className = '' }) => {
  const handleClearData = () => {
    if (window.confirm('This will clear all cached mock data and refresh the page. Are you sure?')) {
      clearAllMockData();
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleClearData}
      className={`px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors ${className}`}
      title="Clear mock data that might be interfering with Supabase authentication"
    >
      Clear Mock Data
    </button>
  );
};

export default ClearDataButton; 