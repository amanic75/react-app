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
      .select('*')
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
    
    // Test 4: Check company_id distribution
    const { data: companyData, error: companyError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .not('company_id', 'is', null)
      .limit(10);
    
    // Test 5: Check company_users table
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select('*')
      .limit(10);
    
    console.log('Table existence check:', { tableData, tableError });
    console.log('Company ID distribution:', { companyData, companyError });
    console.log('Company Users table:', { companyUsersData, companyUsersError });
    
    // Test 6: Check if company_users table exists by trying to select its schema
    const { data: companyUsersSchema, error: companyUsersSchemaError } = await supabase
      .from('company_users')
      .select('*', { count: 'exact', head: true });

    console.log('Company Users schema check:', { companyUsersSchema, companyUsersSchemaError });

    // Test 7: Try to insert a test record into company_users table
    const testUserId = '8d3a8ac9-14fd-4761-b273-44191e9bab5c'; // admintest@capacity.com
    const testCompanyId = 'f42538be-9dcb-493a-9e2e-8b10691ace25'; // Capacity Chemicals
    
    const { data: insertTest, error: insertError } = await supabase
      .from('company_users')
      .insert([{
        company_id: testCompanyId,
        user_id: testUserId,
        role: 'Admin',
        status: 'Active',
        added_at: new Date().toISOString()
      }])
      .select();

    console.log('Company Users insert test:', { insertTest, insertError });

    // Test 8: Check if the insert worked
    const { data: verifyInsert, error: verifyError } = await supabase
      .from('company_users')
      .select('*')
      .eq('company_id', testCompanyId)
      .eq('user_id', testUserId);

    console.log('Company Users verify insert:', { verifyInsert, verifyError });

    // Test 9: Try to create company_users table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS company_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL,
        user_id UUID NOT NULL,
        role VARCHAR(50) DEFAULT 'Employee',
        permissions JSONB DEFAULT '[]'::jsonb,
        added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        added_by UUID,
        status VARCHAR(20) DEFAULT 'Active',
        
        CONSTRAINT company_users_unique UNIQUE (company_id, user_id),
        CONSTRAINT company_users_role_check CHECK (role IN ('Admin', 'Manager', 'Employee', 'Viewer')),
        CONSTRAINT company_users_status_check CHECK (status IN ('Active', 'Inactive', 'Pending'))
      );
    `;

    const { data: createTableResult, error: createTableError } = await supabase
      .rpc('exec_sql', { sql: createTableSQL })
      .catch(() => ({ data: null, error: { message: 'RPC exec_sql not available' } }));

    console.log('Company Users table creation:', { createTableResult, createTableError });

    // Test 10: Try insert again after table creation
    const { data: insertTest2, error: insertError2 } = await supabase
      .from('company_users')
      .insert([{
        company_id: testCompanyId,
        user_id: testUserId,
        role: 'Admin',
        status: 'Active',
        added_at: new Date().toISOString()
      }])
      .select();

    console.log('Company Users insert test 2:', { insertTest2, insertError2 });

    // Test 11: Check if company_users table exists in information schema
    const { data: tableExists, error: tableExistsError } = await supabase
      .rpc('exec_sql', { sql: "SELECT table_name FROM information_schema.tables WHERE table_name = 'company_users';" })
      .catch(() => ({ data: null, error: { message: 'Cannot check table existence' } }));

    console.log('Company Users table exists check:', { tableExists, tableExistsError });

    // Test 12: Try a simple upsert without constraints
    const { data: simpleUpsert, error: simpleUpsertError } = await supabase
      .from('company_users')
      .upsert([{
        company_id: testCompanyId,
        user_id: testUserId,
        role: 'Admin',
        status: 'Active'
      }], { 
        onConflict: 'company_id,user_id' 
      })
      .select();

    console.log('Simple upsert test:', { simpleUpsert, simpleUpsertError });

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
        },
        companyIdCheck: {
          data: companyData,
          error: companyError,
          length: companyData?.length
        },
        companyUsersCheck: {
          data: companyUsersData,
          error: companyUsersError,
          length: companyUsersData?.length
        },
        companyUsersSchemaCheck: {
          data: companyUsersSchema,
          error: companyUsersSchemaError,
          count: companyUsersSchema?.count
        },
        companyUsersInsertTest: {
          data: insertTest,
          error: insertError,
          length: insertTest?.length
        },
        companyUsersVerifyTest: {
          data: verifyInsert,
          error: verifyError,
          length: verifyInsert?.length
        },
        createTableTest: {
          data: createTableResult,
          error: createTableError
        },
        companyUsersInsertTest2: {
          data: insertTest2,
          error: insertError2,
          length: insertTest2?.length
        },
        tableExistsCheck: {
          data: tableExists,
          error: tableExistsError
        },
        simpleUpsertTest: {
          data: simpleUpsert,
          error: simpleUpsertError,
          length: simpleUpsert?.length
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