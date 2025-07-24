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
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    hey: "Hey",

    // Modal
    logADrink: "Log a Drink",
    cancel: "Cancel",
    logIt: "Log it!",
    whatDidYouDrink: "What did you drink?",
    drinkName: "Drink Name (Optional)",
    drinkNamePlaceholder: "e.g., IPA, Merlot, Margarita",
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
    large_glass: "Large Glass",
    standard: "Standard",
    strong: "Strong",
    double: "Double",
    shot: "Shot",
    tall: "Tall",
    small: "Small",
    medium: "Medium",
    extra_large: "Extra Large",

    // Units
    ml: "mL",
    cl: "cL",
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
    add: "Add",
    of: "of",
    addDrink: "Add drink",
    addLastNightDrinks: "Add last night drinks",

    // Liver States
    perfectlyHealthy: "Perfectly Healthy",
    kindaVibing: "Kinda Vibing",
    lowkeyStruggling: "Lowkey Struggling",
    runningOnRegret: "Running on Regret",
    deeplyConcerned: "Deeply Concerned",
    legallyDeceased: "Legally Deceased",

    // Calendar
    drinkingCalendar: "Drinking Calendar",
    monthlySummary: "Monthly Summary",
    totalDrinks: "Total drinks",
    averagePerDay: "Average per day",
    worstDay: "Worst day",
    topDrinkType: "Top drink type",
    noDrinksLogged: "No drinks logged for this day! 🧠",
    loadingCalendar: "Loading calendar...",

    // Stats
    totalDrinksLabel: "Total drinks",
    averagePerDayLabel: "Average per day",
    worstDayLabel: "Worst day",
    topDrinkTypeLabel: "Top drink type",
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
    morning: "Bonjour",
    afternoon: "Bon après-midi",
    evening: "Bonsoir",
    hey: "Salut",

    // Modal
    logADrink: "Enregistrer une Boisson",
    cancel: "Annuler",
    logIt: "Enregistrer !",
    whatDidYouDrink: "Qu'avez-vous bu ?",
    drinkName: "Nom de la Boisson (Optionnel)",
    drinkNamePlaceholder: "ex: IPA, Merlot, Margarita",
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
    large_glass: "Grand Verre",
    standard: "Standard",
    strong: "Fort",
    double: "Double",
    shot: "Shot",
    tall: "Grande",
    small: "Petite",
    medium: "Moyenne",
    extra_large: "Très Grande",

    // Units
    ml: "mL",
    cl: "cL",
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
    add: "Ajouter",
    of: "de",
    addDrink: "Ajouter une boisson",
    addLastNightDrinks: "Ajouter les boissons d'hier soir",

    // Liver States
    perfectlyHealthy: "Parfaitement Sain",
    kindaVibing: "Plutôt Cool",
    lowkeyStruggling: "Un Peu en Difficulté",
    runningOnRegret: "Survit sur les Regrets",
    deeplyConcerned: "Profondément Inquiet",
    legallyDeceased: "Légalement Décédé",

    // Calendar
    drinkingCalendar: "Calendrier de Consommation",
    monthlySummary: "Résumé Mensuel",
    totalDrinks: "Total des boissons",
    averagePerDay: "Moyenne par jour",
    worstDay: "Pire jour",
    topDrinkType: "Type de boisson préféré",
    noDrinksLogged: "Aucune boisson enregistrée pour ce jour ! 🧠",
    loadingCalendar: "Chargement du calendrier...",

    // Stats
    totalDrinksLabel: "Total des boissons",
    averagePerDayLabel: "Moyenne par jour",
    worstDayLabel: "Pire jour",
    topDrinkTypeLabel: "Type de boisson préféré",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (
  key: TranslationKey,
  language: SupportedLanguage = "en"
): string => {
  return translations[language][key] || translations.en[key] || key;
};
