import React, { useState, useRef } from 'react';
import { FolderOpen, FlaskConical, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';

const EmployeeDashboard = ({ userData }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRefs = useRef({});
  const navigate = useNavigate();

  const handleMouseMove = (e, cardId) => {
    if (!cardRefs.current[cardId]) return;
    
    const rect = cardRefs.current[cardId].getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };



  const allApplications = [
    {
      id: 1,
      title: 'Formulas',
      icon: FolderOpen,
      glowColor: 'rgba(59, 130, 246, 0.3)', // Blue
      iconBgColor: 'bg-blue-900',
      iconColor: 'text-blue-400',
      borderColor: 'hover:border-blue-500',
      appKey: 'formulas'
    },
    {
      id: 2,
      title: 'Raw Materials',
      icon: FlaskConical,
      glowColor: 'rgba(249, 115, 22, 0.3)', // Orange
      iconBgColor: 'bg-orange-900',
      iconColor: 'text-orange-400',
      borderColor: 'hover:border-orange-500',
      appKey: 'raw-materials'
    },
    {
      id: 3,
      title: 'Suppliers',
      icon: Users,
      glowColor: 'rgba(217, 70, 239, 0.3)', // Magenta
      iconBgColor: 'bg-fuchsia-900',
      iconColor: 'text-fuchsia-400',
      borderColor: 'hover:border-fuchsia-500',
      appKey: 'suppliers'
    }
  ];

  // Filter applications based on user's access
  const applications = userData && userData.app_access && userData.app_access.length > 0
    ? allApplications.filter(app => userData.app_access.includes(app.appKey))
    : [];

  // Get dynamic grid classes based on number of accessible apps
  const getGridClasses = (appCount) => {
    if (appCount === 1) {
      return "flex justify-center gap-6"; // Single app centered
    } else if (appCount === 2) {
      return "flex justify-center gap-6 flex-wrap"; // Two apps centered with fixed width
    } else {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"; // Three or more apps normal grid
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="grid grid-cols-3 gap-1 p-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-slate-400 rounded-sm"></div>
            ))}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
            {userData && (
              <p className="text-slate-400 text-sm mt-1">
                Welcome back, {userData.first_name || userData.email?.split('@')[0] || 'User'}!
              </p>
            )}
          </div>
        </div>

      </div>



      {/* Applications Grid */}
      <div className={getGridClasses(applications.length)}>
        {applications.map((app) => {
          const IconComponent = app.icon;
          return (
            <div
              key={app.id}
              ref={(el) => (cardRefs.current[app.id] = el)}
              onMouseEnter={() => setHoveredCard(app.id)}
              onMouseLeave={() => {
                setHoveredCard(null);
                setMousePosition({ x: 50, y: 50 }); // Reset to center
              }}
              onMouseMove={(e) => handleMouseMove(e, app.id)}
              className={`relative cursor-pointer ${applications.length <= 2 ? 'w-80' : ''}`}
              style={{
                transform: hoveredCard === app.id ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                transformOrigin: hoveredCard === app.id 
                  ? `${mousePosition.x}% ${mousePosition.y}%` 
                  : 'center center',
                transition: hoveredCard === app.id ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
              }}
              onClick={() => {
                if (app.appKey === 'formulas') {
                  navigate('/formulas');
                } else if (app.appKey === 'raw-materials') {
                  navigate('/raw-materials');
                } else if (app.appKey === 'suppliers') {
                  navigate('/suppliers');
                }
              }}
            >
              <Card className={`p-12 hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden border-2 border-transparent ${app.borderColor}`}>
                {hoveredCard === app.id && (
                  <div 
                    className="absolute inset-0 opacity-20 -z-0"
                    style={{
                      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${app.glowColor}, transparent 70%)`
                    }}
                  />
                )}
                <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                  {/* Icon Circle */}
                  <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center transition-all duration-300"
                       style={{
                         transform: hoveredCard === app.id ? 'scale(1.1)' : 'scale(1)',
                         transition: hoveredCard === app.id ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
                       }}>
                    <div className={`w-20 h-20 ${app.iconBgColor} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`w-10 h-10 ${app.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-medium text-slate-100">{app.title}</h3>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeDashboard; 