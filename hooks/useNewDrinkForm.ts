import { useTranslation } from "@/hooks/useTranslation";
import { UserData } from "@/services/userDataService";
import { DrinkOption, DrinkType } from "@/types";
import { getDrinkTypes } from "@/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TimeMode = "now" | "earlier" | "lastNight";

export interface FormState {
  selectedType: DrinkType;
  selectedOption: DrinkOption;
  drinkName: string;
  customAmount: string;
  customUnit: string;
  useCustomTime: boolean;
  customTime: Date;
  timeMode: TimeMode;
  sliderValue: number;
}

export interface FormActions {
  setDrinkName: (name: string) => void;
  setCustomAmount: (amount: string) => void;
  setCustomUnit: (unit: string) => void;
  setSliderValue: (value: number) => void;
  handleTypeSelect: (type: DrinkType) => void;
  handleOptionSelect: (option: DrinkOption) => void;
  handleTimeModeChange: (mode: TimeMode) => void;
  handleTimeChange: (date: Date) => void;
}

export interface FormValidation {
  isFormValid: boolean;
  isAmountValid: (amount: number) => boolean;
}

export const useNewDrinkForm = (
  userData: UserData,
  initialMode: "normal" | "lastNight",
  isVisible: boolean
) => {
  const { t } = useTranslation();

  // Memoize the translation function to prevent drinkTypes from changing
  const translateFn = useCallback((key: string) => t(key as any), [t]);
  const drinkTypes = useMemo(() => getDrinkTypes(translateFn), [translateFn]);

  // Helper functions to get default values
  const getSelectedDrinkType = useCallback(() => {
    return (
      drinkTypes.find((type) => type.id === userData.favorite_drink_type) ||
      drinkTypes[0]
    );
  }, [drinkTypes, userData.favorite_drink_type]);

  const getSelectedOption = useCallback(() => {
    const type = getSelectedDrinkType();
    return (
      type.options.find(
        (option) => option.key === userData.favorite_drink_option
      ) || type.options[0]
    );
  }, [getSelectedDrinkType, userData.favorite_drink_option]);

  // Create initial state - memoized to prevent unnecessary recreations
  const createInitialState = useCallback(
    (): FormState => ({
      selectedType: getSelectedDrinkType(),
      selectedOption: getSelectedOption(),
      drinkName: userData?.favorite_drink || "",
      customAmount: "",
      customUnit: userData?.preferred_unit || "",
      useCustomTime: false,
      customTime: new Date(),
      timeMode: initialMode === "lastNight" ? "lastNight" : "now",
      sliderValue: 1,
    }),
    [
      getSelectedDrinkType,
      getSelectedOption,
      userData?.favorite_drink,
      userData?.preferred_unit,
      initialMode,
    ]
  );

  const [formState, setFormState] = useState<FormState>(() =>
    createInitialState()
  );

  // Track previous visibility to only reset when modal opens (not on every render when visible)
  const prevVisible = useRef(isVisible);

  useEffect(() => {
    // Only reset when modal transitions from closed to open
    if (isVisible && !prevVisible.current) {
      setFormState(createInitialState());
    }
    prevVisible.current = isVisible;
  }, [isVisible, createInitialState]);

  // Actions
  const actions: FormActions = useMemo(
    () => ({
      setDrinkName: (name: string) =>
        setFormState((prev) => ({ ...prev, drinkName: name })),

      setCustomAmount: (amount: string) =>
        setFormState((prev) => ({ ...prev, customAmount: amount })),

      setCustomUnit: (unit: string) =>
        setFormState((prev) => ({ ...prev, customUnit: unit })),

      setSliderValue: (value: number) =>
        setFormState((prev) => ({ ...prev, sliderValue: value })),

      handleTypeSelect: (type: DrinkType) =>
        setFormState((prev) => ({
          ...prev,
          selectedType: type,
          selectedOption: type.options[0],
          customAmount: "",
          customUnit: "",
        })),

      handleOptionSelect: (option: DrinkOption) =>
        setFormState((prev) => ({
          ...prev,
          selectedOption: option,
          customAmount: "",
          customUnit: "",
        })),

      handleTimeModeChange: (mode: TimeMode) =>
        setFormState((prev) => ({
          ...prev,
          timeMode: mode,
          useCustomTime: mode === "earlier",
          customTime: new Date(),
        })),

      handleTimeChange: (date: Date) =>
        setFormState((prev) => ({ ...prev, customTime: date })),
    }),
    []
  );

  // Validation
  const validation: FormValidation = useMemo(
    () => ({
      isAmountValid: (amount: number) => !isNaN(amount) && amount > 0,

      isFormValid:
        formState.timeMode === "lastNight"
          ? true
          : formState.selectedType &&
            (formState.customAmount
              ? !isNaN(parseFloat(formState.customAmount)) &&
                parseFloat(formState.customAmount) > 0
              : true),
    }),
    [formState]
  );

  // Reset function
  const resetForm = useCallback(() => {
    setFormState(createInitialState());
  }, [createInitialState]);

  return {
    formState,
    actions,
    validation,
    resetForm,
  };
};
