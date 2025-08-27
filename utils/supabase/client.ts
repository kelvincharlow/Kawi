import { createClient } from '@supabase/supabase-js'

// Get environment variables for Supabase configuration - prioritize .env.local
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://lwcleasphjczynmnidmj.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3Y2xlYXNwaGpjenlubW5pZG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjQyMjQsImV4cCI6MjA3MTY0MDIyNH0.hGxFSwDfpLPt7OGBSsSvT4-vLsLk3ZCBTLWQcvdrm9c'

console.log('🔧 Supabase client configuration:');
console.log('- URL:', supabaseUrl);
console.log('- Key length:', supabaseAnonKey?.length || 0);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})

// Database connection status
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test actual table access
    const { data, error } = await supabase.from('vehicles').select('id').limit(1);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection and table query successful');
    console.log('✅ Table query successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Export configuration for debugging
export const config = {
  url: supabaseUrl,
  key: supabaseAnonKey.substring(0, 20) + '...' // Only show first 20 chars for security
}
