import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditRawMaterialModal = ({ isOpen, onClose, onSave, material }) => {
  const [formData, setFormData] = useState({
    materialName: '',
    supplierName: '',
    manufacture: '',
    tradeName: '',
    casNumber: '',
    weightVolume: '',
    density: '',
    supplierCost: '',
    country: '',
    description: '',
    physicalForm: '',
    purity: '',
    storageConditions: '',
    hazardClass: '',
    shelfLife: ''
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
        country: material.country || '',
        description: material.description || '',
        physicalForm: material.physicalForm || '',
        purity: material.purity || '',
        storageConditions: material.storageConditions || '',
        hazardClass: material.hazardClass || '',
        shelfLife: material.shelfLife || ''
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
    // Call onSave with the updated form data
    if (onSave) {
      onSave(formData);
    } else {
      // Fallback if onSave is not provided
      console.log('Updated material data:', formData);
      onClose();
    }
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
        country: material.country || '',
        description: material.description || '',
        physicalForm: material.physicalForm || '',
        purity: material.purity || '',
        storageConditions: material.storageConditions || '',
        hazardClass: material.hazardClass || '',
        shelfLife: material.shelfLife || ''
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Edit Raw Material</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Basic Information</h3>
              
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

            {/* Middle Column - Technical Properties */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Technical Properties</h3>
              
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

              {/* Physical Form */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Physical Form
                </label>
                <input
                  type="text"
                  name="physicalForm"
                  value={formData.physicalForm}
                  onChange={handleInputChange}
                  placeholder="e.g., Liquid, Powder, Crystals"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Purity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Purity
                </label>
                <input
                  type="text"
                  name="purity"
                  value={formData.purity}
                  onChange={handleInputChange}
                  placeholder="e.g., 99.5%, Technical Grade"
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

            {/* Right Column - Safety & Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Safety & Notes</h3>
              
              {/* Hazard Class */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hazard Class
                </label>
                <input
                  type="text"
                  name="hazardClass"
                  value={formData.hazardClass}
                  onChange={handleInputChange}
                  placeholder="e.g., Corrosive, Non-hazardous"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Shelf Life */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Shelf Life
                </label>
                <input
                  type="text"
                  name="shelfLife"
                  value={formData.shelfLife}
                  onChange={handleInputChange}
                  placeholder="e.g., 24 months, 5 years"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Storage Conditions */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Storage Conditions
                </label>
                <textarea
                  name="storageConditions"
                  value={formData.storageConditions}
                  onChange={handleInputChange}
                  placeholder="Enter storage requirements..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description & Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed description, usage notes, or special handling instructions..."
                  rows={5}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="mt-1 text-xs text-slate-400">
                  {formData.description.length} characters
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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