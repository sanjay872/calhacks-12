import { getCurrentUser } from "../services/auth";

/**
 * Get the current user's UID
 * Returns null if no user is signed in
 */
export const getUserUid = (): string | null => {
  const user = getCurrentUser();
  return user?.uid || null;
};

/**
 * Get the current user's email
 * Returns null if no user is signed in
 */
export const getUserEmail = (): string | null => {
  const user = getCurrentUser();
  return user?.email || null;
};

/**
 * Check if a user is currently signed in
 */
export const isUserSignedIn = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Get the current user object
 * Returns null if no user is signed in
 */
export const getUser = () => {
  return getCurrentUser();
};
