import React, { useState } from 'react';
import { X } from 'lucide-react';
import useFormState from '../../hooks/useFormState';

const AddSupplierModal = ({ isOpen, onClose }) => {
  const initialState = {
    supplierName: '',
    supplierId: '',
    supplierEmail: '',
    supplierContact: '',
    packagingCode: '',
    standardCost: ''
  };
  const { formData, handleInputChange, resetForm } = useFormState(initialState);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    // console.log removed
    // Reset form after successful submission
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    // Reset form data
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Add New Supplier</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Supplier Name
            </label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={e => handleInputChange('supplierName', e.target.value)}
              placeholder="Enter supplier name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Supplier ID */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Supplier ID
            </label>
            <input
              type="text"
              name="supplierId"
              value={formData.supplierId}
              onChange={e => handleInputChange('supplierId', e.target.value)}
              placeholder="Enter supplier ID"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Supplier Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Supplier Email
            </label>
            <input
              type="email"
              name="supplierEmail"
              value={formData.supplierEmail}
              onChange={e => handleInputChange('supplierEmail', e.target.value)}
              placeholder="Enter supplier email"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Supplier Contact */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Supplier Contact
            </label>
            <input
              type="tel"
              name="supplierContact"
              value={formData.supplierContact}
              onChange={e => handleInputChange('supplierContact', e.target.value)}
              placeholder="Enter contact number"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Packaging Code */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Packaging Code
            </label>
            <input
              type="text"
              name="packagingCode"
              value={formData.packagingCode}
              onChange={e => handleInputChange('packagingCode', e.target.value)}
              placeholder="Enter packaging code"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Standard Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Standard Cost
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="standardCost"
              value={formData.standardCost}
              onChange={e => handleInputChange('standardCost', e.target.value)}
              placeholder="Enter standard cost"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal; 