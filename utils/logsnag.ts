import { LogSnag } from "logsnag";
import { userMetadata } from "./device";
import { isBetaUser } from "./beta";

export const logsnag = new LogSnag({
  token: process.env.EXPO_PUBLIC_LOGSNAG_TOKEN || "",
  project: process.env.EXPO_PUBLIC_LOGSNAG_PROJECT || "",
});

export const logNewAnonymousUser = async (userId: string) => {
  const isBeta = await isBetaUser(userId);
  logsnag.track({
    channel: "users",
    event: "New anonymous user",
    user_id: userId,
    icon: "👋",
    notify: true,
    tags: {
      time: new Date().toISOString(),
      beta: isBeta,
      ...userMetadata,
    },
  });
};

export const logNewUser = async (userId: string, provider: string) => {
  const isBeta = await isBetaUser(userId);
  logsnag.track({
    channel: "users",
    event: `User registered with ${provider}`,
    user_id: userId,
    icon: provider === "apple" ? "🍎" : "🔑",
    notify: true,
    tags: {
      time: new Date().toISOString(),
      provider,
      beta: isBeta,
      ...userMetadata,
    },
  });
};

export const logFeedback = async (
  userId: string,
  {
    title,
    description,
    rating,
  }: { title: string; description: string; rating: number }
) => {
  const isBeta = await isBetaUser(userId);
  logsnag.track({
    channel: "feedback",
    event: "Feedback",
    user_id: userId,
    icon: "💬",
    notify: true,
    tags: {
      time: new Date().toISOString(),
      ...userMetadata,
      title,
      description,
      rating,
      beta: isBeta,
    },
  });
};
