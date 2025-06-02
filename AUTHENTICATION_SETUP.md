# 🔐 Authentication Setup Guide

This guide will help you set up Firebase Authentication for the Roadmap Visualizer application.

## 🚀 Quick Start

### Option 1: Use Your Existing Firebase Project (Recommended)

You already have a Firebase project (`roadmap-cc3d6`) configured! Your `.env.local` file contains the correct configuration.

1. **Enable Authentication in Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your `roadmap-cc3d6` project
   - Navigate to **Authentication** > **Sign-in method**
   - Enable the following providers:
     - **Email/Password** (required)
     - **Google** (optional but recommended)

2. **Set up Firestore Database:**
   - Navigate to **Firestore Database**
   - Click **Create database**
   - Choose **Start in test mode** (for development)
   - Select your preferred location

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Test authentication:**
   - Visit `http://localhost:5173`
   - Click "Sign Up" to create a new account
   - Try signing in with your new account

### Option 2: Demo Mode (No Firebase Setup Required)

For testing without setting up Firebase:

1. **Enable demo mode:**
   ```bash
   # Add this to your .env.local file
   echo "VITE_FIREBASE_DEMO_MODE=true" >> .env.local
   ```

2. **Install Firebase CLI (for emulators):**
   ```bash
   npm install -g firebase-tools
   ```

3. **Start Firebase emulators:**
   ```bash
   firebase emulators:start --only auth,firestore
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

## 🔧 Firebase Console Setup

### Step 1: Enable Authentication Providers

1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

3. Enable **Google** (optional):
   - Click on "Google"
   - Toggle "Enable"
   - Add your project's support email
   - Click "Save"

### Step 2: Configure Firestore Security Rules

Go to **Firestore Database** > **Rules** and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own roadmaps
    match /roadmaps/{roadmapId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Allow users to create new roadmaps
    match /roadmaps/{roadmapId} {
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 🏗️ Architecture Overview

### Authentication Flow

1. **User Registration/Login** → Firebase Auth
2. **User Profile Creation** → Firestore `/users/{uid}`
3. **Roadmap Data** → Firestore `/roadmaps/{roadmapId}`
4. **Protected Routes** → `ProtectedRoute` component

### Key Components

- **`AuthContext`** - Global authentication state management
- **`ProtectedRoute`** - Route protection for authenticated users
- **`UserMenu`** - User navigation and profile access
- **`Login/Signup`** - Authentication forms
- **`ProfilePage`** - User profile management
- **`SettingsPage`** - Account settings and preferences

### Data Structure

```javascript
// User Profile (Firestore: /users/{uid})
{
  displayName: "John Doe",
  email: "john@example.com",
  photoURL: "https://...",
  createdAt: timestamp,
  lastLoginAt: timestamp,
  preferences: {
    theme: "auto",
    emailNotifications: true,
    roadmapSharing: true
  }
}

// Roadmap Data (Firestore: /roadmaps/{roadmapId})
{
  userId: "user-uid",
  title: "React Learning Path",
  description: "...",
  phases: [...],
  createdAt: timestamp,
  updatedAt: timestamp,
  isPublic: false
}
```

## 🔒 Security Features

- **JWT-based authentication** with Firebase Auth
- **User-scoped data access** with Firestore security rules
- **Protected routes** for authenticated content
- **Password validation** and secure password reset
- **Email verification** support
- **Session management** with automatic token refresh

## 🎯 User Features

### Authentication
- ✅ Email/password registration and login
- ✅ Google OAuth sign-in
- ✅ Password reset functionality
- ✅ Automatic session management

### Profile Management
- ✅ Update display name and profile information
- ✅ Change password with current password verification
- ✅ View account creation date and login history

### Settings & Preferences
- ✅ Email notification preferences
- ✅ Roadmap sharing settings
- ✅ Theme preferences (synced with existing theme system)

### Data Management
- ✅ User-scoped roadmap storage
- ✅ Automatic data migration from localStorage
- ✅ Real-time data synchronization
- ✅ Offline support with Firestore caching

## 🚨 Troubleshooting

### Common Issues

1. **"Firebase configuration not found"**
   - Check your `.env.local` file has all required variables
   - Ensure variable names start with `VITE_`

2. **"Auth domain not authorized"**
   - Add your domain to Firebase Console > Authentication > Settings > Authorized domains

3. **"Firestore permission denied"**
   - Check your Firestore security rules
   - Ensure user is authenticated before accessing data

4. **"Google sign-in not working"**
   - Enable Google provider in Firebase Console
   - Add your domain to authorized domains

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```bash
VITE_FIREBASE_DEBUG=true
```

## 📚 Next Steps

1. **Set up email verification** for new users
2. **Implement social login** with GitHub, Twitter, etc.
3. **Add admin panel** for user management
4. **Set up analytics** with Firebase Analytics
5. **Implement roadmap sharing** between users
6. **Add collaborative features** for team roadmaps

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
