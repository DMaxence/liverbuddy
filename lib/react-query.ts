import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

// Create the persister for AsyncStorage
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "liver-buddy-cache",
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Configure React Query client with offline-first settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache settings based on environment
      staleTime: __DEV__ ? 0 : 5 * 60 * 1000,
      // Keep data in cache based on environment
      gcTime: __DEV__ ? 0 : 24 * 60 * 60 * 1000,
      // Retry failed queries 3 times
      retry: (failureCount: number, error: any) => {
        // Don't retry on certain error types
        if (error && typeof error === "object" && "status" in error) {
          if ([401, 403, 404].includes(error.status as number)) {
            return false;
          }
        }
        return failureCount < 3;
      },
      // Refetch settings based on environment
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: false,
      // Always refetch in dev mode
      refetchOnMount: __DEV__ ? "always" : true,
      // Use network-first approach
      networkMode: __DEV__ ? "online" : "offlineFirst",
    },
    mutations: {
      // Retry mutations when back online
      retry: (failureCount: number, error: any) => {
        if (error && typeof error === "object" && "status" in error) {
          if ([401, 403, 404].includes(error.status as number)) {
            return false;
          }
        }
        return failureCount < 3;
      },
      // Queue mutations when offline
      networkMode: __DEV__ ? "online" : "offlineFirst",
    },
  },
});

// Network status tracking
let isOnline = true;

NetInfo.addEventListener((state) => {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? false;

  if (!wasOnline && isOnline) {
    // Back online - resume paused queries and mutations
    queryClient.resumePausedMutations();
    queryClient.invalidateQueries();
  }
});

// Helper to check if we're online
export const getNetworkStatus = () => isOnline;

// Query keys factory for consistency
export const queryKeys = {
  // Auth
  user: ["user"] as const,
  userProfile: (id: string) => ["user", "profile", id] as const,

  // Badges
  badges: ["badges"] as const,
  userBadges: (userId: string) => ["user", userId, "badges"] as const,
} as const;
