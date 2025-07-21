import { LogSnag } from "logsnag";
import { userMetadata } from "./device";

export const logsnag = new LogSnag({
  token: process.env.EXPO_PUBLIC_LOGSNAG_TOKEN || "",
  project: process.env.EXPO_PUBLIC_LOGSNAG_PROJECT || "",
});

export const logNewAnonymousUser = (userId: string) => {
  logsnag.track({
    channel: "users",
    event: "New anonymous user",
    user_id: userId,
    icon: "👋",
    notify: true,
    tags: {
      time: new Date().toISOString(),
      ...userMetadata,
    },
  });
};

export const logNewUser = (userId: string, provider: string) => {
  logsnag.track({
    channel: "users",
    event: `User registered with ${provider}`,
    user_id: userId,
    icon: provider === "apple" ? "🍎" : "🔑",
    notify: true,
    tags: {
      time: new Date().toISOString(),
      provider,
      ...userMetadata,
    },
  });
};
