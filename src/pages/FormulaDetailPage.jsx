import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FolderOpen, Edit3, Upload, File, Image, X, Download, Trash2, Plus, Search, Bot, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import { getFormulaById, updateFormula, getAllFormulas, deleteFormula, getAllMaterials } from '../lib/supabaseData';
import aiService from '../lib/aiService';

const FormulaDetailPage = () => {
  const navigate = useNavigate();
  const { formulaId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [editableFormula, setEditableFormula] = useState(null);
  const [formula, setFormula] = useState(null);
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Material search functionality for editing
  const [rawMaterials, setRawMaterials] = useState([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [showMaterialSearch, setShowMaterialSearch] = useState(false);
  
  // AI material addition state
  const [isAddingWithAI, setIsAddingWithAI] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Get formula from Supabase
  useEffect(() => {
    const loadFormula = async () => {
      try {
        setLoading(true);
    console.log('Loading formula with ID:', formulaId);
    
        const foundFormula = await getFormulaById(formulaId);
    console.log('Found formula:', foundFormula);
    
    if (foundFormula) {
      setFormula(foundFormula);
      setEditableFormula({
        name: foundFormula.name,
        totalCost: foundFormula.totalCost,
        finalSalePriceDrum: foundFormula.finalSalePriceDrum,
        finalSalePriceTote: foundFormula.finalSalePriceTote,
        ingredients: [...foundFormula.ingredients]
      });
      console.log('Formula state set successfully');
    } else {
      console.log('No formula found for ID:', formulaId);
          setError('Formula not found');
        }
      } catch (err) {
        console.error('Error loading formula:', err);
        setError('Failed to load formula');
      } finally {
        setLoading(false);
      }
    };

    loadFormula();
  }, [formulaId]);

  // Reset edit state when navigating to different formula
  useEffect(() => {
    console.log('FormulaDetailPage rendered with formulaId:', formulaId);
    
    // Reset edit state when navigating to different formula
    setIsEditing(false);
    setUploadedFiles([]);
    setDeletedDocuments([]);
    
    return () => {
      console.log('FormulaDetailPage cleanup');
    };
  }, [formulaId]);

  console.log('Current formula state:', formula);
  console.log('Current editableFormula state:', editableFormula);

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400">Loading formula...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error or not found state
  if (error || !formula) {
    console.log('Rendering Formula Not Found page');
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              {error || 'Formula Not Found'}
            </h2>
            <p className="text-slate-400 mb-4">Formula ID: {formulaId}</p>
            <button
              onClick={() => navigate('/formulas')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Formulas
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock existing documents for each formula
  const getExistingDocuments = (formulaId) => {
    const mockDocuments = {
      'HDST001': [
        { id: 1, name: 'HDST001_Safety_Data_Sheet.pdf', size: 2451232, type: 'application/pdf', uploadDate: new Date('2024-01-15'), uploader: 'Safety Team' },
        { id: 2, name: 'Heavy_Duty_Steam_Formula_Specs.docx', size: 1024567, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date('2024-01-10'), uploader: 'R&D Team' },
        { id: 3, name: 'Manufacturing_Instructions_HDST001.pdf', size: 876543, type: 'application/pdf', uploadDate: new Date('2024-01-08'), uploader: 'Production Team' },
        { id: 4, name: 'Quality_Control_Certificate.pdf', size: 345678, type: 'application/pdf', uploadDate: new Date('2024-01-05'), uploader: 'QC Lab' }
      ],
      'MDCL002': [
        { id: 5, name: 'MDCL002_Safety_Data_Sheet.pdf', size: 1876543, type: 'application/pdf', uploadDate: new Date('2024-01-12'), uploader: 'Safety Team' },
        { id: 6, name: 'Degreaser_Performance_Analysis.xlsx', size: 567890, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadDate: new Date('2024-01-08'), uploader: 'Lab Team' },
        { id: 7, name: 'EPA_Compliance_Certificate.pdf', size: 234567, type: 'application/pdf', uploadDate: new Date('2024-01-06'), uploader: 'Compliance Team' },
        { id: 8, name: 'Customer_Usage_Guidelines.docx', size: 456789, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date('2024-01-04'), uploader: 'Technical Support' }
      ],
      'INDL003': [
        { id: 9, name: 'INDL003_Safety_Data_Sheet.pdf', size: 3245612, type: 'application/pdf', uploadDate: new Date('2024-01-05'), uploader: 'Safety Team' },
        { id: 10, name: 'Industrial_Solvent_Safety_Protocol.docx', size: 987654, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date('2024-01-03'), uploader: 'Safety Team' },
        { id: 11, name: 'Lab_Test_Results_Batch_2024_001.xlsx', size: 234567, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadDate: new Date('2024-01-01'), uploader: 'Lab Team' },
        { id: 12, name: 'Hazmat_Transportation_Guide.pdf', size: 1234567, type: 'application/pdf', uploadDate: new Date('2023-12-28'), uploader: 'Logistics Team' },
        { id: 13, name: 'Solvent_Storage_Requirements.pdf', size: 654321, type: 'application/pdf', uploadDate: new Date('2023-12-25'), uploader: 'Facilities Team' }
      ]
    };
    return mockDocuments[formulaId] || [];
  };

  const existingDocuments = getExistingDocuments(formulaId);

  const handleDeleteDocument = (documentId) => {
    setDeletedDocuments(prev => [...prev, documentId]);
    console.log('Deleted document ID:', documentId);
  };

  const filteredExistingDocuments = existingDocuments.filter(doc => !deletedDocuments.includes(doc.id));

  // File upload handlers
  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      formulaId: formulaId
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    console.log('Uploading files for formula:', formulaId, newFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-400" />;
    }
    return <File className="h-5 w-5 text-slate-400" />;
  };

  const handleEditToggle = () => {
    // Reset to current values when starting edit
    setEditableFormula({
      name: formula.name,
      totalCost: formula.totalCost,
      finalSalePriceDrum: formula.finalSalePriceDrum,
      finalSalePriceTote: formula.finalSalePriceTote,
      ingredients: [...formula.ingredients]
    });
    setIsEditing(true);
    // Load raw materials for search functionality
    loadRawMaterials();
  };

  const handleSave = async () => {
    try {
      // Save changes to Supabase
      if (editableFormula) {
        const updatedFormula = await updateFormula(formula.id, editableFormula);
        if (updatedFormula) {
          setFormula(updatedFormula);
          console.log('Formula saved successfully:', updatedFormula);
        }
      }
      console.log('Deleted documents:', deletedDocuments);
      setIsEditing(false);
      setShowMaterialSearch(false);
      setMaterialSearchTerm('');
      setIsAddingWithAI(false);
      setAiResponse('');
      // Keep deleted documents after save - they are permanently removed
    } catch (err) {
      console.error('Error saving formula:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleCancel = () => {
    // Revert all changes back to original formula
    setEditableFormula({
      name: formula.name,
      totalCost: formula.totalCost,
      finalSalePriceDrum: formula.finalSalePriceDrum,
      finalSalePriceTote: formula.finalSalePriceTote,
      ingredients: [...formula.ingredients]
    });
    setIsEditing(false);
    setShowMaterialSearch(false);
    setMaterialSearchTerm('');
    setIsAddingWithAI(false);
    setAiResponse('');
    // Clear any uploaded files that weren't saved
    setUploadedFiles([]);
    setDeletedDocuments([]);
  };

  // Load raw materials for ingredient search
  const loadRawMaterials = async () => {
    try {
      const materials = await getAllMaterials();
      setRawMaterials(materials);
    } catch (error) {
      console.error('Error loading raw materials:', error);
    }
  };

  // Filter materials for search
  const filteredMaterials = rawMaterials.filter(material =>
    material.materialName.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.supplierName.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.casNumber.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  // Add ingredient from material search
  const addIngredientFromMaterial = (material) => {
    const newIngredient = {
      name: material.materialName,
      percentage: 0,
      cost: material.supplierCost || 0
    };
    
    setEditableFormula(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
    setMaterialSearchTerm('');
    setShowMaterialSearch(false);
  };

  // Handle AI material addition in edit mode
  const handleAddWithAI = async (chemicalName) => {
    setIsAddingWithAI(true);
    setAiResponse('');
    
    try {
      // Request AI to add the chemical
      const response = await aiService.generateResponse(
        `Add ${chemicalName} to my raw materials database`,
        null,
        []
      );
      
      setAiResponse(response.response || response);
      
      if (response.materialAdded && response.materialData) {
        // Refresh materials list
        const updatedMaterials = await getAllMaterials();
        setRawMaterials(updatedMaterials);
        
        // Auto-add the new material to the formula
        const newMaterial = response.materialData;
        addIngredientFromMaterial(newMaterial);
        
        // Clear search term since material was added
        setMaterialSearchTerm('');
        
        // Show success feedback
        setTimeout(() => {
          setAiResponse('');
          setIsAddingWithAI(false);
        }, 3000);
      } else {
        // Show error message
        setTimeout(() => {
          setIsAddingWithAI(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error adding material with AI:', error);
      setAiResponse('❌ Failed to add material with AI. Please try again.');
      setTimeout(() => {
        setIsAddingWithAI(false);
      }, 5000);
    }
  };

  const handleFieldChange = (field, value) => {
    console.log('Field change:', field, value);
    setEditableFormula(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setEditableFormula(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const handleDeleteIngredient = (index) => {
    setEditableFormula(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteFormula = async () => {
    try {
      const success = await deleteFormula(formula.id);
      if (success) {
        // Navigate back to formulas list after successful deletion
        navigate('/formulas');
      } else {
        console.error('Failed to delete formula');
        // You might want to show an error message to the user here
      }
    } catch (err) {
      console.error('Error deleting formula:', err);
      // You might want to show an error message to the user here
    }
    setShowDeleteConfirm(false);
  };

  return (
    <DashboardLayout key={`formula-${formulaId}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/formulas')}
              className="bg-slate-700 hover:bg-slate-600 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-100">Formula Details</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing && (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Formula</span>
              </Button>
            )}
          {isEditing ? (
            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleEditToggle}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Formula
            </Button>
          )}
          </div>
        </div>

        {/* Formula Info Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          {isEditing && editableFormula ? (
            <input
              type="text"
              value={editableFormula.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="text-2xl font-semibold text-slate-100 mb-6 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">{editableFormula?.name || formula.name}</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Formula ID</label>
              <div className="text-slate-200 font-medium">{formula.id}</div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Total Cost</label>
              {isEditing && editableFormula ? (
                <input
                  type="number"
                  step="0.01"
                  value={editableFormula.totalCost}
                  onChange={(e) => handleFieldChange('totalCost', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-slate-200 font-medium">${(editableFormula?.totalCost || formula.totalCost).toFixed(2)}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Final Sale Price (Drum)</label>
              {isEditing && editableFormula ? (
                <input
                  type="number"
                  step="0.01"
                  value={editableFormula.finalSalePriceDrum}
                  onChange={(e) => handleFieldChange('finalSalePriceDrum', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-slate-200 font-medium">${(editableFormula?.finalSalePriceDrum || formula.finalSalePriceDrum).toFixed(2)}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Final Sale Price (Tote)</label>
              {isEditing && editableFormula ? (
                <input
                  type="number"
                  step="0.01"
                  value={editableFormula.finalSalePriceTote}
                  onChange={(e) => handleFieldChange('finalSalePriceTote', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-slate-200 font-medium">${(editableFormula?.finalSalePriceTote || formula.finalSalePriceTote).toFixed(2)}</div>
              )}
            </div>
          </div>

          {/* Ingredients Horizontal Scroll */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-200">Ingredients</h3>
              {isEditing && (
                <button
                  onClick={() => setShowMaterialSearch(!showMaterialSearch)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Ingredient</span>
                </button>
              )}
            </div>

            {/* Material Search Panel - Only show when editing and search is active */}
            {isEditing && showMaterialSearch && (
              <div className="mb-6 p-4 bg-slate-750 rounded-lg border border-slate-600">
                <h4 className="text-md font-medium text-slate-200 mb-3">Add Ingredient from Raw Materials</h4>
                
                {/* Material Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={materialSearchTerm}
                    onChange={(e) => setMaterialSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search raw materials by name, supplier, or CAS number..."
                  />
                </div>

                {/* Material Search Results */}
                {materialSearchTerm && (
                  <div className="border border-slate-600 rounded-lg">
                    {/* AI Response Display */}
                    {isAddingWithAI && aiResponse && (
                      <div className="p-3 bg-blue-900/20 border-b border-slate-600">
                        <div className="flex items-start space-x-2">
                          <Bot className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-slate-300">{aiResponse}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Search Results */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredMaterials.slice(0, 8).map((material) => (
                        <button
                          key={material.id}
                          onClick={() => addIngredientFromMaterial(material)}
                          className="w-full p-3 text-left hover:bg-slate-700 border-b border-slate-600 last:border-b-0 transition-colors"
                          disabled={isAddingWithAI}
                        >
                          <div className="font-medium text-slate-200">{material.materialName}</div>
                          <div className="text-sm text-slate-400">
                            {material.supplierName} • ${material.supplierCost ? material.supplierCost.toFixed(2) : '0.00'}/unit • {material.casNumber}
                          </div>
                        </button>
                      ))}
                      
                      {/* Show more results hint */}
                      {filteredMaterials.length > 8 && !isAddingWithAI && (
                        <div className="p-2 text-slate-400 text-center text-xs bg-slate-750">
                          Showing first 8 results. Refine search for more specific results.
                        </div>
                      )}
                      
                      {/* No Results + AI Option */}
                      {filteredMaterials.length === 0 && materialSearchTerm && !isAddingWithAI && (
                        <div className="p-4">
                          <div className="text-center text-slate-400 mb-4">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No materials found for "<span className="font-medium">{materialSearchTerm}</span>"</p>
                          </div>
                          
                          <button
                            onClick={() => handleAddWithAI(materialSearchTerm)}
                            className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="font-medium">Add "{materialSearchTerm}" with AI</span>
                            <Bot className="h-4 w-4" />
                          </button>
                          
                          <p className="text-xs text-slate-500 text-center mt-2">
                            AI will research and add this chemical with complete specifications
                          </p>
                        </div>
                      )}
                      
                      {/* Loading State */}
                      {isAddingWithAI && (
                        <div className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2 text-blue-400">
                            <Bot className="h-5 w-5 animate-pulse" />
                            <span className="text-sm font-medium">AI is researching "{materialSearchTerm}"...</span>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            This may take a few seconds while we gather chemical data
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!materialSearchTerm && (
                  <div className="text-slate-400 text-sm text-center py-4">
                    Start typing to search through {rawMaterials.length} available raw materials
                  </div>
                )}
              </div>
            )}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              <div className="flex space-x-4 pb-2 min-w-max">
                {(editableFormula?.ingredients || formula.ingredients).map((ingredient, index) => (
                  <div key={index} className="flex-shrink-0 bg-slate-700 rounded-lg border border-slate-600 p-4 w-64 relative">
                    {/* Delete Button - Only show when editing */}
                    {isEditing && editableFormula && (
                      <button
                        onClick={() => handleDeleteIngredient(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors z-10 shadow-lg"
                        title="Delete ingredient"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    
                    <div className="space-y-3">
                      {/* Ingredient Name */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Ingredient</label>
                        {isEditing && editableFormula ? (
                          <input
                            type="text"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                            className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingredient name"
                          />
                        ) : (
                          <div className="text-slate-200 font-medium text-sm">{ingredient.name}</div>
                        )}
                      </div>
                      
                      {/* Percentage and Cost Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Percentage */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Percentage</label>
                          {isEditing && editableFormula ? (
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="0.1"
                                value={ingredient.percentage}
                                onChange={(e) => handleIngredientChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-600 border border-slate-500 rounded-md px-2 py-1 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-slate-300 ml-1 text-sm">%</span>
                            </div>
                          ) : (
                            <div className="text-slate-300 font-medium text-sm">{ingredient.percentage}%</div>
                          )}
                        </div>
                        
                        {/* Cost */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Cost</label>
                          {isEditing && editableFormula ? (
                            <div className="flex items-center">
                              <span className="text-slate-300 mr-1 text-sm">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={ingredient.cost}
                                onChange={(e) => handleIngredientChange(index, 'cost', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-600 border border-slate-500 rounded-md px-2 py-1 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ) : (
                            <div className="text-slate-300 font-medium text-sm">${ingredient.cost.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll Hint */}
            <div className="text-xs text-slate-500 mt-2 text-center">
              ← Scroll horizontally to view all ingredients →
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button className="bg-slate-700 hover:bg-slate-600">
            Export Data
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Generate Report
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            Duplicate Formula
          </Button>
        </div>

        {/* File Upload Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-medium text-slate-200 mb-6">Documents & Files</h3>
          
          {/* Existing Documents */}
          {filteredExistingDocuments.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-medium text-slate-200 mb-4">Existing Documents ({filteredExistingDocuments.length})</h4>
              <div className="space-y-2">
                {filteredExistingDocuments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="text-sm font-medium text-slate-200">{file.name}</div>
                        <div className="text-xs text-slate-400">
                          {formatFileSize(file.size)} • Uploaded {file.uploadDate.toLocaleDateString()} by {file.uploader}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditing) {
                            handleDeleteDocument(file.id);
                          } else {
                            console.log('Download existing file:', file.name);
                          }
                        }}
                        className={`p-1 transition-colors ${
                          isEditing 
                            ? 'text-slate-400 hover:text-red-400' 
                            : 'text-slate-400 hover:text-blue-400'
                        }`}
                        title={isEditing ? 'Delete' : 'Download'}
                      >
                        {isEditing ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-600 my-6"></div>
            </div>
          )}
          
          {/* Upload New Files Section */}
          <div>
            <h4 className="text-md font-medium text-slate-200 mb-4">Upload New Files</h4>
            
            {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOver 
                ? 'border-blue-400 bg-blue-400/10' 
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif"
              className="hidden"
            />
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-200 mb-2">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </h4>
            <p className="text-slate-400 mb-4">
              or click to browse files
            </p>
            <p className="text-sm text-slate-500">
              Supports: PDF, DOC, DOCX, TXT, CSV, XLSX, XLS, PNG, JPG, JPEG, GIF
            </p>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-slate-200 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="text-sm font-medium text-slate-200">{file.name}</div>
                        <div className="text-xs text-slate-400">
                          {formatFileSize(file.size)} • Uploaded {file.uploadDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Download file:', file.name);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                         </div>
           )}
           </div>
         </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md mx-4">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">Delete Formula</h3>
              </div>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete formula <strong>{formula?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFormula}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
       </div>
    </DashboardLayout>
  );
};

export default FormulaDetailPage; 