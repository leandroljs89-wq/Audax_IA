import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qcakrewtjkesqdwoximz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYWtyZXd0amtlc3Fkd294aW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NzE0NzIsImV4cCI6MjEwNTQ0NzQ3Mn0.8vK_Jy5635MMlRdWXCjn4SMCT1RpF8pZvGlvLiOKnto';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
