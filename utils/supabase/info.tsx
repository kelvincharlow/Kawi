/* ENVIRONMENT CONFIGURATION - SECURE VERSION */

// Environment Variables Debug (only in development)
if (import.meta.env.DEV) {
  console.log('=== SUPABASE CONFIG DEBUG ===');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('Environment Mode:', import.meta.env.MODE);
  console.log('===========================');
}

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dftwstjxrxwszkufggom.supabase.co";
export const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || "dftwstjxrxwszkufggom";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHdzdGp4cnh3c3prdWZnZ29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODU1MDMsImV4cCI6MjA2ODk2MTUwM30.kui2ggN_OhOokDzX46wEcP_yb8HHEseyB4aF9ZnRMns";

// Validate that environment variables are set in production
if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('Missing Supabase environment variables in production! Using fallback values.');
}

// Log the configuration being used (without exposing the full key)
console.log('Supabase Configuration:', {
  projectId,
  url: supabaseUrl,
  hasKey: !!publicAnonKey,
  keyPrefix: publicAnonKey.substring(0, 20) + '...',
  environment: import.meta.env.MODE
});