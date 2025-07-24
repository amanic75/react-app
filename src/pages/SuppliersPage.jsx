import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Users, List, ArrowUpDown, Plus, Info, X, Search, Filter, ChevronDown, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import DropboxUploadModal from '../components/shared/DropboxUploadModal';
import EditSupplierModal from '../components/shared/EditSupplierModal';
import AddSupplierModal from '../components/shared/AddSupplierModal';
import { getAllSuppliers } from '../lib/suppliers';

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
  const [isDropboxModalOpen, setIsDropboxModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tabRefs = useRef({});

  // Sort and Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('supplierName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCostRange, setFilterCostRange] = useState('all');
  const [filterPackaging, setFilterPackaging] = useState('all');

  // Temporary states for complex filtering
  const [tempSortBy, setTempSortBy] = useState('supplierName');
  const [tempSortOrder, setTempSortOrder] = useState('asc');
  const [tempFilterCostRange, setTempFilterCostRange] = useState('all');
  const [tempFilterPackaging, setTempFilterPackaging] = useState('all');

  // Load suppliers from Supabase on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        const data = await getAllSuppliers();
        setSuppliers(data);
        setError(null);
      } catch (err) {
        console.error('Error loading suppliers:', err);
        setError('Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest('.relative')) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  // Sort and Filter functions
  const handleSortChange = (newSortBy) => {
    setTempSortBy(newSortBy);
  };

  const toggleSortOrder = () => {
    setTempSortOrder(tempSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearAllFilters = () => {
    setSortBy('supplierName');
    setSortOrder('asc');
    setFilterCostRange('all');
    setFilterPackaging('all');
    setSearchTerm('');
    
    // Reset temp states
    setTempSortBy('supplierName');
    setTempSortOrder('asc');
    setTempFilterCostRange('all');
    setTempFilterPackaging('all');
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setSortOrder(tempSortOrder);
    setFilterCostRange(tempFilterCostRange);
    setFilterPackaging(tempFilterPackaging);
    setIsFilterOpen(false);
  };

  const cancelFilters = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setTempFilterCostRange(filterCostRange);
    setTempFilterPackaging(filterPackaging);
    setIsFilterOpen(false);
  };

  const toggleFilter = () => {
    if (isFilterOpen) {
      cancelFilters();
    } else {
      setTempSortBy(sortBy);
      setTempSortOrder(sortOrder);
      setTempFilterCostRange(filterCostRange);
      setTempFilterPackaging(filterPackaging);
      setIsFilterOpen(true);
    }
  };

  // Filter suppliers based on search term and filters
  const filteredSuppliers = suppliers.filter(supplier => {
    // Search filter
    const matchesSearch = 
    (supplier.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.supplierId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.supplierEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.supplierContact || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Cost range filter
    const matchesCostRange = filterCostRange === 'all' || (() => {
      const cost = parseFloat(supplier.standardCost) || 0;
      switch (filterCostRange) {
        case 'low': return cost < 50;
        case 'medium': return cost >= 50 && cost < 200;
        case 'high': return cost >= 200;
        default: return true;
      }
    })();
    
    // Packaging filter
    const matchesPackaging = filterPackaging === 'all' || supplier.packagingCode === filterPackaging;
    
    return matchesSearch && matchesCostRange && matchesPackaging;
  });

  // Sort filtered suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'supplierName':
        aValue = a.supplierName.toLowerCase();
        bValue = b.supplierName.toLowerCase();
        break;
      case 'supplierId':
        aValue = a.supplierId.toLowerCase();
        bValue = b.supplierId.toLowerCase();
        break;
      case 'supplierEmail':
        aValue = a.supplierEmail.toLowerCase();
        bValue = b.supplierEmail.toLowerCase();
        break;
      case 'standardCost':
        aValue = parseFloat(a.standardCost) || 0;
        bValue = parseFloat(b.standardCost) || 0;
        break;
      case 'packagingCode':
        aValue = a.packagingCode.toLowerCase();
        bValue = b.packagingCode.toLowerCase();
        break;
      case 'supplierContact':
        aValue = a.supplierContact.toLowerCase();
        bValue = b.supplierContact.toLowerCase();
        break;
      default:
        aValue = a.supplierName.toLowerCase();
        bValue = b.supplierName.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Get unique values for filter dropdowns
  const uniquePackaging = [...new Set(suppliers.map(s => s.packagingCode))].filter(Boolean).sort();

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

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-100">Suppliers</h1>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading suppliers...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
  return (
    <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-100">Suppliers</h1>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
              <Users className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-100">Suppliers</h1>
            </div>
          </div>

        {/* Search and Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Supplier ID, name, email"
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
              <div className="relative">
                <button 
                  onClick={toggleFilter}
                  className="flex items-center space-x-2 p-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Filter className="h-5 w-5 text-slate-300" />
                  <span className="text-sm text-slate-300">Filter & Sort</span>
                  <ChevronDown className="h-4 w-4 text-slate-300" />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      {/* Sort Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-slate-200">Sort By</h3>
                          <button
                            onClick={toggleSortOrder}
                            className="flex items-center space-x-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                          >
                            <span>{tempSortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                            <span>{tempSortOrder === 'asc' ? '↑' : '↓'}</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'supplierName', label: 'Supplier Name' },
                            { key: 'supplierId', label: 'Supplier ID' },
                            { key: 'supplierEmail', label: 'Email' },
                            { key: 'supplierContact', label: 'Contact' },
                            { key: 'packagingCode', label: 'Packaging Code' },
                            { key: 'standardCost', label: 'Standard Cost' }
                          ].map((option) => (
                            <button
                              key={option.key}
                              onClick={() => handleSortChange(option.key)}
                              className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                                tempSortBy === option.key 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filter Section */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Cost Range Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Cost</h3>
                            <select
                              value={tempFilterCostRange}
                              onChange={(e) => setTempFilterCostRange(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Costs</option>
                              <option value="low">Low (&lt; $50)</option>
                              <option value="medium">Medium ($50 - $200)</option>
                              <option value="high">High (&gt;= $200)</option>
                            </select>
                          </div>

                          {/* Packaging Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Packaging</h3>
                            <select
                              value={tempFilterPackaging}
                              onChange={(e) => setTempFilterPackaging(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Packaging</option>
                              {uniquePackaging.map(packaging => (
                                <option key={packaging} value={packaging}>{packaging}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-600">
                        <button
                          onClick={clearAllFilters}
                          className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          Clear All
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={cancelFilters}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
        <div className="space-y-6">
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
                {sortedSuppliers.map((supplier, index) => (
                  <tr 
                    key={`${supplier.supplierId}-${index}`}
                    className="border-b border-slate-700 hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierName}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierId}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierEmail}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.supplierContact}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{supplier.packagingCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">${supplier.standardCost ? supplier.standardCost.toFixed(2) : '0.00'}</td>
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Dropbox Upload Modal */}
        <DropboxUploadModal
          isOpen={isDropboxModalOpen}
          onClose={() => setIsDropboxModalOpen(false)}
        />

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