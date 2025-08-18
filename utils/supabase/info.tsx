/* ENVIRONMENT CONFIGURATION - SECURE VERSION */

// Get environment variables with fallbacks for development
export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || "dftwstjxrxwszkufggom";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHdzdGp4cnh3c3prdWZnZ29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODU1MDMsImV4cCI6MjA2ODk2MTUwM30.kui2ggN_OhOokDzX46wEcP_yb8HHEseyB4aF9ZnRMns";

// Validate that environment variables are set in production
if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.error('Missing Supabase environment variables in production!');
}