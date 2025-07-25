import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, ChevronLeft, ChevronRight, Check, AlertCircle, Bot, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { getAllMaterials } from '../../lib/materials';
import aiService from '../../lib/aiService';
import useFormState from '../../hooks/useFormState';

const AddFormulaModal = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  
  // AI material addition state
  const [isAddingWithAI, setIsAddingWithAI] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const initialState = {
    name: '',
    targetDrumPrice: '',
    targetTotePrice: '',
    ingredients: []
  };
  const { formData: formulaData, handleInputChange, setFormData, resetForm } = useFormState(initialState);

  // Load raw materials when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRawMaterials();
      // Reset form when opening
      setCurrentStep(1);
      resetForm();
      setErrors({});
      setMaterialSearchTerm('');
    }
  }, [isOpen]);

  const loadRawMaterials = async () => {
    try {
      const { data } = await getAllMaterials();
      setRawMaterials(data || []);
    } catch (error) {
      console.error('Error loading raw materials:', error);
    }
  };

  // Filter materials for search
  const filteredMaterials = rawMaterials.filter(material =>
    (material.materialName || '').toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    (material.supplierName || '').toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    (material.casNumber || '').toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  // Calculate total cost and percentages
  const calculations = {
    totalPercentage: formulaData.ingredients.reduce((sum, ing) => sum + parseFloat(ing.percentage || 0), 0),
    totalCost: formulaData.ingredients.reduce((sum, ing) => {
      const percentage = parseFloat(ing.percentage || 0);
      const cost = parseFloat(ing.cost || 0);
      return sum + (percentage / 100 * cost);
    }, 0)
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formulaData.name.trim()) newErrors.name = 'Formula name is required';
      if (!formulaData.targetDrumPrice || parseFloat(formulaData.targetDrumPrice) <= 0) {
        newErrors.targetDrumPrice = 'Valid drum price is required';
      }
      if (!formulaData.targetTotePrice || parseFloat(formulaData.targetTotePrice) <= 0) {
        newErrors.targetTotePrice = 'Valid tote price is required';
      }
    }
    
    if (step === 2) {
      if (formulaData.ingredients.length === 0) {
        newErrors.ingredients = 'At least one ingredient is required';
      }
      
      // Check percentage total
      if (Math.abs(calculations.totalPercentage - 100) > 0.1) {
        newErrors.percentageTotal = 'Ingredients must total 100%';
      }
      
      // Check individual ingredients
      formulaData.ingredients.forEach((ing, index) => {
        if (!ing.percentage || parseFloat(ing.percentage) <= 0) {
          newErrors[`ingredient_${index}_percentage`] = 'Valid percentage required';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle ingredient management
  const addIngredient = (material) => {
    const newIngredient = {
      id: Date.now(),
      name: material.materialName,
      materialId: material.id,
      percentage: '',
      cost: material.supplierCost || 0,
      supplierName: material.supplierName,
      casNumber: material.casNumber
    };
    
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
    setMaterialSearchTerm('');
  };

  const updateIngredient = (ingredientId, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing =>
        ing.id === ingredientId ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (ingredientId) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== ingredientId)
    }));
  };

  // Handle AI material addition
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
        addIngredient(newMaterial);
        
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

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Save formula
  const handleSave = () => {
    if (validateStep(2)) {
      const formulaToSave = {
        name: formulaData.name,
        totalCost: calculations.totalCost,
        finalSalePriceDrum: parseFloat(formulaData.targetDrumPrice),
        finalSalePriceTote: parseFloat(formulaData.targetTotePrice),
        ingredients: formulaData.ingredients.map(ing => ({
          name: ing.name,
          percentage: parseFloat(ing.percentage),
          cost: parseFloat(ing.cost)
        }))
      };
      
      onSave(formulaToSave);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Add New Formula</h2>
            <p className="text-slate-400 mt-1">
              Step {currentStep} of 2: {currentStep === 1 ? 'Basic Information' : 'Ingredients & Composition'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className={currentStep >= 1 ? 'text-slate-200' : 'text-slate-400'}>
                Basic Info
              </span>
            </div>
            <div className={`flex-1 h-1 ${currentStep > 1 ? 'bg-blue-600' : 'bg-slate-600'}`} />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                2
              </div>
              <span className={currentStep >= 2 ? 'text-slate-200' : 'text-slate-400'}>
                Ingredients
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Formula Name *
                </label>
                <input
                  type="text"
                  value={formulaData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="e.g., Heavy Duty Degreaser Pro"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Target Drum Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formulaData.targetDrumPrice}
                    onChange={e => handleInputChange('targetDrumPrice', e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.targetDrumPrice ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="589.99"
                  />
                  {errors.targetDrumPrice && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.targetDrumPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Target Tote Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formulaData.targetTotePrice}
                    onChange={e => handleInputChange('targetTotePrice', e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.targetTotePrice ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="1249.99"
                  />
                  {errors.targetTotePrice && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.targetTotePrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-750 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-200 mb-2">What's Next?</h3>
                <p className="text-slate-400">
                  In the next step, you'll select ingredients from your raw materials database 
                  and specify their percentages. The system will automatically calculate costs 
                  based on your material pricing.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Ingredients */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Add Ingredient Section */}
              <div className="border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-200 mb-4">Add Ingredients</h3>
                
                {/* Material Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={materialSearchTerm}
                    onChange={(e) => setMaterialSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search raw materials..."
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
                    <div className="max-h-40 overflow-y-auto">
                      {filteredMaterials.slice(0, 5).map((material) => (
                        <button
                          key={material.id}
                          onClick={() => addIngredient(material)}
                          className="w-full p-3 text-left hover:bg-slate-700 border-b border-slate-600 last:border-b-0 transition-colors"
                          disabled={isAddingWithAI}
                        >
                          <div className="font-medium text-slate-200">{material.materialName}</div>
                          <div className="text-sm text-slate-400">
                            {material.supplierName} • ${material.supplierCost ? material.supplierCost.toFixed(2) : '0.00'}/unit • {material.casNumber}
                          </div>
                        </button>
                      ))}
                      
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
              </div>

              {/* Current Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-200">Formula Composition</h3>
                  <div className="text-sm">
                    <span className={`${Math.abs(calculations.totalPercentage - 100) < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                      Total: {calculations.totalPercentage.toFixed(1)}%
                    </span>
                    <span className="text-slate-400 ml-4">
                      Cost: ${calculations.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {errors.ingredients && (
                  <p className="text-red-400 text-sm mb-4 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.ingredients}
                  </p>
                )}

                {errors.percentageTotal && (
                  <p className="text-red-400 text-sm mb-4 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.percentageTotal}
                  </p>
                )}

                {formulaData.ingredients.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No ingredients added yet</p>
                    <p className="text-sm">Search and select materials above to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formulaData.ingredients.map((ingredient, index) => (
                      <div key={ingredient.id} className="bg-slate-750 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-slate-200">{ingredient.name}</h4>
                            <p className="text-sm text-slate-400">
                              {ingredient.supplierName} • {ingredient.casNumber} • ${ingredient.cost}/unit
                            </p>
                          </div>
                          <button
                            onClick={() => removeIngredient(ingredient.id)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label className="block text-xs text-slate-400 mb-1">Percentage</label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={ingredient.percentage}
                                onChange={(e) => updateIngredient(ingredient.id, 'percentage', e.target.value)}
                                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[`ingredient_${index}_percentage`] ? 'border-red-500' : 'border-slate-600'
                                }`}
                                placeholder="0.0"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                            </div>
                            {errors[`ingredient_${index}_percentage`] && (
                              <p className="text-red-400 text-xs mt-1">{errors[`ingredient_${index}_percentage`]}</p>
                            )}
                          </div>
                          
                          <div className="w-24">
                            <label className="block text-xs text-slate-400 mb-1">Cost Impact</label>
                            <div className="px-3 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm">
                              ${((parseFloat(ingredient.percentage) || 0) / 100 * parseFloat(ingredient.cost)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {formulaData.ingredients.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-300 mb-2">Formula Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Total Percentage:</span>
                      <div className={`font-medium ${Math.abs(calculations.totalPercentage - 100) < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {calculations.totalPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Cost:</span>
                      <div className="font-medium text-slate-200">${calculations.totalCost.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Profit Margin (Drum):</span>
                      <div className="font-medium text-slate-200">
                        {formulaData.targetDrumPrice ? 
                          `${(((parseFloat(formulaData.targetDrumPrice) - calculations.totalCost) / parseFloat(formulaData.targetDrumPrice)) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                onClick={prevStep}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>
            
            {currentStep < 2 ? (
              <Button
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="flex items-center space-x-2"
                disabled={Object.keys(errors).length > 0 || Math.abs(calculations.totalPercentage - 100) > 0.1}
              >
                <Check className="h-4 w-4" />
                <span>Save Formula</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFormulaModal; 