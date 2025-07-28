import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Users, 
  Settings, 
  Zap, 
  ChevronRight, 
  Code, 
  Database,
  UserPlus,
  Edit3,
  ArrowLeft,
  Check,
  Table,
  X,
  Trash2,
  FlaskConical
} from 'lucide-react';
import Card from '../ui/Card';
import CreateCompanyModal from './CreateCompanyModal';
import CreateAppModal from './CreateAppModal';

// Move constants outside component to avoid recreating on each render
const AVAILABLE_APPS = [
    { 
      id: 'formulas', 
      name: 'Formulas', 
      icon: Database, 
      description: 'Chemical formula management system',
      color: '#10B981',
      schema: {
        fields: [
          { name: 'id', type: 'bigint', label: 'ID', required: true },
          { name: 'formula_name', type: 'text', label: 'Formula Name', required: true },
          { name: 'chemical_composition', type: 'text', label: 'Chemical Composition', required: true },
          { name: 'density', type: 'decimal', label: 'Density (g/mL)', required: false },
          { name: 'ph_level', type: 'decimal', label: 'pH Level', required: false },
          { name: 'created_at', type: 'timestamp', label: 'Created At', required: true }
        ]
      }
    },
    { 
      id: 'suppliers', 
      name: 'Suppliers', 
      icon: Building2, 
      description: 'Supplier relationship management',
      color: '#3B82F6',
      schema: {
        fields: [
          { name: 'id', type: 'bigint', label: 'ID', required: true },
          { name: 'company_name', type: 'text', label: 'Company Name', required: true },
          { name: 'contact_person', type: 'text', label: 'Contact Person', required: true },
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'phone', type: 'text', label: 'Phone', required: false },
          { name: 'address', type: 'textarea', label: 'Address', required: false },
          { name: 'created_at', type: 'timestamp', label: 'Created At', required: true }
        ]
      }
    },
    { 
      id: 'raw-materials', 
      name: 'Raw Materials', 
    icon: FlaskConical, 
    description: 'Raw material inventory tracking',
      color: '#F59E0B',
      schema: {
        fields: [
          { name: 'id', type: 'bigint', label: 'ID', required: true },
          { name: 'material_name', type: 'text', label: 'Material Name', required: true },
        { name: 'supplier_name', type: 'text', label: 'Supplier Name', required: false },
        { name: 'cas_number', type: 'text', label: 'CAS Number', required: false },
        { name: 'quantity', type: 'decimal', label: 'Quantity', required: false },
        { name: 'unit', type: 'text', label: 'Unit', required: false },
        { name: 'cost', type: 'decimal', label: 'Cost', required: false },
          { name: 'created_at', type: 'timestamp', label: 'Created At', required: true }
        ]
      }
    }
  ];

const NsightAdminDashboard = ({ userData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState(false);
  const [isAddExistingAppModalOpen, setIsAddExistingAppModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [apps, setApps] = useState([]);
  const [allAvailableApps, setAllAvailableApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [isLoadingAvailableApps, setIsLoadingAvailableApps] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('company');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState(null);
  
  // Hover animation state
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRefs = useRef({});

  // Get current mode from URL
  const searchParams = new URLSearchParams(location.search);
  const currentMode = searchParams.get('mode');

  // Extracted utility functions
  const handleMouseMove = (e, cardId) => {
    if (!cardRefs.current[cardId]) return;
    
    const rect = cardRefs.current[cardId].getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const getIconString = (iconComponent) => {
    const iconMap = {
      [Database]: 'Database',
      [Building2]: 'Building2',
      [FlaskConical]: 'FlaskConical'
    };
    return iconMap[iconComponent] || 'Database';
  };

  // API functions
  const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      
    try {
      const response = await fetch('/api/admin/companies');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      // console.error removed
      setError('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCompanies = async () => {
      setIsSyncing(true);
    try {
      const response = await fetch('/api/admin/company-sync', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      setSyncStatus(result);
        await fetchCompanies();
    } catch (error) {
      // console.error removed
      setSyncStatus({ error: 'Failed to sync companies' });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchApps = async () => {
    if (!selectedCompany) return;
      setIsLoadingApps(true);
    
    try {
      const response = await fetch(`/api/admin/companies?id=${selectedCompany.id}&action=get-apps`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setApps(data.apps || []);
    } catch (error) {
      // console.error removed
      setApps([]);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const fetchAllAvailableApps = async () => {
      setIsLoadingAvailableApps(true);
    
    try {
      const templates = AVAILABLE_APPS.map(template => ({
          ...template,
        // Keep the original React component for rendering
        icon: template.icon,
          isTemplate: true
        }));

      setAllAvailableApps(templates);
    } catch (error) {
      // console.error removed
      setAllAvailableApps([]);
    } finally {
      setIsLoadingAvailableApps(false);
    }
  };

  const handleDeleteApp = async (appId, appName) => {
    if (!confirm(`Are you sure you want to delete "${appName}"?`)) return;

    try {
      const response = await fetch(`/api/admin/companies?action=delete-app`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, appName })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      await fetchApps(); // Refresh apps list
    } catch (error) {
      // console.error removed
      alert('Failed to delete app');
    }
  };

  const handleAddExistingApp = async (appTemplate) => {
    if (!selectedCompany) return;

    try {
      const response = await fetch('/api/admin/companies?action=create-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        companyId: selectedCompany.id,
        appName: appTemplate.name,
          appType: appTemplate.id,
        appDescription: appTemplate.description,
          appIcon: appTemplate.icon,
          appColor: appTemplate.color,
          schema: appTemplate.schema
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        setIsAddExistingAppModalOpen(false);
      await fetchApps();
    } catch (error) {
      // console.error removed
      alert('Failed to add app');
    }
  };

  // Event handlers  
  const handleModeSelection = (mode) => navigate(`/dashboard?mode=${mode}`);
  const handleBackToModeSelection = () => navigate('/dashboard');
  const handleCompanySelection = (company) => {
    if (selectedCompany?.id === company.id) {
      setSelectedCompany(null);
      setApps([]);
    } else {
      setSelectedCompany(company);
    }
  };
  const handleViewApps = () => setCurrentView('apps');
  const handleDeleteCompany = async (companyId, companyName) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This will permanently delete the company and all its users and data.`)) return;

    try {
      setIsDeleting(true);
      setDeletingCompanyId(companyId);
      
      const response = await fetch(`/api/admin/companies?id=${companyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        alert(`Company "${companyName}" deleted successfully! ${data.deletedUsers} users were also deleted.`);
        await fetchCompanies();
        if (selectedCompany?.id === companyId) {
          setSelectedCompany(null);
        }
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      // console.error removed
      alert(`Failed to delete company: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeletingCompanyId(null);
    }
  };
  const handleCreateCompany = async (companyData) => {
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
        await fetchCompanies();
      setIsCreateCompanyModalOpen(false);
    } catch (error) {
      // console.error removed
      throw error;
    }
  };

  const handleCreateApp = async (appData) => {
    try {
      const response = await fetch('/api/admin/companies?action=create-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      await fetchApps();
      setIsCreateAppModalOpen(false);
    } catch (error) {
      // console.error removed
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    if (currentMode) {
      fetchCompanies();
    }
  }, [currentMode]);

  useEffect(() => {
    if (selectedCompany) {
      fetchApps();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (isAddExistingAppModalOpen) {
      fetchAllAvailableApps();
    }
  }, [isAddExistingAppModalOpen]);

  // Render helper functions
  const renderModeCard = (mode, icon, title, description, color, features) => (
    <div
      key={mode}
      ref={(el) => (cardRefs.current[mode] = el)}
      onMouseEnter={() => setHoveredCard(mode)}
          onMouseLeave={() => {
            setHoveredCard(null);
        setMousePosition({ x: 50, y: 50 });
          }}
      onMouseMove={(e) => handleMouseMove(e, mode)}
          className="relative cursor-pointer"
          style={{
        transform: hoveredCard === mode ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
        transformOrigin: hoveredCard === mode ? `${mousePosition.x}% ${mousePosition.y}%` : 'center center',
        transition: hoveredCard === mode ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
          }}
      onClick={() => handleModeSelection(mode)}
        >
      <Card className={`p-8 hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden border-2 border-transparent hover:border-${color}-500`}>
        {hoveredCard === mode && (
              <div 
                className="absolute inset-0 opacity-20 -z-0"
                style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.3)'}, transparent 70%)`
                }}
              />
            )}
            <div className="text-center space-y-4 relative z-10">
              <div 
            className={`w-16 h-16 bg-${color}-600 rounded-full flex items-center justify-center mx-auto transition-all duration-300`}
                style={{
              transform: hoveredCard === mode ? 'scale(1.1)' : 'scale(1)',
              transition: hoveredCard === mode ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
                }}
              >
            {React.createElement(icon, { className: "h-8 w-8 text-white" })}
              </div>
          <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
              <div className="pt-4 space-y-2 text-xs text-slate-500">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-2 transition-transform duration-300"
                  style={{
                  transform: hoveredCard === mode ? 'scale(1.05)' : 'scale(1)',
                  transition: hoveredCard === mode ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
                  }}
                >
                {React.createElement(feature.icon, { className: "h-3 w-3" })}
                <span>{feature.text}</span>
                </div>
            ))}
              </div>
            </div>
          </Card>
        </div>
  );

  const renderModeSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Nsight Admin Dashboard</h1>
        <p className="text-slate-400">Choose your administrative mode</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Developer Mode */}
        {renderModeCard('developer', Code, 'Developer Mode', 'Create new companies and develop custom applications for clients', 'blue', [
          { icon: Plus, text: 'Create New Company' },
          { icon: Database, text: 'Create Apps' }
        ])}

        {/* Existing Company Mode */}
        {renderModeCard('existing', Building2, 'Existing Company Mode', 'Manage existing companies, users, and applications', 'green', [
          { icon: Users, text: 'Manage Users' },
          { icon: Edit3, text: 'Edit/Add Apps' }
        ])}
      </div>
    </div>
  );

  const renderDeveloperMode = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackToModeSelection}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {React.createElement(ArrowLeft, { className: "h-5 w-5 text-slate-400" })}
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Developer Mode</h1>
          <p className="text-slate-400">Create and configure new companies and applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create New Company */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                {React.createElement(Plus, { className: "h-6 w-6 text-white" })}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Create New Company</h3>
              <p className="text-slate-400 text-sm">Set up a new client company</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateCompanyModalOpen(true)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Company
          </button>
        </Card>

        {/* Create Apps */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                {React.createElement(Database, { className: "h-6 w-6 text-white" })}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Create Apps</h3>
              <p className="text-slate-400 text-sm">Develop custom applications</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateAppModalOpen(true)}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create App
          </button>
        </Card>
      </div>

      {/* Available App Templates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Available App Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AVAILABLE_APPS.map((app) => {
            const IconComponent = app.icon;
            return (
              <div key={app.id} className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  {IconComponent && React.createElement(IconComponent, { className: "h-5 w-5 text-blue-400" })}
                  <span className="text-slate-200 font-medium">{app.name}</span>
                </div>
                <p className="text-slate-400 text-xs">{app.description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderExistingCompanyMode = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackToModeSelection}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {React.createElement(ArrowLeft, { className: "h-5 w-5 text-slate-400" })}
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Existing Company Mode</h1>
          <p className="text-slate-400">Manage existing companies and their configurations</p>
        </div>
      </div>

      {/* Company Selection Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Select Company</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncCompanies}
              disabled={isSyncing}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                isSyncing 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSyncing ? 'Syncing...' : 'Sync Companies'}
            </button>
            {error && (
              <button
                onClick={fetchCompanies}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
        
        {syncStatus && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
            <p className="text-green-300 text-sm">✅ Sync completed</p>
            <p className="text-green-400 text-xs mt-1">
              {syncStatus.created} users created, {syncStatus.linked} companies linked, {syncStatus.errors} errors
            </p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">⚠️ {error}</p>
            <p className="text-red-400 text-xs mt-1">Showing sample data</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-slate-400">Loading companies...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8">
            {React.createElement(Building2, { className: "h-12 w-12 text-slate-600 mx-auto mb-3" })}
            <h4 className="text-slate-300 font-medium mb-2">No Companies Found</h4>
            <p className="text-slate-400 text-sm mb-4">Create your first company to get started</p>
            <button
              onClick={() => navigate('/dashboard?mode=developer')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Company
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`p-4 rounded-lg transition-colors border-2 ${
                  selectedCompany?.id === company.id 
                    ? 'bg-blue-600/20 border-blue-500' 
                    : 'bg-slate-700 border-transparent hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => handleCompanySelection(company)}
                    className="cursor-pointer flex-1"
                  >
                    <h4 className="text-slate-200 font-medium">{company.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-slate-400 text-sm">{company.users} users</span>
                      <span className="text-slate-400 text-sm">
                        {Array.isArray(company.apps) ? `${company.apps.length} apps` : '0 apps'}
                      </span>
                      {company.adminUserEmail && (
                        <span className="text-slate-400 text-sm">
                          Admin: {company.adminUserEmail}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCompany(company.id, company.name);
                      }}
                      disabled={isDeleting && deletingCompanyId === company.id}
                      className={`p-2 rounded-lg transition-colors ${
                        isDeleting && deletingCompanyId === company.id
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                      title="Delete Company"
                    >
                      {isDeleting && deletingCompanyId === company.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        React.createElement(Trash2, { className: "h-4 w-4" })
                      )}
                    </button>
                    {selectedCompany?.id === company.id ? (
                      React.createElement(Check, { className: "h-5 w-5 text-blue-400" })
                    ) : (
                      React.createElement(ChevronRight, { className: "h-5 w-5 text-slate-400 group-hover:text-slate-200 transition-colors" })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* App Selection Section */}
      {selectedCompany && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-100">Select App</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setIsAddExistingAppModalOpen(true);
                  fetchAllAvailableApps();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Existing App
              </button>
              <button
                onClick={() => setIsCreateAppModalOpen(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add New App
              </button>
            </div>
          </div>
          
          {isLoadingApps ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-slate-400">Loading apps...</span>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8">
              {React.createElement(Database, { className: "h-12 w-12 text-slate-600 mx-auto mb-3" })}
              <h4 className="text-slate-300 font-medium mb-2">No Apps Found</h4>
              <p className="text-slate-400 text-sm mb-4">Create your first app for {selectedCompany.name}</p>
              <button
                onClick={() => setIsCreateAppModalOpen(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create App
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => {
                const IconComponent = (() => {
                  switch(app.appIcon) {
                    case 'Users': return Users;
                    case 'Database': return Database;
                    case 'Settings': return Settings;
                    case 'Table': return Table;
                    case 'FlaskConical': return FlaskConical;
                    case 'Building2': return Building2;
                    case 'Zap': return Zap;
                    default: return Database;
                  }
                })();
                
                return (
                  <div
                    key={app.id}
                    className="relative p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer group"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteApp(app.id, app.appName);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                      title="Delete App"
                    >
                      {React.createElement(X, { className: "h-3 w-3" })}
                    </button>
                    
                    {/* App Content */}
                    <div 
                      onClick={() => navigate(`/apps/${app.id}`)}
                      className="flex items-start space-x-3"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: app.appColor }}
                      >
                        {React.createElement(IconComponent, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-slate-200 font-medium truncate">{app.appName}</h4>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{app.appDescription}</p>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                          <span>{app.recordCount || 0} records</span>
                          <span>{app.userCount || 0} users</span>
                          <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded">
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}


    </div>
  );

  const renderCompanyManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{selectedCompany.name}</h2>
          <p className="text-slate-400">Manage users and applications</p>
        </div>
        <button
          onClick={() => setSelectedCompany(null)}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
        >
          Back to Companies
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manage Users */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                {React.createElement(Users, { className: "h-6 w-6 text-white" })}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Manage Users</h3>
              <p className="text-slate-400 text-sm">{selectedCompany.users} active users</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <div className="flex items-center justify-center space-x-2">
                {React.createElement(UserPlus, { className: "h-4 w-4" })}
                <span>Add New User</span>
              </div>
            </button>
            <button className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
              View All Users
            </button>
          </div>
        </Card>

        {/* Edit/Add Apps */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                                {React.createElement(Edit3, { className: "h-6 w-6 text-white" })}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Edit/Add Apps</h3>
              <p className="text-slate-400 text-sm">{Array.isArray(selectedCompany.apps) ? selectedCompany.apps.length : 0} apps configured</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <button 
              onClick={() => setIsCreateAppModalOpen(true)}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add New App
            </button>
            <button 
              onClick={handleViewApps}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              View & Edit Apps
            </button>
          </div>
        </Card>
      </div>

      {/* Current Apps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Current Applications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedCompany.apps.map((appName, index) => (
            <div key={index} className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-medium">{appName}</span>
                <button className="text-slate-400 hover:text-slate-200 transition-colors">
                  {React.createElement(Settings, { className: "h-4 w-4" })}
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-1">Active</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );



  // Determine which view to render based on URL mode
  return (
    <>
      {currentMode === 'developer' ? renderDeveloperMode() : 
       currentMode === 'existing' ? renderExistingCompanyMode() : 
       renderModeSelection()}
      
      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={isCreateCompanyModalOpen}
        onClose={() => setIsCreateCompanyModalOpen(false)}
        onSave={handleCreateCompany}
      />
      
      {/* Create App Modal */}
      <CreateAppModal
        isOpen={isCreateAppModalOpen}
        onClose={() => setIsCreateAppModalOpen(false)}
        onSave={handleCreateApp}
        selectedCompany={selectedCompany}
        companies={companies}
      />

      {/* Add Existing App Modal */}
      {isAddExistingAppModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100">Add Existing App Template</h2>
              <button
                onClick={() => setIsAddExistingAppModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            
            <p className="text-slate-400 mb-6">
              Choose from pre-built templates or copy existing apps from other companies to add to {selectedCompany?.name}
            </p>
            
            {isLoadingAvailableApps ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-slate-400">Loading available apps...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAvailableApps.map((appTemplate) => {
                const IconComponent = appTemplate.icon;
                return (
                  <div
                    key={appTemplate.id}
                    onClick={() => handleAddExistingApp(appTemplate)}
                    className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer group border border-transparent hover:border-blue-500"
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: appTemplate.color }}
                      >
                        {IconComponent && React.createElement(IconComponent, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-slate-200 font-medium">{appTemplate.name}</h4>
                        <p className="text-slate-400 text-sm mt-1">{appTemplate.description}</p>
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            appTemplate.isTemplate 
                              ? 'bg-blue-900 text-blue-300' 
                              : 'bg-green-900 text-green-300'
                          }`}>
                            {appTemplate.isTemplate ? 'Template' : `From ${appTemplate.originalApp?.company?.name || 'Other Company'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={() => setIsAddExistingAppModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NsightAdminDashboard; 