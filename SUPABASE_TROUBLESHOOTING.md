# Supabase Connection Troubleshooting

## Current Issue

We're getting authentication errors when trying to connect to your Supabase database.

## Possible Causes:

### 1. Database is Paused (Most Common)
Supabase free tier pauses databases after 7 days of inactivity.

**Solution:**
1. Go to https://supabase.com/dashboard/project/fgqgxommiqeznveipdzr
2. Look for a message saying "Database is paused"
3. Click **Resume** or **Restore** button
4. Wait 1-2 minutes for it to start

### 2. Password Might Be Incorrect

**To verify/reset your password:**
1. Go to https://supabase.com/dashboard/project/fgqgxommiqeznveipdzr
2. Click **Settings** → **Database**
3. Scroll to **Database password** section
4. Click **Reset database password**
5. Copy the new password
6. Update `backend/.env` with the new password (remember to URL-encode special characters)

### 3. Connection String Format

**For Prisma with Supabase, use this format:**

```env
# Direct connection (for migrations)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.fgqgxommiqeznveipdzr.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Or pooled connection (for app)
DATABASE_URL="postgresql://postgres.fgqgxommiqeznveipdzr:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 4. Special Characters in Password

If your password is `anurag2412?`, encode it as:
- `anurag2412%3F` (the `?` becomes `%3F`)

## Step-by-Step Fix:

### Step 1: Check Database Status
1. Open https://supabase.com/dashboard/project/fgqgxommiqeznveipdzr
2. Check if you see "Database is paused" or "Project is paused"
3. If paused, click **Resume** and wait

### Step 2: Get Fresh Connection String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Copy the **URI** string
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.fgqgxommiqeznveipdzr.supabase.co:5432/postgres
   ```

### Step 3: Update .env File

Replace `[YOUR-PASSWORD]` with your actual password (URL-encoded):

```env
DATABASE_URL="postgresql://postgres:anurag2412%3F@db.fgqgxommiqeznveipdzr.supabase.co:5432/postgres"
```

### Step 4: Test Connection

```bash
cd backend
npx prisma db pull
```

If this works, you'll see "Introspecting based on datasource..."

### Step 5: Run Migrations

```bash
npx prisma migrate deploy
```

### Step 6: Seed Database

```bash
npm run seed
```

## Alternative: Use Supabase Studio

If Prisma migrations keep failing, you can use Supabase's built-in SQL editor:

1. Go to https://supabase.com/dashboard/project/fgqgxommiqeznveipdzr
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. I'll provide you with the SQL to create all tables

Would you like me to generate the SQL script for you?

## Quick Test

Try this command to test if the connection works:

```bash
cd backend
npx prisma db execute --stdin <<< "SELECT 1"
```

If this returns an error, the connection string is definitely wrong.

## What to Share

If still not working, please share:
1. Screenshot of your Supabase dashboard (blur any sensitive info)
2. The exact error message you see
3. Confirm if the database shows as "Active" or "Paused"

## Next Steps Once Connected

Once the connection works:
1. Run migrations: `npx prisma migrate deploy`
2. Seed database: `npm run seed`
3. Backend will auto-restart
4. Sign-in will work at http://localhost:3000/login
