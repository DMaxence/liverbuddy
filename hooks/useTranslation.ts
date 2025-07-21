import { SupportedLanguage, translations } from "@/constants/localization";
import { useLanguage } from "@/stores/uiStore";
import { useMemo } from "react";

export const useTranslation = () => {
  const language = useLanguage();

  const t = useMemo(() => {
    const currentTranslations =
      translations[language as SupportedLanguage] || translations.en;

    return (
      key: keyof typeof translations.en,
      params?: Record<string, string | number>
    ) => {
      let text = (currentTranslations[
        key as keyof typeof currentTranslations
      ] ||
        translations.en[key] ||
        key) as string;

      // Simple parameter replacement
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(`{${paramKey}}`, String(paramValue));
        });
      }

      return text;
    };
  }, [language]);

  return { t, language };
};
