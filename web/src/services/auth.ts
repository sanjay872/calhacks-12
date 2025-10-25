import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// User data interface
export interface UserData {
  uid: string;
  email: string;
  company: string;
  createdAt: any;
  lastLogin?: any;
}

// Sign Up with Email, Password, and Company
export const signUp = async (
  email: string,
  password: string,
  company: string
): Promise<UserCredential> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("first update profile completed", userCredential.user);

    // Update user profile with display name (company)
    await updateProfile(userCredential.user, {
      displayName: company,
    });

    // Store additional user data in Firestore
    console.log("update profile completed");

    try {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        company: company,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } catch (error: any) {
      console.error("Error storing user data:", error);
    }

    console.log("signUp:", userCredential.user);
    return userCredential;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// Sign In with Email and Password
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update last login time
    await setDoc(
      doc(db, "users", userCredential.user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );

    return userCredential;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// Sign Out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error("Failed to sign out. Please try again.");
  }
};

// Send Password Reset Email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// Get User Data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Helper function to convert Firebase error codes to user-friendly messages
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return "An error occurred. Please try again.";
  }
};
