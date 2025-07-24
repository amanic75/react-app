import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import EditRawMaterialModal from '../components/shared/EditRawMaterialModal';
import { getMaterialById, updateMaterial, getAllMaterials, deleteMaterial } from '../lib/materials';
import { useTheme } from '../contexts/ThemeContext';

const RawMaterialDetailPage = () => {
  const navigate = useNavigate();
  const { materialId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get material from Supabase
  useEffect(() => {
    const loadMaterial = async () => {
      try {
        setLoading(true);
        
        // Since the URL uses generated IDs (like "sodium-hydroxide"), 
        // we need to find the material by generated ID from the material name
        const allMaterials = await getAllMaterials();
        const foundMaterial = allMaterials.find(mat => 
          generateMaterialId(mat.materialName) === materialId
        );
        
        if (foundMaterial) {
    setMaterial(foundMaterial);
        } else {
          setError('Material not found');
        }
      } catch (err) {
        console.error('Error loading material:', err);
        setError('Failed to load material');
      } finally {
        setLoading(false);
      }
    };

    loadMaterial();
  }, [materialId]);

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400">Loading material...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error or not found state
  if (error || !material) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              {error || 'Material Not Found'}
            </h2>
            <Button onClick={() => navigate('/raw-materials')}>
              Back to Raw Materials
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleEditMaterial = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveMaterial = async (updatedData) => {
    try {
      // Update the material in Supabase
      const updated = await updateMaterial(material.id, updatedData);
    if (updated) {
      // Update local state to reflect changes immediately
      setMaterial(updated);
    }
    setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating material:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      const success = await deleteMaterial(materialId);
      if (success) {
        // Navigate back to raw materials list after successful deletion
        navigate('/raw-materials');
      } else {
        console.error('Failed to delete material');
        // You might want to show an error message to the user here
      }
    } catch (err) {
      console.error('Error deleting material:', err);
      // You might want to show an error message to the user here
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-900 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/raw-materials')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Raw Materials</span>
            </Button>
            <h1 className="text-2xl font-bold text-slate-100">Raw Material Details</h1>
          </div>
          <Button
            onClick={handleEditMaterial}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Material</span>
          </Button>
        </div>

        {/* Material Details */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Main Info Card */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-4xl font-bold text-slate-100 mb-3">{material.materialName}</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    {material.tradeName}
                  </span>
                  <span className="px-3 py-1 bg-slate-600 text-slate-200 text-sm rounded-full">
                    CAS: {material.casNumber}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Supplier Cost</p>
                <p className="text-3xl font-bold text-green-400">
                  ${material.supplierCost ? material.supplierCost.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Information */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center">
                <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                Technical Information
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Chemical Properties</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Physical Form:</span>
                        <span className="text-slate-200">{material.physicalForm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Purity:</span>
                        <span className="text-slate-200">{material.purity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Weight/Volume:</span>
                        <span className="text-slate-200">{material.weightVolume} lbs/gallon</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Density:</span>
                        <span className="text-slate-200">{material.density}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier & Safety Information */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center">
                <div className="w-2 h-6 bg-green-500 rounded mr-3"></div>
                Supplier & Safety
              </h3>
              <div className="space-y-6">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Supplier Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supplier:</span>
                      <span className="text-slate-200">{material.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Manufacturer:</span>
                      <span className="text-slate-200">{material.manufacture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Country:</span>
                      <span className="text-slate-200">{material.country}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Safety & Storage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hazard Class:</span>
                      <span className="text-slate-200">{material.hazardClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shelf Life:</span>
                      <span className="text-slate-200">{material.shelfLife}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-400">Storage Conditions:</p>
                    <p className="text-sm text-slate-200 mt-1">{material.storageConditions}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-2 h-6 bg-purple-500 rounded mr-3"></div>
              <h3 className="text-xl font-semibold text-slate-200">Description & Applications</h3>
            </div>
            <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-6">
              <p className="text-slate-200 leading-relaxed">{material.description}</p>
            </div>
          </div>
        </div>

        {/* Edit Material Modal */}
        <EditRawMaterialModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveMaterial}
          onDelete={handleDeleteMaterial}
          material={material}
        />
      </div>
    </DashboardLayout>
  );
};

export default RawMaterialDetailPage; 