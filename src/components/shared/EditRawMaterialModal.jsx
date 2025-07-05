import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditRawMaterialModal = ({ isOpen, onClose, material }) => {
  const [formData, setFormData] = useState({
    materialName: '',
    supplierName: '',
    manufacture: '',
    tradeName: '',
    casNumber: '',
    weightVolume: '',
    density: '',
    supplierCost: '',
    country: ''
  });

  // Update form data when material prop changes
  useEffect(() => {
    if (material) {
      setFormData({
        materialName: material.materialName || '',
        supplierName: material.supplierName || '',
        manufacture: material.manufacture || '',
        tradeName: material.tradeName || '',
        casNumber: material.casNumber || '',
        weightVolume: material.weightVolume || '',
        density: material.density || '',
        supplierCost: material.supplierCost || '',
        country: material.country || ''
      });
    }
  }, [material]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Updated material data:', formData);
    // Here you would typically update the material in your data store
    onClose();
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (material) {
      setFormData({
        materialName: material.materialName || '',
        supplierName: material.supplierName || '',
        manufacture: material.manufacture || '',
        tradeName: material.tradeName || '',
        casNumber: material.casNumber || '',
        weightVolume: material.weightVolume || '',
        density: material.density || '',
        supplierCost: material.supplierCost || '',
        country: material.country || ''
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Edit Raw Material</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Material Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Material Name *
                </label>
                <input
                  type="text"
                  name="materialName"
                  value={formData.materialName}
                  onChange={handleInputChange}
                  placeholder="Enter material name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Supplier Name
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacture"
                  value={formData.manufacture}
                  onChange={handleInputChange}
                  placeholder="Enter manufacturer"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Trade Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Trade Name
                </label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleInputChange}
                  placeholder="Enter trade name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* CAS Number */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CAS Number
                </label>
                <input
                  type="text"
                  name="casNumber"
                  value={formData.casNumber}
                  onChange={handleInputChange}
                  placeholder="Enter CAS number"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Weight/Volume */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Weight/Volume (lbs/gallon)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="weightVolume"
                  value={formData.weightVolume}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Density */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Density
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="density"
                  value={formData.density}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Supplier Cost */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Supplier Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="supplierCost"
                  value={formData.supplierCost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-slate-700">
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRawMaterialModal; 