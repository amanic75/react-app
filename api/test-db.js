import { createClient } from '@supabase/supabase-js';

console.log('🔍 Environment check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
console.log('Using API key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  apiKey
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Simple count query
    const { data: countData, error: countError, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log('Count query result:', { countData, countError, count });

    // Test 2: Select query
    const { data: selectData, error: selectError } = await supabase
      .from('user_profiles')
      .select('id, email, created_at')
      .limit(5);
    
    console.log('Select query result:', { 
      selectData, 
      selectError, 
      selectDataLength: selectData?.length 
    });

    // Test 3: Check table existence
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    console.log('Table existence check:', { tableData, tableError });

    return res.status(200).json({
      message: 'Database connection test',
      results: {
        countQuery: {
          data: countData,
          error: countError,
          count: count
        },
        selectQuery: {
          data: selectData,
          error: selectError,
          length: selectData?.length
        },
        tableExistence: {
          data: tableData,
          error: tableError
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test error:', error);
    return res.status(500).json({ 
      error: 'Database test failed', 
      details: error.message 
    });
  }
} 