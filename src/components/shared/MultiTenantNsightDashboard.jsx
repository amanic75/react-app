import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Database, 
  Users, 
  Settings, 
  ChevronRight, 
  Check,
  AlertCircle,
  Shield,
  Globe,
  Key,
  Trash2,
  Edit3,
  Eye,
  X,
  RefreshCw
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const MultiTenantNsightDashboard = ({ userData }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // New company form state
  const [newCompanyData, setNewCompanyData] = useState({
    companyName: '',
    adminUserName: '',
    adminUserEmail: '',
    industry: 'Technology',
    initialApps: ['formulas', 'suppliers', 'raw-materials']
  });

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load multi-tenant companies
  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/multi-tenant-companies');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load companies');
      }
      
      if (data.success) {
        setCompanies(data.companies);
        console.log('✅ Loaded multi-tenant companies:', data.companies.length);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('❌ Failed to load companies:', error);
      setError(error.message);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new multi-tenant company
  const createMultiTenantCompany = async (e) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      setError(null);
      
      console.log('🏗️ Creating multi-tenant company:', newCompanyData.companyName);
      
      const response = await fetch('/api/admin/multi-tenant-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompanyData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create company');
      }
      
      if (data.success) {
        console.log('✅ Multi-tenant company created successfully:', data.company.name);
        
        // Show success alert with admin credentials
        alert(`
Multi-tenant company "${data.company.name}" created successfully!

Admin Account Details:
Email: ${data.adminAccount.email}
Password: ${data.adminAccount.defaultPassword}

Database: ${data.tenantInfo.schemaName}
Apps Deployed: ${data.tenantInfo.appsDeployed}

Please save these credentials and change the password immediately after first login.
        `);
        
        // Reset form
        setNewCompanyData({
          companyName: '',
          adminUserName: '',
          adminUserEmail: '',
          industry: 'Technology',
          initialApps: ['formulas', 'suppliers', 'raw-materials']
        });
        
        setShowCreateModal(false);
        
        // Reload companies list
        await loadCompanies();
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('❌ Failed to create multi-tenant company:', error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Get company details
  const getCompanyDetails = async (companyId) => {
    try {
      const response = await fetch(`/api/admin/multi-tenant-companies?id=${companyId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load company details');
      }
      
      if (data.success) {
        setSelectedCompany(data.company);
        setShowCompanyDetails(true);
        console.log('✅ Company details loaded:', data.company.name);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('❌ Failed to load company details:', error);
      alert(`Failed to load company details: ${error.message}`);
    }
  };

  // Delete company and its tenant database
  const deleteCompany = async (companyId, companyName) => {
    if (!confirm(`Are you sure you want to delete "${companyName}" and its entire isolated database?\n\nThis action cannot be undone and will permanently delete all company data.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/multi-tenant-companies?id=${companyId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete company');
      }
      
      if (data.success) {
        console.log('✅ Company deleted successfully:', companyName);
        alert(`Company "${companyName}" and its isolated database deleted successfully`);
        
        // Reload companies list
        await loadCompanies();
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('❌ Failed to delete company:', error);
      alert(`Failed to delete company: ${error.message}`);
    }
  };

  // Available app options
  const availableApps = [
    { id: 'formulas', name: 'Formulas', description: 'Chemical formula management' },
    { id: 'suppliers', name: 'Suppliers', description: 'Supplier relationship management' },
    { id: 'raw-materials', name: 'Raw Materials', description: 'Inventory management' },
    { id: 'analytics', name: 'Analytics', description: 'Data analytics and reporting' }
  ];

  // Handle app selection
  const handleAppToggle = (appId) => {
    setNewCompanyData(prev => ({
      ...prev,
      initialApps: prev.initialApps.includes(appId)
        ? prev.initialApps.filter(id => id !== appId)
        : [...prev.initialApps, appId]
    }));
  };

  // Render company status badge
  const renderStatusBadge = (company) => {
    const hasDatabase = company.hasIsolatedDatabase;
    const isHealthy = company.tenantHealthy;
    
    if (hasDatabase && isHealthy) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-400 text-sm">Isolated Database</span>
        </div>
      );
    } else if (hasDatabase && !isHealthy) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-400 text-sm">Database Issues</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Shared (Legacy)</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">NSight Multi-Tenant Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage isolated company databases and admin accounts</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadCompanies}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Multi-Tenant Company
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Companies List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-100">Multi-Tenant Companies</h2>
          <div className="text-sm text-slate-400">
            {companies.length} companies • {companies.filter(c => c.hasIsolatedDatabase).length} isolated databases
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-slate-400">Loading companies...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p>No multi-tenant companies found</p>
            <p className="text-sm mt-2">Create your first company to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-slate-100">{company.name}</h3>
                      {renderStatusBadge(company)}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                      <span>Admin: {company.adminEmail}</span>
                      <span>•</span>
                      <span>Database: {company.databaseType}</span>
                      <span>•</span>
                      <span>Users: {company.users}</span>
                      <span>•</span>
                      <span>Apps: {company.apps.length}</span>
                    </div>
                    {company.tenantSchema && (
                      <div className="mt-1 text-xs text-slate-500">
                        Schema: {company.tenantSchema}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => getCompanyDetails(company.id)}
                      variant="outline"
                      size="sm"
                      className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => deleteCompany(company.id, company.name)}
                      variant="outline"
                      size="sm"
                      className="bg-red-900/20 border-red-500 text-red-400 hover:bg-red-900/40"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-100">Create Multi-Tenant Company</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={createMultiTenantCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newCompanyData.companyName}
                  onChange={(e) => setNewCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., NVIDIA Corporation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Admin User Name
                </label>
                <input
                  type="text"
                  value={newCompanyData.adminUserName}
                  onChange={(e) => setNewCompanyData(prev => ({ ...prev, adminUserName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Admin User Email
                </label>
                <input
                  type="email"
                  value={newCompanyData.adminUserEmail}
                  onChange={(e) => setNewCompanyData(prev => ({ ...prev, adminUserEmail: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., admin@nvidia.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Industry
                </label>
                <select
                  value={newCompanyData.industry}
                  onChange={(e) => setNewCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Chemical Manufacturing">Chemical Manufacturing</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Initial Apps
                </label>
                <div className="space-y-2">
                  {availableApps.map((app) => (
                    <label key={app.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newCompanyData.initialApps.includes(app.id)}
                        onChange={() => handleAppToggle(app.id)}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-300">{app.name}</span>
                        <p className="text-xs text-slate-500">{app.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Company
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {showCompanyDetails && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-100">{selectedCompany.name}</h3>
              <button
                onClick={() => setShowCompanyDetails(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email</label>
                  <p className="text-slate-100">{selectedCompany.adminEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <p className="text-slate-100">{selectedCompany.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Database Type</label>
                  <p className="text-slate-100">{selectedCompany.databaseType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tenant Schema</label>
                  <p className="text-slate-100 text-sm font-mono">{selectedCompany.tenantSchema || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Users</label>
                  <p className="text-slate-100">{selectedCompany.users}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Apps</label>
                  <p className="text-slate-100">{selectedCompany.apps.length}</p>
                </div>
              </div>

              {selectedCompany.apps.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Deployed Apps</label>
                  <div className="space-y-2">
                    {selectedCompany.apps.map((app, index) => (
                      <div key={index} className="bg-slate-700 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-100">{app.app_name}</span>
                          <span className="text-xs text-slate-400">{app.status}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{app.app_description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setShowCompanyDetails(false)}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiTenantNsightDashboard; 