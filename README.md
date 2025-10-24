# Movie Community Platform

A full-stack web application for creating, sharing, and curating movie-related content and personal playlists.

## Project Structure

```
movie-community-platform/
├── frontend/          # Next.js 14 application
├── backend/           # Express.js API server
├── ml-service/        # Python Flask ML recommendation service
└── .kiro/            # Kiro spec files
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **ML Service**: Python, Flask, scikit-learn

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../ml-service && pip install -r requirements.txt
```

2. Set up environment variables (see each service's README)

3. Run database migrations:
```bash
cd backend && npm run migrate
```

### Development

Run all services:
```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend

# Terminal 3 - ML Service
npm run dev:ml
```

## Documentation

See individual service READMEs for detailed documentation:
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [ML Service Documentation](./ml-service/README.md)
