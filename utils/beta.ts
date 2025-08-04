import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTestFlight } from "expo-testflight";

export const storeBetaUser = async (userId: string) => {
  if (!isTestFlight) {
    return;
  }
  const isBeta = await AsyncStorage.getItem("beta_user_id");
  if (isBeta) {
    return;
  }
  await AsyncStorage.setItem("beta_user_id", userId);
};
