import { useState, useEffect } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserData, type UserData } from "../services/auth";

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // User is signed in
          try {
            const userData = await getUserData(user.uid);
            setAuthState({
              user,
              userData,
              loading: false,
              error: null,
            });
          } catch (error) {
            setAuthState({
              user,
              userData: null,
              loading: false,
              error: "Failed to load user data",
            });
          }
        } else {
          // User is signed out
          setAuthState({
            user: null,
            userData: null,
            loading: false,
            error: null,
          });
        }
      },
      (error) => {
        setAuthState({
          user: null,
          userData: null,
          loading: false,
          error: error.message,
        });
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return authState;
};
