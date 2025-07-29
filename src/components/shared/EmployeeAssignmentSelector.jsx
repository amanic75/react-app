import React, { useState, useEffect } from 'react';
import { Search, X, Check, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const EmployeeAssignmentSelector = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentAssignments = [], 
  title = "Assign to Employees",
  appType = "formulas" // Default to formulas, can be "raw_materials"
}) => {
  const { getCompanyUsers, userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState(new Set(currentAssignments));
  const [loading, setLoading] = useState(true);

  // Load employees when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      // Don't set selected employees here - we'll do it after filtering
    }
  }, [isOpen, currentAssignments]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Get the current user's company ID from company_users table
      if (!userProfile?.id) {
        setEmployees([]);
        return;
      }

      // First get the company ID for the current user
      const { data: companyUserData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userProfile.id)
        .single();

      if (companyError || !companyUserData?.company_id) {
        setEmployees([]);
        return;
      }

      const companyId = companyUserData.company_id;
      
      const response = await getCompanyUsers(companyId);
      const users = response.data || [];
      
      console.log('EmployeeAssignmentSelector - Debug:', {
        companyId,
        totalUsers: users.length,
        appType,
        currentAssignments,
        userProfile: userProfile ? { id: userProfile.id, role: userProfile.role } : null
      });
      
      // Filter to show only employees who have access to the specified app
      // or are already assigned to this item
      const filteredUsers = users.filter(user => {
        // Check if user has access to the specified app
        const hasAppAccess = user.app_access && 
          (user.app_access.includes(appType) || 
           user.app_access.includes('all'));
        
        // Only show employees, not admins
        const isEmployee = user.role === 'Employee';
        const isAssigned = currentAssignments.includes(user.id);
        
        // Must be employee AND have app access (or be already assigned)
        const shouldInclude = isEmployee && (hasAppAccess || isAssigned);
        

        
        return shouldInclude;
      });
      

      setEmployees(filteredUsers);
      
      // Only include assigned employees that are actually visible in the filtered list
      const visibleAssignedEmployees = currentAssignments.filter(assignmentId => 
        filteredUsers.some(user => user.id === assignmentId)
      );
      setSelectedEmployees(new Set(visibleAssignedEmployees));
    } catch (error) {
      setEmployees([]);
      setSelectedEmployees(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle employee selection
  const toggleEmployee = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSave = () => {
    onSave(Array.from(selectedEmployees));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search employees by name or email..."
            />
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {selectedEmployees.size} employee{selectedEmployees.size !== 1 ? 's' : ''} selected
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              {searchTerm ? 'No employees found matching your search' : 'No employees available'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  onClick={() => toggleEmployee(employee.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedEmployees.has(employee.id)
                      ? 'bg-blue-900/30 border-blue-600'
                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-100">{employee.name}</div>
                      <div className="text-sm text-slate-400">{employee.email}</div>
                      {employee.department && (
                        <div className="text-xs text-slate-500 mt-1">
                          Department: {employee.department}
                        </div>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedEmployees.has(employee.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-500'
                    }`}>
                      {selectedEmployees.has(employee.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-700">
          <button
            onClick={() => setSelectedEmployees(new Set())}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear all
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAssignmentSelector; 