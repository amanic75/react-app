import React, { useState, useEffect } from 'react';
import { X, FolderOpen, FlaskConical, Users, Check, Trash2, Code, Building2, Lock } from 'lucide-react';
import Button from '../ui/Button';
import ChangePasswordModal from './ChangePasswordModal';
import useFormState from '../../hooks/useFormState';

const getDefaultCredentials = (userRole) => {
  switch (userRole) {
    case 'Capacity Admin':
      return 'admin/secure pass';
    case 'NSight Admin':
      return 'nsight-admin/enterprise pass';
    case 'Employee':
    default:
      return 'user/temporary pass';
  }
};

const EditUserModal = ({ isOpen, onClose, user, onSave, onDelete, currentUserRole, onChangePassword }) => {
  const initialState = {
    name: '',
    email: '',
    contact: '',
    role: 'Employee',
    credentials: getDefaultCredentials('Employee'),
    appAccess: []
  };
  const { formData, setFormData, handleInputChange, resetForm } = useFormState(initialState);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contact: user.contact || '',
        role: user.role || 'Employee',
        credentials: user.credentials || getDefaultCredentials(user.role),
        appAccess: user.appAccess || []
      });
    }
  }, [user, setFormData]);

  // Update credentials and app access when role changes
  useEffect(() => {
    if (formData.role && user) {
      const newCredentials = getDefaultCredentials(formData.role);
      
      // Only update credentials when role changes, not app access
      if (formData.credentials !== newCredentials) {
        setFormData(prev => ({
          ...prev,
          credentials: newCredentials
        }));
      }
    }
  }, [formData.role, user]);

  const toggleAppAccess = (appId) => {
    setFormData(prev => ({
      ...prev,
      appAccess: prev.appAccess.includes(appId)
        ? prev.appAccess.filter(id => id !== appId)
        : [...prev.appAccess, appId]
    }));
  };

  const handleSave = () => {
    onSave({
      ...user,
      ...formData
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      onDelete(user.id);
      onClose();
    }
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const handleSavePassword = async (passwordData) => {
    try {
      const result = await onChangePassword({
        email: user.email,
        newPassword: passwordData.newPassword,
        isAdminReset: true // Flag to indicate this is an admin reset
      });
      
      if (result && result.success) {
        alert(`Password changed successfully for ${user.name}!`);
        setIsChangePasswordModalOpen(false);
      } else {
        alert(`Error: ${result?.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      // console.error removed
      alert(`Error: Failed to change password. Please try again.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Edit User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Change Password Button - Only for Admins */}
          {currentUserRole === 'Capacity Admin' && (
            <div className="pb-6 border-b border-slate-700 mb-6">
              <Button
                onClick={handleChangePassword}
                className="bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center space-x-2 py-3 px-6"
              >
                <Lock className="w-4 h-4" />
                <span>Change Password for {user?.name}</span>
              </Button>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Basic Information</h3>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                  placeholder="Phone number"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  <option value="Employee" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">Employee</option>
                  <option value="Capacity Admin" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                    {currentUserRole === 'Capacity Admin' ? 'Company Admin' : 'Capacity Admin'}
                  </option>
                  {currentUserRole === 'NSight Admin' && (
                    <option value="NSight Admin" className="bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">NSight Admin</option>
                  )}
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
                {formData.role === 'Employee' ? (
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
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400 mb-3">
                      {formData.role === 'Capacity Admin' ? 'Capacity Admins automatically have access to all business applications' : 'NSight Admins automatically have access to all platform applications'}
                    </p>
                    {getAppOptions(formData.role).map(app => {
                      const IconComponent = app.icon;
                      const isSelected = formData.appAccess.includes(app.id);
                      
                      return (
                        <div
                          key={app.id}
                          className="w-full flex items-center justify-between p-3 rounded-lg border bg-slate-800 border-slate-600 text-slate-400 opacity-75 cursor-not-allowed"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-600">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{app.name}</span>
                          </div>
                          <Check className="w-5 h-5" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
          <Button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-500 text-white flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete User</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleCloseChangePasswordModal}
        onSave={handleSavePassword}
        currentUserEmail={user?.email}
        isAdminReset={true}
        targetUserName={user?.name}
      />
    </div>
  );
};

export default EditUserModal; 