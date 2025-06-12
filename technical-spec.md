# Supabase User Manager Library - Technical Specification

## Overview

A TypeScript library for user authentication and profile management using Supabase, designed to be consumed by vanilla JavaScript projects. The library is data-agnostic and focuses solely on core user management functionality.

## Architecture

### Core Principles

- **Data Agnostic**: Library doesn't handle project-specific data (social links, transactions, etc.)
- **Configuration-Based**: Each project provides its own Supabase configuration
- **Result-Based Error Handling**: No thrown exceptions, all methods return Result objects
- **Interface-Only CRUD**: Provides interfaces, projects handle their own data operations

### Library Structure

```
src/
├── types/
│   ├── user.ts          # User interfaces and types
│   ├── auth.ts          # Authentication types
│   └── result.ts        # Result wrapper types
├── services/
│   ├── auth.service.ts  # Authentication operations
│   └── user.service.ts  # User profile operations
├── core/
│   └── user-manager.ts  # Main library class
└── index.ts             # Public API exports
```

## API Design

### Configuration

```typescript
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface UserManagerConfig {
  supabase: SupabaseConfig;
}
```

### Core Types

```typescript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

type Result<T, E = Error> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };
```

### Main Class

```typescript
class UserManager {
  constructor(config: UserManagerConfig);

  // Authentication
  signUp(email: string, password: string): Promise<Result<{user: User; needsVerification: boolean}>>;
  signIn(email: string, password: string): Promise<Result<{user: User; session: AuthSession}>>;
  signOut(): Promise<Result<void>>;

  // Profile Management
  updateProfile(updates: Partial<Pick<User, "firstName" | "lastName" | "avatar">>): Promise<Result<User>>;
  getCurrentUser(): Promise<Result<User | null>>;
  getCurrentSession(): Promise<Result<AuthSession | null>>;

  // Email Verification
  resendVerificationEmail(): Promise<Result<void>>;
}
```

## Implementation Plan

### Phase 1: Core Infrastructure

1. **Project Setup**

   - Initialize TypeScript project with Vite for building
   - Configure build for multiple output formats (ESM, CJS, UMD)
   - Set up package.json for npm publishing via GitHub

2. **Type Definitions**
   - Create all TypeScript interfaces and types
   - Define Result wrapper pattern
   - Set up error types

### Phase 2: Authentication Service

1. **Auth Service Implementation**
   - Supabase client initialization
   - Sign up with email verification
   - Sign in functionality
   - Sign out functionality
   - Session management

### Phase 3: User Profile Service

1. **Profile Service Implementation**
   - Profile update functionality
   - Current user retrieval
   - Session state management

### Phase 4: Main Library Class

1. **UserManager Implementation**
   - Integrate auth and user services
   - Implement public API
   - Add proper error handling and result wrapping

### Phase 5: Build & Distribution

1. **Build Configuration**

   - Configure Vite for library mode
   - Set up multiple output formats
   - Configure TypeScript declarations

2. **Package Configuration**
   - Set up package.json for GitHub npm registry
   - Configure exports for different module systems
   - Add proper peer dependencies

## Technical Decisions

### Dependencies

- **Supabase JS Client**: For Supabase integration
- **TypeScript**: For type safety and development
- **Vite**: For building and bundling

### Build Output

- **ESM**: For modern bundlers and browsers
- **CJS**: For Node.js compatibility
- **UMD**: For direct browser usage
- **TypeScript Declarations**: For type support

### Error Handling Strategy

All methods return `Result<T, E>` objects instead of throwing exceptions:

```typescript
const result = await userManager.signUp(email, password);
if (result.success) {
  console.log("User created:", result.data.user);
} else {
  console.error("Sign up failed:", result.error.message);
}
```

### Session Management

- Library handles session state internally
- Projects can access current session via `getCurrentSession()`
- Automatic token refresh handled by Supabase client

## Usage Example

```typescript
import {UserManager} from "@your-org/supabase-user-manager";

const userManager = new UserManager({
  supabase: {
    url: "your-supabase-url",
    anonKey: "your-anon-key",
  },
});

// Sign up
const signUpResult = await userManager.signUp("user@example.com", "password123");
if (signUpResult.success) {
  if (signUpResult.data.needsVerification) {
    console.log("Please check your email for verification");
  }
}

// Sign in
const signInResult = await userManager.signIn("user@example.com", "password123");
if (signInResult.success) {
  console.log("Signed in:", signInResult.data.user);
}

// Update profile
const updateResult = await userManager.updateProfile({
  firstName: "John",
  lastName: "Doe",
  avatar: "https://example.com/avatar.jpg",
});
```

## Validation Criteria

- [ ] All authentication flows work correctly
- [ ] Profile updates persist to Supabase
- [ ] Error handling returns proper Result objects
- [ ] Library builds successfully for all target formats
- [ ] TypeScript types are properly exported
- [ ] Can be consumed by vanilla JavaScript projects
- [ ] Works with separate Supabase project configurations
