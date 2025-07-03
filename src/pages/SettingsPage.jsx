import React from 'react';
import { ArrowLeft, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, changeTheme, isTransitioning } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      name: 'Light Mode',
      icon: Sun,
      description: 'Light theme with bright colors',
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark',
      name: 'Dark Mode', 
      icon: Moon,
      description: 'Dark theme with muted colors',
      preview: 'bg-slate-800 border-slate-600'
    },
    {
      id: 'system',
      name: 'System',
      icon: Monitor,
      description: 'Follow system preference',
      preview: 'bg-gradient-to-r from-white to-slate-800 border-slate-400'
    }
  ];

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Theme Settings Section */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-2">Appearance</h2>
              <p className="text-slate-400">Customize how the application looks and feels</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-4">Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((themeOption) => {
                    const IconComponent = themeOption.icon;
                    const isSelected = theme === themeOption.id;
                    
                    return (
                      <button
                        key={themeOption.id}
                        onClick={() => handleThemeChange(themeOption.id)}
                        disabled={isTransitioning}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                        }`}
                      >
                        {/* Preview Box */}
                        <div className={`w-full h-20 rounded-md mb-3 border-2 ${themeOption.preview} transition-all duration-300`}>
                          <div className="p-2 h-full flex items-center justify-center">
                            <IconComponent className={`h-6 w-6 ${
                              themeOption.id === 'light' ? 'text-gray-600' : 
                              themeOption.id === 'dark' ? 'text-slate-300' : 
                              'text-slate-500'
                            }`} />
                          </div>
                        </div>
                        
                        {/* Theme Info */}
                        <div className="text-left">
                          <div className="flex items-center space-x-2 mb-1">
                            <IconComponent className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-200">{themeOption.name}</span>
                            {isSelected && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{themeOption.description}</p>
                        </div>

                        {/* Selection Ring */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-lg bg-blue-500/5 animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Theme Info */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  <span>Current theme: </span>
                  <span className="text-slate-200 font-medium">
                    {themeOptions.find(t => t.id === theme)?.name}
                  </span>
                  {isTransitioning && (
                    <span className="ml-2 text-blue-400 animate-pulse">
                      (Applying changes...)
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-slate-500">
                  Changes apply automatically
                </div>
              </div>
            </div>
          </Card>

          {/* Future Settings Sections */}
          <Card className="p-6 opacity-50">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-100 mb-2">General Settings</h2>
              <p className="text-slate-400">Coming soon...</p>
            </div>
          </Card>

          <Card className="p-6 opacity-50">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-100 mb-2">Account Settings</h2>
              <p className="text-slate-400">Coming soon...</p>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage; 