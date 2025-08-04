import { createDrinkLog } from '@/services/drinkService';
import { upsertUserPreferences } from '@/services/userPreferencesService';
import { DrinkTypeKey, DrinkOptionKey } from '@/types';

// Test function to add sample data to the database
export const addSampleData = async () => {
  try {
    console.log('Adding sample data to database...');
    
    // Add user preferences
    console.log('Adding user preferences...');
    await upsertUserPreferences('local-user', {
      favorite_drink_type: 'beer' as DrinkTypeKey,
      favorite_drink_option: 'pint' as DrinkOptionKey,
      favorite_drink: 'IPA',
      preferred_unit: 'cl',
      weekly_goal: 7,
    });
    console.log('✅ User preferences added');

    // Add some sample drink logs
    const sampleDrinks = [
      {
        drink_type: 'beer' as DrinkTypeKey,
        drink_option: 'pint' as DrinkOptionKey,
        drink_name: 'IPA',
        amount_cl: 47.3, // 16 oz pint
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        alcohol_percentage: 6.5,
      },
      {
        drink_type: 'wine' as DrinkTypeKey,
        drink_option: 'glass' as DrinkOptionKey,
        drink_name: 'Merlot',
        amount_cl: 14.8, // 5 oz glass
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        alcohol_percentage: 13.5,
      },
      {
        drink_type: 'cocktail' as DrinkTypeKey,
        drink_option: 'standard' as DrinkOptionKey,
        drink_name: 'Margarita',
        amount_cl: 20, // Standard cocktail
        timestamp: new Date().toISOString(), // Today
        alcohol_percentage: 15,
      },
    ];

    console.log('Adding sample drink logs...');
    for (const drink of sampleDrinks) {
      await createDrinkLog(drink);
      console.log(`✅ Added ${drink.drink_name}`);
    }

    console.log('🎉 Sample data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
};

// Test function to check if database is working
export const testDatabase = async () => {
  try {
    console.log('Testing database connection...');
    
    // Try to get user preferences
    const { getUserPreferences } = await import('@/services/userPreferencesService');
    const prefs = await getUserPreferences('local-user');
    console.log('User preferences:', prefs);
    
    // Try to get drink logs
    const { getDrinkLogs } = await import('@/services/drinkService');
    const logs = await getDrinkLogs('local-user');
    console.log('Drink logs count:', logs.length);
    
    console.log('Database test successful!');
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}; 