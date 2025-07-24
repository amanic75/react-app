import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useFormState from '../../hooks/useFormState';
import Button from '../ui/Button';

const EditRawMaterialModal = ({ isOpen, onClose, onSave, onDelete, material }) => {
  const initialState = {
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
    shelfLife: '',
    assigned_to: []
  };
  const { formData, setFormData, handleInputChange, resetForm } = useFormState(initialState);

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
        shelfLife: material.shelfLife || '',
        assigned_to: material.assigned_to || []
      });
    }
  }, [material, setFormData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white rounded-t-lg">
          <h2 className="text-xl font-semibold">Add Raw Material</h2>
          <button onClick={handleCancel} className="text-white hover:text-slate-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Material Name *</label>
              <input type="text" value={formData.materialName} onChange={e => handleInputChange('materialName', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Supplier Name</label>
              <input type="text" value={formData.supplierName} onChange={e => handleInputChange('supplierName', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Manufacture</label>
              <input type="text" value={formData.manufacture} onChange={e => handleInputChange('manufacture', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Trade Name</label>
              <input type="text" value={formData.tradeName} onChange={e => handleInputChange('tradeName', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">CAS Number</label>
              <input type="text" value={formData.casNumber} onChange={e => handleInputChange('casNumber', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Weight/Volume</label>
              <input type="text" value={formData.weightVolume} onChange={e => handleInputChange('weightVolume', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Density</label>
              <input type="text" value={formData.density} onChange={e => handleInputChange('density', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Supplier Cost</label>
              <input type="number" value={formData.supplierCost} onChange={e => handleInputChange('supplierCost', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Country</label>
              <input type="text" value={formData.country} onChange={e => handleInputChange('country', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Physical Form</label>
              <input type="text" value={formData.physicalForm} onChange={e => handleInputChange('physicalForm', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Purity</label>
              <input type="text" value={formData.purity} onChange={e => handleInputChange('purity', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Storage Conditions</label>
              <input type="text" value={formData.storageConditions} onChange={e => handleInputChange('storageConditions', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Hazard Class</label>
              <input type="text" value={formData.hazardClass} onChange={e => handleInputChange('hazardClass', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Shelf Life</label>
              <input type="text" value={formData.shelfLife} onChange={e => handleInputChange('shelfLife', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100" rows={3} />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" onClick={handleCancel} className="bg-slate-600 hover:bg-slate-700 text-white">Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Add Material</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRawMaterialModal; 