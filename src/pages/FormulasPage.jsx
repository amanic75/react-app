import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FolderOpen, List, ArrowUpDown, Plus, Info, X, Search, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import DropboxUploadModal from '../components/shared/DropboxUploadModal';
import { getAllFormulas } from '../lib/supabaseData';

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
  const [isAddFormulaModalOpen, setIsAddFormulaModalOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tabRefs = useRef({});

  // Sort and Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCostRange, setFilterCostRange] = useState('all');
  const [filterSalePriceRange, setFilterSalePriceRange] = useState('all');
  const [filterIngredientCount, setFilterIngredientCount] = useState('all');

  // Temporary states for complex filtering
  const [tempSortBy, setTempSortBy] = useState('name');
  const [tempSortOrder, setTempSortOrder] = useState('asc');
  const [tempFilterCostRange, setTempFilterCostRange] = useState('all');
  const [tempFilterSalePriceRange, setTempFilterSalePriceRange] = useState('all');
  const [tempFilterIngredientCount, setTempFilterIngredientCount] = useState('all');

  // Load formulas from Supabase on component mount
  useEffect(() => {
    const loadFormulas = async () => {
      try {
        setLoading(true);
        const data = await getAllFormulas();
        setFormulas(data);
        setError(null);
      } catch (err) {
        console.error('Error loading formulas:', err);
        setError('Failed to load formulas');
      } finally {
        setLoading(false);
      }
    };

    loadFormulas();
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
    setSortBy('name');
    setSortOrder('asc');
    setFilterCostRange('all');
    setFilterSalePriceRange('all');
    setFilterIngredientCount('all');
    setSearchTerm('');
    
    // Reset temp states
    setTempSortBy('name');
    setTempSortOrder('asc');
    setTempFilterCostRange('all');
    setTempFilterSalePriceRange('all');
    setTempFilterIngredientCount('all');
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setSortOrder(tempSortOrder);
    setFilterCostRange(tempFilterCostRange);
    setFilterSalePriceRange(tempFilterSalePriceRange);
    setFilterIngredientCount(tempFilterIngredientCount);
    setIsFilterOpen(false);
  };

  const cancelFilters = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setTempFilterCostRange(filterCostRange);
    setTempFilterSalePriceRange(filterSalePriceRange);
    setTempFilterIngredientCount(filterIngredientCount);
    setIsFilterOpen(false);
  };

  const toggleFilter = () => {
    if (isFilterOpen) {
      cancelFilters();
    } else {
      setTempSortBy(sortBy);
      setTempSortOrder(sortOrder);
      setTempFilterCostRange(filterCostRange);
      setTempFilterSalePriceRange(filterSalePriceRange);
      setTempFilterIngredientCount(filterIngredientCount);
      setIsFilterOpen(true);
    }
  };

  // Filter formulas based on search term and filters
  const filteredFormulas = formulas.filter(formula => {
    // Search filter
    const matchesSearch = 
      formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formula.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Cost range filter
    const matchesCostRange = filterCostRange === 'all' || (() => {
      const cost = parseFloat(formula.totalCost) || 0;
      switch (filterCostRange) {
        case 'low': return cost < 100;
        case 'medium': return cost >= 100 && cost < 500;
        case 'high': return cost >= 500;
        default: return true;
      }
    })();
    
    // Sale price range filter
    const matchesSalePriceRange = filterSalePriceRange === 'all' || (() => {
      const price = parseFloat(formula.finalSalePriceDrum) || 0;
      switch (filterSalePriceRange) {
        case 'low': return price < 200;
        case 'medium': return price >= 200 && price < 1000;
        case 'high': return price >= 1000;
        default: return true;
      }
    })();
    
    // Ingredient count filter
    const matchesIngredientCount = filterIngredientCount === 'all' || (() => {
      const count = formula.ingredients ? formula.ingredients.length : 0;
      switch (filterIngredientCount) {
        case 'few': return count <= 3;
        case 'medium': return count > 3 && count <= 6;
        case 'many': return count > 6;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesCostRange && matchesSalePriceRange && matchesIngredientCount;
  });

  // Sort filtered formulas
  const sortedFormulas = [...filteredFormulas].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'id':
        aValue = a.id.toLowerCase();
        bValue = b.id.toLowerCase();
        break;
      case 'totalCost':
        aValue = parseFloat(a.totalCost) || 0;
        bValue = parseFloat(b.totalCost) || 0;
        break;
      case 'finalSalePriceDrum':
        aValue = parseFloat(a.finalSalePriceDrum) || 0;
        bValue = parseFloat(b.finalSalePriceDrum) || 0;
        break;
      case 'finalSalePriceTote':
        aValue = parseFloat(a.finalSalePriceTote) || 0;
        bValue = parseFloat(b.finalSalePriceTote) || 0;
        break;
      case 'ingredientCount':
        aValue = a.ingredients ? a.ingredients.length : 0;
        bValue = b.ingredients ? b.ingredients.length : 0;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-100">Formulas</h1>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading formulas...</div>
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
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-100">Formulas</h1>
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
                            { key: 'name', label: 'Formula Name' },
                            { key: 'id', label: 'Formula ID' },
                            { key: 'totalCost', label: 'Total Cost' },
                            { key: 'finalSalePriceDrum', label: 'Sale Price (Drum)' },
                            { key: 'finalSalePriceTote', label: 'Sale Price (Tote)' },
                            { key: 'ingredientCount', label: 'Ingredient Count' }
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
                              <option value="low">Low (&lt; $100)</option>
                              <option value="medium">Medium ($100 - $500)</option>
                              <option value="high">High (&gt;= $500)</option>
                            </select>
                          </div>

                          {/* Sale Price Range Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Sale Price</h3>
                            <select
                              value={tempFilterSalePriceRange}
                              onChange={(e) => setTempFilterSalePriceRange(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Prices</option>
                              <option value="low">Low (&lt; $200)</option>
                              <option value="medium">Medium ($200 - $1000)</option>
                              <option value="high">High (&gt;= $1000)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {/* Ingredient Count Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Ingredients</h3>
                            <select
                              value={tempFilterIngredientCount}
                              onChange={(e) => setTempFilterIngredientCount(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Ingredient Counts</option>
                              <option value="few">Few (≤ 3 ingredients)</option>
                              <option value="medium">Medium (4-6 ingredients)</option>
                              <option value="many">Many (&gt; 6 ingredients)</option>
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
                {sortedFormulas.map((formula, index) => (
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
                          {formula.ingredients && formula.ingredients.map((ingredient, idx) => (
                            <div 
                              key={idx}
                              className="flex-shrink-0 bg-slate-700 rounded-full px-3 py-1 text-xs text-slate-300 border border-slate-600"
                            >
                              {ingredient.name} ({ingredient.percentage}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">${formula.totalCost ? formula.totalCost.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">${formula.finalSalePriceDrum ? formula.finalSalePriceDrum.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">${formula.finalSalePriceTote ? formula.finalSalePriceTote.toFixed(2) : '0.00'}</td>
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