# Prisma Setup Guide

## Prerequisites

You need PostgreSQL installed and running. Here are options:

### Option 1: Local PostgreSQL Installation

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install and remember your password
3. Default port is 5432

**Mac (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Option 2: Docker (Recommended for Development)

```bash
docker run --name movie-community-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=movie_community \
  -p 5432:5432 \
  -d postgres:15
```

### Option 3: Cloud Database (Supabase, Neon, Railway)

Use a managed PostgreSQL service and get the connection string.

## Setup Steps

### 1. Verify PostgreSQL is Running

```bash
# Try connecting with psql
psql -U postgres -h localhost

# Or check if port 5432 is listening
netstat -an | grep 5432  # Linux/Mac
netstat -an | findstr 5432  # Windows
```

### 2. Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE movie_community;

-- Exit
\q
```

### 3. Configure Connection String

The `.env` file should have:
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Example:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_community?schema=public"
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the TypeScript types and client based on your schema.

### 5. Create and Run Migration

```bash
npm run migrate
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Prompt you to name the migration (e.g., "init")

### 6. Seed Database (Optional)

```bash
npm run seed
```

This populates the database with demo data:
- 2 demo users (john@example.com, jane@example.com)
- 2 demo blogs
- 2 demo playlists with movies
- Follow relationships
- Saved blogs

**Demo Credentials:**
- Email: john@example.com or jane@example.com
- Password: password123

## Troubleshooting

### Error: "Can't reach database server"

**Solution:**
1. Check PostgreSQL is running
2. Verify connection string in `.env`
3. Check firewall settings
4. Ensure database exists

### Error: "Database does not exist"

**Solution:**
```bash
# Create the database
createdb movie_community

# Or using psql
psql -U postgres -c "CREATE DATABASE movie_community;"
```

### Error: "Authentication failed"

**Solution:**
1. Check username and password in DATABASE_URL
2. Verify PostgreSQL user exists
3. Check pg_hba.conf for authentication method

### Reset Database

```bash
# Drop and recreate database
npm run migrate -- reset

# This will:
# - Drop the database
# - Create it again
# - Run all migrations
# - Run seed (if configured)
```

## Prisma Studio

View and edit your database with a GUI:

```bash
npm run prisma:studio
```

Opens at http://localhost:5555

## Common Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Create a migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View database in browser
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema without migration
npx prisma db push
```

## Production Deployment

### 1. Set Production DATABASE_URL

Use environment variables in your hosting platform.

### 2. Run Migrations

```bash
npm run migrate:deploy
```

### 3. Generate Client

```bash
npm run prisma:generate
```

### 4. Don't Seed in Production

The seed script is for development only.

## Schema Changes Workflow

1. Edit `prisma/schema.prisma`
2. Run `npx prisma format` to format
3. Run `npx prisma generate` to update client
4. Run `npx prisma migrate dev --name describe_change` to create migration
5. Test the changes
6. Commit both schema and migration files

## Connection Pooling

For production, consider using connection pooling:

```typescript
// In production
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

Or use Prisma Data Proxy / Accelerate for serverless environments.
