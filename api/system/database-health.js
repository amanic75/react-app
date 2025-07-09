import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }

  try {
    // Check environment variables
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ 
        error: 'Database configuration missing',
        environment: 'production'
      });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const healthChecks = {
      connectionTest: { responseTime: null, status: 'pending' },
      queryTest: { responseTime: null, status: 'pending' },
      overallHealth: 'checking'
    };

    // Test 1: Basic connection test
    const connectionStart = Date.now();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      healthChecks.connectionTest.responseTime = Date.now() - connectionStart;
      healthChecks.connectionTest.status = error ? 'failed' : 'healthy';
      
      if (error) {
        console.error('Connection test error:', error);
      }
    } catch (error) {
      healthChecks.connectionTest.responseTime = Date.now() - connectionStart;
      healthChecks.connectionTest.status = 'failed';
      console.error('Connection test failed:', error);
    }

    // Test 2: Query performance test
    const queryStart = Date.now();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, role')
        .limit(5);
      
      healthChecks.queryTest.responseTime = Date.now() - queryStart;
      healthChecks.queryTest.status = error ? 'failed' : 'healthy';
      
      if (error) {
        console.error('Query test error:', error);
      }
    } catch (error) {
      healthChecks.queryTest.responseTime = Date.now() - queryStart;
      healthChecks.queryTest.status = 'failed';
      console.error('Query test failed:', error);
    }

    // Determine overall health
    const allHealthy = Object.values(healthChecks)
      .filter(check => typeof check === 'object' && check.status)
      .every(check => check.status === 'healthy');
    
    healthChecks.overallHealth = allHealthy ? 'healthy' : 'degraded';

    // Calculate average response time
    const responseTimes = [
      healthChecks.connectionTest.responseTime,
      healthChecks.queryTest.responseTime
    ].filter(time => time !== null);
    
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    res.status(200).json({
      overallHealth: healthChecks.overallHealth,
      averageResponseTime: `${avgResponseTime}ms`,
      checks: {
        connection: {
          status: healthChecks.connectionTest.status,
          responseTime: `${healthChecks.connectionTest.responseTime || 0}ms`
        },
        queries: {
          status: healthChecks.queryTest.status,
          responseTime: `${healthChecks.queryTest.responseTime || 0}ms`
        }
      },
      environment: 'production',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database health check error:', error);
    res.status(500).json({ 
      error: 'Failed to check database health', 
      details: error.message,
      environment: 'production'
    });
  }
} 