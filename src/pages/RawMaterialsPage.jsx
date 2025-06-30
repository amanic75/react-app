import React, { useState, useRef } from 'react';
import { ArrowLeft, FlaskConical, List, ArrowUpDown, Plus, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import DropboxUploadModal from '../components/shared/DropboxUploadModal';

// Chemformation Logo Component
const ChemformationLogo = ({ className = "w-6 h-6" }) => (
  <img
    src="/chemformation-logo.png"
    alt="Chemformation Logo"
    className={className}
  />
);

const RawMaterialsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDropboxModalOpen, setIsDropboxModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const tabRefs = useRef({});

  // Form state for new material
  const [newMaterial, setNewMaterial] = useState({
    supplier: '',
    materialName: '',
    manufacturer: '',
    casNumber: '',
    weightVolume: '',
    activityPercentage: '',
    density: '',
    viscosity: '',
    cost: '',
    supplierCost: ''
  });

  // Mock raw materials data
  const rawMaterials = [
    { 
      materialName: 'CALCIUM CHLORIDE (100%)', 
      supplierName: 'ChemSupply Co.', 
      manufacture: 'Dow Chemical', 
      tradeName: 'DowFlake Xtra', 
      supplierCost: 0.000,
      casNumber: '10043-52-4',
      weightVolume: 0,
      density: 0,
      country: '--'
    },
    { 
      materialName: '60% HEDP Liquid Tech Grade', 
      supplierName: 'Industrial Chemicals Ltd.', 
      manufacture: 'Kemira', 
      tradeName: 'Dequest 2010', 
      supplierCost: 0.000,
      casNumber: '--',
      weightVolume: 0,
      density: 0,
      country: '--'
    },
    { 
      materialName: 'Acetic Acid, Glacial', 
      supplierName: 'Acid Solutions Inc.', 
      manufacture: 'Eastman Chemical', 
      tradeName: 'Glacial Acetic Acid', 
      supplierCost: 8.76,
      casNumber: '--',
      weightVolume: 0,
      density: 0,
      country: '--'
    },
    { 
      materialName: 'Sodium Molybdate Crystals, Tech Grade', 
      supplierName: 'Specialty Metals Corp.', 
      manufacture: 'Climax Molybdenum', 
      tradeName: 'Sodium Molybdate Dihydrate', 
      supplierCost: 0.000,
      casNumber: '--',
      weightVolume: 0,
      density: 3.78,
      country: '--'
    },
    { 
      materialName: 'HPMA (homopolymer of maleic acid) 50%', 
      supplierName: 'Polymer Technologies', 
      manufacture: 'Dow Chemical', 
      tradeName: 'Belclene 200', 
      supplierCost: 0.000,
      casNumber: '--',
      weightVolume: 0,
      density: 0,
      country: '--'
    },
    { 
      materialName: 'PBTC Phosphonobutane Tricarboxylic Acid', 
      supplierName: 'Water Treatment Chemicals', 
      manufacture: 'Italmatch Chemicals', 
      tradeName: 'Dequest 7000', 
      supplierCost: 1.55,
      casNumber: '--',
      weightVolume: 0,
      density: 9,
      country: '--'
    },
    { 
      materialName: 'Sodium Hypochlorite Solution 12.5%', 
      supplierName: 'Bleach Supply Co.', 
      manufacture: 'Olin Corporation', 
      tradeName: 'Liquid Bleach', 
      supplierCost: 2.34,
      casNumber: '7681-52-9',
      weightVolume: 0,
      density: 1.2,
      country: 'USA'
    },
    { 
      materialName: 'Citric Acid Anhydrous', 
      supplierName: 'Food Grade Chemicals', 
      manufacture: 'Cargill', 
      tradeName: 'CitriSafe', 
      supplierCost: 3.45,
      casNumber: '77-92-9',
      weightVolume: 0,
      density: 1.67,
      country: 'Brazil'
    },
    { 
      materialName: 'Hydrogen Peroxide 35%', 
      supplierName: 'Peroxide Solutions LLC', 
      manufacture: 'Solvay', 
      tradeName: 'Proxitane AHP35', 
      supplierCost: 4.89,
      casNumber: '7722-84-1',
      weightVolume: 0,
      density: 1.13,
      country: 'Belgium'
    },
    { 
      materialName: 'Potassium Hydroxide Flakes 90%', 
      supplierName: 'Caustic Supply Inc.', 
      manufacture: 'Olin Corporation', 
      tradeName: 'KOH Technical Grade', 
      supplierCost: 6.78,
      casNumber: '1310-58-3',
      weightVolume: 0,
      density: 2.04,
      country: 'USA'
    }
  ];

  const filteredMaterials = rawMaterials.filter(material => 
    material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.casNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.manufacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMouseMove = (e, tabId) => {
    if (!tabRefs.current[tabId]) return;
    
    const rect = tabRefs.current[tabId].getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const tabs = [
    { id: 'all', label: 'All Raw Materials' },
    { id: 'assigned', label: 'Assigned to me' },
    { id: 'created', label: 'Created by Me' }
  ];

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewMaterial(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle opening add material modal
  const handleAddMaterial = () => {
    setIsAddMaterialModalOpen(true);
  };

  // Handle showing confirmation dialog
  const handleShowConfirm = () => {
    setShowConfirmDialog(true);
  };

  // Handle confirming material creation
  const handleConfirmCreate = () => {
    console.log('Creating new material:', newMaterial);
    // Here you would typically send the data to your backend
    
    // Reset form and close modals
    setNewMaterial({
      supplier: '',
      materialName: '',
      manufacturer: '',
      casNumber: '',
      weightVolume: '',
      activityPercentage: '',
      density: '',
      viscosity: '',
      cost: '',
      supplierCost: ''
    });
    setShowConfirmDialog(false);
    setIsAddMaterialModalOpen(false);
  };

  // Handle canceling
  const handleCancel = () => {
    setShowConfirmDialog(false);
    setIsAddMaterialModalOpen(false);
    setNewMaterial({
      supplier: '',
      materialName: '',
      manufacturer: '',
      casNumber: '',
      weightVolume: '',
      activityPercentage: '',
      density: '',
      viscosity: '',
      cost: '',
      supplierCost: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <FlaskConical className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-semibold text-slate-100">Raw Materials</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by Txn Id, Material Name, CAS Nu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
            
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
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
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
            <button 
              onClick={handleAddMaterial}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">Add Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-750 border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Material Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">CAS Number</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Weight/Volume (lbs/gallon)</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Density</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Supplier Cost</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Country</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material, index) => (
                <tr 
                  key={`${material.materialName}-${index}`}
                  className="border-b border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-slate-300">{material.materialName}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{material.casNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{material.weightVolume}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{material.density}</td>
                  <td className="px-6 py-4 text-sm text-green-500 font-medium">
                    $ {material.supplierCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{material.country}</td>
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
      <button 
        onClick={handleAddMaterial}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors shadow-lg"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Dropbox Upload Modal */}
      <DropboxUploadModal
        isOpen={isDropboxModalOpen}
        onClose={() => setIsDropboxModalOpen(false)}
      />

      {/* Add Material Modal */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-semibold">Raw Materials</h2>
              <button
                onClick={handleCancel}
                className="text-white hover:text-slate-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Supplier *
                    </label>
                    <input
                      type="text"
                      value={newMaterial.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter supplier name"
                    />
                  </div>

                  {/* Material Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Material Name *
                    </label>
                    <input
                      type="text"
                      value={newMaterial.materialName}
                      onChange={(e) => handleInputChange('materialName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter material name"
                    />
                  </div>

                  {/* Manufacturer */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={newMaterial.manufacturer}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter manufacturer"
                    />
                  </div>

                  {/* CAS Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      CAS Number
                    </label>
                    <input
                      type="text"
                      value={newMaterial.casNumber}
                      onChange={(e) => handleInputChange('casNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter CAS number"
                    />
                  </div>

                  {/* Weight/Volume */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Weight/Volume (lbs/gallon)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newMaterial.weightVolume}
                      onChange={(e) => handleInputChange('weightVolume', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* % Activity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      % Activity
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMaterial.activityPercentage}
                      onChange={(e) => handleInputChange('activityPercentage', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Density */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Density
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newMaterial.density}
                      onChange={(e) => handleInputChange('density', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Viscosity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Viscosity
                    </label>
                    <input
                      type="text"
                      value={newMaterial.viscosity}
                      onChange={(e) => handleInputChange('viscosity', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Text"
                    />
                  </div>

                  {/* Cost */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Cost ($USD)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newMaterial.cost}
                      onChange={(e) => handleInputChange('cost', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0000"
                    />
                  </div>

                  {/* Supplier Cost */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Supplier Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newMaterial.supplierCost}
                      onChange={(e) => handleInputChange('supplierCost', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleShowConfirm}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-700">
            {/* Dialog Content */}
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <Info className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">RAW MATERIALS</h3>
              </div>
              
              <p className="text-slate-300 mb-6">
                Shall we go ahead and create this transaction?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  CONFIRM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default RawMaterialsPage; 