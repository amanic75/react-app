export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Measure latency to a reliable external service
    const startTime = Date.now();
    
    try {
      // Test latency to Google's DNS (reliable and fast)
      const response = await fetch('https://dns.google/resolve?name=google.com&type=A', {
        method: 'GET',
        headers: { 'Accept': 'application/dns-json' },
        // 5 second timeout
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`DNS lookup failed: ${response.status}`);
      }
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Determine status based on latency
      let status;
      if (latency < 1000) {
        status = 'good';
      } else if (latency < 1500) {
        status = 'warning';  
      } else {
        status = 'poor';
      }
      
      console.log(`🌐 Network test completed: ${latency}ms (${status})`);
      
      return res.status(200).json({
        latency: `${latency}ms`,
        status: status,
        timestamp: new Date().toISOString(),
        testEndpoint: 'dns.google',
        method: 'DNS lookup'
      });
      
    } catch (networkError) {
      console.error('❌ Network test failed:', networkError.message);
      
      // Return high latency for timeout/error cases
      return res.status(200).json({
        latency: 'timeout',
        status: 'poor',
        timestamp: new Date().toISOString(),
        error: 'Network test timeout or failure',
        testEndpoint: 'dns.google'
      });
    }
    
  } catch (error) {
    console.error('❌ Network monitoring error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      latency: 'error',
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
} 