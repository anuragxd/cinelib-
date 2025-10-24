# Get Your Supabase Connection String

## Steps to Get the Correct Connection String:

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/fgqgxommiqeznveipdzr

2. **Navigate to Database Settings:**
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **Database**

3. **Find Connection String:**
   - Scroll down to the **Connection string** section
   - You'll see tabs: **URI**, **JDBC**, **Golang**, etc.

4. **Copy the URI Connection String:**
   - Click on the **URI** tab
   - You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.fgqgxommiqeznveipdzr.supabase.co:5432/postgres
   ```
   - Click the **Copy** button

5. **Important: Use Transaction Pooler for Prisma:**
   - Look for **Connection pooling** section
   - Select **Transaction** mode
   - Copy that connection string instead (it will use port 6543)
   - It should look like:
   ```
   postgresql://postgres.fgqgxommiqeznveipdzr:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

## Alternative: Use Direct Connection

If you want to use direct connection (not pooled):

1. In Supabase Dashboard > Settings > Database
2. Look for **Connection string** section
3. Make sure you're using the **Direct connection** string
4. It should be:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.fgqgxommiqeznveipdzr.supabase.co:5432/postgres
   ```

## Check Your Password

Your password appears to be: `anurag2412?`

If it contains special characters like `?`, `@`, `#`, etc., they need to be URL-encoded:
- `?` becomes `%3F`
- `@` becomes `%40`
- `#` becomes `%23`
- `&` becomes `%26`

So your password in the connection string should be: `anurag2412%3F`

## What to Do Next:

1. Get the correct connection string from Supabase
2. Replace `[YOUR-PASSWORD]` with `anurag2412%3F` (URL-encoded)
3. Update `backend/.env` file with the complete string
4. The backend will automatically reconnect

## Test Connection:

Once you have the correct string, you can test it:

```bash
cd backend
npx prisma db pull
```

This will test if Prisma can connect to your database.

## Need Help?

If you're still having issues:
1. Check if your Supabase project is paused (free tier pauses after inactivity)
2. Make sure you're using the correct region in the connection string
3. Verify your password is correct in Supabase dashboard
4. Try resetting your database password in Supabase Settings > Database

## Once Connected:

After you get the correct connection string and update `.env`:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Then your backend will connect and sign-in will work!
