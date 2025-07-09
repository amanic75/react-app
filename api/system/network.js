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

  // Simple cache to avoid too many external requests
  const cacheKey = 'network-metrics';
  const cacheTimeout = 10000; // 10 seconds
  
  // Simple in-memory cache (reset on each cold start)
  if (!global.networkCache) {
    global.networkCache = {};
  }
  
  const cached = global.networkCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < cacheTimeout) {
    return res.status(200).json(cached.data);
  }

  try {
    const tests = [
      { name: 'Supabase', url: process.env.VITE_SUPABASE_URL || 'https://httpbin.org/status/200' },
      { name: 'External API', url: 'https://httpbin.org/status/200' }
    ];

    const networkResults = [];
    
    for (const test of tests) {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(test.url, {
          method: 'HEAD', // Use HEAD to minimize data transfer
          signal: controller.signal,
          headers: {
            'User-Agent': 'System-Health-Monitor/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        
        networkResults.push({
          name: test.name,
          latency: `${latency}ms`,
          status: response.ok ? 'healthy' : 'degraded',
          statusCode: response.status
        });
        
      } catch (error) {
        const latency = Date.now() - startTime;
        networkResults.push({
          name: test.name,
          latency: `${latency}ms`,
          status: 'failed',
          error: error.name === 'AbortError' ? 'Timeout' : 'Connection failed'
        });
      }
    }

    // Calculate overall network health
    const healthyCount = networkResults.filter(result => result.status === 'healthy').length;
    const overallStatus = healthyCount === networkResults.length ? 'healthy' : 
                         healthyCount > 0 ? 'degraded' : 'critical';

    // Calculate average latency for successful tests
    const successfulTests = networkResults.filter(result => result.status === 'healthy');
    const avgLatency = successfulTests.length > 0 
      ? Math.round(successfulTests.reduce((sum, test) => 
          sum + parseInt(test.latency), 0) / successfulTests.length)
      : 0;

    const result = {
      overallStatus,
      averageLatency: `${avgLatency}ms`,
      tests: networkResults,
      environment: 'serverless',
      timestamp: new Date().toISOString(),
      note: 'Testing from serverless function environment'
    };

    // Cache the result
    global.networkCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Network monitoring error:', error);
    res.status(500).json({ 
      error: 'Failed to test network connectivity', 
      details: error.message,
      environment: 'serverless'
    });
  }
} 