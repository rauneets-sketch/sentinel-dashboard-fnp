import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://wnymknrycmldwqzdqoct.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW1rbnJ5Y21sZHdxemRxb2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDA5NTMsImV4cCI6MjA4MzI3Njk1M30.RO25k77AcJHYcaCtmqjYUifdfsG6NiOJ7UuGu2-LSq0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
