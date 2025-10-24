@echo off

echo Setting up database...

REM Check if .env exists
if not exist .env (
    echo .env file not found. Copying from .env.example...
    copy .env.example .env
    echo Please update .env with your database credentials
    exit /b 1
)

REM Generate Prisma Client
echo Generating Prisma Client...
call npm run prisma:generate

REM Run migrations
echo Running database migrations...
call npm run migrate

REM Seed database
echo Seeding database with initial data...
call npm run seed

echo Database setup complete!
echo You can now start the server with: npm run dev
