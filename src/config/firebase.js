/**
 * Firebase Configuration
 * Initialize Firebase app with authentication and Firestore
 */

import { initializeApp, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Firebase configuration
// Set VITE_FIREBASE_DEMO_MODE=true in your .env file to use demo mode
const isDemoMode = import.meta.env.VITE_FIREBASE_DEMO_MODE === "true";

const firebaseConfig = isDemoMode
  ? {
      // Demo configuration - uses Firebase emulators
      apiKey: "demo-api-key",
      authDomain: "demo-project.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo",
    }
  : {
      // Production configuration from environment variables
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional, for Google Analytics
    };

// Validate configuration
if (!isDemoMode && !firebaseConfig.apiKey) {
  console.error("❌ Firebase configuration error: API key is missing!");
  console.error(
    "Please check your .env.local file and ensure all VITE_FIREBASE_* variables are set."
  );
}

// Initialize Firebase (with duplicate app check)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === "app/duplicate-app") {
    // App already exists, get the existing instance
    app = getApp();
  } else {
    throw error;
  }
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Connect to emulators in development or demo mode
if (import.meta.env.DEV || isDemoMode) {
  try {
    // Connect to Firebase emulators for development/demo
    if (isDemoMode) {
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(db, "localhost", 8080);
    }
    // Uncomment these lines if you want to use Firebase emulators in development
    // connectAuthEmulator(auth, "http://localhost:9099");
    // connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log("Emulator connection failed:", error);
  }
}

export default app;
