# 🔥 Firebase Setup Guide

## Step 1: Install Firebase

```bash
npm install firebase
```

## Step 2: Create Firebase Config

Create `src/firebase/config.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
```

## Step 3: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Click the web icon (</>) to add a web app
4. Copy the config values
5. Paste them into `firebase/config.ts`

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method

## Step 5: Set Up Firestore (Optional)

To store company information:

1. Go to **Firestore Database**
2. Click **Create Database**
3. Start in **test mode** (or production mode with rules)
4. Create a collection called `users`

## Step 6: Update SignIn.tsx

Add Firebase auth to `signin.tsx`:

```typescript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed in:", userCredential.user);
    // Navigate to home
    navigate("/");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Step 7: Update SignUp.tsx

Add Firebase auth to `signup.tsx`:

```typescript
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...

  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with company name
    await updateProfile(userCredential.user, {
      displayName: company,
    });

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      company: company,
      createdAt: new Date().toISOString(),
    });

    setSuccess(true);
    setTimeout(() => navigate("/"), 2000);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Step 8: Add Protected Routes

Create `src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return <>{children}</>;
}
```

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

## Step 9: Update App.tsx with Protected Routes

```typescript
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contract"
          element={
            <ProtectedRoute>
              <Contract />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

## Security Rules for Firestore

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Done! 🎉

Your Firebase authentication is now set up with:

- ✅ Beautiful sign-in page
- ✅ Sign-up with email, password, and company
- ✅ Password strength indicator
- ✅ Error handling
- ✅ Loading states
- ✅ Protected routes
