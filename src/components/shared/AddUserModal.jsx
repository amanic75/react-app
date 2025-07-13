import React, { useState } from 'react';
import { X, FolderOpen, FlaskConical, Users, Check, Code, Building2 } from 'lucide-react';
import Button from '../ui/Button';

const AddUserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    role: 'Employee',
    credentials: 'user/temporary pass',
    appAccess: ['formulas'],
    password: ''
  });

  const roleOptions = [
    { value: 'Employee', label: 'Employee', credentials: 'user/temporary pass' },
    { value: 'Capacity Admin', label: 'Capacity Admin', credentials: 'admin/secure pass' },
    { value: 'NSight Admin', label: 'NSight Admin', credentials: 'nsight-admin/enterprise pass' }
  ];

  const getAppOptions = (userRole) => {
    if (userRole === 'NSight Admin') {
      return [
        { id: 'developer-mode', name: 'Developer Mode', icon: Code },
        { id: 'existing-company-mode', name: 'Existing Company Mode', icon: Building2 }
      ];
    } else {
      return [
        { id: 'formulas', name: 'Formulas', icon: FolderOpen },
        { id: 'raw-materials', name: 'Raw Materials', icon: FlaskConical },
        { id: 'suppliers', name: 'Suppliers', icon: Users }
      ];
    }
  };

  const getAppAccessByRole = (role) => {
    switch (role) {
      case 'Capacity Admin':
        return ['formulas', 'suppliers', 'raw-materials'];
      case 'NSight Admin':
        return ['developer-mode', 'existing-company-mode'];
      case 'Employee':
        return ['formulas'];
      default:
        return ['formulas'];
    }
  };

  const getCredentialsByRole = (role) => {
    switch (role) {
      case 'Capacity Admin':
        return 'admin/secure pass';
      case 'NSight Admin':
        return 'nsight-admin/enterprise pass';
      case 'Employee':
      default:
        return 'user/temporary pass';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-set app access and credentials based on role
      if (field === 'role') {
        newData.appAccess = getAppAccessByRole(value);
        newData.credentials = getCredentialsByRole(value);
      }
      
      return newData;
    });
  };

  const toggleAppAccess = (appId) => {
    setFormData(prev => ({
      ...prev,
      appAccess: prev.appAccess.includes(appId)
        ? prev.appAccess.filter(id => id !== appId)
        : [...prev.appAccess, appId]
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required');
      return;
    }

    if (!formData.password.trim()) {
      alert('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    const newUser = {
      id: Date.now(), // Simple ID generation
      name: formData.name.trim(),
      email: formData.email.trim(),
      contact: formData.contact.trim(),
      role: formData.role,
      credentials: formData.credentials,
      appAccess: formData.appAccess,
      status: 'Active',
      lastLogin: 'Never',
      password: formData.password.trim()
    };

    onSave(newUser);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      contact: '',
      role: 'Employee',
      credentials: 'user/temporary pass',
      appAccess: ['formulas'],
      password: ''
    });
    
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      email: '',
      contact: '',
      role: 'Employee',
      credentials: 'user/temporary pass',
      appAccess: ['formulas'],
      password: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Add User</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Basic Information</h3>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create password for this user"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Minimum 6 characters
                </p>
              </div>
            </div>

            {/* Right Column - Role & Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Role & Permissions</h3>
              
              {/* Role & Access Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Role & Access Level
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Credentials: {formData.credentials}
                </p>
              </div>

              {/* App Access */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-3">
                  App Access
                </label>
                <div className="space-y-3">
                  {getAppOptions(formData.role).map(app => {
                    const IconComponent = app.icon;
                    const isSelected = formData.appAccess.includes(app.id);
                    
                    return (
                      <button
                        key={app.id}
                        onClick={() => toggleAppAccess(app.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            isSelected ? 'bg-blue-500' : 'bg-slate-600'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{app.name}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal; 