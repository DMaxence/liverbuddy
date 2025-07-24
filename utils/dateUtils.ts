/**
 * Check if a timestamp is within the last hour
 */
export const isWithinLastHour = (timestamp: string): boolean => {
  const now = new Date().getTime();
  const drinkTime = new Date(timestamp).getTime();
  const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
  
  return (now - drinkTime) <= oneHourInMs;
};

/**
 * Get the most recent drink from an array of drink logs
 */
export const getMostRecentDrink = (drinkLogs: any[]): any | null => {
  if (!drinkLogs || drinkLogs.length === 0) {
    return null;
  }
  
  // Sort by timestamp descending and return the most recent
  const sortedLogs = [...drinkLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return sortedLogs[0];
}; 