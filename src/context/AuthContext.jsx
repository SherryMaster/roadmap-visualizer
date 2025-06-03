/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email, photoURL } = user;
        const createdAt = new Date();

        await setDoc(userRef, {
          displayName: displayName || "",
          email,
          photoURL: photoURL || "",
          createdAt,
          lastLoginAt: createdAt,
          preferences: {
            theme: "auto",
            emailNotifications: true,
            roadmapSharing: true,
          },
          ...additionalData,
        });
      } else {
        // Update last login time
        await updateDoc(userRef, {
          lastLoginAt: new Date(),
        });
      }

      // Fetch and set user profile
      const updatedUserSnap = await getDoc(userRef);
      setUserProfile(updatedUserSnap.data());
    } catch (error) {
      console.error("Error creating user profile:", error);
      setError("Failed to create user profile");
    }
  };

  // Sign up with email and password
  const signup = async (email, password, displayName = "") => {
    try {
      setError(null);
      setLoading(true);

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      await createUserProfile(user, { displayName });
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await createUserProfile(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setError(null);

      if (!currentUser) throw new Error("No user logged in");

      // Update Firebase Auth profile
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        await updateProfile(currentUser, {
          ...(updates.displayName !== undefined && {
            displayName: updates.displayName,
          }),
          ...(updates.photoURL !== undefined && { photoURL: updates.photoURL }),
        });
      }

      // Update Firestore profile
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });

      // Refresh user profile
      const updatedUserSnap = await getDoc(userRef);
      setUserProfile(updatedUserSnap.data());
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);

      if (!currentUser) throw new Error("No user logged in");

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Load user profile in background (non-blocking)
  const loadUserProfile = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
        console.log("👤 User profile loaded from Firestore");
      } else {
        // Create profile if it doesn't exist (non-blocking)
        console.log("👤 Creating new user profile...");
        await createUserProfile(user);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Don't block auth flow for profile errors
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Set user immediately (this is fast - from cache)
      setCurrentUser(user);

      // Mark auth as initialized after first state change
      if (!authInitialized) {
        setAuthInitialized(true);
        setLoading(false); // Stop loading immediately when auth state is determined
      }

      // Load user profile in background (non-blocking)
      if (user) {
        loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
    });

    // Set a timeout as fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!authInitialized) {
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 2000); // Reduced to 2 seconds for better UX

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [authInitialized]);

  const value = {
    currentUser,
    userProfile,
    loading,
    authInitialized,
    error,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
