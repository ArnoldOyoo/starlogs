# Starlogs Backend

Express.js API with Prisma ORM, PostgreSQL, and Redis caching.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Docker Development

```bash
# From project root
docker-compose up -d

# Run migrations
docker-compose exec backend npm run prisma:migrate

# View logs
docker-compose logs -f backend
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile
- `DELETE /api/users/me` - Delete account

### Observation Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session details
- `PATCH /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Favorites
- `GET /api/favorites` - List favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites/:objectId` - Remove favorite

## Database

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Express app entry
│   ├── lib/
│   │   ├── prisma.ts     # Prisma client
│   │   └── redis.ts      # Redis client + cache helpers
│   ├── middleware/
│   │   ├── auth.ts       # JWT authentication
│   │   └── errorHandler.ts
│   └── routes/
│       ├── auth.ts
│       ├── favorites.ts
│       ├── sessions.ts
│       └── users.ts
├── prisma/
│   └── schema.prisma     # Database schema
├── Dockerfile
├── package.json
└── tsconfig.json
```
