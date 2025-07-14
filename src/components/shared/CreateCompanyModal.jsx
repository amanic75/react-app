import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  Database,
  Shield,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  Settings,
  Mail,
  Phone,
  User,
  UserPlus
} from 'lucide-react';
import Button from '../ui/Button';

const CreateCompanyModal = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Company Information
    companyName: '',
    industry: 'Chemical Manufacturing',
    companySize: '1-50',
    website: '',
    country: 'United States',
    timezone: 'America/New_York',
    
    // Step 2: Primary Contact
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: 'CEO',
    
    // Step 3: Technical Configuration
    databaseIsolation: 'schema', // 'schema' or 'database'
    dataRetention: '7-years',
    backupFrequency: 'daily',
    apiRateLimit: '1000', // requests per hour
    
    // Step 4: Security & Compliance
    dataResidency: 'us-east',
    complianceStandards: ['ISO9001'],
    ssoEnabled: false,
    twoFactorRequired: false,
    
    // Step 5: Subscription & Billing
    subscriptionTier: 'professional',
    billingContact: '',
    billingEmail: '',
    paymentMethod: 'invoice',
    
    // Step 6: Initial Setup
    adminUserName: '',
    adminUserEmail: '',
    defaultDepartments: ['Production', 'Quality Control', 'Research'],
    initialApps: ['formulas', 'raw-materials']
  });

  const totalSteps = 6;

  // Industry options
  const industryOptions = [
    'Chemical Manufacturing',
    'Pharmaceuticals',
    'Cosmetics & Personal Care',
    'Food & Beverage',
    'Materials Science',
    'Petrochemicals',
    'Specialty Chemicals',
    'Other'
  ];

  // Company size options
  const companySizeOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  // Compliance standards
  const complianceOptions = [
    { id: 'ISO9001', label: 'ISO 9001 (Quality Management)' },
    { id: 'ISO14001', label: 'ISO 14001 (Environmental)' },
    { id: 'OSHA', label: 'OSHA Safety Standards' },
    { id: 'FDA', label: 'FDA Compliance' },
    { id: 'REACH', label: 'REACH Regulation (EU)' },
    { id: 'GMP', label: 'Good Manufacturing Practice' }
  ];

  // Subscription tiers
  const subscriptionTiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$99/month',
      features: ['Up to 10 users', 'Basic apps', 'Email support']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$299/month',
      features: ['Up to 50 users', 'All apps', 'Priority support', 'Advanced analytics']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited users', 'Custom apps', 'Dedicated support', 'SSO integration']
    }
  ];

  // Available apps
  const availableApps = [
    { id: 'formulas', name: 'Formulas Management', description: 'Chemical formula creation and management' },
    { id: 'raw-materials', name: 'Raw Materials', description: 'Inventory and supplier management' },
    { id: 'suppliers', name: 'Suppliers', description: 'Supplier relationship management' },
    { id: 'analytics', name: 'Analytics', description: 'Advanced reporting and insights' },
    { id: 'compliance', name: 'Compliance', description: 'Safety and regulatory compliance' },
    { id: 'quality', name: 'Quality Control', description: 'Quality assurance workflows' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    // Validate required fields
    const requiredFields = {
      1: ['companyName', 'industry'],
      2: ['contactName', 'contactEmail'],
      3: [], // All have defaults
      4: [], // All have defaults
      5: ['billingContact', 'billingEmail'],
      6: ['adminUserName', 'adminUserEmail']
    };

    // Check current step requirements
    const required = requiredFields[currentStep] || [];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      alert(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }

    if (currentStep === totalSteps) {
      // Final save
      const newCompany = {
        id: Date.now(),
        ...formData,
        status: 'Active',
        createdAt: new Date().toISOString(),
        setupComplete: true
      };
      
      onSave(newCompany);
      handleClose();
    } else {
      nextStep();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      companyName: '',
      industry: 'Chemical Manufacturing',
      companySize: '1-50',
      website: '',
      country: 'United States',
      timezone: 'America/New_York',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactTitle: 'CEO',
      databaseIsolation: 'schema',
      dataRetention: '7-years',
      backupFrequency: 'daily',
      apiRateLimit: '1000',
      dataResidency: 'us-east',
      complianceStandards: ['ISO9001'],
      ssoEnabled: false,
      twoFactorRequired: false,
      subscriptionTier: 'professional',
      billingContact: '',
      billingEmail: '',
      paymentMethod: 'invoice',
      adminUserName: '',
      adminUserEmail: '',
      defaultDepartments: ['Production', 'Quality Control', 'Research'],
      initialApps: ['formulas', 'raw-materials']
    });
    onClose();
  };

  if (!isOpen) return null;

  // Step rendering functions
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Company Information</h3>
        <p className="text-slate-400">Basic details about the new client company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter company name"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {industryOptions.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Company Size
          </label>
          <select
            value={formData.companySize}
            onChange={(e) => handleInputChange('companySize', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {companySizeOptions.map(size => (
              <option key={size} value={size}>{size} employees</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://company.com"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="Japan">Japan</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/New_York">Eastern Time (UTC-5)</option>
            <option value="America/Chicago">Central Time (UTC-6)</option>
            <option value="America/Denver">Mountain Time (UTC-7)</option>
            <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="Europe/Berlin">Berlin (UTC+1)</option>
            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Primary Contact</h3>
        <p className="text-slate-400">Main point of contact for this company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Contact Name *
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            placeholder="Full name"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Title/Position
          </label>
          <input
            type="text"
            value={formData.contactTitle}
            onChange={(e) => handleInputChange('contactTitle', e.target.value)}
            placeholder="CEO, CTO, etc."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            placeholder="contact@company.com"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Database className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Technical Configuration</h3>
        <p className="text-slate-400">Database and API settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Database Isolation
          </label>
          <select
            value={formData.databaseIsolation}
            onChange={(e) => handleInputChange('databaseIsolation', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="schema">Schema-based (Recommended)</option>
            <option value="database">Separate Database</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">Schema-based is more cost-effective</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Data Retention
          </label>
          <select
            value={formData.dataRetention}
            onChange={(e) => handleInputChange('dataRetention', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1-year">1 Year</option>
            <option value="3-years">3 Years</option>
            <option value="7-years">7 Years (Recommended)</option>
            <option value="indefinite">Indefinite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Backup Frequency
          </label>
          <select
            value={formData.backupFrequency}
            onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily (Recommended)</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            API Rate Limit (per hour)
          </label>
          <select
            value={formData.apiRateLimit}
            onChange={(e) => handleInputChange('apiRateLimit', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="500">500 requests/hour</option>
            <option value="1000">1,000 requests/hour</option>
            <option value="5000">5,000 requests/hour</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Security & Compliance</h3>
        <p className="text-slate-400">Security settings and compliance requirements</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Data Residency
          </label>
          <select
            value={formData.dataResidency}
            onChange={(e) => handleInputChange('dataResidency', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="us-east">US East (Virginia)</option>
            <option value="us-west">US West (California)</option>
            <option value="eu-central">EU Central (Frankfurt)</option>
            <option value="asia-pacific">Asia Pacific (Tokyo)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-3">
            Compliance Standards
          </label>
          <div className="space-y-2">
            {complianceOptions.map(option => (
              <label key={option.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.complianceStandards.includes(option.id)}
                  onChange={() => toggleArrayField('complianceStandards', option.id)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-200">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.ssoEnabled}
              onChange={(e) => handleInputChange('ssoEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-slate-200 font-medium">Enable SSO</span>
              <p className="text-xs text-slate-400">Single Sign-On integration</p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.twoFactorRequired}
              onChange={(e) => handleInputChange('twoFactorRequired', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-slate-200 font-medium">Require 2FA</span>
              <p className="text-xs text-slate-400">Two-factor authentication</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CreditCard className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Subscription & Billing</h3>
        <p className="text-slate-400">Choose plan and billing details</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-3">
            Subscription Tier
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionTiers.map(tier => (
              <button
                key={tier.id}
                onClick={() => handleInputChange('subscriptionTier', tier.id)}
                className={`p-4 rounded-lg border transition-all ${
                  formData.subscriptionTier === tier.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:bg-slate-600/50'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-slate-100">{tier.name}</h4>
                  <p className="text-blue-400 font-bold">{tier.price}</p>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Billing Contact *
            </label>
            <input
              type="text"
              value={formData.billingContact}
              onChange={(e) => handleInputChange('billingContact', e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Billing Email *
            </label>
            <input
              type="email"
              value={formData.billingEmail}
              onChange={(e) => handleInputChange('billingEmail', e.target.value)}
              placeholder="billing@company.com"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="invoice">Invoice (NET 30)</option>
            <option value="credit-card">Credit Card</option>
            <option value="ach">ACH Transfer</option>
            <option value="wire">Wire Transfer</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <UserPlus className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Initial Setup</h3>
        <p className="text-slate-400">Create admin user and configure initial apps</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Admin User Name *
            </label>
            <input
              type="text"
              value={formData.adminUserName}
              onChange={(e) => handleInputChange('adminUserName', e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Admin User Email *
            </label>
            <input
              type="email"
              value={formData.adminUserEmail}
              onChange={(e) => handleInputChange('adminUserEmail', e.target.value)}
              placeholder="admin@company.com"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-3">
            Default Departments
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.defaultDepartments.map((dept, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center space-x-1"
              >
                <span>{dept}</span>
                <button
                  onClick={() => {
                    const newDepts = formData.defaultDepartments.filter((_, i) => i !== index);
                    handleInputChange('defaultDepartments', newDepts);
                  }}
                  className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add department..."
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleInputChange('defaultDepartments', [...formData.defaultDepartments, e.target.value.trim()]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-3">
            Initial Applications
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableApps.map(app => {
              const isSelected = formData.initialApps.includes(app.id);
              return (
                <button
                  key={app.id}
                  onClick={() => toggleArrayField('initialApps', app.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-100">{app.name}</h4>
                      <p className="text-xs text-slate-400">{app.description}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-blue-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 border border-slate-700 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-100">Create New Company</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Step {currentStep} of {totalSteps}</span>
              <div className="flex space-x-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i + 1 <= currentStep ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <Button
            variant="secondary"
            onClick={currentStep === 1 ? handleClose : prevStep}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            {currentStep === 1 ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            {currentStep === totalSteps ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Company
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCompanyModal; 