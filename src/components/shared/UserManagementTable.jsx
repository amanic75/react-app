import React, { useState, useEffect } from 'react';
import { Users, MoreHorizontal, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getUsers } from '../../lib/data';

const UserManagementTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const usersPerPage = 20;

  useEffect(() => {
    // Load users when component mounts and refresh periodically
    const loadUsers = () => {
      const allUsers = getUsers();
      // Sort by last login date/time (most recent first)
      const sortedUsers = allUsers.sort((a, b) => {
        const dateA = new Date(a.lastLogin);
        const dateB = new Date(b.lastLogin);
        return dateB - dateA; // Descending order (newest first)
      });
      setUsers(sortedUsers);
    };
    
    loadUsers();
    
    // Refresh users every 2 seconds to show new accounts
    const interval = setInterval(loadUsers, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-50';
      case 'Inactive':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'text-purple-600 bg-purple-100';
      case 'NSight Admin':
        return 'text-indigo-600 bg-indigo-100';
      case 'Employee':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-primary-600 mr-2" />
          <button
            onClick={() => navigate('/user-management')}
            className="flex items-center space-x-2 hover:text-blue-400 transition-colors group"
          >
            <h2 className="text-xl font-semibold text-slate-100 group-hover:text-blue-400">User Management</h2>
            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-400" />
          </button>
        </div>
        <Button 
          size="sm"
          onClick={() => navigate('/user-management?action=add')}
        >
          Add User
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-3 px-4 font-medium text-slate-200">Name</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Email</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Last Login</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700">
                <td className="py-3 px-4 font-medium text-slate-100">{user.name}</td>
                <td className="py-3 px-4 text-slate-300">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">{user.lastLogin}</td>
                <td className="py-3 px-4">
                  <button className="text-slate-400 hover:text-slate-200">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-600 flex justify-between items-center">
        <p className="text-sm text-slate-300">
          Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserManagementTable; 