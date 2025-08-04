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
    runningOnRegretDescription:
      "The liver is working overtime with no union rights.",
    deeplyConcernedDescription:
      "You've turned your liver into a part-time bartender.",
    legallyDeceasedDescription:
      "Not a liver. Just emotional baggage in organ form.",

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
    deleteSelectedDrinksMessage:
      "Are you sure you want to delete {count} drink{plural}?",
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
    date: "Date",
    now: "Now",
    earlier: "Earlier",
    lastNight: "Last Night",
    selectATime: "Select a time",

    // Common
    back: "Back",
    error: "Error",

    // Not Found Screen
    oops: "Oops!",
    screenDoesNotExist: "This screen does not exist.",
    goToHomeScreen: "Go to home screen!",

    // Settings
    personalInfo: "Personal Info",
    drinkingPreferences: "Drinking Preferences",
    appPreferences: "App Preferences",
    personalInfoSubtitle: "Age, gender, weight, activity level",
    drinkingPreferencesSubtitle: "Habits, favorites, weekly goals",
    appPreferencesSubtitle: "Language, units, display options",
    personalSettings: "Personal Settings",
    appSettings: "App Settings",
    supportSettings: "Support",
    age: "Age",
    gender: "Gender",
    weight: "Weight",
    activityLevel: "Activity Level",
    drinkHabits: "Drink Habits",
    favoriteDrinkType: "Favorite Drink Type",
    favoriteDrinkOption: "Favorite Drink Option",
    favoriteDrinkName: "Favorite Drink Name",
    weeklyGoal: "Weekly Goal",
    language: "Language",
    weightUnit: "Weight Unit",
    quantityUnit: "Quantity Unit",

    // Gender options
    male: "Male",
    female: "Female",
    nonBinary: "Non-binary",
    preferNotToSay: "Prefer not to say",

    // Activity level options
    sedentary: "Sedentary",
    lightlyActive: "Lightly Active",
    moderatelyActive: "Moderately Active",
    veryActive: "Very Active",

    // Drink habits options
    rarely: "Rarely (0-1 times/week)",
    occasionally: "Occasionally (2-3 times/week)",
    regularly: "Regularly (4-5 times/week)",
    frequently: "Frequently (6+ times/week)",

    // Form labels
    ageYears: "years old",
    weightKg: "kg",
    weightLbs: "lbs",
    drinksPerWeek: "drinks per week",
    english: "English",
    french: "French",
    kilograms: "Kilograms",
    pounds: "Pounds",
    milliliters: "Milliliters",
    centiliters: "Centiliters",
    ounces: "Ounces",
    save: "Save",
    saved: "Saved!",
    pleaseEnterAge: "Please enter your age",
    pleaseSelectGender: "Please select your gender",
    pleaseEnterWeight: "Please enter your weight",
    settingsSaved: "Settings saved successfully!",
    settingsError: "Failed to save settings",

    // Credits
    credits: "Developed with ❤️ and 🍺",
    version: "Version",
    customizeExperience: "Customize your LiverBuddy experience",

    // App Preferences
    accurateCalculations: "Accurate Calculations",
    advanced: "Advanced",
    simple: "Simple",

    // Support Page
    support: "Support",
    supportSubtitle: "Get support from the team",

    //infos page
    infos: "Infos",
    infosSubtitle: "Learn how your liver health score is calculated",

    // Feedback
    feedback: "Feedback",
    feedbackTitle: "Title",
    feedbackDescription: "Description",
    feedbackRating: "Do you like the app?",
    feedbackSubmit: "Submit Feedback",
    feedbackCancel: "Cancel",
    feedbackSuccess: "Thank you for your feedback!",
    feedbackError: "Failed to submit feedback",
    feedbackTitlePlaceholder: "Enter feedback title...",
    feedbackDescriptionPlaceholder: "Tell us what you think...",
    howScoringWorks: "How Scoring Works",
    howScoringWorksDescription:
      "Your liver health score is calculated using medical research and your personal drinking patterns. The score ranges from 0-10, where 10 is excellent liver health and 0 indicates critical stress.",
    accurateCalculationsDescription:
      "Advanced calculations that consider your personal factors like age, weight, gender, and activity level for precise health assessment.",
    accurateFactor1:
      "Personal factors: age, weight, gender, and activity level",
    accurateFactor2:
      "Blood alcohol concentration (BAC) calculations using Widmark formula",
    accurateFactor3:
      "Alcohol metabolism rate based on individual characteristics",
    accurateFactor4: "Liver recovery time estimation",
    accurateFactor5: "Medical risk assessment based on consumption patterns",
    accurateFactor6:
      "Modified Widmark Formula: BAC = (grams alcohol / (body weight × r)) × 100",
    accurateFactor7:
      "Variable elimination rates: Women eliminate 10-52% faster per unit lean body mass",
    accurateFactor8: "Age adjustments: 15% slower after 65, 5% slower after 40",
    simpleCalculations: "Simple Calculations",
    simpleCalculationsDescription:
      "Straightforward calculations based primarily on alcohol quantity for quick assessment.",
    simpleFactor1: "Based mainly on total alcohol units consumed",
    simpleFactor2: "Considers binge drinking patterns (speed of consumption)",
    simpleFactor3: "Provides quick, easy-to-understand health assessment",
    scoringSystem: "Scoring System",
    scoringSystemDescription:
      "Comprehensive liver health assessment using multiple metrics:",
    scoringSystem1:
      "Daily Score (0-10): Based on consumption amount, peak BAC, and recovery time",
    scoringSystem2:
      "Global Score: Long-term assessment considering 30-day patterns",
    scoringSystem3:
      "Risk Levels: Low, moderate, high, and critical classifications",
    scoringSystem4: "Peak BAC tracking with multiple drinks over time",
    scoreRanges: "Score Ranges",
    scoreRangesDescription:
      "Understanding what your score means for your liver health:",
    scoreRange1: "8-10: Excellent liver health - keep up the good work!",
    scoreRange2: "6-7: Good liver health - consider moderating intake",
    scoreRange3: "4-5: Moderate liver stress - time for a break",
    scoreRange4: "2-3: High liver stress - significant recovery needed",
    scoreRange5: "0-1: Critical liver stress - seek medical advice",
    healthGuidelines: "Health Guidelines",
    healthGuidelinesDescription:
      "Integration of international health standards and recommendations:",
    healthGuideline1: "WHO Standards: 10g pure alcohol as standard drink unit",
    healthGuideline2: "Daily Limits: Men ≤2 drinks, Women ≤1 drink per day",
    healthGuideline3:
      "Weekly Limits: <100g/week low risk, 100-280g moderate risk, >280g high risk",
    healthGuideline4:
      "Recovery Periods: 2-3 alcohol-free days per week recommended",
    advancedFeatures: "Advanced Features",
    advancedFeaturesDescription:
      "Sophisticated analysis capabilities for comprehensive health assessment:",
    advancedFeature1:
      "Peak BAC Tracking: Calculates maximum BAC over time with multiple drinks",
    advancedFeature2:
      "Binge Drinking Detection: Identifies harmful consumption patterns",
    advancedFeature3:
      "Alcohol Use Disorder Risk: Flags potential AUD based on patterns",
    advancedFeature4:
      "Personalized Recommendations: Tailored advice based on individual risk factors",
    recommendations: "Recommendations",
    recommendationsDescription:
      "Based on your score, we provide personalized recommendations:",
    recommendation1: "Hydration and nutrition advice",
    recommendation2: "Recovery time suggestions",
    recommendation3: "Drinking pattern improvements",
    recommendation4: "When to seek medical attention",
    // Specific recommendation messages
    recommendationsReduceAlcohol:
      "Consider reducing your alcohol intake slightly.",
    recommendationsAlternateWater:
      "Try alternating alcoholic drinks with water.",
    recommendationsLiverCare:
      "Your liver needs some care. Consider a break from alcohol.",
    recommendationsHydrationNutrition:
      "Focus on hydration and nutrition today.",
    recommendationsHighAlcoholDetected: "⚠️ High alcohol consumption detected.",
    recommendationsTakeBreak: "Take a break from alcohol for several days.",
    recommendationsSpeakDoctor: "Consider speaking with a healthcare provider.",
    recommendationsGreatJob: "Great job! Your liver is happy today. 🎉",
    recommendationsKeepUp: "Keep up the responsible drinking pattern.",
    recommendationsAvoidDrinking: "Avoid drinking for the next 24-48 hours.",
    recommendationsMonitorSymptoms:
      "Monitor for symptoms like nausea or abdominal pain.",
    recommendationsRecoveryDays: "Allow {days} days for liver recovery.",
    recommendationsSupportRecovery:
      "Support recovery with plenty of water and rest.",
    recommendationsAgeSlows:
      "As we age, alcohol processing slows. Consider lower limits.",
    recommendationsExercise: "Regular exercise can improve alcohol metabolism.",
    // Additional specific recommendations
    recommendationsModerateDrinking:
      "Moderate drinking detected. Consider slowing down.",
    recommendationsHeavyDrinking: "Heavy drinking. Take a break and hydrate.",
    recommendationsExcessiveDrinking:
      "⚠️ Excessive drinking. Stop and seek help if needed.",
    supportFooter: "This information is for educational purposes only.",
    supportDisclaimer:
      "Always consult healthcare professionals for medical advice.",
    sources: "Sources",
    sourcesDescription:
      "Our calculations are based on the following medical sources and research:",
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
    medium: "Demi",
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
    perfectlyHealthyDescription:
      "Je suis pratiquement un smoothie vert avec des jambes.",
    kindaVibingDescription: "Un verre ne peut pas faire de mal… non ?",
    lowkeyStrugglingDescription: "On s'en sort encore. Techniquement.",
    runningOnRegretDescription:
      "Le foie travaille en surtemps sans droits syndicaux.",
    deeplyConcernedDescription:
      "Tu as transformé ton foie en barman à temps partiel.",
    legallyDeceasedDescription:
      "Pas un foie. Juste des bagages émotionnels sous forme d'organe.",

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
    deleteSelectedDrinksMessage:
      "Êtes-vous sûr de vouloir supprimer {count} boisson{plural} ?",
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
    date: "Date",
    now: "Maintenant",
    earlier: "Plus tôt",
    lastNight: "Hier soir",
    selectATime: "Sélectionner une heure",

    // Common
    back: "Retour",
    error: "Erreur",

    // Not Found Screen
    oops: "Oups !",
    screenDoesNotExist: "Cet écran n'existe pas.",
    goToHomeScreen: "Aller à l'écran d'accueil !",

    // Settings
    personalInfo: "Informations Personnelles",
    drinkingPreferences: "Préférences de Consommation",
    appPreferences: "Préférences de l'App",
    personalInfoSubtitle: "Âge, genre, poids, niveau d'activité",
    drinkingPreferencesSubtitle: "Habitudes, préférés, objectifs hebdomadaires",
    appPreferencesSubtitle: "Langue, unités, options d'affichage",
    personalSettings: "Paramètres Personnels",
    appSettings: "Paramètres de l'App",
    supportSettings: "Support",
    age: "Âge",
    gender: "Genre",
    weight: "Poids",
    activityLevel: "Niveau d'Activité",
    drinkHabits: "Habitudes de Consommation",
    favoriteDrinkType: "Type de Boisson Préféré",
    favoriteDrinkOption: "Option de Boisson Préférée",
    favoriteDrinkName: "Nom de la Boisson Préférée",
    weeklyGoal: "Objectif Hebdomadaire",
    language: "Langue",
    weightUnit: "Unité de Poids",
    quantityUnit: "Unité de Quantité",

    // Gender options
    male: "Homme",
    female: "Femme",
    nonBinary: "Non-binaire",
    preferNotToSay: "Préfère ne pas dire",

    // Activity level options
    sedentary: "Sédentaire",
    lightlyActive: "Actif Légèrement",
    moderatelyActive: "Actif Modérément",
    veryActive: "Très Actif",

    // Drink habits options
    rarely: "Rarement (0-1 fois/semaine)",
    occasionally: "Occasionnellement (2-3 fois/semaine)",
    regularly: "Régulièrement (4-5 fois/semaine)",
    frequently: "Fréquemment (6+ fois/semaine)",

    // Form labels
    ageYears: "ans",
    weightKg: "kg",
    weightLbs: "lbs",
    drinksPerWeek: "verres par semaine",
    english: "Anglais",
    french: "Français",
    kilograms: "Kilogrammes",
    pounds: "Livres",
    milliliters: "Millilitres",
    centiliters: "Centilitres",
    ounces: "Onces",
    save: "Enregistrer",
    saved: "Enregistré !",
    pleaseEnterAge: "Veuillez entrer votre âge",
    pleaseSelectGender: "Veuillez sélectionner votre genre",
    pleaseEnterWeight: "Veuillez entrer votre poids",
    settingsSaved: "Paramètres enregistrés avec succès !",
    settingsError: "Échec de l'enregistrement des paramètres",

    // Credits
    credits: "Développé avec ❤️ et 🍺",
    version: "Version",
    customizeExperience: "Personnalisez votre expérience LiverBuddy",

    // App Preferences
    accurateCalculations: "Calculs Précis",
    advanced: "Avancé",
    simple: "Simple",

    // Support Page
    support: "Support",
    supportSubtitle: "Obtenez de l'aide de l'équipe",

    // infos page
    infos: "Infos",
    infosSubtitle:
      "Découvrez comment votre score de santé hépatique est calculé",

    howScoringWorks: "Comment Fonctionne le Score",
    howScoringWorksDescription:
      "Votre score de santé hépatique est calculé en utilisant la recherche médicale et vos habitudes de consommation personnelles. Le score varie de 0 à 10, où 10 est une excellente santé hépatique et 0 indique un stress critique.",
    accurateCalculationsDescription:
      "Calculs avancés qui prennent en compte vos facteurs personnels comme l'âge, le poids, le genre et le niveau d'activité pour une évaluation précise de la santé.",
    accurateFactor1:
      "Facteurs personnels : âge, poids, genre et niveau d'activité",
    accurateFactor2:
      "Calculs de concentration d'alcool dans le sang (BAC) avec la formule de Widmark",
    accurateFactor3:
      "Taux de métabolisme de l'alcool basé sur les caractéristiques individuelles",
    accurateFactor4: "Estimation du temps de récupération hépatique",
    accurateFactor5:
      "Évaluation du risque médical basée sur les habitudes de consommation",
    accurateFactor6:
      "Formule de Widmark modifiée : BAC = (grammes d'alcool / (poids corporel × r)) × 100",
    accurateFactor7:
      "Taux d'élimination variables : Les femmes éliminent 10-52% plus vite par unité de masse maigre",
    accurateFactor8:
      "Ajustements d'âge : 15% plus lent après 65 ans, 5% plus lent après 40 ans",
    simpleCalculations: "Calculs Simples",
    simpleCalculationsDescription:
      "Calculs simples basés principalement sur la quantité d'alcool pour une évaluation rapide.",
    simpleFactor1:
      "Basé principalement sur le nombre total d'unités d'alcool consommées",
    simpleFactor2:
      "Prend en compte les habitudes de binge drinking (vitesse de consommation)",
    simpleFactor3:
      "Fournit une évaluation de santé rapide et facile à comprendre",
    scoringSystem: "Système de Score",
    scoringSystemDescription:
      "Évaluation complète de la santé hépatique utilisant plusieurs métriques :",
    scoringSystem1:
      "Score Quotidien (0-10) : Basé sur la quantité consommée, BAC maximal et temps de récupération",
    scoringSystem2:
      "Score Global : Évaluation à long terme considérant les habitudes sur 30 jours",
    scoringSystem3:
      "Niveaux de Risque : Classifications faible, modéré, élevé et critique",
    scoringSystem4:
      "Suivi du BAC maximal avec plusieurs boissons dans le temps",
    scoreRanges: "Échelles de Score",
    scoreRangesDescription:
      "Comprendre ce que signifie votre score pour votre santé hépatique :",
    scoreRange1: "8-10 : Excellente santé hépatique - continuez comme ça !",
    scoreRange2:
      "6-7 : Bonne santé hépatique - envisagez de modérer votre consommation",
    scoreRange3: "4-5 : Stress hépatique modéré - temps de faire une pause",
    scoreRange4:
      "2-3 : Stress hépatique élevé - récupération importante nécessaire",
    scoreRange5: "0-1 : Stress hépatique critique - consultez un médecin",
    healthGuidelines: "Directives de Santé",
    healthGuidelinesDescription:
      "Intégration des normes et recommandations de santé internationales :",
    healthGuideline1:
      "Normes OMS : 10g d'alcool pur comme unité de boisson standard",
    healthGuideline2:
      "Limites Quotidiennes : Hommes ≤2 verres, Femmes ≤1 verre par jour",
    healthGuideline3:
      "Limites Hebdomadaires : <100g/semaine faible risque, 100-280g risque modéré, >280g risque élevé",
    healthGuideline4:
      "Périodes de Récupération : 2-3 jours sans alcool par semaine recommandés",
    advancedFeatures: "Fonctionnalités Avancées",
    advancedFeaturesDescription:
      "Capacités d'analyse sophistiquées pour une évaluation complète de la santé :",
    advancedFeature1:
      "Suivi du BAC Maximal : Calcule le BAC maximum dans le temps avec plusieurs boissons",
    advancedFeature2:
      "Détection du Binge Drinking : Identifie les habitudes de consommation nocives",
    advancedFeature3:
      "Risque de Trouble de l'Usage d'Alcool : Signale les risques potentiels basés sur les habitudes",
    advancedFeature4:
      "Recommandations Personnalisées : Conseils adaptés basés sur les facteurs de risque individuels",
    recommendations: "Recommandations",
    recommendationsDescription:
      "Basé sur votre score, nous fournissons des recommandations personnalisées :",
    recommendation1: "Conseils d'hydratation et de nutrition",
    recommendation2: "Suggestions de temps de récupération",
    recommendation3: "Améliorations des habitudes de consommation",
    recommendation4: "Quand consulter un médecin",
    // Specific recommendation messages
    recommendationsReduceAlcohol:
      "Considérez de réduire votre consommation d'alcool légèrement.",
    recommendationsAlternateWater:
      "Essayez d'alterner les boissons alcoolisées avec de l'eau.",
    recommendationsLiverCare:
      "Votre foie a besoin d'un peu d'attention. Considérez une pause de l'alcool.",
    recommendationsHydrationNutrition:
      "Focalisez-vous sur l'hydratation et la nutrition aujourd'hui.",
    recommendationsHighAlcoholDetected:
      "⚠️ Consommation d'alcool élevée détectée.",
    recommendationsTakeBreak:
      "Prenez une pause de l'alcool pendant plusieurs jours.",
    recommendationsSpeakDoctor:
      "Considérez de parler à un professionnel de santé.",
    recommendationsGreatJob:
      "Excellent travail ! Votre foie est heureux aujourd'hui. 🎉",
    recommendationsKeepUp: "Continuez le mode de consommation responsable.",
    recommendationsAvoidDrinking:
      "Évitez de boire pendant les 24-48 prochaines heures.",
    recommendationsMonitorSymptoms:
      "Surveillez les symptômes comme la nausée ou la douleur abdominale.",
    recommendationsRecoveryDays:
      "Autorisez {days} jours pour la récupération du foie.",
    recommendationsSupportRecovery:
      "Supportez la récupération avec beaucoup d'eau et de repos.",
    recommendationsAgeSlows:
      "Avec l'âge, le traitement de l'alcool ralentit. Considérez des limites plus basses.",
    recommendationsExercise:
      "L'exercice régulier peut améliorer le métabolisme de l'alcool.",
    // Additional specific recommendations
    recommendationsModerateDrinking:
      "Consommation modérée détectée. Considérez de ralentir.",
    recommendationsHeavyDrinking:
      "Consommation excessive. Prenez une pause et hydratez-vous.",
    recommendationsExcessiveDrinking:
      "⚠️ Consommation excessive. Arrêtez et demandez de l'aide si nécessaire.",
    supportFooter: "Ces informations sont à des fins éducatives uniquement.",
    supportDisclaimer:
      "Consultez toujours des professionnels de santé pour des conseils médicaux.",
    sources: "Sources",
    sourcesDescription:
      "Nos calculs sont basés sur les sources médicales et recherches suivantes :",

    // Feedback
    feedback: "Feedback",
    feedbackTitle: "Titre",
    feedbackDescription: "Description",
    feedbackRating: "Aimez-vous l'application ?",
    feedbackSubmit: "Envoyer le feedback",
    feedbackCancel: "Annuler",
    feedbackSuccess: "Merci pour votre feedback !",
    feedbackError: "Échec de l'envoi du feedback",
    feedbackTitlePlaceholder: "Entrez le titre du feedback...",
    feedbackDescriptionPlaceholder: "Dites-nous ce que vous pensez...",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (
  key: TranslationKey,
  language: SupportedLanguage = "en"
): string => {
  return translations[language][key] || translations.en[key] || key;
};
