# Backend API

Express.js backend API for the Movie Community Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Set up database and run migrations:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT access tokens
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens
- `ML_SERVICE_URL`: URL of the ML recommendation service
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## API Documentation

API endpoints will be documented here as they are implemented.
