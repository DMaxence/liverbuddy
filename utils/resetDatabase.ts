import { sqlite } from '@/lib/database';

// Function to reset the database (use with caution!)
export const resetDatabase = async () => {
  try {
    console.log('Resetting database...');
    
    // Drop existing tables
    await sqlite.execAsync(`
      DROP TABLE IF EXISTS drink_logs;
      DROP TABLE IF EXISTS user;
    `);
    
    console.log('Database reset complete. Restart the app to reinitialize.');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
};

// Function to check database schema
export const checkDatabaseSchema = async () => {
  try {
    console.log('Checking database schema...');
    
    // Check if tables exist by trying to select from them
    try {
      await sqlite.execAsync(`SELECT COUNT(*) FROM drink_logs LIMIT 1`);
      console.log('✅ drink_logs table exists');
    } catch (error) {
      console.log('❌ drink_logs table does not exist');
    }
    
    try {
      await sqlite.execAsync(`SELECT COUNT(*) FROM user LIMIT 1`);
      console.log('✅ user table exists');
    } catch (error) {
      console.log('❌ user table does not exist');
    }
    
    // Try to check if the new columns exist by selecting them
    try {
      await sqlite.execAsync(`SELECT favorite_drink_type FROM user LIMIT 1`);
      console.log('✅ favorite_drink_type column exists');
    } catch (error) {
      console.log('❌ favorite_drink_type column does not exist');
    }
    
    try {
      await sqlite.execAsync(`SELECT favorite_drink_option FROM user LIMIT 1`);
      console.log('✅ favorite_drink_option column exists');
    } catch (error) {
      console.log('❌ favorite_drink_option column does not exist');
    }
    
  } catch (error) {
    console.error('Error checking database schema:', error);
  }
}; 