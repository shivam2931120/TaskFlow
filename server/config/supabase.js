// Supabase client configuration
// yeh file Supabase se connection setup karti hai

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Environment variables se Supabase credentials lete hain
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Agar credentials nahi milte to error throw karo
if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase URL ya Anon Key missing hai. .env file check karo.');
  process.exit(1);
}

// Supabase client create karo
const supabase = createClient(supabaseUrl, supabaseKey);

// Connection test karne ka function
const testConnection = async () => {
  try {
    // ek simple query chalate hain connection check karne ke liye
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 matlab no rows found - yeh ok hai empty table ke liye
      logger.warn('Supabase connection warning: ' + error.message);
    }
    logger.info('Supabase database se connection successful hai');
  } catch (err) {
    logger.error('Supabase se connect nahi ho paa raha: ' + err.message);
  }
};

module.exports = { supabase, testConnection };
