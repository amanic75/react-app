import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FolderOpen, Filter, ChevronDown, Plus, List, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import DropboxUploadModal from '../components/shared/DropboxUploadModal';
import { getAllFormulas } from '../lib/data';

// Chemformation Logo Component
const ChemformationLogo = ({ className = "w-6 h-6" }) => (
  <img
    src="/chemformation-logo.png"
    alt="Chemformation Logo"
    className={className}
  />
);

const FormulasPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDropboxModalOpen, setIsDropboxModalOpen] = useState(false);
  const tabRefs = useRef({});

  // Add CSS to hide scrollbars for webkit browsers
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ingredients-scroll::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Get formulas data from shared source
  const formulas = getAllFormulas();

  const filteredFormulas = formulas.filter(formula => 
    formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formula.id.toString().includes(searchTerm)
  );

  const handleMouseMove = (e, tabId) => {
    if (!tabRefs.current[tabId]) return;
    
    const rect = tabRefs.current[tabId].getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const tabs = [
    { id: 'all', label: 'All Formulas' },
    { id: 'assigned', label: 'Assigned to me' },
    { id: 'created', label: 'Created by Me' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div className="flex items-center space-x-3">
            <FolderOpen className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-slate-100">Formulas</h1>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Txn Id, material name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-3 bg-red-600 rounded-full hover:bg-red-500 transition-colors">
                <ChemformationLogo className="w-6 h-6" />
              </button>
              
              <button 
                onClick={() => setIsDropboxModalOpen(true)}
                className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                title="Upload to Dropbox"
              >
                <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 2L12 6L6 10L0 6L6 2ZM18 2L24 6L18 10L12 6L18 2ZM0 14L6 10L12 14L6 18L0 14ZM18 10L24 14L18 18L12 14L18 10ZM6 21L12 17L18 21L12 24L6 21Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs and Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  onMouseMove={(e) => handleMouseMove(e, tab.id)}
                  className={`relative px-6 py-2 transition-all duration-300 ease-out ${
                    activeTab === tab.id
                      ? 'bg-slate-600 text-slate-100'
                      : 'bg-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-650'
                  } ${tab.id === 'all' ? 'rounded-l-lg' : tab.id === 'created' ? 'rounded-r-lg' : ''}`}
                  style={{
                    transform: hoveredTab === tab.id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  <span className="relative z-10 font-medium">{tab.label}</span>
                  {hoveredTab === tab.id && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-md -z-0"
                      style={{
                        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), transparent 50%)`
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <List className="w-4 h-4 text-slate-300" />
                <span className="text-sm text-slate-300">Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <ArrowUpDown className="w-4 h-4 text-slate-300" />
                <span className="text-sm text-slate-300">Sort</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
                <Plus className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">Add Formula</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Table */}
          <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-750 border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Item number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Display name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Ingredients</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Total cost</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Final sale price (Drum)</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Final sale price (Tote)</th>
                </tr>
              </thead>
              <tbody>
                {filteredFormulas.map((formula, index) => (
                  <tr 
                    key={`${formula.id}-${index}`}
                    onClick={() => navigate(`/formulas/${formula.id}`)}
                    className="border-b border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">{formula.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{formula.name}</td>
                    <td className="px-6 py-4">
                      {/* Compact Ingredients Scroll */}
                      <div 
                        className="w-64 overflow-x-auto ingredients-scroll"
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                        }}
                      >
                        <div className="flex space-x-2 min-w-max">
                          {formula.ingredients.map((ingredient, idx) => (
                            <div 
                              key={idx} 
                              className="flex-shrink-0 bg-slate-700 rounded-md px-2 py-1 border border-slate-600"
                            >
                              <div className="text-xs text-slate-200 font-medium truncate max-w-20">
                                {ingredient.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {ingredient.percentage}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">$ {formula.totalCost.toFixed(3)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">$ {formula.finalSalePriceDrum.toFixed(3)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">$ {formula.finalSalePriceTote.toFixed(3)}</td>
                  </tr>
                ))}
                {/* Add empty rows to fill space like in reference */}
                {Array.from({ length: 15 }, (_, index) => (
                  <tr key={`empty-${index}`} className="border-b border-slate-700">
                    <td className="px-6 py-4 text-sm text-slate-600">&nbsp;</td>
                    <td className="px-6 py-4 text-sm text-slate-600">&nbsp;</td>
                    <td className="px-6 py-4 text-sm text-slate-600">&nbsp;</td>
                    <td className="px-6 py-4 text-sm text-slate-600">&nbsp;</td>
                    <td className="px-6 py-4 text-sm text-slate-600">&nbsp;</td>
                    <td className="px-6 py-4 text-sm text-slate-600">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-6 right-6 p-4 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors shadow-lg">
          <Plus className="h-6 w-6 text-white" />
        </button>

        {/* Dropbox Upload Modal */}
        <DropboxUploadModal
          isOpen={isDropboxModalOpen}
          onClose={() => setIsDropboxModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default FormulasPage; 