# Async Express - A New Way to Build TypeScript Node Applications

A **modern TypeScript Node starter** that revolutionizes Express.js development with **functional programming patterns** and **bulletproof error handling**. Perfect foundation for scalable web applications.

## 🚀 What Makes This Different

Instead of traditional Express middleware chains, this starter introduces a **functional pipeline composition system**:

```typescript
export const createTaskHandler = compose([authenticateApiUser, createTask], {
  validationSchemas: { body: createTaskSchema },
  enableLogging: true,
});
```

## 📦 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd async-express
pnpm install

# Database setup
pnpm run db:generate
pnpm run db:migrate

# Development
pnpm run dev

# Production build
pnpm run build
pnpm start
```

## 🔍 Project Structure

```
src/
├── core/           # Framework-level abstractions
│   ├── compose.ts  # Pipeline composition system
│   └── result.ts   # Result pattern implementation
├── controllers/    # Request handlers (API + Web)
├── services/       # Business logic layer
├── repositories/   # Data access layer
├── db/            # Database schema and client
└── routes/        # Route definitions
```

---

_A modern TypeScript Node starter that makes Express.js development more functional, type-safe, and maintainable._
