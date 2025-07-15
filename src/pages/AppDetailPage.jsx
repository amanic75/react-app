import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Database, 
  Settings, 
  Table, 
  Edit3,
  Calendar,
  Building2,
  Eye,
  EyeOff,
  X,
  Save,
  FileText,
  Zap
} from 'lucide-react';
import Card from '../components/ui/Card';
import DashboardLayout from '../layouts/DashboardLayout';

const AppDetailPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    appName: '',
    appDescription: '',
    appColor: '#3B82F6',
    appIcon: 'Database',
    category: 'business',
    tableName: '',
    uiConfig: {
      showInDashboard: true,
      enableSearch: true,
      enableFilters: true,
      enableExport: true
    },
    schema: {
      fields: []
    },
    permissionsConfig: {
      adminAccess: [],
      managerAccess: [],
      userAccess: []
    }
  });

  // Fetch app details
  useEffect(() => {
    fetchAppDetails();
  }, [appId]);

  const fetchAppDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/apps?id=${appId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch app details');
      }
      
      if (data.success) {
        setApp(data.app);
        setEditForm({
          appName: data.app.appName,
          appDescription: data.app.appDescription,
          appColor: data.app.appColor,
          appIcon: data.app.appIcon
        });
        console.log('✅ Loaded app details:', data.app.appName);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('❌ Failed to fetch app details:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditApp = async () => {
    try {
      console.log('🔧 Updating app:', editForm.appName);
      
      const response = await fetch(`/api/admin/apps?id=${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update app');
      }
      
      if (result.success) {
        console.log('✅ Successfully updated app:', editForm.appName);
        setIsEditModalOpen(false);
        // Refresh the app details
        fetchAppDetails();
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('❌ Failed to update app:', error);
      alert(`Failed to update app: ${error.message}`);
    }
  };

  const handleEditChange = (field, value) => {
    if (field.startsWith('uiConfig.')) {
      const configKey = field.split('.')[1];
      setEditForm(prev => ({ 
        ...prev, 
        uiConfig: { ...prev.uiConfig, [configKey]: value }
      }));
    } else if (field.startsWith('permissionsConfig.')) {
      const roleKey = field.split('.')[1];
      setEditForm(prev => ({ 
        ...prev, 
        permissionsConfig: { ...prev.permissionsConfig, [roleKey]: value }
      }));
    } else if (field === 'schema.fields') {
      setEditForm(prev => ({ 
        ...prev, 
        schema: { ...prev.schema, fields: value }
      }));
    } else {
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const addSchemaField = () => {
    const newField = {
      name: '',
      label: '',
      type: 'text',
      required: false
    };
    handleEditChange('schema.fields', [...editForm.schema.fields, newField]);
  };

  const updateSchemaField = (index, fieldKey, value) => {
    const updatedFields = [...editForm.schema.fields];
    updatedFields[index] = { ...updatedFields[index], [fieldKey]: value };
    handleEditChange('schema.fields', updatedFields);
  };

  const removeSchemaField = (index) => {
    const updatedFields = editForm.schema.fields.filter((_, i) => i !== index);
    handleEditChange('schema.fields', updatedFields);
  };

  const addPermission = (role, permission) => {
    if (permission.trim() && !editForm.permissionsConfig[role].includes(permission.trim())) {
      const updatedPermissions = [...editForm.permissionsConfig[role], permission.trim()];
      handleEditChange(`permissionsConfig.${role}`, updatedPermissions);
    }
  };

  const removePermission = (role, permission) => {
    const updatedPermissions = editForm.permissionsConfig[role].filter(p => p !== permission);
    handleEditChange(`permissionsConfig.${role}`, updatedPermissions);
  };

  const openEditModal = () => {
    setEditForm({
      appName: app.appName,
      appDescription: app.appDescription,
      appColor: app.appColor,
      appIcon: app.appIcon,
      category: app.category || 'business',
      tableName: app.tableName || '',
      uiConfig: {
        showInDashboard: app.uiConfig?.showInDashboard !== false,
        enableSearch: app.uiConfig?.enableSearch !== false,
        enableFilters: app.uiConfig?.enableFilters !== false,
        enableExport: app.uiConfig?.enableExport !== false
      },
      schema: {
        fields: app.schema?.fields || []
      },
      permissionsConfig: {
        adminAccess: app.permissionsConfig?.adminAccess || [],
        managerAccess: app.permissionsConfig?.managerAccess || [],
        userAccess: app.permissionsConfig?.userAccess || []
      }
    });
    setIsEditModalOpen(true);
  };

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'Users': return Users;
      case 'Database': return Database;
      case 'Settings': return Settings;
      case 'Table': return Table;
      case 'Building2': return Building2;
      default: return Database;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading app details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">App Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard?mode=existing')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!app) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Database className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">App Not Found</h2>
          <p className="text-slate-400 mb-6">The requested app could not be found.</p>
          <button
            onClick={() => navigate('/dashboard?mode=existing')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const IconComponent = getIconComponent(app.appIcon);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard?mode=existing')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: app.appColor }}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">{app.appName}</h1>
              <p className="text-slate-400">{app.appDescription}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-slate-500">
                  Company: <span className="text-slate-300">{app.company?.name}</span>
                </span>
                <span className="text-sm text-slate-500">•</span>
                <span className="text-sm text-slate-500">
                  Created: <span className="text-slate-300">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={openEditModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Edit App</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">{app.recordCount || 0}</div>
              <div className="text-sm text-slate-400 mt-1">Records</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">{app.userCount || 0}</div>
              <div className="text-sm text-slate-400 mt-1">Users</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 capitalize">{app.status}</div>
              <div className="text-sm text-slate-400 mt-1">Status</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">{app.schema?.fields?.length || 0}</div>
              <div className="text-sm text-slate-400 mt-1">Fields</div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database Schema */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Schema
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Table Name</label>
                <p className="text-slate-400 font-mono bg-slate-700 px-3 py-2 rounded mt-1">
                  {app.tableName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Fields ({app.schema?.fields?.length || 0})
                </label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {app.schema?.fields?.map((field, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <div>
                        <span className="text-slate-200 font-medium">{field.label || field.name}</span>
                        <p className="text-xs text-slate-400 mt-1">{field.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="text-xs px-2 py-1 bg-red-900 text-red-300 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  )) || <p className="text-slate-500 text-sm">No fields defined</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* UI Configuration */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
                              {React.createElement(Settings, { className: "h-5 w-5 mr-2" })}
              UI Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Primary Color</label>
                <div className="flex items-center space-x-3 mt-1">
                  <div 
                    className="w-8 h-8 rounded border border-slate-600"
                    style={{ backgroundColor: app.appColor }}
                  ></div>
                  <span className="text-slate-400 font-mono">{app.appColor}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Features</label>
                <div className="mt-2 space-y-2">
                  {[
                    { key: 'showInDashboard', label: 'Show in Dashboard' },
                    { key: 'enableSearch', label: 'Enable Search' },
                    { key: 'enableFilters', label: 'Enable Filters' },
                    { key: 'enableExport', label: 'Enable Export' }
                  ].map(feature => {
                    const isEnabled = app.uiConfig?.[feature.key] !== false;
                    return (
                      <div key={feature.key} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                        <span className="text-slate-300">{feature.label}</span>
                        <div className="flex items-center">
                          {isEnabled ? (
                            <Eye className="h-4 w-4 text-green-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Permissions
            </h3>
            <div className="space-y-4">
              {[
                { key: 'adminAccess', label: 'Admin Access', color: 'red' },
                { key: 'managerAccess', label: 'Manager Access', color: 'orange' },
                { key: 'userAccess', label: 'User Access', color: 'green' }
              ].map(role => {
                const permissions = app.permissionsConfig?.[role.key] || [];
                return (
                  <div key={role.key} className="p-3 bg-slate-700 rounded">
                    <div className="text-sm font-medium text-slate-300 mb-2">{role.label}</div>
                    <div className="flex flex-wrap gap-1">
                      {permissions.length > 0 ? permissions.map((permission, index) => (
                        <span 
                          key={index}
                          className={`text-xs px-2 py-1 rounded bg-${role.color}-900 text-${role.color}-300`}
                        >
                          {permission}
                        </span>
                      )) : (
                        <span className="text-xs text-slate-500">No permissions</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* App Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              App Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Category</label>
                <p className="text-slate-400 capitalize">{app.category || 'business'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Created At</label>
                <p className="text-slate-400">{new Date(app.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Last Updated</label>
                <p className="text-slate-400">{new Date(app.updatedAt).toLocaleString()}</p>
              </div>
              {app.createdBy && (
                <div>
                  <label className="text-sm font-medium text-slate-300">Created By</label>
                  <p className="text-slate-400">{app.createdBy.name || app.createdBy.email}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit App Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100">Edit App</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
                  Basic Information
                </h3>
                
                {/* App Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={editForm.appName}
                    onChange={(e) => handleEditChange('appName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter app name"
                  />
                </div>

                {/* App Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.appDescription}
                    onChange={(e) => handleEditChange('appDescription', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter app description"
                    rows="3"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => handleEditChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="business">Business</option>
                    <option value="productivity">Productivity</option>
                    <option value="communication">Communication</option>
                    <option value="finance">Finance</option>
                    <option value="analytics">Analytics</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Appearance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
                  Appearance
                </h3>
                
                {/* App Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={editForm.appColor}
                      onChange={(e) => handleEditChange('appColor', e.target.value)}
                      className="w-12 h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editForm.appColor}
                      onChange={(e) => handleEditChange('appColor', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                {/* App Icon */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-7 gap-3">
                    {[
                      { name: 'Database', component: Database },
                      { name: 'Table', component: Table },
                      { name: 'Users', component: Users },
                      { name: 'Settings', component: Settings },
                      { name: 'FileText', component: FileText },
                      { name: 'Building2', component: Building2 },
                      { name: 'Zap', component: Zap }
                    ].map((icon) => (
                      <button
                        key={icon.name}
                        onClick={() => handleEditChange('appIcon', icon.name)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          editForm.appIcon === icon.name
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        {React.createElement(icon.component, { 
                          className: "h-5 w-5 text-slate-300 mx-auto" 
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
                  Features
                </h3>
                
                <div className="space-y-2">
                  {[
                    { key: 'showInDashboard', label: 'Show in Dashboard' },
                    { key: 'enableSearch', label: 'Enable Search' },
                    { key: 'enableFilters', label: 'Enable Filters' },
                    { key: 'enableExport', label: 'Enable Export' }
                  ].map(feature => (
                    <div key={feature.key} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">{feature.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.uiConfig[feature.key]}
                          onChange={(e) => handleEditChange(`uiConfig.${feature.key}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Schema */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
                  Database Schema
                </h3>
                
                {/* Table Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Table Name
                  </label>
                  <input
                    type="text"
                    value={editForm.tableName}
                    onChange={(e) => handleEditChange('tableName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="Enter table name"
                  />
                </div>

                {/* Fields */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-200">
                      Fields ({editForm.schema.fields.length})
                    </label>
                    <button
                      type="button"
                      onClick={addSchemaField}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Field
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editForm.schema.fields.map((field, index) => (
                      <div key={index} className="p-3 bg-slate-700 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateSchemaField(index, 'name', e.target.value)}
                            className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm font-mono"
                            placeholder="Field name"
                          />
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateSchemaField(index, 'label', e.target.value)}
                            className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm"
                            placeholder="Field label"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <select
                              value={field.type}
                              onChange={(e) => updateSchemaField(index, 'type', e.target.value)}
                              className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="email">Email</option>
                              <option value="date">Date</option>
                              <option value="boolean">Boolean</option>
                              <option value="select">Select</option>
                              <option value="textarea">Textarea</option>
                            </select>
                            <label className="flex items-center text-sm text-slate-300">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateSchemaField(index, 'required', e.target.checked)}
                                className="mr-1"
                              />
                              Required
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSchemaField(index)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {editForm.schema.fields.length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">No fields defined. Click "Add Field" to get started.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
                  Permissions
                </h3>
                
                {[
                  { key: 'adminAccess', label: 'Admin Access', color: 'red' },
                  { key: 'managerAccess', label: 'Manager Access', color: 'orange' },
                  { key: 'userAccess', label: 'User Access', color: 'green' }
                ].map(role => (
                  <div key={role.key} className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">{role.label}</label>
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {editForm.permissionsConfig[role.key].map((permission, index) => (
                          <span 
                            key={index}
                            className={`text-xs px-2 py-1 rounded bg-${role.color}-900 text-${role.color}-300 flex items-center`}
                          >
                            {permission}
                            <button
                              type="button"
                              onClick={() => removePermission(role.key, permission)}
                              className="ml-1 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {editForm.permissionsConfig[role.key].length === 0 && (
                          <span className="text-xs text-slate-500">No permissions</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addPermission(role.key, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm"
                        >
                          <option value="">Add permission...</option>
                          <option value="create">Create</option>
                          <option value="read">Read</option>
                          <option value="update">Update</option>
                          <option value="delete">Delete</option>
                          <option value="export">Export</option>
                          <option value="import">Import</option>
                          <option value="manage_users">Manage Users</option>
                          <option value="manage_settings">Manage Settings</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditApp}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppDetailPage; 