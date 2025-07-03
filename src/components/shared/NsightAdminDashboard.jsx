import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import Card from '../ui/Card';

const NsightAdminDashboard = ({ userData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Get current mode from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const currentMode = searchParams.get('mode');

  // Mock companies data
  const companies = [
    { id: 1, name: 'Capacity Chemical', users: 12, apps: ['Formulas', 'Suppliers', 'Raw Materials'] },
    { id: 2, name: 'Industrial Solutions Inc', users: 8, apps: ['Formulas', 'Suppliers'] },
    { id: 3, name: 'ChemTech Corp', users: 15, apps: ['Formulas', 'Raw Materials'] },
    { id: 4, name: 'Precision Chemicals', users: 6, apps: ['Formulas'] }
  ];

  const availableApps = [
    { id: 'formulas', name: 'Formulas', icon: Database, description: 'Chemical formula management' },
    { id: 'suppliers', name: 'Suppliers', icon: Building2, description: 'Supplier relationship management' },
    { id: 'raw-materials', name: 'Raw Materials', icon: Zap, description: 'Raw material inventory' },
    { id: 'analytics', name: 'Analytics', icon: Settings, description: 'Data analytics and reporting' }
  ];

  // Reset selected company when mode changes
  useEffect(() => {
    setSelectedCompany(null);
  }, [currentMode]);

  const handleModeSelection = (mode) => {
    navigate(`/dashboard?mode=${mode}`);
  };

  const handleBackToModeSelection = () => {
    navigate('/dashboard');
  };

  const handleCompanySelection = (company) => {
    setSelectedCompany(company);
  };

  const renderModeSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Nsight Admin Dashboard</h1>
        <p className="text-slate-400">Choose your administrative mode</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Developer Mode */}
        <Card 
          className="p-8 cursor-pointer hover:bg-slate-750 transition-all duration-200 border-2 border-transparent hover:border-blue-500"
          onClick={() => handleModeSelection('developer')}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100">Developer Mode</h3>
            <p className="text-slate-400 text-sm">
              Create new companies and develop custom applications for clients
            </p>
            <div className="pt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-center space-x-2">
                <Plus className="h-3 w-3" />
                <span>Create New Company</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Database className="h-3 w-3" />
                <span>Create Apps</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Existing Company Mode */}
        <Card 
          className="p-8 cursor-pointer hover:bg-slate-750 transition-all duration-200 border-2 border-transparent hover:border-green-500"
          onClick={() => handleModeSelection('existing')}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100">Existing Company Mode</h3>
            <p className="text-slate-400 text-sm">
              Manage existing companies, users, and applications
            </p>
            <div className="pt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-3 w-3" />
                <span>Manage Users</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Edit3 className="h-3 w-3" />
                <span>Edit/Add Apps</span>
              </div>
            </div>
          </div>
        </Card>
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
          <ArrowLeft className="h-5 w-5 text-slate-400" />
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
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Create New Company</h3>
              <p className="text-slate-400 text-sm">Set up a new client company</p>
            </div>
          </div>
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Company
          </button>
        </Card>

        {/* Create Apps */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Create Apps</h3>
              <p className="text-slate-400 text-sm">Develop custom applications</p>
            </div>
          </div>
          <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Create App
          </button>
        </Card>
      </div>

      {/* Available App Templates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Available App Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableApps.map((app) => {
            const IconComponent = app.icon;
            return (
              <div key={app.id} className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <IconComponent className="h-5 w-5 text-blue-400" />
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
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Existing Company Mode</h1>
          <p className="text-slate-400">Manage existing companies and their configurations</p>
        </div>
      </div>

      {!selectedCompany ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Select Company</h3>
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleCompanySelection(company)}
                className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 font-medium">{company.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-slate-400 text-sm">{company.users} users</span>
                      <span className="text-slate-400 text-sm">
                        Apps: {company.apps.join(', ')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        renderCompanyManagement()
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
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Manage Users</h3>
              <p className="text-slate-400 text-sm">{selectedCompany.users} active users</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="h-4 w-4" />
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
              <Edit3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Edit/Add Apps</h3>
              <p className="text-slate-400 text-sm">{selectedCompany.apps.length} apps configured</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Add New App
            </button>
            <button className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
              Configure Existing Apps
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
                  <Settings className="h-4 w-4" />
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
  if (currentMode === 'developer') {
    return renderDeveloperMode();
  } else if (currentMode === 'existing') {
    return renderExistingCompanyMode();
  } else {
    return renderModeSelection();
  }
};

export default NsightAdminDashboard; 