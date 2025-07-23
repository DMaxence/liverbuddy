import { getLocales } from "expo-localization";

export const supportedLanguages = ["en", "fr"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLanguage = getLocales()[0]?.languageCode || "en";
  return supportedLanguages.includes(deviceLanguage as SupportedLanguage)
    ? (deviceLanguage as SupportedLanguage)
    : "en";
};

export const translations = {
  en: {
    // Navigation
    home: "Home",
    calendar: "Calendar",
    stats: "Stats",
    settings: "Settings",
    
    // Home Screen
    appTitle: "LiverBuddy",
    lastDrink: "Last drink",
    thisWeeksDrinks: "This week's drinks",
    recentLogs: "recent logs",
    thisWeek: "This Week",
    never: "Never",
    daysAgo: "days ago",
    emptyStateMessage: "No drinks yet — keep up the great work! 🍀",
    
    // Greetings
    morning: "Morning",
    afternoon: "Afternoon", 
    evening: "Evening",
    hey: "Hey",
    
    // Modal
    logADrink: "Log a Drink",
    cancel: "Cancel",
    logIt: "Log it!",
    whatDidYouDrink: "What did you drink?",
    howMuch: "How much?",
    orEnterCustom: "Or enter custom amount:",
    amount: "Amount",
    unit: "Unit (oz, mL, etc.)",
    summary: "Summary",
    invalidAmount: "Invalid Amount",
    invalidAmountMessage: "Please enter a valid amount.",
    
    // Drink Types
    beer: "Beer",
    wine: "Wine", 
    cocktail: "Cocktail",
    spirits: "Spirits",
    other: "Other",
    
    // Drink Options
    can: "Can",
    bottle: "Bottle",
    pint: "Pint",
    large: "Large",
    glass: "Glass",
    largeGlass: "Large Glass",
    standard: "Standard",
    strong: "Strong",
    double: "Double",
    shot: "Shot",
    
    // Units
    ml: "mL",
    oz: "oz",
    l: "L",
    drink: "drink",
    drinks: "drinks",
    
    // Time
    justNow: "Just now",
    hourAgo: "hour ago",
    hoursAgo: "hours ago",
    yesterday: "Yesterday",
    
    // Quick Add Button
    addDrink: "Add drink",
    addLastNightDrinks: "Add last night drinks",
    
    // Liver States
    perfectlyHealthy: "Perfectly Healthy",
    kindaVibing: "Kinda Vibing", 
    lowkeyStruggling: "Lowkey Struggling",
    runningOnRegret: "Running on Regret",
    deeplyConcerned: "Deeply Concerned",
    legallyDeceased: "Legally Deceased",
  },
  fr: {
    // Navigation
    home: "Accueil",
    calendar: "Calendrier",
    stats: "Statistiques",
    settings: "Paramètres",
    
    // Home Screen
    appTitle: "LiverBuddy",
    lastDrink: "Dernière boisson",
    thisWeeksDrinks: "Boissons de la semaine",
    recentLogs: "logs récents",
    thisWeek: "Cette Semaine",
    never: "Jamais",
    daysAgo: "jours",
    emptyStateMessage: "Aucune boisson encore — continuez comme ça ! 🍀",
    
    // Greetings
    morning: "Matin",
    afternoon: "Après-midi",
    evening: "Soir",
    hey: "Salut",
    
    // Modal
    logADrink: "Enregistrer une Boisson",
    cancel: "Annuler",
    logIt: "Enregistrer !",
    whatDidYouDrink: "Qu'avez-vous bu ?",
    howMuch: "Combien ?",
    orEnterCustom: "Ou saisir une quantité personnalisée :",
    amount: "Quantité",
    unit: "Unité (oz, mL, etc.)",
    summary: "Résumé",
    invalidAmount: "Quantité Invalide",
    invalidAmountMessage: "Veuillez saisir une quantité valide.",
    
    // Drink Types
    beer: "Bière",
    wine: "Vin",
    cocktail: "Cocktail",
    spirits: "Spiritueux",
    other: "Autre",
    
    // Drink Options
    can: "Canette",
    bottle: "Bouteille",
    pint: "Pinte",
    large: "Grande",
    glass: "Verre",
    largeGlass: "Grand Verre",
    standard: "Standard",
    strong: "Fort",
    double: "Double",
    shot: "Shot",
    
    // Units
    ml: "mL",
    oz: "oz",
    l: "L",
    drink: "verre",
    drinks: "verres",
    
    // Time
    justNow: "À l'instant",
    hourAgo: "heure",
    hoursAgo: "heures",
    yesterday: "Hier",
    
    // Quick Add Button
    addDrink: "Ajouter une boisson",
    addLastNightDrinks: "Ajouter les boissons d'hier soir",
    
    // Liver States
    perfectlyHealthy: "Parfaitement Sain",
    kindaVibing: "Plutôt Cool",
    lowkeyStruggling: "Un Peu en Difficulté",
    runningOnRegret: "Survit sur les Regrets",
    deeplyConcerned: "Profondément Inquiet",
    legallyDeceased: "Légalement Décédé",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (key: TranslationKey, language: SupportedLanguage = "en"): string => {
  return translations[language][key] || translations.en[key] || key;
};
