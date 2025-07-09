import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive,
  Wifi,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const SystemHealthPage = () => {
  const { userProfile, loading, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [infrastructureMetrics, setInfrastructureMetrics] = useState({
    serverStatus: { uptime: '--', responseTime: '--', status: 'loading' },
    database: { queryTime: '--', connections: 0, maxConnections: 100, slowQueries: 0, status: 'loading' },
    resources: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, status: 'loading' },
    network: { latency: '--', bandwidth: '--', status: 'loading' }
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Role-based access control - only Capacity Admin can access
  useEffect(() => {
    if (!loading && userProfile) {
      if (userProfile.role !== 'Capacity Admin') {
        console.log(`🚫 Access denied to system health for role: ${userProfile.role}, redirecting to dashboard`);
        const dashboardRoute = getDashboardRoute();
        navigate(dashboardRoute, { replace: true });
      }
    }
  }, [userProfile, loading, navigate, getDashboardRoute]);

  // Fetch metrics on component mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // If user doesn't have access, don't render anything
  if (userProfile && userProfile.role !== 'Capacity Admin') {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch real metrics from API endpoints (optimized with staggered requests)
  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      // Fetch critical metrics first (server and database)
      const [serverRes, databaseRes] = await Promise.all([
        fetch('http://localhost:3001/api/system/server-status'),
        fetch('http://localhost:3001/api/system/database-health')
      ]);

      const [serverData, databaseData] = await Promise.all([
        serverRes.json(),
        databaseRes.json()
      ]);

      // Update UI with critical metrics immediately
      setInfrastructureMetrics(prev => ({
        ...prev,
        serverStatus: {
          uptime: serverData.uptime,
          responseTime: serverData.responseTime,
          status: serverData.status,
          lastCheck: serverData.lastCheck,
          details: {
            actualUptimeSeconds: serverData.actualUptimeSeconds,
            actualUptimeFormatted: serverData.actualUptimeFormatted
          }
        },
        database: {
          queryTime: databaseData.queryTime,
          connections: databaseData.connections,
          maxConnections: databaseData.maxConnections,
          slowQueries: databaseData.slowQueries,
          status: databaseData.status,
          details: {
            realUserCount: databaseData.realUserCount,
            hasQueryError: databaseData.hasQueryError,
            errorMessage: databaseData.errorMessage
          }
        }
      }));

      // Then fetch secondary metrics (can be cached)
      const [resourcesRes, networkRes] = await Promise.all([
        fetch('http://localhost:3001/api/system/resources'),
        fetch('http://localhost:3001/api/system/network')
      ]);

      const [resourcesData, networkData] = await Promise.all([
        resourcesRes.json(),
        networkRes.json()
      ]);

      // Update with all metrics
      setInfrastructureMetrics(prev => ({
        ...prev,
        resources: {
          cpuUsage: resourcesData.cpuUsage,
          memoryUsage: resourcesData.memoryUsage,
          diskUsage: resourcesData.diskUsage,
          status: resourcesData.status,
          details: resourcesData.details
        },
        network: {
          latency: networkData.latency,
          bandwidth: networkData.bandwidth,
          status: networkData.status,
          details: networkData.details
        }
      }));
      
      setRefreshTime(new Date());
    } catch (error) {
      console.error('❌ Failed to fetch system metrics:', error);
      // Set error status for all metrics
      setInfrastructureMetrics(prev => ({
        serverStatus: { ...prev.serverStatus, status: 'error' },
        database: { ...prev.database, status: 'error' },
        resources: { ...prev.resources, status: 'error' },
        network: { ...prev.network, status: 'error' }
      }));
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'normal':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Activity className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-100">System Health</h1>
              <p className="text-slate-400">Infrastructure & Performance Monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchMetrics}
              disabled={isLoadingMetrics}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
              title="Refresh metrics"
            >
              <TrendingUp className={`h-4 w-4 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
              <span>{isLoadingMetrics ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            {isLoadingMetrics && (
              <div className="flex items-center space-x-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <span className="text-sm">Fetching real data...</span>
              </div>
            )}
            <div className="text-sm text-slate-400">
              Last updated: {refreshTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Infrastructure & Performance Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-slate-100">Infrastructure & Performance</h2>
            </div>
            {infrastructureMetrics.serverStatus.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to connect to monitoring endpoints</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Server Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-slate-100">Server Status</h3>
                </div>
                {getStatusIcon(infrastructureMetrics.serverStatus.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.serverStatus.uptime}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Response Time</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.serverStatus.responseTime}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-semibold capitalize ${getStatusColor(infrastructureMetrics.serverStatus.status)}`}>
                      {infrastructureMetrics.serverStatus.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Database Health */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-slate-100">Database Health</h3>
                </div>
                {getStatusIcon(infrastructureMetrics.database.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Query Time</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.database.queryTime}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Connections</span>
                    <span className="text-slate-100 font-mono">
                      {infrastructureMetrics.database.connections}/{infrastructureMetrics.database.maxConnections}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(infrastructureMetrics.database.connections / infrastructureMetrics.database.maxConnections) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Slow Queries</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.database.slowQueries}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Resource Usage */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-orange-400" />
                  <h3 className="font-semibold text-slate-100">Resource Usage</h3>
                </div>
                {getStatusIcon(infrastructureMetrics.resources.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">CPU</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.resources.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${infrastructureMetrics.resources.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Memory</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.resources.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${infrastructureMetrics.resources.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Disk</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.resources.diskUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${infrastructureMetrics.resources.diskUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Network Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-slate-100">Network</h3>
                </div>
                {getStatusIcon(infrastructureMetrics.network.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Latency</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.network.latency}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Bandwidth</span>
                    <span className="text-slate-100 font-mono">{infrastructureMetrics.network.bandwidth}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: infrastructureMetrics.network.bandwidth }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-semibold capitalize ${getStatusColor(infrastructureMetrics.network.status)}`}>
                      {infrastructureMetrics.network.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemHealthPage; 