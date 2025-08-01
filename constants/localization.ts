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
    listDrinks: "Drinks",

    // Home Screen
    appTitle: "LiverBuddy",
    lastDrink: "Last drink",
    thisWeeksDrinks: "This week's drinks",
    recentDrinks: "Recent drinks",
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
    minuteAgo: "minute ago",
    minutesAgo: "minutes ago",
    hourAgo: "hour ago",
    hoursAgo: "hours ago",
    yesterday: "Yesterday",

    // Quick Add Button
    add: "Add",
    of: "of",
    addDrink: "Add drink",
    addLastNightDrinks: "Add last night drinks",
    
    // Toast Messages
    drinkAddedSuccess: "Drink logged successfully!",
    drinkAddedToast: "Added", // Used in toast: "Added [amount] [drink] 🍺"
    drinkAddError: "Failed to add drink",
    drinkAddErrorDescription: "Please try again",

    // Liver States
    perfectlyHealthy: "Perfectly Healthy",
    kindaVibing: "Kinda Vibing",
    lowkeyStruggling: "Lowkey Struggling",
    runningOnRegret: "Running on Regret",
    deeplyConcerned: "Deeply Concerned",
    legallyDeceased: "Legally Deceased",
    
    // Liver State Descriptions
    perfectlyHealthyDescription: "I'm basically a green smoothie with legs.",
    kindaVibingDescription: "One drink won't hurt… right?",
    lowkeyStrugglingDescription: "We're still fine. Technically.",
    runningOnRegretDescription: "The liver is working overtime with no union rights.",
    deeplyConcernedDescription: "You've turned your liver into a part-time bartender.",
    legallyDeceasedDescription: "Not a liver. Just emotional baggage in organ form.",

    // Calendar
    drinkingCalendar: "Drinking Calendar",
    monthlySummary: "Monthly Summary",
    totalDrinks: "Total drinks",
    averagePerDay: "Average per day",
    worstDay: "Worst day",
    topDrinkType: "Top drink type",
    noDrinksLogged: "No drinks logged for this day! 🧠",
    liverRecovering: "Your liver is still recovering from recent drinking 🫁",
    loadingCalendar: "Loading calendar...",

    // Stats
    totalDrinksLabel: "Total drinks",
    averagePerDayLabel: "Average per day",
    worstDayLabel: "Worst day",
    topDrinkTypeLabel: "Top drink type",

    // Logs Screen
    edit: "Edit",
    done: "Done",
    deleteSelectedDrinks: "Delete Selected Drinks",
    deleteSelectedDrinksMessage: "Are you sure you want to delete {count} drink{plural}?",
    deleteDrink: "Delete Drink",
    actions: "Actions",
    deleteItem: "Delete {count} item{plural}",
    delete: "Delete",

    // Last Night Slider
    howHeavyWasLastNight: "How heavy was last night?",
    stoneColdSober: "Stone-cold sober",
    barelyABuzz: "Barely a buzz",
    feelingTipsy: "Feeling tipsy",
    nightGotInteresting: "The night got interesting",
    whoBoughtLastRound: "Who bought the last round?",
    dontEvenRemember: "Bro, I don't even remember...\nhell of a hangover",

    // Time Selector
    when: "When?",
    now: "Now",
    earlier: "Earlier",
    lastNight: "Last Night",
    selectATime: "Select a time",

    // Common
    error: "Error",

    // Not Found Screen
    oops: "Oops!",
    screenDoesNotExist: "This screen does not exist.",
    goToHomeScreen: "Go to home screen!",
  },
  fr: {
    // Navigation
    home: "Accueil",
    calendar: "Calendrier",
    stats: "Statistiques",
    settings: "Paramètres",
    listDrinks: "Boissons",

    // Home Screen
    appTitle: "LiverBuddy",
    lastDrink: "Dernière boisson",
    thisWeeksDrinks: "Boissons de la semaine",
    recentDrinks: "Boissons récentes",
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
    minuteAgo: "minute",
    minutesAgo: "minutes",
    hourAgo: "heure",
    hoursAgo: "heures",
    yesterday: "Hier",

    // Quick Add Button
    add: "Ajouter",
    of: "de",
    addDrink: "Ajouter une boisson",
    addLastNightDrinks: "Ajouter les boissons d'hier soir",
    
    // Toast Messages
    drinkAddedSuccess: "Boisson enregistrée avec succès !",
    drinkAddedToast: "Ajouté", // Used in toast: "Ajouté [amount] [drink] 🍺"
    drinkAddError: "Échec de l'ajout de la boisson",
    drinkAddErrorDescription: "Veuillez réessayer",

    // Liver States
    perfectlyHealthy: "Parfaitement Sain",
    kindaVibing: "Plutôt Cool",
    lowkeyStruggling: "Un Peu en Difficulté",
    runningOnRegret: "Survit sur les Regrets",
    deeplyConcerned: "Profondément Inquiet",
    legallyDeceased: "Légalement Décédé",
    
    // Liver State Descriptions
    perfectlyHealthyDescription: "Je suis pratiquement un smoothie vert avec des jambes.",
    kindaVibingDescription: "Un verre ne peut pas faire de mal… non ?",
    lowkeyStrugglingDescription: "On s'en sort encore. Techniquement.",
    runningOnRegretDescription: "Le foie travaille en surtemps sans droits syndicaux.",
    deeplyConcernedDescription: "Tu as transformé ton foie en barman à temps partiel.",
    legallyDeceasedDescription: "Pas un foie. Juste des bagages émotionnels sous forme d'organe.",

    // Calendar
    drinkingCalendar: "Calendrier de Consommation",
    monthlySummary: "Résumé Mensuel",
    totalDrinks: "Total des boissons",
    averagePerDay: "Moyenne par jour",
    worstDay: "Pire jour",
    topDrinkType: "Type de boisson préféré",
    noDrinksLogged: "Aucune boisson enregistrée pour ce jour ! 🧠",
    liverRecovering: "Votre foie se remet encore de la consommation récente 🫁",
    loadingCalendar: "Chargement du calendrier...",

    // Stats
    totalDrinksLabel: "Total des boissons",
    averagePerDayLabel: "Moyenne par jour",
    worstDayLabel: "Pire jour",
    topDrinkTypeLabel: "Type de boisson préféré",

    // Logs Screen
    edit: "Modifier",
    done: "Terminé",
    deleteSelectedDrinks: "Supprimer les Boissons Sélectionnées",
    deleteSelectedDrinksMessage: "Êtes-vous sûr de vouloir supprimer {count} boisson{plural} ?",
    deleteDrink: "Supprimer la Boisson",
    actions: "Actions",
    deleteItem: "Supprimer {count} élément{plural}",
    delete: "Supprimer",

    // Last Night Slider
    howHeavyWasLastNight: "À quel point était-ce intense hier soir ?",
    stoneColdSober: "Sobre comme un roc",
    barelyABuzz: "À peine une sensation",
    feelingTipsy: "Un peu pompette",
    nightGotInteresting: "La soirée est devenue intéressante",
    whoBoughtLastRound: "Qui a payé la dernière tournée ?",
    dontEvenRemember: "Mec, je me souviens même plus...\nquelle gueule de bois",

    // Time Selector
    when: "Quand ?",
    now: "Maintenant",
    earlier: "Plus tôt",
    lastNight: "Hier soir",
    selectATime: "Sélectionner une heure",

    // Common
    error: "Erreur",

    // Not Found Screen
    oops: "Oups !",
    screenDoesNotExist: "Cet écran n'existe pas.",
    goToHomeScreen: "Aller à l'écran d'accueil !",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (
  key: TranslationKey,
  language: SupportedLanguage = "en"
): string => {
  return translations[language][key] || translations.en[key] || key;
};
