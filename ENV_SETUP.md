# Environment Variables Setup

## Overview

This project uses `dotenv-webpack` to manage environment variables. All environment variables must be prefixed with `REACT_APP_` to be accessible in the application code.

## Files

- `.env` - Development environment variables (not committed to git)
- `.env.example` - Template file with example variables (committed to git)
- `.env.production` - Production environment variables (optional, not committed to git)

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local values:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   ```

## Usage in Code

Access environment variables via `process.env`:

```typescript
const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
```

## NODE_ENV

**You don't need to set `NODE_ENV` manually!**

- `NODE_ENV` is automatically set by webpack:
  - `NODE_ENV=development` when running `yarn start` (dev mode)
  - `NODE_ENV=production` when running `yarn build` (production mode)

- Access it in code:
  ```typescript
  if (process.env.NODE_ENV === "production") {
    // Production-only code
  }
  ```

## Best Practices

1. **Never commit `.env` files** - They may contain sensitive data
2. **Always commit `.env.example`** - Shows required variables without values
3. **Use `REACT_APP_` prefix** - Required for variables to be exposed to the browser
4. **System env vars override file vars** - Useful for CI/CD pipelines
5. **Use different files for different environments**:
   - `.env` - Local development
   - `.env.production` - Production build (optional)
   - System environment variables - CI/CD (highest priority)

## Priority Order (highest to lowest)

1. System environment variables
2. `.env.production` (if exists, in production mode)
3. `.env.local` (if exists)
4. `.env` (default)

## Example for Different Environments

### Local Development
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Staging
```env
REACT_APP_API_URL=https://api-staging.example.com
```

### Production
```env
REACT_APP_API_URL=https://api.example.com
```

## CI/CD

For CI/CD pipelines, set environment variables in your platform:
- GitHub Actions: Repository secrets
- GitLab CI: CI/CD variables
- AWS: Environment variables
- Docker: `-e` flag or `.env` file

Example:
```bash
REACT_APP_API_URL=https://api.example.com yarn build
```

