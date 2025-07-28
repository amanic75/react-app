import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config({ path: 'keys.env' });

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to create mock response for Vercel API compatibility
function createMockResponse(res) {
  return {
    status: (code) => ({
      json: (data) => res.status(code).json(data),
      end: () => res.end()
    }),
    setHeader: (name, value) => res.setHeader(name, value)
  };
}

// CONSOLIDATED API ROUTES (Primary endpoints - fewer serverless functions)

// 1. Consolidated Admin Users API (create user, change password)
app.post('/api/admin/users', async (req, res) => {
  try {
    const { default: handler } = await import('../api/admin/users.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
});

// 2. Consolidated Companies API (create, list, get, update, delete)
app.all('/api/admin/companies', async (req, res) => {
  try {
    const { default: handler } = await import('../api/admin/companies.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
});

// 2a. Company-User Sync API (sync companies with their admin users)
app.all('/api/admin/company-sync', async (req, res) => {
  try {
    const { default: handler } = await import('../api/admin/company-sync.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
});

// 2b. Consolidated Apps API (create, list, get, update, delete)
app.all('/api/admin/apps', async (req, res) => {
  try {
    const { default: handler } = await import('../api/admin/apps.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
});

// 2c. Multi-Tenant Companies API (create, list, get, update, delete)
app.all('/api/admin/multi-tenant-companies', async (req, res) => {
  try {
    const { default: handler } = await import('../api/admin/multi-tenant-companies.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
});

// 3. Consolidated System Monitoring API (all system monitoring endpoints)
app.get('/api/system/monitoring', async (req, res) => {
  try {
    const { default: handler } = await import('../api/system/monitoring.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
});

// 4. AI Chat endpoint (standalone)
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { default: handler } = await import('../api/ai-chat.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// 5. Activity tracking endpoint (standalone)
app.post('/api/track-activity', async (req, res) => {
  try {
    const { default: handler } = await import('../api/track-activity.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// 6. Activity summary endpoint (for user management metrics)
app.get('/api/activity-summary', async (req, res) => {
  try {
    const { default: handler } = await import('../api/activity-summary.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// 7. Login events endpoint (for storing login/logout events)
app.post('/api/login-events', async (req, res) => {
  try {
    const { default: handler } = await import('../api/login-events.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// 8. Database test endpoint (debugging)
app.get('/api/test-db', async (req, res) => {
  try {
    const { default: handler } = await import('../api/test-db.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});


// LEGACY COMPATIBILITY ROUTES (for backward compatibility - route to consolidated APIs)

// Legacy user management routes
app.post('/api/admin/create-user', async (req, res) => {
  req.query = { action: 'create' };
  try {
    const { default: handler } = await import('../api/admin/users.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/admin/change-password', async (req, res) => {
  req.query = { action: 'change-password' };
  try {
    const { default: handler } = await import('../api/admin/users.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Legacy company routes
app.get('/api/admin/companies/list', async (req, res) => {
  req.query = {};
  try {
    const { default: handler } = await import('../api/admin/companies.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/admin/companies/create', async (req, res) => {
  req.query = {};
  try {
    const { default: handler } = await import('../api/admin/companies.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/api/admin/companies/:id', async (req, res) => {
  req.query = { id: req.params.id };
  try {
    const { default: handler } = await import('../api/admin/companies.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.put('/api/admin/companies/:id', async (req, res) => {
  req.query = { id: req.params.id };
  try {
    const { default: handler } = await import('../api/admin/companies.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.delete('/api/admin/companies/:id', async (req, res) => {
  req.query = { id: req.params.id };
  try {
    const { default: handler } = await import('../api/admin/companies.js');
    await handler(req, createMockResponse(res));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Legacy system monitoring routes
const systemRoutes = [
  'server-status', 'network', 'database-health', 'resources',
  'error-monitoring', 'usage-analytics', 'historical-data', 'supabase-metrics'
];

systemRoutes.forEach(route => {
  app.get(`/api/system/${route}`, async (req, res) => {
    req.query = { type: route };
    try {
      const { default: handler } = await import('../api/system/monitoring.js');
      await handler(req, createMockResponse(res));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: 'development',
    consolidatedAPIs: true
  });
});

// Serve static files from the project root
app.use(express.static(join(__dirname, '..')));

// Fallback route to serve index.html for SPA routing
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  // Server started silently
});

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
}); 