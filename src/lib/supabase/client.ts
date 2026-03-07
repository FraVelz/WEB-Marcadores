import { createBrowserClient } from "@supabase/ssr";
import { isDemoMode } from "@/lib/demo-data";

const DEMO_URL = "https://demo.supabase.co";
const DEMO_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5OTk5OTk5OTl9.placeholder";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEMO_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEMO_KEY;
  return createBrowserClient(url, key);
}

export { isDemoMode };
