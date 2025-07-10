import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  HardDrive,
  Zap,
  AlertCircle,
  XCircle,
  TrendingDown,
  FileText,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';

const SystemHealthPage = () => {
  const { userProfile, loading, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [infrastructureMetrics, setInfrastructureMetrics] = useState({
    serverStatus: { uptime: '--', responseTime: '--', status: 'loading' },
    database: { queryTime: '--', connections: 'Loading...', maxConnections: 'Loading...', slowQueries: '0', status: 'loading' },
    network: { latency: 'Testing...', status: 'loading' }
  });
  const [usageAnalytics, setUsageAnalytics] = useState({
    activeUsers: { current: '--', peakToday: '--', peakHourLabel: 'Loading...', recentlyActive: '--' },
    apiCallVolume: { requestsPerMinute: '--', requestsPerHour: '--', totalRequests: '--', mostUsedEndpoints: [] },
    databaseOperations: { readOperations: '--', writeOperations: '--', queryCount: '--', totalUsers: '--' },
    storageUsage: { databaseSize: 'Loading...', tableCount: 'Loading...', indexSize: 'Loading...', growthRate: 'Loading...' },
    status: 'loading'
  });
  const [errorMonitoring, setErrorMonitoring] = useState({
    errorRates: { 
      http4xx: '--', 
      http5xx: '--', 
      errorTrend: 'loading', 
      totalErrorsToday: '--' 
    },
    failedOperations: { 
      loginFailures: '--', 
      databaseTimeouts: '--', 
      authenticationErrors: '--', 
      apiErrors: '--' 
    },
    systemAlerts: { 
      criticalAlerts: '--', 
      warningAlerts: '--', 
      lastCriticalAlert: 'Loading...', 
      alertStatus: 'loading' 
    },
    recentErrors: [],
    status: 'loading'
  });
  const [supabaseMetrics, setSupabaseMetrics] = useState({
    apiHealth: {
      responseTime: '--',
      rateLimits: '--',
      status: 'loading',
      diagnostics: null
    },
    databaseConnections: {
      activeConnections: '--',
      connectionPoolStatus: '--',
      poolHealth: 'loading',
      diagnostics: null
    },
    rowLevelSecurity: {
      policyPerformance: '--',
      accessPatterns: '--',
      rlsStatus: 'loading',
      diagnostics: null
    },
    status: 'loading'
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState({
    apiHealth: false,
    databaseConnections: false,
    rowLevelSecurity: false
  });

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

  // Track user activity and fetch metrics on component mount
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

  // Get environment-aware API base URL
  const getApiBaseUrl = () => {
    // In development, use local Express server
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      return 'http://localhost:3001/api/system';
    }
    // In production, use Vercel serverless functions
    return '/api/system';
  };



  // Fetch real metrics from API endpoints (optimized with staggered requests)
  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);
    const baseUrl = getApiBaseUrl();
    
    try {
      // Fetch critical metrics first (server and database)
      const [serverRes, databaseRes] = await Promise.all([
        fetch(`${baseUrl}/server-status`),
        fetch(`${baseUrl}/database-health`)
      ]);

      const [serverData, databaseData] = await Promise.all([
        serverRes.json(),
        databaseRes.json()
      ]);

      // Update UI with critical metrics immediately - adapt data structure for production
      setInfrastructureMetrics(prev => ({
        ...prev,
        serverStatus: {
          uptime: serverData.uptime,
          responseTime: serverData.responseTime,
          status: serverData.status,
          lastCheck: serverData.lastCheck || serverData.timestamp,
          details: {
            actualUptimeSeconds: serverData.actualUptimeSeconds || 'N/A',
            actualUptimeFormatted: serverData.actualUptimeFormatted || 'Serverless Function'
          }
        },
        database: {
          queryTime: databaseData.queryTime || databaseData.averageResponseTime,
          connections: databaseData.connections || 'Managed',
          maxConnections: databaseData.maxConnections || 'Auto-scaling',
          slowQueries: databaseData.slowQueries || '0',
          status: databaseData.status || databaseData.overallHealth,
          details: {
            realUserCount: databaseData.realUserCount || 'N/A',
            hasQueryError: databaseData.hasQueryError || false,
            errorMessage: databaseData.errorMessage || null
          }
        }
      }));

      // Fetch network metrics (now available in both development and production)
      try {
        const networkRes = await fetch(`${baseUrl}/network`);
        const networkData = await networkRes.json();

        setInfrastructureMetrics(prev => ({
          ...prev,
          network: {
            latency: networkData.latency,
            status: networkData.status
          }
        }));
      } catch (networkError) {
        console.error('❌ Failed to fetch network metrics:', networkError);
        setInfrastructureMetrics(prev => ({
          ...prev,
          network: { latency: 'unavailable', status: 'error' }
        }));
      }

      // Fetch usage analytics metrics
      try {
        const analyticsRes = await fetch(`${baseUrl}/usage-analytics`);
        const analyticsData = await analyticsRes.json();

        setUsageAnalytics({
          activeUsers: analyticsData.activeUsers,
          apiCallVolume: analyticsData.apiCallVolume,
          databaseOperations: analyticsData.databaseOperations,
          storageUsage: analyticsData.storageUsage,
          status: analyticsData.status || 'healthy'
        });
      } catch (analyticsError) {
        console.error('❌ Failed to fetch usage analytics:', analyticsError);
        setUsageAnalytics(prev => ({
          ...prev,
          status: 'error'
        }));
      }

      // Fetch error monitoring metrics
      try {
        const errorRes = await fetch(`${baseUrl}/error-monitoring`);
        const errorData = await errorRes.json();

        setErrorMonitoring({
          errorRates: errorData.errorRates,
          failedOperations: errorData.failedOperations,
          systemAlerts: errorData.systemAlerts,
          recentErrors: errorData.recentErrors,
          status: errorData.status || 'healthy'
        });
      } catch (errorMonitoringError) {
        console.error('❌ Failed to fetch error monitoring data:', errorMonitoringError);
        setErrorMonitoring(prev => ({
          ...prev,
          status: 'error'
        }));
      }

      // Fetch Supabase-specific metrics
      try {
        const supabaseRes = await fetch(`${baseUrl}/supabase-metrics`);
        const supabaseData = await supabaseRes.json();

        setSupabaseMetrics({
          apiHealth: supabaseData.apiHealth,
          databaseConnections: supabaseData.databaseConnections,
          rowLevelSecurity: supabaseData.rowLevelSecurity,
          status: supabaseData.status || 'healthy'
        });
      } catch (supabaseError) {
        console.error('❌ Failed to fetch Supabase metrics:', supabaseError);
        setSupabaseMetrics(prev => ({
          ...prev,
          status: 'error'
        }));
      }
      
      setRefreshTime(new Date());
    } catch (error) {
      console.error('❌ Failed to fetch system metrics:', error);
      // Set error status for server and database only (network handles its own fallback)
      setInfrastructureMetrics(prev => ({
        serverStatus: { ...prev.serverStatus, status: 'error' },
        database: { ...prev.database, status: 'error' },
        network: prev.network // Keep existing network data (may have fallback values)
      }));
      // Set error status for error monitoring
      setErrorMonitoring(prev => ({
        ...prev,
        status: 'error'
      }));
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-slate-400';
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'normal':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
      case 'error':
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <Activity className="h-5 w-5 text-slate-400" />;
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'critical':
      case 'error':
      case 'poor':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const toggleDiagnostics = (section) => {
    setDiagnosticsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const DiagnosticDetail = ({ title, diagnostics, sectionKey }) => {
    const isExpanded = diagnosticsExpanded[sectionKey];
    const isLoading = !diagnostics;
    
    return (
      <div className="mt-4 border-t border-slate-700 pt-4">
        <button
          onClick={() => !isLoading && toggleDiagnostics(sectionKey)}
          disabled={isLoading}
          className={`flex items-center space-x-2 text-sm transition-colors ${
            isLoading 
              ? 'text-slate-500 cursor-not-allowed' 
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <Info className="h-4 w-4" />
          <span>
            {isLoading ? 'Loading diagnostics...' : 'Diagnostic Details'}
          </span>
        </button>
        
        {isExpanded && !isLoading && (
          <div className="mt-3 space-y-3">
            <div className="text-xs text-slate-500">
              {diagnostics.totalTests && `${diagnostics.totalTests} tests performed`}
              {diagnostics.totalDbTests && `${diagnostics.totalDbTests} database tests performed`}
              {diagnostics.totalRlsTests && `${diagnostics.totalRlsTests} RLS tests performed`}
              {diagnostics.errorCount > 0 && ` • ${diagnostics.errorCount} errors`}
              {diagnostics.slowTestCount > 0 && ` • ${diagnostics.slowTestCount} slow tests`}
              {diagnostics.slowQueryCount > 0 && ` • ${diagnostics.slowQueryCount} slow queries`}
            </div>
            
            {diagnostics.issueType && diagnostics.issueType !== 'none' && (
              <div className="text-xs text-yellow-400">
                <span className="font-semibold">Issue Type:</span> {diagnostics.issueType}
              </div>
            )}
            
            {diagnostics.poolHealthReason && (
              <div className="text-xs text-slate-400">
                <span className="font-semibold">Pool Status:</span> {diagnostics.poolHealthReason}
              </div>
            )}
            
            {diagnostics.rlsStatusReason && (
              <div className="text-xs text-slate-400">
                <span className="font-semibold">RLS Status:</span> {diagnostics.rlsStatusReason}
              </div>
            )}
            
            {diagnostics.individualTests && (
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">Individual Test Results:</div>
                <div className="space-y-1">
                  {diagnostics.individualTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{test.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-400">{test.responseTime}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          test.status === 'healthy' ? 'bg-green-900 text-green-300' :
                          test.status === 'slow' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {diagnostics.roleDistribution && Object.keys(diagnostics.roleDistribution).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">Role Distribution:</div>
                <div className="space-y-1">
                  {Object.entries(diagnostics.roleDistribution).map(([role, count]) => (
                    <div key={role} className="flex justify-between text-xs">
                      <span className="text-slate-500">{role}</span>
                      <span className="text-slate-400">{count} users</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Connections</span>
                    <span className="text-slate-100 font-mono">Managed by Platform</span>
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



            {/* Simple Network Performance */}
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
                    <span className="text-slate-100 font-mono text-lg font-bold">{infrastructureMetrics.network.latency}</span>
                  </div>
                  {/* Simple status bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        infrastructureMetrics.network.status === 'good' ? 'bg-green-400' :
                        infrastructureMetrics.network.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ 
                        width: infrastructureMetrics.network.status === 'good' ? '25%' :
                               infrastructureMetrics.network.status === 'warning' ? '60%' : '90%'
                      }}
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

        {/* Usage Analytics Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-slate-100">Usage Analytics</h2>
            </div>
            {usageAnalytics.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to fetch usage analytics</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Users */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-slate-100">Active Users</h3>
                </div>
                {getStatusIcon(usageAnalytics.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Current Online</span>
                    <span className="text-slate-100 font-mono text-lg font-bold">{usageAnalytics.activeUsers.current}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Peak Today</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.activeUsers.peakToday}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Peak Hour</span>
                    <span className="text-slate-100 font-mono text-xs">{usageAnalytics.activeUsers.peakHourLabel}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Recently Active</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.activeUsers.recentlyActive}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* API Call Volume */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-semibold text-slate-100">API Calls</h3>
                </div>
                {getStatusIcon(usageAnalytics.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Per Minute</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.apiCallVolume.requestsPerMinute}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Per Hour</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.apiCallVolume.requestsPerHour}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Today</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.apiCallVolume.totalRequests}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Most Used:</div>
                  <div className="text-xs text-slate-300 font-mono truncate">
                    {usageAnalytics.apiCallVolume.mostUsedEndpoints.length > 0 
                      ? usageAnalytics.apiCallVolume.mostUsedEndpoints[0]?.endpoint?.split('/').pop() || 'N/A'
                      : 'Loading...'
                    }
                  </div>
                </div>
              </div>
            </Card>

            {/* Database Operations */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-slate-100">DB Operations</h3>
                </div>
                {getStatusIcon(usageAnalytics.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Read Ops</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations.readOperations}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Write Ops</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations.writeOperations}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Queries</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations.queryCount}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Users</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations.totalUsers}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Storage Usage */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5 text-orange-400" />
                  <h3 className="font-semibold text-slate-100">Storage</h3>
                </div>
                {getStatusIcon(usageAnalytics.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Database Size</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.storageUsage.databaseSize}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Tables</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.storageUsage.tableCount}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Index Size</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.storageUsage.indexSize}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Growth Rate</span>
                    <span className="text-green-400 font-mono text-xs">{usageAnalytics.storageUsage.growthRate}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Error Monitoring Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-semibold text-slate-100">Error Monitoring</h2>
            </div>
            {errorMonitoring.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to fetch error monitoring data</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Error Rates */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                  <h3 className="font-semibold text-slate-100">Error Rates</h3>
                </div>
                {getStatusIcon(errorMonitoring.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">4xx Errors</span>
                    <span className="text-slate-100 font-mono">{errorMonitoring.errorRates.http4xx}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">5xx Errors</span>
                    <span className="text-slate-100 font-mono">{errorMonitoring.errorRates.http5xx}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Today</span>
                    <span className="text-slate-100 font-mono">{errorMonitoring.errorRates.totalErrorsToday}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Trend</span>
                    <span className={`font-mono text-xs capitalize ${
                      errorMonitoring.errorRates.errorTrend === 'improving' ? 'text-green-400' :
                      errorMonitoring.errorRates.errorTrend === 'stable' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {errorMonitoring.errorRates.errorTrend}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Failed Operations */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-orange-400" />
                  <h3 className="font-semibold text-slate-100">Failed Operations</h3>
                </div>
                {getStatusIcon(errorMonitoring.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Login Failures</span>
                    <span className="text-slate-100 font-mono">{errorMonitoring.failedOperations.loginFailures}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">DB Timeouts</span>
                    <span className="text-slate-100 font-mono">{errorMonitoring.failedOperations.databaseTimeouts}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Auth Errors</span>
                    <span className="text-slate-100 font-mono">{errorMonitoring.failedOperations.authenticationErrors}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">API Errors</span>
                    <span className="text-slate-100 font-mono">{errorMonitoring.failedOperations.apiErrors}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Alerts */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-semibold text-slate-100">System Alerts</h3>
                </div>
                {getStatusIcon(errorMonitoring.systemAlerts.alertStatus)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Critical</span>
                    <span className="text-red-400 font-mono font-bold">{errorMonitoring.systemAlerts.criticalAlerts}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Warnings</span>
                    <span className="text-yellow-400 font-mono">{errorMonitoring.systemAlerts.warningAlerts}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-semibold capitalize ${getStatusColor(errorMonitoring.systemAlerts.alertStatus)}`}>
                      {errorMonitoring.systemAlerts.alertStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Last Critical:</div>
                  <div className="text-xs text-slate-300 font-mono">
                    {errorMonitoring.systemAlerts.lastCriticalAlert}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Error Log */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-slate-100">Recent Error Log</h3>
                </div>
                {getStatusIcon(errorMonitoring.status)}
              </div>
              
              <div className="space-y-2">
                {errorMonitoring.recentErrors.length > 0 ? (
                  errorMonitoring.recentErrors.slice(0, 4).map((error, index) => (
                    <div key={index} className="border-l-2 border-red-400 pl-3 py-1">
                      <div className="text-xs text-red-400 font-mono">
                        {error.type}
                      </div>
                      <div className="text-xs text-slate-300 truncate">
                        {error.message}
                      </div>
                      <div className="text-xs text-slate-500">
                        {error.timestamp}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-green-400">No recent errors</div>
                    <div className="text-xs text-slate-400">System running smoothly</div>
                  </div>
                )}
                
                {errorMonitoring.recentErrors.length > 4 && (
                  <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-700">
                    +{errorMonitoring.recentErrors.length - 4} more errors
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Supabase Specific Metrics Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-slate-100">Supabase Specific Metrics</h2>
            </div>
            {supabaseMetrics.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to fetch Supabase metrics</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supabase API Health */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-slate-100">Supabase API Health</h3>
                </div>
                {getStatusIcon(supabaseMetrics.apiHealth.status)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Response Times</span>
                    <span className="text-slate-100 font-mono">{supabaseMetrics.apiHealth.responseTime}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Rate Limits</span>
                    <span className="text-slate-100 font-mono">{supabaseMetrics.apiHealth.rateLimits}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-semibold capitalize ${getStatusColor(supabaseMetrics.apiHealth.status)}`}>
                      {supabaseMetrics.apiHealth.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <DiagnosticDetail 
                title="API Health Diagnostics" 
                diagnostics={supabaseMetrics.apiHealth?.diagnostics} 
                sectionKey="apiHealth" 
              />
            </Card>

            {/* Database Connections */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-slate-100">Database Connections</h3>
                </div>
                {getStatusIcon(supabaseMetrics.databaseConnections.poolHealth)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Active Connections</span>
                    <span className="text-slate-100 font-mono">{supabaseMetrics.databaseConnections.activeConnections}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Connection Pool Status</span>
                    <span className="text-slate-100 font-mono">{supabaseMetrics.databaseConnections.connectionPoolStatus}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pool Health</span>
                    <span className={`font-semibold capitalize ${getStatusColor(supabaseMetrics.databaseConnections.poolHealth)}`}>
                      {supabaseMetrics.databaseConnections.poolHealth}
                    </span>
                  </div>
                </div>
              </div>
              
              <DiagnosticDetail 
                title="Database Connection Diagnostics" 
                diagnostics={supabaseMetrics.databaseConnections?.diagnostics} 
                sectionKey="databaseConnections" 
              />
            </Card>

            {/* Row Level Security */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <h3 className="font-semibold text-slate-100">Row Level Security</h3>
                </div>
                {getStatusIcon(supabaseMetrics.rowLevelSecurity.rlsStatus)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Policy Performance</span>
                    <span className="text-slate-100 font-mono">{supabaseMetrics.rowLevelSecurity.policyPerformance}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Access Patterns</span>
                    <span className="text-slate-100 font-mono">{supabaseMetrics.rowLevelSecurity.accessPatterns}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">RLS Status</span>
                    <span className={`font-semibold capitalize ${getStatusColor(supabaseMetrics.rowLevelSecurity.rlsStatus)}`}>
                      {supabaseMetrics.rowLevelSecurity.rlsStatus}
                    </span>
                  </div>
                </div>
              </div>
              
              <DiagnosticDetail 
                title="Row Level Security Diagnostics" 
                diagnostics={supabaseMetrics.rowLevelSecurity?.diagnostics} 
                sectionKey="rowLevelSecurity" 
              />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemHealthPage; 