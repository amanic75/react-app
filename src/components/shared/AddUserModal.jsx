import React, { useState } from 'react';
import { X, FolderOpen, FlaskConical, Users, Check, Code, Building2 } from 'lucide-react';
import Button from '../ui/Button';

const AddUserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    credentials: 'user/temporary pass',
    appAccess: []
  });

  const credentialOptions = [
    'user/temporary pass',
    'admin/secure pass',
    'unknown/restricted access'
  ];

  const appOptions = [
    { id: 'formulas', name: 'Formulas', icon: FolderOpen },
    { id: 'raw-materials', name: 'Raw Materials', icon: FlaskConical },
    { id: 'suppliers', name: 'Suppliers', icon: Users },
    { id: 'developer-mode', name: 'Developer Mode', icon: Code },
    { id: 'existing-company-mode', name: 'Existing Company Mode', icon: Building2 }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    const newUser = {
      id: Date.now(), // Simple ID generation
      name: formData.name.trim(),
      email: formData.email.trim(),
      contact: formData.contact.trim(),
      credentials: formData.credentials,
      appAccess: formData.appAccess,
      role: formData.credentials.includes('admin') ? 'Admin' : 'Employee',
      status: 'Active',
      lastLogin: 'Never'
    };

    onSave(newUser);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      contact: '',
      credentials: 'user/temporary pass',
      appAccess: []
    });
    
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      email: '',
      contact: '',
      credentials: 'user/temporary pass',
      appAccess: []
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
      <div className="relative bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Add User</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Contact
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              placeholder="Phone number (optional)"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Credentials */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Credentials
            </label>
            <select
              value={formData.credentials}
              onChange={(e) => handleInputChange('credentials', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {credentialOptions.map(option => (
                <option key={option} value={option} className="bg-slate-700">
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* App Access */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">
              App Access
            </label>
            <div className="space-y-3">
              {appOptions.map(app => {
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

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700">
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