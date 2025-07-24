import { useState } from 'react';

/**
 * useFormState - A reusable hook for managing form state, input changes, and reset logic.
 * @param {Object} initialState - The initial state of the form.
 * @param {Function} [validate] - Optional validation function. Receives formData, returns errors object.
 * @returns {Object} - { formData, setFormData, handleInputChange, resetForm, errors, validateForm }
 */
export default function useFormState(initialState, validate) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Generic input change handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  // Validate form (if validate function provided)
  const validateForm = () => {
    if (typeof validate === 'function') {
      const validationErrors = validate(formData);
      setErrors(validationErrors || {});
      return Object.keys(validationErrors || {}).length === 0;
    }
    return true;
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm,
    errors,
    validateForm,
    setErrors,
  };
} 