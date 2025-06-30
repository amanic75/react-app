import React, { useState, useRef } from 'react';
import { ArrowLeft, Users, SlidersHorizontal, ArrowUpDown, Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import EditSupplierModal from '../components/shared/EditSupplierModal';
import AddSupplierModal from '../components/shared/AddSupplierModal';

// Chemformation Logo Component
const ChemformationLogo = ({ className = "w-6 h-6" }) => (
  <img
    src="/chemformation-logo.png"
    alt="Chemformation Logo"
    className={className}
  />
);

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const tabRefs = useRef({});

  // Mock suppliers data matching the image format
  const suppliers = [
    { 
      supplierName: 'ChemCorp Industries', 
      supplierId: 'CC001', 
      supplierEmail: 'orders@chemcorp.com', 
      supplierContact: '+1 2039894719', 
      packagingCode: 'CC-PKG-001', 
      standardCost: 245.67 
    },
    { 
      supplierName: 'MineralSupply Ltd', 
      supplierId: 'MS002', 
      supplierEmail: 'sales@mineralsupply.com', 
      supplierContact: '+1 2039894720', 
      packagingCode: 'MS-PKG-002', 
      standardCost: 156.34 
    },
    { 
      supplierName: 'PetroChems Corp', 
      supplierId: 'PC003', 
      supplierEmail: 'procurement@petrochems.com', 
      supplierContact: '+1 2039894721', 
      packagingCode: 'PC-PKG-003', 
      standardCost: 334.12 
    },
    { 
      supplierName: 'SurfTech Solutions', 
      supplierId: 'ST004', 
      supplierEmail: 'orders@surftech.com', 
      supplierContact: '+1 2039894722', 
      packagingCode: 'ST-PKG-004', 
      standardCost: 89.45 
    },
    { 
      supplierName: 'ProtecChem LLC', 
      supplierId: 'PT005', 
      supplierEmail: 'sales@protecchem.com', 
      supplierContact: '+1 2039894723', 
      packagingCode: 'PT-PKG-005', 
      standardCost: 178.90 
    }
  ];

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMouseMove = (e, tabId) => {
    if (!tabRefs.current[tabId]) return;
    
    const rect = tabRefs.current[tabId].getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const tabs = [
    { id: 'all', label: 'All suppliers' },
    { id: 'assigned', label: 'Assigned to me' },
    { id: 'created', label: 'Created by Me' }
  ];

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleAddSupplier = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
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
                <Users className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-semibold text-slate-100">Suppliers</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
              
              <button className="p-3 bg-red-600 rounded-full hover:bg-red-500 transition-colors">
                <ChemformationLogo className="w-6 h-6" />
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <SlidersHorizontal className="w-4 h-4 text-slate-300" />
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <ArrowUpDown className="w-4 h-4 text-slate-300" />
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
              <button 
                onClick={handleAddSupplier}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">Add Supplier</span>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Supplier Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Supplier ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Supplier Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Supplier Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Packaging code</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Standard Cost</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <tr 
                    key={`${supplier.supplierId}-${index}`}
                    className="border-b border-slate-700 hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierName}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierId}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierEmail}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierContact}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.packagingCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">${supplier.standardCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSupplier(supplier);
                        }}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                        title="Edit supplier"
                      >
                        <Edit className="h-4 w-4 text-slate-400 hover:text-slate-200" />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Add empty rows to fill space */}
                {Array.from({ length: Math.max(0, 15 - filteredSuppliers.length) }, (_, index) => (
                  <tr key={`empty-${index}`} className="border-b border-slate-700">
                    <td className="px-6 py-4 text-sm text-slate-600">&nbsp;</td>
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
          onClick={handleAddSupplier}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors shadow-lg"
        >
          <Plus className="h-6 w-6 text-white" />
        </button>

        {/* Edit Supplier Modal */}
        <EditSupplierModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          supplier={selectedSupplier}
        />

        {/* Add Supplier Modal */}
        <AddSupplierModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
        />
      </div>
    </DashboardLayout>
  );
};

export default SuppliersPage; 