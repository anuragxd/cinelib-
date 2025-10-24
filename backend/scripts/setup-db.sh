#!/bin/bash

echo "🔧 Setting up database..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env with your database credentials"
    exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run prisma:generate

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate

# Seed database
echo "🌱 Seeding database with initial data..."
npm run seed

echo "✅ Database setup complete!"
echo "🎉 You can now start the server with: npm run dev"
