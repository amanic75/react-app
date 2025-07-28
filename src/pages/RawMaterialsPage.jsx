import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FlaskConical, List, ArrowUpDown, Plus, Info, X, Search, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import DropboxUploadModal from '../components/shared/DropboxUploadModal';
import { getAllMaterials, addMaterial } from '../lib/materials';
import { useAuth } from '../contexts/AuthContext';
import { filterByTab } from '../lib/filterUtils';

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
  const { user, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDropboxModalOpen, setIsDropboxModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tabRefs = useRef({});

  // Sort and Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('materialName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterForm, setFilterForm] = useState('all');
  const [filterHazard, setFilterHazard] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');

  // Temporary states for complex filtering
  const [tempSortBy, setTempSortBy] = useState('materialName');
  const [tempSortOrder, setTempSortOrder] = useState('asc');
  const [tempFilterSupplier, setTempFilterSupplier] = useState('all');
  const [tempFilterForm, setTempFilterForm] = useState('all');
  const [tempFilterHazard, setTempFilterHazard] = useState('all');
  const [tempFilterCountry, setTempFilterCountry] = useState('all');

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

  // Load raw materials from Supabase on component mount
  const loadMaterials = async () => {
    try {
      setLoading(true);
      const { data } = await getAllMaterials();
      setRawMaterials(data || []);
      setError(null);
    } catch (err) {
      // console.error removed
      setError('Failed to load raw materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Callback to refresh materials when added via chat
  const handleMaterialAdded = (materialData) => {
    // console.log removed
    // Refresh the materials list
    loadMaterials();
  };

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

  // Handle clicking on a material name to navigate to detail page
  const handleMaterialClick = (material) => {
    const materialId = material.id; // Assuming material.id is the unique identifier
    navigate(`/raw-materials/${materialId}`);
  };

  // Sort and Filter functions
  const handleSortChange = (newSortBy) => {
    setTempSortBy(newSortBy);
  };

  const toggleSortOrder = () => {
    setTempSortOrder(tempSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearAllFilters = () => {
    setSortBy('materialName');
    setSortOrder('asc');
    setFilterSupplier('all');
    setFilterForm('all');
    setFilterHazard('all');
    setFilterCountry('all');
    setSearchTerm('');
    
    // Reset temp states
    setTempSortBy('materialName');
    setTempSortOrder('asc');
    setTempFilterSupplier('all');
    setTempFilterForm('all');
    setTempFilterHazard('all');
    setTempFilterCountry('all');
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setSortOrder(tempSortOrder);
    setFilterSupplier(tempFilterSupplier);
    setFilterForm(tempFilterForm);
    setFilterHazard(tempFilterHazard);
    setFilterCountry(tempFilterCountry);
    setIsFilterOpen(false);
  };

  const cancelFilters = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setTempFilterSupplier(filterSupplier);
    setTempFilterForm(filterForm);
    setTempFilterHazard(filterHazard);
    setTempFilterCountry(filterCountry);
    setIsFilterOpen(false);
  };

  const toggleFilter = () => {
    if (isFilterOpen) {
      cancelFilters();
    } else {
      setTempSortBy(sortBy);
      setTempSortOrder(sortOrder);
      setTempFilterSupplier(filterSupplier);
      setTempFilterForm(filterForm);
      setTempFilterHazard(filterHazard);
      setTempFilterCountry(filterCountry);
      setIsFilterOpen(true);
    }
  };

  // Filter materials based on search term, filters, and active tab
  // First apply tab filtering with the new utility
  const tabFilteredMaterials = filterByTab(rawMaterials, activeTab, user, userProfile);
  
  // Then apply additional filters (search, supplier, form, hazard, country)
  const filteredMaterials = tabFilteredMaterials.filter(material => {
    // Search filter
    const matchesSearch = 
      (material.materialName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Supplier filter
    const matchesSupplier = filterSupplier === 'all' || 
      (material.supplierName || '').toLowerCase() === filterSupplier.toLowerCase();
    
    // Form filter
    const matchesForm = filterForm === 'all' || 
      (material.physicalForm || '').toLowerCase() === filterForm.toLowerCase();
    
    // Hazard filter
    const matchesHazard = filterHazard === 'all' || 
      (material.hazardClass || '').toLowerCase() === filterHazard.toLowerCase();
    
    // Country filter
    const matchesCountry = filterCountry === 'all' || 
      (material.country || '').toLowerCase() === filterCountry.toLowerCase();
    
    return matchesSearch && matchesSupplier && matchesForm && matchesHazard && matchesCountry;
  });

  // Sort filtered materials
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'materialName':
        aValue = (a.materialName || '').toLowerCase();
        bValue = (b.materialName || '').toLowerCase();
        break;
      case 'supplierName':
        aValue = (a.supplierName || '').toLowerCase();
        bValue = (b.supplierName || '').toLowerCase();
        break;
      case 'supplierCost':
        aValue = parseFloat(a.supplierCost) || 0;
        bValue = parseFloat(b.supplierCost) || 0;
        break;
      case 'physicalForm':
        aValue = (a.physicalForm || '').toLowerCase();
        bValue = (b.physicalForm || '').toLowerCase();
        break;
      case 'hazardClass':
        aValue = (a.hazardClass || '').toLowerCase();
        bValue = (b.hazardClass || '').toLowerCase();
        break;
      case 'country':
        aValue = (a.country || '').toLowerCase();
        bValue = (b.country || '').toLowerCase();
        break;
      case 'purity':
        aValue = (a.purity || '').toLowerCase();
        bValue = (b.purity || '').toLowerCase();
        break;
      case 'casNumber':
        aValue = (a.casNumber || '').toLowerCase();
        bValue = (b.casNumber || '').toLowerCase();
        break;
      default:
        aValue = a.materialName.toLowerCase();
        bValue = b.materialName.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Get unique values for filter dropdowns
  const uniqueSuppliers = [...new Set(rawMaterials.map(m => m.supplierName))].sort();
  const uniqueForms = [...new Set(rawMaterials.map(m => m.physicalForm))].filter(Boolean).sort();
  const uniqueHazards = [...new Set(rawMaterials.map(m => m.hazardClass))].filter(Boolean).sort();
  const uniqueCountries = [...new Set(rawMaterials.map(m => m.country))].filter(Boolean).sort();

  const handleMouseMove = (e, tabId) => {
    if (!tabRefs.current[tabId]) return;
    
    const rect = tabRefs.current[tabId].getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  // Define tabs based on user role
  const tabs = [
    { id: 'all', label: 'All Raw Materials' },
    // Only show "Assigned to me" tab for employees (not Capacity Admins)
    ...(userProfile?.role === 'Employee' ? [{ id: 'assigned', label: 'Assigned to me' }] : []),
    { id: 'created', label: 'Created by Me' }
  ];

  // Reset active tab if current tab is not available for user's role
  useEffect(() => {
    const availableTabIds = tabs.map(tab => tab.id);
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab('all');
    }
  }, [userProfile?.role, activeTab, tabs]);

  // Debug: Log user and filtering info
  console.log('RawMaterialsPage filtering:', {
    totalMaterials: rawMaterials.length,
    activeTab,
    user: user ? { id: user.id, email: user.email } : null,
    userRole: userProfile?.role,
    availableTabs: tabs.map(t => t.id),
    tabFilteredCount: tabFilteredMaterials.length
  });

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
  const handleConfirmCreate = async () => {
    try {
      // Add the current user's ID as created_by
      const materialWithUser = {
        ...newMaterial,
        created_by: user?.id
      };
      
      const newMaterialResult = await addMaterial(materialWithUser);
      if (newMaterialResult) {
        // Refresh the materials list
        loadMaterials();
      }
    } catch (error) {
      setError('Failed to add material. Please try again.');
    }
    
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

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout onMaterialAdded={handleMaterialAdded}>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <FlaskConical className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Raw Materials</h1>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading raw materials...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
  return (
    <DashboardLayout onMaterialAdded={handleMaterialAdded}>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <FlaskConical className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Raw Materials</h1>
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
    <DashboardLayout onMaterialAdded={handleMaterialAdded}>
      <div className="space-y-8">
          {/* Header with Back Button and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <FlaskConical className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Raw Materials</h1>
            </div>
          </div>

          {/* Search Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Txn Id, Material Name, CAS Nu..."
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
                            { key: 'materialName', label: 'Material Name' },
                            { key: 'supplierName', label: 'Supplier' },
                            { key: 'supplierCost', label: 'Cost' },
                            { key: 'physicalForm', label: 'Physical Form' },
                            { key: 'hazardClass', label: 'Hazard Class' },
                            { key: 'country', label: 'Country' },
                            { key: 'purity', label: 'Purity' },
                            { key: 'casNumber', label: 'CAS Number' }
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
                          {/* Supplier Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Supplier</h3>
                            <select
                              value={tempFilterSupplier}
                              onChange={(e) => setTempFilterSupplier(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Suppliers</option>
                              {uniqueSuppliers.map(supplier => (
                                <option key={supplier} value={supplier}>{supplier}</option>
                              ))}
                            </select>
                          </div>

                          {/* Physical Form Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Form</h3>
                            <select
                              value={tempFilterForm}
                              onChange={(e) => setTempFilterForm(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Forms</option>
                              {uniqueForms.map(form => (
                                <option key={form} value={form}>{form}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Hazard Class Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Hazard</h3>
                            <select
                              value={tempFilterHazard}
                              onChange={(e) => setTempFilterHazard(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Hazard Classes</option>
                              {uniqueHazards.map(hazard => (
                                <option key={hazard} value={hazard}>{hazard}</option>
                              ))}
                            </select>
                          </div>

                          {/* Country Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Country</h3>
                            <select
                              value={tempFilterCountry}
                              onChange={(e) => setTempFilterCountry(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Countries</option>
                              {uniqueCountries.map(country => (
                                <option key={country} value={country}>{country}</option>
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
              <Button 
                onClick={handleAddMaterial}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Material</span>
              </Button>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Material Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Supplier Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Trade Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">CAS Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Manufacture</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Country</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Supplier Cost</th>
                </tr>
              </thead>
              <tbody>
                {sortedMaterials.map((material, index) => (
                  <tr 
                    key={`${material.id}-${index}`}
                    onClick={() => handleMaterialClick(material)}
                    className="border-b border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                      {material.materialName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{material.supplierName}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{material.tradeName}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{material.casNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{material.manufacture}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{material.country}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">${(material.supplierCost || 0).toFixed(2)}</td>
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">RAW MATERIALS</h3>
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