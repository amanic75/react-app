import React, { useState, useRef } from 'react';
import { 
  X, 
  Database, 
  Palette, 
  Settings, 
  Users, 
  ArrowLeft,
  ArrowRight,
  Check,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  FileText,
  Image,
  Mail,
  Phone,
  DollarSign,
  Link,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  Edit,
  Table
} from 'lucide-react';
import Button from '../ui/Button';

const CreateAppModal = ({ isOpen, onClose, onSave, selectedCompany = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [draggedItem, setDraggedItem] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const dragCounter = useRef(0);

  const [formData, setFormData] = useState({
    // Step 1: Basic App Information
    appName: '',
    appDescription: '',
    appIcon: 'Database',
    appColor: '#3B82F6',
    category: 'business',
    targetCompany: selectedCompany?.id || '',
    
    // Step 2: Database Schema
    tableName: '',
    fields: [],
    
    // Step 3: UI Configuration
    showInDashboard: true,
    enableSearch: true,
    enableFilters: true,
    enableExport: true,
    
    // Step 4: Permissions
    adminAccess: ['create', 'read', 'update', 'delete'],
    userAccess: ['read'],
    managerAccess: ['create', 'read', 'update']
  });

  const totalSteps = 4;

  // Available field types for drag and drop
  const fieldTypes = [
    { 
      type: 'text', 
      label: 'Text Field', 
      icon: Type, 
      config: { required: false, maxLength: 255 }
    },
    { 
      type: 'number', 
      label: 'Number', 
      icon: Hash, 
      config: { required: false, min: null, max: null }
    },
    { 
      type: 'email', 
      label: 'Email', 
      icon: Mail, 
      config: { required: false }
    },
    { 
      type: 'phone', 
      label: 'Phone', 
      icon: Phone, 
      config: { required: false }
    },
    { 
      type: 'date', 
      label: 'Date', 
      icon: Calendar, 
      config: { required: false }
    },
    { 
      type: 'boolean', 
      label: 'Yes/No', 
      icon: ToggleLeft, 
      config: { defaultValue: false }
    },
    { 
      type: 'textarea', 
      label: 'Long Text', 
      icon: FileText, 
      config: { required: false, rows: 4 }
    },
    { 
      type: 'currency', 
      label: 'Currency', 
      icon: DollarSign, 
      config: { required: false, currency: 'USD' }
    },
    { 
      type: 'url', 
      label: 'URL', 
      icon: Link, 
      config: { required: false }
    },
    { 
      type: 'file', 
      label: 'File Upload', 
      icon: Image, 
      config: { required: false, allowedTypes: ['image/*', 'application/pdf'] }
    }
  ];

  // App icons
  const appIcons = [
    { name: 'Database', icon: Database },
    { name: 'Table', icon: Table },
    { name: 'FileText', icon: FileText },
    { name: 'Settings', icon: Settings },
    { name: 'Users', icon: Users }
  ];

  // App colors
  const appColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16'  // Lime
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Drag and drop handlers
  const handleDragStart = (e, fieldType) => {
    setDraggedItem(fieldType);
    e.dataTransfer.effectAllowed = 'copy';
    dragCounter.current = 0;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedItem) {
      const newField = {
        id: Date.now(),
        type: draggedItem.type,
        label: draggedItem.label,
        fieldName: `field_${Date.now()}`,
        ...draggedItem.config
      };
      
      setFormFields(prev => [...prev, newField]);
      setDraggedItem(null);
    }
  };

  const removeField = (fieldId) => {
    setFormFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const updateField = (fieldId, updates) => {
    setFormFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    // Validate required fields
    const requiredFields = {
      1: ['appName', 'appDescription'],
      2: ['tableName'],
      3: [], // All have defaults
      4: [] // All have defaults
    };

    const required = requiredFields[currentStep] || [];
    const missing = required.filter(field => !formData[field]?.trim?.());
    
    if (missing.length > 0) {
      alert(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }

    if (currentStep === 2 && formFields.length === 0) {
      alert('Please add at least one field to your app');
      return;
    }

    if (currentStep === totalSteps) {
      // Final save
      const newApp = {
        id: Date.now(),
        ...formData,
        fields: formFields,
        schema: {
          tableName: formData.tableName,
          fields: formFields.map(field => ({
            name: field.fieldName,
            type: field.type,
            required: field.required,
            config: field
          }))
        },
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      onSave(newApp);
      handleClose();
    } else {
      nextStep();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormFields([]);
    setFormData({
      appName: '',
      appDescription: '',
      appIcon: 'Database',
      appColor: '#3B82F6',
      category: 'business',
      targetCompany: selectedCompany?.id || '',
      tableName: '',
      fields: [],
      showInDashboard: true,
      enableSearch: true,
      enableFilters: true,
      enableExport: true,
      adminAccess: ['create', 'read', 'update', 'delete'],
      userAccess: ['read'],
      managerAccess: ['create', 'read', 'update']
    });
    onClose();
  };

  if (!isOpen) return null;

  // Step 1: Basic App Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Database className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">App Information</h3>
        <p className="text-slate-400">Basic details about your new application</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            App Name *
          </label>
          <input
            type="text"
            value={formData.appName}
            onChange={(e) => handleInputChange('appName', e.target.value)}
            placeholder="e.g., Customer Database, Inventory Manager"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Description *
          </label>
          <textarea
            value={formData.appDescription}
            onChange={(e) => handleInputChange('appDescription', e.target.value)}
            placeholder="Brief description of what this app does..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              App Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {appIcons.map((iconOption) => {
                const IconComponent = iconOption.icon;
                return (
                  <button
                    key={iconOption.name}
                    type="button"
                    onClick={() => handleInputChange('appIcon', iconOption.name)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.appIcon === iconOption.name
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 text-slate-300 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              App Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {appColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('appColor', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.appColor === color
                      ? 'border-white scale-110'
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {selectedCompany && (
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h4 className="text-sm font-medium text-slate-200 mb-1">Target Company</h4>
            <p className="text-slate-400">{selectedCompany.name}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Step 2: Database Schema Builder
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Table className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Database Schema</h3>
        <p className="text-slate-400">Design your app's data structure</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Table Name *
        </label>
        <input
          type="text"
          value={formData.tableName}
          onChange={(e) => handleInputChange('tableName', e.target.value)}
          placeholder="e.g., customers, products, orders"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Types Panel */}
        <div>
          <h4 className="text-sm font-medium text-slate-200 mb-3">Available Field Types</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {fieldTypes.map((fieldType) => {
              const IconComponent = fieldType.icon;
              return (
                <div
                  key={fieldType.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, fieldType)}
                  className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg border border-slate-600 cursor-grab hover:bg-slate-600 transition-colors"
                >
                  <IconComponent className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-200 font-medium">{fieldType.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop Zone */}
        <div>
          <h4 className="text-sm font-medium text-slate-200 mb-3">App Fields</h4>
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="min-h-96 p-4 border-2 border-dashed border-slate-600 rounded-lg bg-slate-800/50"
          >
            {formFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Plus className="w-12 h-12 mb-3" />
                <p className="text-center">Drag field types here to build your app</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formFields.map((field) => {
                  const IconComponent = fieldTypes.find(ft => ft.type === field.type)?.icon || Type;
                  return (
                    <div key={field.id} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg border border-slate-600">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <IconComponent className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="bg-transparent text-slate-200 font-medium focus:outline-none"
                          placeholder="Field Label"
                        />
                        <input
                          type="text"
                          value={field.fieldName}
                          onChange={(e) => updateField(field.id, { fieldName: e.target.value })}
                          className="block text-xs text-slate-400 bg-transparent focus:outline-none mt-1"
                          placeholder="field_name"
                        />
                      </div>
                      <label className="flex items-center space-x-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded"
                        />
                        <span>Required</span>
                      </label>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: UI Configuration
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Palette className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">UI Configuration</h3>
        <p className="text-slate-400">Customize your app's interface</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <input
              type="checkbox"
              checked={formData.showInDashboard}
              onChange={(e) => handleInputChange('showInDashboard', e.target.checked)}
              className="rounded"
            />
            <div>
              <span className="text-slate-200 font-medium">Show in Dashboard</span>
              <p className="text-xs text-slate-400">Display app tile on main dashboard</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <input
              type="checkbox"
              checked={formData.enableSearch}
              onChange={(e) => handleInputChange('enableSearch', e.target.checked)}
              className="rounded"
            />
            <div>
              <span className="text-slate-200 font-medium">Enable Search</span>
              <p className="text-xs text-slate-400">Add search functionality</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <input
              type="checkbox"
              checked={formData.enableFilters}
              onChange={(e) => handleInputChange('enableFilters', e.target.checked)}
              className="rounded"
            />
            <div>
              <span className="text-slate-200 font-medium">Enable Filters</span>
              <p className="text-xs text-slate-400">Add filtering options</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <input
              type="checkbox"
              checked={formData.enableExport}
              onChange={(e) => handleInputChange('enableExport', e.target.checked)}
              className="rounded"
            />
            <div>
              <span className="text-slate-200 font-medium">Enable Export</span>
              <p className="text-xs text-slate-400">Allow data export to CSV/Excel</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  // Step 4: Permissions
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="w-12 h-12 text-orange-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Access Permissions</h3>
        <p className="text-slate-400">Define who can access and modify data</p>
      </div>

      <div className="space-y-6">
        {/* Permission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
            <h4 className="text-slate-200 font-medium mb-2">Admin Access</h4>
            <p className="text-xs text-green-400">Full access to all features</p>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
            <h4 className="text-slate-200 font-medium mb-2">Manager Access</h4>
            <p className="text-xs text-blue-400">Create, read, and update</p>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
            <h4 className="text-slate-200 font-medium mb-2">User Access</h4>
            <p className="text-xs text-slate-400">Read-only access</p>
          </div>
        </div>

        <div className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
          <h4 className="text-slate-200 font-medium mb-4">App Preview</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.appColor }}
              >
                {(() => {
                  const IconComponent = appIcons.find(icon => icon.name === formData.appIcon)?.icon || Database;
                  return <IconComponent className="w-5 h-5 text-white" />;
                })()}
              </div>
              <div>
                <h5 className="text-slate-200 font-medium">{formData.appName || 'App Name'}</h5>
                <p className="text-xs text-slate-400">{formData.appDescription || 'App description'}</p>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Fields: {formFields.length} • Table: {formData.tableName || 'table_name'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Create New App</h2>
              <p className="text-sm text-slate-400">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center space-x-2 mb-4">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index + 1 <= currentStep ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentStep === totalSteps ? (
              <>
                <Check className="w-4 h-4" />
                <span>Create App</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAppModal; 