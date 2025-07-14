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
  Info,
  Calendar
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const [historicalData, setHistoricalData] = useState({
    userGrowth: {
      dailyGrowth: [],
      totalUsers: '--',
      growthRate: '--',
      last30Days: '--',
      last7Days: '--'
    },
    peakUsagePatterns: {
      byDayOfWeek: [],
      byHour: [],
      peakDay: '--',
      peakHour: '--'
    },
    growthMetrics: {
      userGrowthRate: '--',
      dataGrowthEstimate: '--',
      recentDataGrowth: '--',
      averageUsersPerDay: '--'
    },
    performanceOverTime: {
      avgResponseTime: [],
      errorRate: []
    },
    summary: {
      trendsAvailable: false,
      dataQuality: 'loading'
    },
    status: 'loading'
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState({
    apiHealth: false,
    databaseConnections: false,
    rowLevelSecurity: false
  });

  // Add state for section visibility
  const [sectionsExpanded, setSectionsExpanded] = useState({
    infrastructure: true,    // expanded
    errors: true,           // expanded  
    supabaseMetrics: true,  // expanded
    userAnalytics: false,   // collapsed
    historicalTrends: false // collapsed
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
    // Use proxy in both development and production
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
          activeUsers: analyticsData.activeUsers || { current: '--', peakToday: '--', peakHourLabel: 'Loading...', recentlyActive: '--' },
          apiCallVolume: analyticsData.apiCallVolume || { requestsPerMinute: '--', requestsPerHour: '--', totalRequests: '--', mostUsedEndpoints: [] },
          databaseOperations: analyticsData.databaseOperations || { readOperations: '--', writeOperations: '--', queryCount: '--', totalUsers: '--' },
          storageUsage: analyticsData.storageUsage || { databaseSize: 'Loading...', tableCount: 'Loading...', indexSize: 'Loading...', growthRate: 'Loading...' },
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

      // Fetch historical trends and analytics data
      try {
        const historicalRes = await fetch(`${baseUrl}/historical-data`);
        const historicalDataRes = await historicalRes.json();

        setHistoricalData({
          userGrowth: historicalDataRes.userGrowth,
          peakUsagePatterns: historicalDataRes.peakUsagePatterns,
          growthMetrics: historicalDataRes.growthMetrics,
          performanceOverTime: historicalDataRes.performanceOverTime,
          summary: historicalDataRes.summary,
          status: 'healthy'
        });
      } catch (historicalError) {
        console.error('❌ Failed to fetch historical data:', historicalError);
        setHistoricalData(prev => ({
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

  // Add function to toggle section visibility
  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // CollapsibleSection component
  const CollapsibleSection = ({ sectionKey, title, icon, isExpanded, children, errorIndicator }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center space-x-2 hover:text-blue-300 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-blue-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-blue-400" />
          )}
          {icon}
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        </button>
        {errorIndicator}
      </div>
      
      {isExpanded && children}
    </div>
  );

  // Add new function to calculate overall system health
  const calculateOverallHealth = () => {
    const statuses = [
      infrastructureMetrics.serverStatus.status,
      infrastructureMetrics.database.status,
      infrastructureMetrics.network.status,
      usageAnalytics.status,
      errorMonitoring.status,
      supabaseMetrics.status
    ];

    // Count status types
    const errorCount = statuses.filter(status => status === 'error').length;
    const warningCount = statuses.filter(status => status === 'warning').length;
    const loadingCount = statuses.filter(status => status === 'loading').length;

    // Determine overall status
    if (errorCount > 0) return 'critical';
    if (warningCount > 1) return 'warning';
    if (loadingCount > 0) return 'loading';
    return 'healthy';
  };

  const getOverallHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'loading': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getOverallHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-12 w-12" />;
      case 'warning': return <AlertTriangle className="h-12 w-12" />;
      case 'critical': return <XCircle className="h-12 w-12" />;
      case 'loading': return <Activity className="h-12 w-12 animate-pulse" />;
      default: return <AlertCircle className="h-12 w-12" />;
    }
  };

  const getOverallHealthMessage = (status) => {
    switch (status) {
      case 'healthy': return 'All systems operational';
      case 'warning': return 'Some systems need attention';
      case 'critical': return 'Critical issues detected';
      case 'loading': return 'Checking system status...';
      default: return 'System status unknown';
    }
  };

  // Add function to collect critical alerts
  const getCriticalAlerts = () => {
    const alerts = [];

    // Check for server issues
    if (infrastructureMetrics.serverStatus.status === 'error') {
      alerts.push({
        type: 'critical',
        title: 'Server Connection Failed',
        message: 'Unable to connect to monitoring endpoints',
        icon: <Server className="h-5 w-5" />,
        action: 'Check server status'
      });
    }

    // Check for database issues
    if (infrastructureMetrics.database.status === 'error') {
      alerts.push({
        type: 'critical',
        title: 'Database Connection Issues',
        message: 'Database health check failed',
        icon: <Database className="h-5 w-5" />,
        action: 'Verify database connection'
      });
    }

    // Check for high error rates
    if (errorMonitoring.systemAlerts.criticalAlerts !== '--' && 
        parseInt(errorMonitoring.systemAlerts.criticalAlerts) > 0) {
      alerts.push({
        type: 'critical',
        title: `${errorMonitoring.systemAlerts.criticalAlerts} Critical System Alerts`,
        message: `Last critical: ${errorMonitoring.systemAlerts.lastCriticalAlert}`,
        icon: <AlertTriangle className="h-5 w-5" />,
        action: 'Review alert details'
      });
    }

    // Check for authentication errors
    if (errorMonitoring.failedOperations.authenticationErrors !== '--' && 
        parseInt(errorMonitoring.failedOperations.authenticationErrors) > 5) {
      alerts.push({
        type: 'warning',
        title: 'High Authentication Failures',
        message: `${errorMonitoring.failedOperations.authenticationErrors} auth errors detected`,
        icon: <XCircle className="h-5 w-5" />,
        action: 'Check authentication system'
      });
    }

    // Check for API errors
    if (errorMonitoring.failedOperations.apiErrors !== '--' && 
        parseInt(errorMonitoring.failedOperations.apiErrors) > 10) {
      alerts.push({
        type: 'warning',
        title: 'High API Error Rate',
        message: `${errorMonitoring.failedOperations.apiErrors} API errors in recent period`,
        icon: <Zap className="h-5 w-5" />,
        action: 'Investigate API issues'
      });
    }

    // Check for Supabase issues
    if (supabaseMetrics.status === 'error') {
      alerts.push({
        type: 'warning',
        title: 'Supabase Metrics Unavailable',
        message: 'Unable to fetch Supabase-specific metrics',
        icon: <Database className="h-5 w-5" />,
        action: 'Check Supabase connection'
      });
    }

    return alerts.slice(0, 4); // Limit to 4 most critical alerts
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

        {/* Overall System Health Indicator */}
        <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-3">
            {getOverallHealthIcon(calculateOverallHealth())}
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Overall System Health</h3>
              <p className={`text-sm ${getOverallHealthColor(calculateOverallHealth())}`}>
                {getOverallHealthMessage(calculateOverallHealth())}
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Last checked: {refreshTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Critical Alerts Banner - Only show if there are alerts */}
        {getCriticalAlerts().length > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Critical Alerts ({getCriticalAlerts().length})</span>
              </div>
              <div className="text-xs text-red-300">
                Requires immediate attention
              </div>
            </div>
            <div className="space-y-3">
              {getCriticalAlerts().map((alert, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  alert.type === 'critical' ? 'bg-red-900/30' : 'bg-yellow-900/30'
                }`}>
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                  }`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      alert.type === 'critical' ? 'text-red-200' : 'text-yellow-200'
                    }`}>
                      {alert.title}
                    </div>
                    <div className="text-sm text-slate-300 mt-1">{alert.message}</div>
                    <button className={`text-sm mt-2 hover:underline ${
                      alert.type === 'critical' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      → {alert.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Critical Alerts - Success State */}
        {getCriticalAlerts().length === 0 && calculateOverallHealth() === 'healthy' && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">No Critical Alerts</span>
              <span className="text-sm text-green-300">• All systems operating normally</span>
            </div>
          </div>
        )}

        {/* 1. Infrastructure & Performance Section (Expanded) */}
        <CollapsibleSection
          sectionKey="infrastructure"
          title="Infrastructure & Performance"
          icon={<Server className="h-6 w-6 text-blue-400" />}
          isExpanded={sectionsExpanded.infrastructure}
          errorIndicator={infrastructureMetrics.serverStatus.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to connect to monitoring endpoints</span>
              </div>
            )}
        >
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
        </CollapsibleSection>

        {/* 2. Error Monitoring Section (Expanded) */}
        <CollapsibleSection
          sectionKey="errors"
          title="Error Monitoring"
          icon={<AlertCircle className="h-6 w-6 text-red-400" />}
          isExpanded={sectionsExpanded.errors}
          errorIndicator={errorMonitoring.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to fetch error monitoring data</span>
              </div>
            )}
        >
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
        </CollapsibleSection>

        {/* 3. Supabase Specific Metrics Section (Expanded) */}
        <CollapsibleSection
          sectionKey="supabaseMetrics"
          title="Supabase Specific Metrics"
          icon={<Database className="h-6 w-6 text-purple-400" />}
          isExpanded={sectionsExpanded.supabaseMetrics}
          errorIndicator={supabaseMetrics.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to fetch Supabase metrics</span>
              </div>
            )}
        >
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
                  <Activity className="h-5 w-5 text-green-400" />
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
                title="RLS Diagnostics" 
                diagnostics={supabaseMetrics.rowLevelSecurity?.diagnostics} 
                sectionKey="rowLevelSecurity" 
              />
            </Card>
          </div>
        </CollapsibleSection>

        {/* 4. Usage Analytics Section (Collapsed) */}
        <CollapsibleSection
          sectionKey="userAnalytics"
          title="Usage Analytics"
          icon={<BarChart3 className="h-6 w-6 text-purple-400" />}
          isExpanded={sectionsExpanded.userAnalytics}
          errorIndicator={usageAnalytics.status === 'error' && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Unable to fetch usage analytics</span>
            </div>
          )}
        >
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
                    <span className="text-slate-100 font-mono text-lg font-bold">{usageAnalytics.activeUsers?.current || '--'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Peak Today</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.activeUsers?.peakToday || '--'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Peak Hour</span>
                    <span className="text-slate-100 font-mono text-xs">{usageAnalytics.activeUsers?.peakHourLabel || 'Loading...'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Recently Active</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.activeUsers?.recentlyActive || '--'}</span>
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
                    <span className="text-slate-100 font-mono">{usageAnalytics.apiCallVolume?.requestsPerMinute || '--'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Per Hour</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.apiCallVolume?.requestsPerHour || '--'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Today</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.apiCallVolume?.totalRequests || '--'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Most Used:</div>
                  <div className="text-xs text-slate-300 font-mono truncate">
                    {usageAnalytics.apiCallVolume?.mostUsedEndpoints?.length > 0 
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
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations?.readOperations || '--'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Write Ops</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations?.writeOperations || '--'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Queries</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations?.queryCount || '--'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Users</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.databaseOperations?.totalUsers || '--'}</span>
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
                    <span className="text-slate-100 font-mono">{usageAnalytics.storageUsage?.databaseSize || 'Loading...'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Tables</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.storageUsage?.tableCount || 'Loading...'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Index Size</span>
                    <span className="text-slate-100 font-mono">{usageAnalytics.storageUsage?.indexSize || 'Loading...'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Growth Rate</span>
                    <span className="text-green-400 font-mono text-xs">{usageAnalytics.storageUsage?.growthRate || 'Loading...'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </CollapsibleSection>

        {/* 5. Trends & Historical Data Section (Collapsed) */}
        <CollapsibleSection
          sectionKey="historicalTrends"
          title="Trends & Historical Data"
          icon={<BarChart3 className="h-6 w-6 text-indigo-400" />}
          isExpanded={sectionsExpanded.historicalTrends}
          errorIndicator={historicalData.status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Unable to fetch historical data</span>
              </div>
            )}
        >
          {/* Growth Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-slate-100">Total Users</h3>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-2">
                {historicalData.userGrowth.totalUsers}
              </div>
              <div className="text-sm text-slate-400">
                +{historicalData.userGrowth.last7Days} this week
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-slate-100">Growth Rate</h3>
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-2">
                {historicalData.userGrowth.growthRate}
              </div>
              <div className="text-sm text-slate-400">
                Last 30 days
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-slate-100">Peak Day</h3>
                </div>
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-2">
                {historicalData.peakUsagePatterns.peakDay}
              </div>
              <div className="text-sm text-slate-400">
                Most registrations
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <h3 className="font-semibold text-slate-100">Peak Hour</h3>
                </div>
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-2">
                {historicalData.peakUsagePatterns.peakHour}
              </div>
              <div className="text-sm text-slate-400">
                Busiest time
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-slate-100">User Growth Over Time</h3>
              </div>
              {historicalData.userGrowth.dailyGrowth.length > 0 ? (
                <div className="h-64">
                  <Line
                    data={{
                      labels: historicalData.userGrowth.dailyGrowth.map(item => 
                        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      ),
                      datasets: [
                        {
                          label: 'Total Users',
                          data: historicalData.userGrowth.dailyGrowth.map(item => item.totalUsers),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'New Users',
                          data: historicalData.userGrowth.dailyGrowth.map(item => item.newUsers),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: false,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgb(148, 163, 184)'
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        y: {
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Loading growth data...</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Peak Usage by Day of Week */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-slate-100">Peak Usage by Day</h3>
              </div>
              {historicalData.peakUsagePatterns.byDayOfWeek.length > 0 ? (
                <div className="h-64">
                  <Bar
                    data={{
                      labels: historicalData.peakUsagePatterns.byDayOfWeek.map(item => item.day),
                      datasets: [
                        {
                          label: 'User Registrations',
                          data: historicalData.peakUsagePatterns.byDayOfWeek.map(item => item.registrations),
                          backgroundColor: 'rgba(147, 51, 234, 0.6)',
                          borderColor: 'rgb(147, 51, 234)',
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgb(148, 163, 184)'
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        y: {
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Loading usage patterns...</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Performance Over Time */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-slate-100">Performance Over Time</h3>
              </div>
              {historicalData.performanceOverTime.avgResponseTime.length > 0 ? (
                <div className="h-64">
                  <Line
                    data={{
                      labels: historicalData.performanceOverTime.avgResponseTime.map(item => 
                        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      ),
                      datasets: [
                        {
                          label: 'Avg Response Time (ms)',
                          data: historicalData.performanceOverTime.avgResponseTime.map(item => item.responseTime),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: false,
                          tension: 0.4,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Error Rate (%)',
                          data: historicalData.performanceOverTime.errorRate.map(item => item.errorRate),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: false,
                          tension: 0.4,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgb(148, 163, 184)'
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            drawOnChartArea: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Loading performance data...</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Peak Usage by Hour */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-5 w-5 text-orange-400" />
                <h3 className="font-semibold text-slate-100">Peak Usage by Hour</h3>
              </div>
              {historicalData.peakUsagePatterns.byHour.length > 0 ? (
                <div className="h-64">
                  <Line
                    data={{
                      labels: historicalData.peakUsagePatterns.byHour.map(item => item.hour),
                      datasets: [
                        {
                          label: 'User Registrations',
                          data: historicalData.peakUsagePatterns.byHour.map(item => item.registrations),
                          borderColor: 'rgb(251, 146, 60)',
                          backgroundColor: 'rgba(251, 146, 60, 0.1)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgb(148, 163, 184)'
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: 'rgb(148, 163, 184)',
                            maxTicksLimit: 12
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        y: {
                          ticks: {
                            color: 'rgb(148, 163, 184)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Loading hourly patterns...</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Growth Metrics Summary */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-100">Growth Metrics Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-slate-400 mb-1">Average Users Per Day</div>
                <div className="text-xl font-semibold text-slate-100">
                  {historicalData.growthMetrics.averageUsersPerDay}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-slate-400 mb-1">Data Growth Estimate</div>
                <div className="text-xl font-semibold text-slate-100">
                  {historicalData.growthMetrics.dataGrowthEstimate}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-slate-400 mb-1">Recent Data Growth</div>
                <div className="text-xl font-semibold text-slate-100">
                  {historicalData.growthMetrics.recentDataGrowth}
                </div>
              </div>
            </div>

            {historicalData.summary.dataQuality === 'real_data' && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Displaying real data from {historicalData.summary.totalDataPoints} data points
                    {historicalData.summary.oldestRecord && (
                      ` • Since ${new Date(historicalData.summary.oldestRecord).toLocaleDateString()}`
                    )}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </CollapsibleSection>
      </div>
    </DashboardLayout>
  );
};

export default SystemHealthPage; 