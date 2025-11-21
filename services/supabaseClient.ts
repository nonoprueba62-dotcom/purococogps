// Accessing the global supabase object from the CDN script tag
// This ensures we don't need a bundler step for the Supabase SDK in this specific setup
declare const window: any;

const SUPABASE_URL = 'https://ltyklvwksvbnadvvbwmk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eWtsdndrc3ZibmFkdnZid21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTAyNjEsImV4cCI6MjA3ODY2NjI2MX0.2faUVdGS2RWi0gyjpBc7xTYSQqhFVzxiY3zw-DJx5V0';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false, // Disable localStorage to avoid iframe issues
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});