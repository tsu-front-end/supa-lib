# Supabase Service Manager

A TypeScript library for user authentication, profile management, and basic CRUD operations using Supabase, designed for vanilla JavaScript consumption.

## Features

- 🔐 **User Authentication** - Sign up, sign in, sign out with email verification
- 👤 **Profile Management** - Update user profiles with metadata
- 📊 **Basic CRUD Operations** - Create, read, update, delete, and list records
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive type definitions
- 🚫 **No Exceptions** - Result pattern for predictable error handling
- 📦 **Multiple Formats** - ESM, CJS, and UMD builds for broad compatibility
- 🍃 **Lightweight** - Simple, focused API with minimal dependencies

## Installation

```bash
npm install supabase-service-manager
```

## Quick Start

```typescript
import {ServiceManager} from "supabase-service-manager";

// Initialize the service manager
const serviceManager = new ServiceManager({
  supabase: {
    url: "your-supabase-url",
    anonKey: "your-anon-key",
  },
});

// Sign up a new user
const signUpResult = await serviceManager.signUp("user@example.com", "password123", {
  firstName: "John",
  lastName: "Doe",
});

if (signUpResult.success) {
  console.log("User created:", signUpResult.data.user);
  if (signUpResult.data.needsVerification) {
    console.log("Please check your email for verification");
  }
} else {
  console.error("Sign up failed:", signUpResult.error.message);
}
```

## Configuration

### ServiceManagerConfig

```typescript
interface ServiceManagerConfig {
  supabase: {
    url: string; // Your Supabase project URL
    anonKey: string; // Your Supabase anonymous key
  };
}
```

### Environment Variables

You can store your Supabase credentials in environment variables:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

```typescript
const serviceManager = new ServiceManager({
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
});
```

## Core Concepts

### Result Pattern

All methods return a `Result<T>` object instead of throwing exceptions:

```typescript
type Result<T, E = Error> = {success: true; data: T} | {success: false; error: E};

// Always check the success property
const result = await serviceManager.signIn("user@example.com", "password");
if (result.success) {
  // result.data contains the successful response
  console.log("Signed in:", result.data.user);
} else {
  // result.error contains the error information
  console.error("Sign in failed:", result.error.message);
}
```

### Type Safety

The library provides comprehensive TypeScript types:

```typescript
import type {ServiceManager, User, AuthSession, Result} from "supabase-service-manager";
```

## API Reference

### Authentication Methods

#### `signUp(email, password, profile?)`

Create a new user account with optional profile data.

```typescript
const result = await serviceManager.signUp("user@example.com", "securePassword123", {
  firstName: "John",
  lastName: "Doe",
  avatar: "https://example.com/avatar.jpg",
});

if (result.success) {
  const {user, needsVerification} = result.data;
  console.log("User created:", user);

  if (needsVerification) {
    console.log("Email verification required");
  }
}
```

#### `signIn(email, password)`

Authenticate an existing user.

```typescript
const result = await serviceManager.signIn("user@example.com", "password123");

if (result.success) {
  const {user, session} = result.data;
  console.log("Signed in:", user);
  console.log("Session expires:", new Date(session.expiresAt));
}
```

#### `signOut()`

Sign out the current user.

```typescript
const result = await serviceManager.signOut();

if (result.success) {
  console.log("Successfully signed out");
}
```

#### `resendVerificationEmail()`

Resend email verification for the current user.

```typescript
const result = await serviceManager.resendVerificationEmail();

if (result.success) {
  console.log("Verification email sent");
}
```

### Profile Management

#### `updateProfile(updates)`

Update the current user's profile information.

```typescript
const result = await serviceManager.updateProfile({
  firstName: "Jane",
  lastName: "Smith",
  avatar: "https://example.com/new-avatar.jpg",
});

if (result.success) {
  console.log("Profile updated:", result.data);
}
```

#### `getCurrentUser()`

Get the current authenticated user.

```typescript
const result = await serviceManager.getCurrentUser();

if (result.success) {
  if (result.data) {
    console.log("Current user:", result.data);
  } else {
    console.log("No user signed in");
  }
}
```

#### `getCurrentSession()`

Get the current authentication session.

```typescript
const result = await serviceManager.getCurrentSession();

if (result.success) {
  if (result.data) {
    console.log("Active session:", result.data);
    console.log("Expires at:", new Date(result.data.expiresAt));
  } else {
    console.log("No active session");
  }
}
```

### CRUD Operations

#### `create(table, data)`

Create a new record in the specified table.

```typescript
const result = await serviceManager.create("social_links", {
  user_id: "user-id",
  platform: "twitter",
  url: "https://twitter.com/username",
  display_name: "@username",
});

if (result.success) {
  console.log("Record created:", result.data);
}
```

#### `read(table, id)`

Read a record by ID from the specified table.

```typescript
const result = await serviceManager.read("social_links", "link-id");

if (result.success) {
  if (result.data) {
    console.log("Record found:", result.data);
  } else {
    console.log("Record not found");
  }
}
```

#### `update(table, id, data)`

Update an existing record.

```typescript
const result = await serviceManager.update("social_links", "link-id", {
  url: "https://twitter.com/newusername",
  display_name: "@newusername",
});

if (result.success) {
  console.log("Record updated:", result.data);
}
```

#### `delete(table, id)`

Delete a record by ID.

```typescript
const result = await serviceManager.delete("social_links", "link-id");

if (result.success) {
  console.log("Record deleted successfully");
}
```

#### `list(table, filters?)`

List records with optional filtering.

```typescript
// List all records
const allResult = await serviceManager.list("social_links");

// List with filters
const filteredResult = await serviceManager.list("social_links", {
  user_id: "user-id",
  platform: "twitter",
});

if (filteredResult.success) {
  console.log("Records found:", filteredResult.data);
}
```

## Usage Examples

### Complete Authentication Flow

```typescript
import {ServiceManager} from "supabase-service-manager";

const serviceManager = new ServiceManager({
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
});

async function authFlow() {
  // Sign up
  const signUpResult = await serviceManager.signUp("user@example.com", "password123", {firstName: "John", lastName: "Doe"});

  if (!signUpResult.success) {
    console.error("Sign up failed:", signUpResult.error.message);
    return;
  }

  console.log("User created:", signUpResult.data.user);

  // Sign in
  const signInResult = await serviceManager.signIn("user@example.com", "password123");

  if (!signInResult.success) {
    console.error("Sign in failed:", signInResult.error.message);
    return;
  }

  console.log("Signed in successfully");

  // Update profile
  const updateResult = await serviceManager.updateProfile({
    avatar: "https://example.com/avatar.jpg",
  });

  if (updateResult.success) {
    console.log("Profile updated:", updateResult.data);
  }

  // Sign out
  await serviceManager.signOut();
  console.log("Signed out");
}

authFlow();
```

### Managing User Data

```typescript
async function manageUserData(serviceManager: ServiceManager, userId: string) {
  // Create social links
  const socialLinks = [
    {platform: "twitter", url: "https://twitter.com/user"},
    {platform: "github", url: "https://github.com/user"},
    {platform: "linkedin", url: "https://linkedin.com/in/user"},
  ];

  for (const link of socialLinks) {
    const result = await serviceManager.create("social_links", {
      user_id: userId,
      ...link,
    });

    if (result.success) {
      console.log(`Created ${link.platform} link:`, result.data);
    }
  }

  // List user's social links
  const listResult = await serviceManager.list("social_links", {user_id: userId});

  if (listResult.success) {
    console.log("User social links:", listResult.data);
  }

  // Update a specific link
  const links = listResult.success ? listResult.data : [];
  const twitterLink = links.find((link) => link.platform === "twitter");

  if (twitterLink) {
    const updateResult = await serviceManager.update("social_links", twitterLink.id, {
      url: "https://twitter.com/newusername",
    });

    if (updateResult.success) {
      console.log("Updated Twitter link:", updateResult.data);
    }
  }
}
```

### Error Handling Patterns

```typescript
async function handleErrors(serviceManager: ServiceManager) {
  const result = await serviceManager.signIn("invalid@email.com", "wrongpassword");

  if (!result.success) {
    // Handle different types of errors
    switch (result.error.message) {
      case "Invalid login credentials":
        console.log("Please check your email and password");
        break;
      case "Email not confirmed":
        console.log("Please verify your email address");
        break;
      default:
        console.log("An error occurred:", result.error.message);
    }
  }
}
```

## Vanilla JavaScript Usage

The library works seamlessly with vanilla JavaScript:

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import {ServiceManager} from "https://unpkg.com/supabase-service-manager/dist/index.js";

      const serviceManager = new ServiceManager({
        supabase: {
          url: "your-supabase-url",
          anonKey: "your-anon-key",
        },
      });

      // Use the service manager
      document.getElementById("signUp").addEventListener("click", async () => {
        const result = await serviceManager.signUp("user@example.com", "password123");

        if (result.success) {
          console.log("User created:", result.data.user);
        } else {
          console.error("Error:", result.error.message);
        }
      });
    </script>
  </head>
  <body>
    <button id="signUp">Sign Up</button>
  </body>
</html>
```

## TypeScript Integration

For TypeScript projects, import types as needed:

```typescript
import {ServiceManager, type User, type AuthSession, type Result, type ServiceManagerConfig} from "supabase-service-manager";

// Type-safe configuration
const config: ServiceManagerConfig = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
};

const serviceManager = new ServiceManager(config);

// Type-safe result handling
const handleSignIn = async (email: string, password: string): Promise<User | null> => {
  const result = await serviceManager.signIn(email, password);

  if (result.success) {
    return result.data.user;
  } else {
    console.error("Sign in failed:", result.error.message);
    return null;
  }
};
```

## Development & CI/CD

This library includes automated workflows for quality assurance and publishing:

- **Continuous Integration**: Automated testing on multiple Node.js versions
- **Automated Publishing**: NPM releases triggered by GitHub releases
- **Documentation Deployment**: Automatic TypeDoc deployment to GitHub Pages

For setup instructions, see [`.github/SETUP.md`](.github/SETUP.md).

### Building the Library

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Generating Documentation

```bash
npm run docs
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/tsu-front-end/supa-lib/issues) page.
