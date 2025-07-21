import { queryKeys } from "@/lib/react-query";
import {
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  onAuthStateChange,
  signInAnonymously,
  signOut as supabaseSignOut,
  updateUserProfile,
} from "@/services/supabase";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/types";
import { userMetadata } from "@/utils/device";
import { logNewAnonymousUser } from "@/utils/logsnag";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

// Auth hooks
export const useAuth = () => {
  const queryClient = useQueryClient();
  const {
    user,
    session,
    isLoading,
    error,
    setUser,
    setSession,
    setLoading,
    setError,
    clearAuth,
  } = useAuthStore();

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      console.log("initializeAuth-------------------");

      const { session, error: sessionError } = await getCurrentSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setError(sessionError.message);
        return;
      }

      if (session?.user) {
        const { user, error: userError } = await getCurrentUser();

        if (userError) {
          console.error("User error:", userError);
          setError(userError.message);
          return;
        }

        if (user) {
          const isAnonymous = user.is_anonymous;
          setSession(session);

          if (isAnonymous) {
            setUser(null);
          } else {
            const { data: profile, error: profileError } = await getUserProfile(
              user.id
            );

            if (profileError) {
              console.error("Profile error:", profileError);
              setError(profileError.message);
              return;
            }

            if (profile) {
              setUser(profile);
              // Update user metadata when app opens
              await updateUserProfile(user.id, userMetadata);
            } else {
              console.error("User exists but no profile found:", user.id);
              setError("Profile not found");
            }
          }
        }
      } else {
        // No session, sign in anonymously
        const { data, error } = await signInAnonymously();
        if (error) {
          setError(error.message);
        } else {
          await updateUserProfile(data.user?.id as string, userMetadata);
          logNewAnonymousUser(data.user?.id as string);
        }
      }
    } catch (error: any) {
      console.error("Auth initialization error:", error);
      setError("Failed to initialize authentication");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSession, setUser]);

  // Auth state listener
  useEffect(() => {
    const { data: authListener } = onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const isAnonymous = session.user.is_anonymous;
        setSession(session);

        if (!isAnonymous) {
          try {
            const { data: profile, error: profileError } = await getUserProfile(
              session.user.id
            );
            console.log(
              "onAuthStateChange profile-------------------",
              JSON.stringify({ profile }, null, 2)
            );

            if (profileError) {
              console.error("onAuthStateChange Profile error:", profileError);
              setError(profileError.message);
              return;
            }

            if (profile) {
              setUser(profile);
              // Update user metadata when user signs in
              await updateUserProfile(session.user.id, userMetadata);
            } else {
              console.error(
                "onAuthStateChange User exists but no profile found:",
                session.user.id
              );
              setError("Profile not found");
            }
          } catch (error: any) {
            console.error("Error in auth state change handler:", error);
            setError(error.message);
          }
        } else {
          setUser(null);
        }
      } else if (event === "SIGNED_OUT") {
        clearAuth();
        // Clear React Query cache
        queryClient.clear();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [setUser, setSession, setError, clearAuth, queryClient]);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    initializeAuth,
  };
};

// Auth mutations using React Query
export const useSignInAnonymously = () => {
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: signInAnonymously,
    onMutate: () => setLoading(true),
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
    },
    onSuccess: async (data) => {
      setError(null);
      setLoading(false);
      // Update user metadata after anonymous sign in
      if (data.data?.user?.id) {
        await updateUserProfile(data.data.user.id, userMetadata);
      }
    },
  });
};

// export const useSignInWithEmail = () => {
//   const { setLoading, setError } = useAuthStore();

//   return useMutation({
//     mutationFn: ({ email, password }: { email: string; password: string }) =>
//       signInWithEmail(email, password),
//     onMutate: () => setLoading(true),
//     onError: (error: any) => {
//       setError(error.message);
//       setLoading(false);
//     },
//     onSuccess: async (data) => {
//       setError(null);
//       setLoading(false);
//       // Update user metadata after email sign in
//       if (data.data?.user?.id) {
//         await updateUserProfile(data.data.user.id, userMetadata);
//       }
//     },
//   });
// };

// export const useSignUpWithEmail = () => {
//   const { setLoading, setError } = useAuthStore();

//   return useMutation({
//     mutationFn: ({
//       email,
//       password,
//       userData,
//     }: {
//       email: string;
//       password: string;
//       userData: { username: string; full_name?: string };
//     }) => signUpWithEmail(email, password, userData),
//     onMutate: () => setLoading(true),
//     onError: (error: any) => {
//       console.log(
//         "useSignUpWithEmail error-------------------",
//         JSON.stringify({ error }, null, 2)
//       );
//       setError(error.message);
//       setLoading(false);
//     },
//     onSuccess: async (data) => {
//       setError(null);
//       setLoading(false);
//       // Update user metadata after sign up
//       if (data.data?.user?.id && data.data.user.created_at) {
//         const createdAt = new Date(data.data.user.created_at);
//         const now = new Date();
//         if (
//           createdAt.getDate() !== now.getDate() &&
//           createdAt.getMonth() !== now.getMonth() &&
//           createdAt.getFullYear() !== now.getFullYear()
//         ) {
//           logNewUser(data.data.user.id, "email");
//           await updateUserProfile(data.data.user.id, {
//             ...userMetadata,
//             full_name:
//               data.data.user.user_metadata?.full_name ||
//               data.data.user.user_metadata?.display_name,
//             email: data.data.user.email,
//             username: data.data.user.user_metadata?.username,
//           });
//         }
//       }
//     },
//   });
// };

// export const useSignInWithApple = () => {
//   const { setLoading, setError } = useAuthStore();

//   return useMutation({
//     mutationFn: (credential: string) => signInWithApple(credential),
//     onMutate: () => setLoading(true),
//     onError: (error: any) => {
//       setError(error.message);
//       setLoading(false);
//     },
//     onSuccess: async (data) => {
//       setError(null);
//       setLoading(false);
//       // Update user metadata after Apple sign in
//       if (data.data?.user?.id && data.data.user.created_at) {
//         const createdAt = new Date(data.data.user.created_at);
//         const now = new Date();
//         if (
//           createdAt.getDate() !== now.getDate() &&
//           createdAt.getMonth() !== now.getMonth() &&
//           createdAt.getFullYear() !== now.getFullYear()
//         ) {
//           logNewUser(data.data.user.id, "apple");
//           await updateUserProfile(data.data.user.id, {
//             ...userMetadata,
//             full_name:
//               data.data.user.user_metadata?.full_name ||
//               data.data.user.user_metadata?.display_name,
//             email: data.data.user.email,
//           });
//         }
//       }
//     },
//   });
// };

export const useSignOut = () => {
  const { setLoading, setError, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supabaseSignOut,
    onMutate: () => setLoading(true),
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      setLoading(false);
    },
  });
};

export const useUpdateUserProfile = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<User>) => {
      if (!user) throw new Error("No user to update");
      return updateUserProfile(user.id, updates);
    },
    onSuccess: (data) => {
      if (data.data && user) {
        setUser({ ...user, ...data.data });
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
      }
    },
  });
};

// export const useCleanAnonymousUserProfile = () => {
//   return useMutation({
//     mutationFn: cleanAnonymousUserProfile,
//   });
// };
