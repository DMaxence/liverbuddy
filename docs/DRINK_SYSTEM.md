# LiverBuddy Drink System

This document describes the new generic drink system for LiverBuddy, which provides a flexible and extensible way to handle different types of drinks with unit conversion and internationalization support.

## Overview

The drink system is designed to be:
- **Generic**: Uses textual keys instead of numbers for better maintainability
- **Extensible**: Easy to add new drink types and options
- **Internationalized**: Supports multiple languages through translation keys
- **Database-ready**: Includes Supabase schema and service functions
- **Unit-aware**: Automatic conversion between different units (mL, oz, L)

## Core Types

### DrinkTypeKey
```typescript
type DrinkTypeKey = 'beer' | 'wine' | 'cocktail' | 'spirits' | 'other';
```

### DrinkOptionKey
```typescript
type DrinkOptionKey = 
  | 'can' 
  | 'bottle' 
  | 'pint' 
  | 'large' 
  | 'glass' 
  | 'large_glass' 
  | 'standard' 
  | 'strong' 
  | 'double' 
  | 'shot'
  | 'tall'
  | 'small'
  | 'medium'
  | 'extra_large';
```

### UnitType
```typescript
type UnitType = 'ml' | 'oz' | 'l' | 'drink';
```

## Drink Type Structure

Each drink type is defined with:
- **id**: Unique identifier (DrinkTypeKey)
- **name_key**: Translation key for the drink name
- **emoji**: Visual representation
- **default_option**: Default drink option for this type
- **options**: Array of available drink options
- **alcohol_percentage**: Default alcohol percentage (optional)

### Example Drink Type
```typescript
{
  id: 'beer',
  name_key: 'beer',
  emoji: '🍺',
  default_option: 'can',
  alcohol_percentage: 5,
  options: [
    { key: 'can', amount: 330, unit: 'ml' },
    { key: 'bottle', amount: 500, unit: 'ml' },
    { key: 'pint', amount: 473, unit: 'ml' },
    { key: 'large', amount: 1, unit: 'l' },
    { key: 'tall', amount: 568, unit: 'ml' },
  ],
}
```

## Drink Option Structure

Each drink option contains:
- **key**: Unique identifier (DrinkOptionKey)
- **amount**: Quantity of the drink
- **unit**: Unit of measurement (UnitType)
- **alcohol_percentage**: Alcohol percentage (optional, overrides drink type default)

## Unit Standardization

The system standardizes on milliliters (mL) for all storage and calculations:
- **Storage**: All amounts are stored in mL in the database
- **Display**: Amounts can be displayed in mL or oz based on user preference
- **Calculations**: All health and alcohol calculations use mL as the base unit
- **Conversion**: Automatic conversion to oz for display when needed (1 oz = 29.5735 ml)

### Display Functions
```typescript
// Format drink option for display with unit preference
formatDrinkOption(option: DrinkOption, t: (key: string) => string, showAmount?: boolean, preferredUnit?: 'ml' | 'oz'): string

// Calculate total alcohol consumption from drink logs
calculateTotalAlcohol(drinks: DrinkLog[]): DrinkCalculation
```

## Local Database Schema (SQLite + Drizzle)

### drink_logs Table
```sql
CREATE TABLE drink_logs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  drink_type TEXT NOT NULL CHECK (drink_type IN ('beer', 'wine', 'cocktail', 'spirits', 'other')),
  drink_option TEXT NOT NULL,
  drink_name TEXT, -- Optional specific drink name (e.g., "IPA", "Merlot", "Margarita")
  amount_ml REAL NOT NULL, -- Always stored in mL for consistency
  timestamp TEXT NOT NULL, -- ISO string
  is_approximate INTEGER DEFAULT 0, -- Boolean as integer
  alcohol_percentage REAL, -- Optional, for more accurate calculations
  created_at TEXT NOT NULL, -- ISO string
  updated_at TEXT -- ISO string
);
```

### user_preferences Table
```sql
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  favorite_drink TEXT, -- User's favorite drink name
  preferred_unit TEXT DEFAULT 'ml' CHECK (preferred_unit IN ('ml', 'oz')),
  weekly_goal INTEGER DEFAULT 7,
  created_at TEXT NOT NULL, -- ISO string
  updated_at TEXT -- ISO string
);
```

### drink_calculations View
A simplified view that provides:
- `amount_ml`: Amount in milliliters (stored value)
- `alcohol_units`: Standard alcohol units (10g pure alcohol each)

## Usage Examples

### Creating a Drink Log
```typescript
import { createDrinkLog } from '@/services/drinkService';

const drinkLog = await createDrinkLog({
  drink_type: 'beer',
  drink_option: 'can',
  drink_name: 'IPA', // Optional specific drink name
  amount_ml: 330, // Always in mL
  timestamp: new Date().toISOString(),
  is_approximate: false,
});
```

### Getting Drink Types with Translations
```typescript
import { getDrinkTypes } from '@/utils/drinks';
import { useTranslation } from '@/hooks/useTranslation';

const { t } = useTranslation();
const drinkTypes = getDrinkTypes(t);
```

### Formatting Drink Options
```typescript
import { formatDrinkOption } from '@/utils/drinks';

const option = { key: 'can', amount: 330, unit: 'ml' };
const formatted = formatDrinkOption(option, t); // "Can (330ml)"
const formattedOz = formatDrinkOption(option, t, true, 'oz'); // "Can (11.2oz)"
```

### Calculating Total Alcohol Consumption
```typescript
import { calculateTotalAlcohol } from '@/utils/drinks';

const total = calculateTotalAlcohol(drinkLogs);
console.log(`Total: ${total.alcohol_units} units`);
```

## Adding New Drink Types

1. **Add the drink type key** to `DrinkTypeKey` type
2. **Add the drink type definition** to `DRINK_TYPES` in `utils/drinks.ts`
3. **Add translation keys** to `constants/localization.ts`
4. **Update the database schema** if needed

### Example: Adding "Cider"
```typescript
// 1. Update DrinkTypeKey
type DrinkTypeKey = 'beer' | 'wine' | 'cocktail' | 'spirits' | 'other' | 'cider';

// 2. Add to DRINK_TYPES
cider: {
  id: 'cider',
  name_key: 'cider',
  emoji: '🍎',
  default_option: 'bottle',
  alcohol_percentage: 4.5,
  options: [
    { key: 'bottle', amount: 500, unit: 'ml' },
    { key: 'can', amount: 330, unit: 'ml' },
  ],
},

// 3. Add translations
en: {
  cider: "Cider",
  // ...
},
fr: {
  cider: "Cidre",
  // ...
}
```

## Adding New Drink Options

1. **Add the option key** to `DrinkOptionKey` type
2. **Add the option to relevant drink types** in `DRINK_TYPES`
3. **Add translation keys** to `constants/localization.ts`

### Example: Adding "Half Pint"
```typescript
// 1. Update DrinkOptionKey
type DrinkOptionKey = 
  | 'can' 
  | 'bottle' 
  | 'pint' 
  | 'half_pint'  // New option
  | // ...

// 2. Add to beer options
options: [
  { key: 'can', amount: 330, unit: 'ml' },
  { key: 'half_pint', amount: 236.5, unit: 'ml' }, // New option
  // ...
],

// 3. Add translations
en: {
  half_pint: "Half Pint",
  // ...
},
fr: {
  half_pint: "Demi-Pinte",
  // ...
}
```

## Service Functions

The `drinkService.ts` provides comprehensive functions for:
- Creating, reading, updating, and deleting drink logs
- Getting daily and weekly consumption statistics
- Bulk operations for "last night" mode
- Validation and error handling

## Benefits of This System

1. **Maintainability**: Textual keys are easier to understand and modify
2. **Extensibility**: Easy to add new drink types and options
3. **Internationalization**: Built-in support for multiple languages
4. **Type Safety**: Full TypeScript support with strict typing
5. **Offline-First**: Local SQLite database with Drizzle ORM
6. **Unit Standardization**: Consistent mL storage with flexible display options
7. **Local Calculations**: Fast, offline alcohol calculations and statistics
8. **User Preferences**: Local storage of favorite drinks and unit preferences
9. **Personalization**: Optional drink names for better tracking and user experience

## Migration from Old System

The old system used numeric indices and hardcoded labels. The new system:
- Replaces numeric indices with textual keys
- Uses translation keys instead of hardcoded strings
- Provides better type safety
- Includes unit conversion utilities
- Has a complete database schema

To migrate existing code, replace:
- `drinkTypes[index]` with `getDrinkOption(typeKey, optionKey)`
- Hardcoded labels with `formatDrinkOption(option, t)`
- Manual unit conversions with local calculation functions 