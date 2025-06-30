import React from 'react';
import { FlaskConical, CheckCircle, Clock } from 'lucide-react';
import Card from '../ui/Card';
import { chemicalData } from '../../lib/data';

const ChemformationMockModule = () => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Under Review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600 bg-green-50';
      case 'Under Review':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <FlaskConical className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-slate-900">Chemformation Module</h2>
      </div>
      
      <div className="space-y-3">
        {chemicalData.map((chemical) => (
          <div 
            key={chemical.id} 
            className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-900">{chemical.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chemical.status)}`}>
                {getStatusIcon(chemical.status)}
                <span className="ml-1">{chemical.status}</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">Formula: {chemical.formula}</p>
            <p className="text-xs text-slate-500">Last updated: {chemical.lastUpdated}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          {chemicalData.length} compounds in database
        </p>
      </div>
    </Card>
  );
};

export default ChemformationMockModule; 