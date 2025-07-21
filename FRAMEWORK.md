# Minimum Express Framework

A type-safe, composable Express.js framework with authentication built-in.

## Features

- **Type-safe pipeline composition** - Compose request handlers with automatic type checking
- **Validation** - Built-in Zod schema validation for request bodies, params, and queries
- **Authentication** - JWT-based auth with middleware
- **Error handling** - Structured error responses with proper HTTP status codes
- **Result pattern** - Functional approach to handling success/error states

## Project Structure

```
src/
├── app.ts                 # Main application entry point
├── auth/                  # Authentication module
│   ├── jwt.ts            # JWT token utilities
│   ├── password.ts       # Password hashing utilities
│   ├── middleware.ts     # Auth middleware
│   └── routes.ts         # Auth routes (signup, login, logout)
├── core/                  # Framework core
│   ├── compose.ts        # Pipeline composition utilities
│   └── result.ts         # Result pattern types and utilities
├── db/                   # Database layer
│   └── prisma.ts         # Mock Prisma client (replace with real one)
├── schemas/              # Validation schemas
│   └── auth.ts          # Auth-related schemas and types
└── views/               # EJS templates
    └── index.ejs        # Home page template
```

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development server:

   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   pnpm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Example Usage

#### Signup

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Core Concepts

### Pipeline Composition

The framework uses a functional pipeline approach for handling requests:

```typescript
const handler = compose(
  [
    step1, // (input, metadata) => Result<Output1>
    step2, // (output1) => Result<Output2>
    step3, // (output2) => Result<FinalOutput>
  ],
  {
    validationSchemas: {
      body: mySchema,
    },
    enableLogging: true,
  }
);
```

### Result Pattern

All operations return a `Result<T>` type that represents either success or failure:

```typescript
// Success
const result = Ok(data, metadata);

// Error
const result = BadRequest("Invalid input");
const result = Unauthorized("Access denied");
```

### Validation

Use Zod schemas for automatic request validation:

```typescript
const mySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Schema is automatically applied and types are inferred
```

## Environment Variables

- `JWT_SECRET` - Secret key for JWT tokens (required in production)
- `NODE_ENV` - Environment (development/production)

## Database Integration

The current setup uses a mock Prisma client. To integrate with a real database:

1. Install Prisma: `pnpm add prisma @prisma/client`
2. Initialize Prisma: `npx prisma init`
3. Replace the mock client in `src/db/prisma.ts` with the real Prisma client
4. Run migrations: `npx prisma migrate dev`

## Extending the Framework

To add new features:

1. Create schemas in `src/schemas/`
2. Add business logic as composable functions
3. Use the `compose` function to create request handlers
4. Add routes to your router

Example:

```typescript
// Define schema
const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

// Define pipeline steps
async function validatePost(_, metadata) {
  // Validation is automatic, just return the data
  return Ok(metadata.body);
}

async function savePost(postData) {
  // Save to database
  const post = await db.post.create({ data: postData });
  return Ok(post);
}

// Compose handler
const createPostHandler = compose([validatePost, savePost], {
  validationSchemas: { body: createPostSchema },
  enableLogging: true,
});

// Add to router
router.post("/posts", createPostHandler);
```
