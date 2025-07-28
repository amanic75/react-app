import { createClient } from '@supabase/supabase-js';

// Multi-tenant database management system
class MultiTenantDatabase {
  constructor() {
    this.connections = new Map(); // Cache database connections
    this.tenants = new Map(); // Cache tenant configurations
    this.masterDb = this.createMasterConnection();
  }

  // Create master connection for tenant management
  createMasterConnection() {
    return createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }

  // Create isolated database for a new tenant
  async createTenantDatabase(companyId, companyName) {
    // console.log removed
    
    try {
      // Generate unique database name
      const dbName = `company_${companyId.replace(/-/g, '_')}`;
      
      // Create database schema (in PostgreSQL, we use schemas for isolation)
      const schemaName = `tenant_${companyId.replace(/-/g, '_')}`;
      
      // Create schema in master database
      await this.masterDb.rpc('create_tenant_schema', {
        schema_name: schemaName,
        company_id: companyId,
        company_name: companyName
      });

      // Deploy base schema to tenant
      await this.deployTenantSchema(schemaName, companyId);

      // Create tenant configuration
      const tenantConfig = {
        companyId,
        companyName,
        schemaName,
        dbName,
        status: 'active',
        createdAt: new Date().toISOString(),
        connectionString: this.buildTenantConnectionString(schemaName)
      };

      // Store tenant configuration
      await this.storeTenantConfig(tenantConfig);

      // console.log removed
      return tenantConfig;

    } catch (error) {
      // console.error removed
      throw error;
    }
  }

  // Deploy schema to tenant database
  async deployTenantSchema(schemaName, companyId) {
    // console.log removed

    const tenantSchema = `
      -- Set search path to tenant schema
      SET search_path TO ${schemaName};

      -- Create tenant-specific tables
      CREATE TABLE IF NOT EXISTS formulas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        formula_name VARCHAR(255) NOT NULL,
        chemical_composition TEXT,
        density DECIMAL(10,4),
        ph_level DECIMAL(3,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID,
        assigned_to UUID
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID,
        assigned_to UUID
      );

      CREATE TABLE IF NOT EXISTS raw_materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        material_name VARCHAR(255) NOT NULL,
        supplier_id UUID REFERENCES suppliers(id),
        quantity DECIMAL(10,2),
        unit VARCHAR(50),
        price_per_unit DECIMAL(10,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID,
        assigned_to UUID
      );

      -- Create apps table for tenant
      CREATE TABLE IF NOT EXISTS apps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        app_name VARCHAR(255) NOT NULL,
        app_description TEXT,
        app_icon VARCHAR(50) DEFAULT 'Database',
        app_color VARCHAR(7) DEFAULT '#3B82F6',
        table_name VARCHAR(255) NOT NULL,
        schema_json JSONB DEFAULT '{}',
        ui_config JSONB DEFAULT '{}',
        permissions_config JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID
      );

      -- Create app_data table for dynamic data storage
      CREATE TABLE IF NOT EXISTS app_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
        record_id VARCHAR(255) NOT NULL,
        data_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID,
        updated_by UUID,
        UNIQUE(app_id, record_id)
      );

      -- Create user_profiles table for tenant users
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Employee',
        department VARCHAR(100),
        app_access JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        company_id UUID NOT NULL
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_formulas_created_at ON formulas(created_at);
      CREATE INDEX IF NOT EXISTS idx_suppliers_company_name ON suppliers(company_name);
      CREATE INDEX IF NOT EXISTS idx_raw_materials_supplier_id ON raw_materials(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_apps_table_name ON apps(table_name);
      CREATE INDEX IF NOT EXISTS idx_app_data_app_id ON app_data(app_id);
      CREATE INDEX IF NOT EXISTS idx_app_data_data_json ON app_data USING GIN(data_json);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);

      -- Enable Row Level Security
      ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
      ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
      ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies (users can only access their company data)
      CREATE POLICY "Company users can access formulas" ON formulas
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.company_id = '${companyId}'
          )
        );

      CREATE POLICY "Company users can access suppliers" ON suppliers
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.company_id = '${companyId}'
          )
        );

      CREATE POLICY "Company users can access raw_materials" ON raw_materials
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.company_id = '${companyId}'
          )
        );

      CREATE POLICY "Company users can access apps" ON apps
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.company_id = '${companyId}'
          )
        );

      CREATE POLICY "Company users can access app_data" ON app_data
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.company_id = '${companyId}'
          )
        );

      CREATE POLICY "Company users can access user_profiles" ON user_profiles
        FOR ALL USING (
          user_profiles.company_id = '${companyId}' AND
          (user_profiles.id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM user_profiles up2 
             WHERE up2.id = auth.uid() 
             AND up2.company_id = '${companyId}'
             AND up2.role = 'Capacity Admin'
           ))
        );

      -- Reset search path
      SET search_path TO public;
    `;

    // Execute schema deployment
    const { error } = await this.masterDb.rpc('execute_tenant_schema', {
      schema_name: schemaName,
      sql_script: tenantSchema
    });

    if (error) {
      throw new Error(`Schema deployment failed: ${error.message}`);
    }

    // console.log removed
  }

  // Get tenant-specific connection
  async getTenantConnection(companyId) {
    // Check cache first
    if (this.connections.has(companyId)) {
      return this.connections.get(companyId);
    }

    // Get tenant configuration
    const tenantConfig = await this.getTenantConfig(companyId);
    if (!tenantConfig) {
      throw new Error(`Tenant configuration not found for company: ${companyId}`);
    }

    // Create connection with tenant-specific search path
    const connection = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: {
            'X-Tenant-Schema': tenantConfig.schemaName
          }
        }
      }
    );

    // Set search path for this connection
    await connection.rpc('set_tenant_search_path', {
      schema_name: tenantConfig.schemaName
    });

    // Cache the connection
    this.connections.set(companyId, connection);
    return connection;
  }

  // Store tenant configuration
  async storeTenantConfig(tenantConfig) {
    const { error } = await this.masterDb
      .from('tenant_configurations')
      .upsert({
        company_id: tenantConfig.companyId,
        company_name: tenantConfig.companyName,
        schema_name: tenantConfig.schemaName,
        db_name: tenantConfig.dbName,
        status: tenantConfig.status,
        created_at: tenantConfig.createdAt,
        connection_string: tenantConfig.connectionString
      });

    if (error) {
      throw new Error(`Failed to store tenant config: ${error.message}`);
    }
  }

  // Get tenant configuration
  async getTenantConfig(companyId) {
    if (this.tenants.has(companyId)) {
      return this.tenants.get(companyId);
    }

    const { data, error } = await this.masterDb
      .from('tenant_configurations')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      // console.error removed
      return null;
    }

    // Cache the configuration
    this.tenants.set(companyId, data);
    return data;
  }

  // Build tenant connection string
  buildTenantConnectionString(schemaName) {
    return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?search_path=${schemaName}`;
  }

  // Create company admin account
  async createCompanyAdmin(companyId, adminEmail, adminName, companyName) {
    // console.log removed

    try {
      // Create auth user
      const { data: authUser, error: authError } = await this.masterDb.auth.admin.createUser({
        email: adminEmail,
        password: 'ChangeMe123!', // Default password
        email_confirm: true,
        user_metadata: {
          first_name: adminName,
          last_name: '',
          role: 'Capacity Admin',
          company_id: companyId,
          company_name: companyName
        }
      });

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      // Get tenant connection
      const tenantDb = await this.getTenantConnection(companyId);

      // Create user profile in tenant database
      const { error: profileError } = await tenantDb
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          email: adminEmail,
          first_name: adminName,
          last_name: '',
          role: 'Capacity Admin',
          company_id: companyId,
          app_access: ['formulas', 'suppliers', 'raw-materials']
        });

      if (profileError) {
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      // Update company record with admin user email
      await this.masterDb
        .from('companies')
        .update({ admin_user_email: adminEmail })
        .eq('id', companyId);

      // console.log removed
      
      return {
        id: authUser.user.id,
        email: adminEmail,
        name: adminName,
        role: 'Capacity Admin',
        defaultPassword: 'ChangeMe123!'
      };

    } catch (error) {
      // console.error removed
      throw error;
    }
  }

  // Deploy initial apps to tenant
  async deployInitialApps(companyId, initialApps) {
    // console.log removed

    const tenantDb = await this.getTenantConnection(companyId);

    const appTemplates = {
      formulas: {
        app_name: 'Formulas',
        app_description: 'Chemical formula management system',
        app_icon: 'Database',
        app_color: '#10B981',
        table_name: 'formulas',
        schema_json: {
          fields: [
            { name: 'formula_name', type: 'text', required: true },
            { name: 'chemical_composition', type: 'text', required: true },
            { name: 'density', type: 'decimal', required: false },
            { name: 'ph_level', type: 'decimal', required: false }
          ]
        }
      },
      suppliers: {
        app_name: 'Suppliers',
        app_description: 'Supplier relationship management',
        app_icon: 'Building2',
        app_color: '#3B82F6',
        table_name: 'suppliers',
        schema_json: {
          fields: [
            { name: 'company_name', type: 'text', required: true },
            { name: 'contact_person', type: 'text', required: true },
            { name: 'email', type: 'email', required: true },
            { name: 'phone', type: 'text', required: false },
            { name: 'address', type: 'textarea', required: false }
          ]
        }
      },
      'raw-materials': {
        app_name: 'Raw Materials',
        app_description: 'Raw material inventory management',
        app_icon: 'Zap',
        app_color: '#F59E0B',
        table_name: 'raw_materials',
        schema_json: {
          fields: [
            { name: 'material_name', type: 'text', required: true },
            { name: 'supplier_id', type: 'reference', required: true },
            { name: 'quantity', type: 'decimal', required: true },
            { name: 'unit', type: 'text', required: true },
            { name: 'price_per_unit', type: 'decimal', required: false }
          ]
        }
      }
    };

    for (const appId of initialApps) {
      const template = appTemplates[appId];
      if (template) {
        const { error } = await tenantDb
          .from('apps')
          .insert(template);

        if (error) {
          // console.error removed
        } else {
          // console.log removed
        }
      }
    }
  }

  // Get user's company ID for routing
  async getUserCompanyId(userId) {
    const { data, error } = await this.masterDb
      .from('user_profiles')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (error) {
      // console.error removed
      return null;
    }

    return data?.company_id;
  }

  // Route user to correct tenant database
  async routeUserToTenant(userId) {
    const companyId = await this.getUserCompanyId(userId);
    if (!companyId) {
      throw new Error('User not associated with any company');
    }

    return await this.getTenantConnection(companyId);
  }
}

// Create singleton instance
const multiTenantDB = new MultiTenantDatabase();

export default multiTenantDB;
export { MultiTenantDatabase }; 