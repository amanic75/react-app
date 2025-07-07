import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isSigningIn } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    department: '',
    role: 'Employee'
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Get redirect path from state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Sign up specific validations
    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!validateForm()) return;

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setErrors({ submit: error.message });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department,
          role: formData.role
        });
        
        if (error) {
          setErrors({ submit: error.message });
        } else {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          // Switch to login mode after successful signup
          setTimeout(() => {
            setIsLogin(true);
            setSuccess('');
          }, 3000);
        }
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      department: '',
      role: 'Employee'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/chemformation-logo.png"
            alt="Chemformation"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white">Capacity Chemicals</h1>
          <p className="text-slate-400 mt-2">Chemical Management System</p>
        </div>

        {/* Auth Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-400 text-center mt-2">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Join our team and get started'
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-400" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-400 text-sm">{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sign up fields */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="pl-10"
                      placeholder="e.g., R&D, Production, Quality"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Employee">Employee</option>
                    <option value="NSight Admin">NSight Admin</option>
                    <option value="Capacity Admin">Capacity Admin</option>
                  </select>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your.email@company.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign up only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 flex items-center justify-center space-x-2"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
              )}
            </Button>
          </form>

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Demo Instructions */}
          {isLogin && (
            <div className="mt-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
              <h3 className="text-sm font-medium text-slate-200 mb-2">🎮 Demo Accounts</h3>
              <p className="text-xs text-slate-400 mb-3">
                Use these demo accounts to test different dashboard types:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-600/50 rounded">
                  <p className="text-blue-300 font-medium">capacity.admin@capacitychemicals.com</p>
                  <p className="text-slate-400">password123 • Capacity Admin Dashboard</p>
                </div>
                <div className="p-2 bg-slate-600/50 rounded">
                  <p className="text-green-300 font-medium">nsight.admin@capacitychemicals.com</p>
                  <p className="text-slate-400">password123 • Nsight Admin Dashboard</p>
                </div>
                <div className="p-2 bg-slate-600/50 rounded">
                  <p className="text-yellow-300 font-medium">employee@capacitychemicals.com</p>
                  <p className="text-slate-400">password123 • Employee Dashboard</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Or create a new account by clicking "Sign up" above.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>© 2024 Chemformation. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 