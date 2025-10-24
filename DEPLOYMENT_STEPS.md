# 🚀 CineLib Deployment Guide - Complete Steps

## 📋 Pre-Deployment Checklist (1 hour)

### Step 1: Test Everything Locally ✅

```bash
# Make sure all services are running
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# ML Service: http://localhost:5000

# Test these features:
1. Sign up / Login
2. Create a playlist
3. Add movies to playlist
4. Write a blog
5. Get recommendations
6. Search movies
```

### Step 2: Prepare Your Code

```bash
# Make sure you're in the project root
cd C:\Users\ACER\Desktop\filmlib

# Initialize git if not already done
git init

# Create .gitignore files
```

Create `frontend/.gitignore`:
```
node_modules/
.next/
.env.local
.DS_Store
```

Create `backend/.gitignore`:
```
node_modules/
dist/
.env
.DS_Store
```

Create `ml-service/.gitignore`:
```
__pycache__/
*.pyc
.env
venv/
```

---

## 🗄️ PART 1: Deploy Database (30 minutes)

### Option A: Supabase (Recommended - Free)

#### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Click "New Project"

#### Step 2: Create Database
1. **Organization**: Create new or select existing
2. **Project Name**: `cinelib-production`
3. **Database Password**: Generate strong password (SAVE THIS!)
4. **Region**: Choose closest to you
5. Click "Create new project" (takes 2-3 minutes)

#### Step 3: Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy content from `backend/setup-tables.sql`
3. Paste and click "Run"
4. Verify tables are created in **Table Editor**

#### Step 4: Get Connection String
1. Go to **Project Settings** → **Database**
2. Find **Connection string** → **URI**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password
5. Save this - you'll need it!

Example:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

---

## 🔧 PART 2: Deploy Backend (45 minutes)

### Using Railway (Free Tier)

#### Step 1: Prepare Backend for Deployment

Create `backend/.env.example`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key-here
PORT=3001
NODE_ENV=production
```

Create `backend/Procfile`:
```
web: npm run start
```

Update `backend/package.json` - add to scripts:
```json
"scripts": {
  "start": "node dist/index.js",
  "build": "tsc",
  "dev": "tsx watch src/index.ts"
}
```

#### Step 2: Push to GitHub

```bash
# In project root
git add .
git commit -m "Prepare for deployment"

# Create GitHub repo (go to github.com)
# Then:
git remote add origin https://github.com/YOUR-USERNAME/cinelib.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `cinelib` repository
6. Click "Add variables" and add:
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-random-secret-key
   PORT=3001
   NODE_ENV=production
   ```
7. In Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
8. Click "Deploy"

#### Step 4: Get Backend URL
1. Once deployed, go to **Settings** → **Networking**
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://cinelib-backend.up.railway.app`)
4. Save this URL!

---

## 🎨 PART 3: Deploy Frontend (30 minutes)

### Using Vercel (Free - Recommended)

#### Step 1: Prepare Frontend

Update `frontend/.env.local` to `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_key
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_key
NEXT_PUBLIC_GIPHY_API_KEY=your_giphy_key
```

#### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your `cinelib` repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from `.env.production`
7. Click "Deploy"

#### Step 3: Get Frontend URL
1. Once deployed, you'll get a URL like: `https://cinelib.vercel.app`
2. This is your live site! 🎉

---

## 🤖 PART 4: Deploy ML Service (Optional - 30 minutes)

### Option A: Railway

#### Step 1: Prepare ML Service

Create `ml-service/Procfile`:
```
web: python app.py
```

Update `ml-service/app.py` - change last line:
```python
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f'🤖 ML Service running on port {port}')
    print(f'📊 Movie recommendations enabled')
    if OLLAMA_AVAILABLE:
        print(f'🧠 LLM-powered explanations: ENABLED')
    else:
        print(f'💡 LLM-powered explanations: DISABLED')
    app.run(host='0.0.0.0', port=port, debug=False)
```

#### Step 2: Deploy to Railway

1. In Railway, click "New" → "GitHub Repo"
2. Select your repository
3. Add variables:
   ```
   DATABASE_URL=your-supabase-connection-string
   TMDB_API_KEY=your_tmdb_key
   PORT=5000
   ```
4. In Settings:
   - **Root Directory**: `ml-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
5. Deploy

#### Step 3: Update Backend to Use ML Service

Add to backend environment variables:
```
ML_SERVICE_URL=https://your-ml-service.railway.app
```

### Option B: Skip ML Service (Use Backend)

If you skip ML deployment, recommendations will use TMDB's similar movies API directly through the backend.

---

## 🔗 PART 5: Connect Everything (15 minutes)

### Step 1: Update Backend CORS

In `backend/src/index.ts`, update CORS:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://cinelib.vercel.app', // Your Vercel URL
    'https://your-custom-domain.com' // If you have one
  ],
  credentials: true
}));
```

Redeploy backend:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

### Step 2: Update Frontend API URL

In Vercel dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Redeploy (Vercel will auto-redeploy)

### Step 3: Test Production Site

Visit your Vercel URL and test:
- ✅ Sign up
- ✅ Login
- ✅ Create playlist
- ✅ Get recommendations
- ✅ Write blog

---

## 🎯 PART 6: Post-Deployment (30 minutes)

### Step 1: Add Custom Domain (Optional)

#### Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `cinelib.com`)
3. Follow DNS instructions

#### Railway:
1. Go to Settings → Networking
2. Add custom domain
3. Update DNS records

### Step 2: Set Up Monitoring

#### Add Sentry (Free Error Tracking)

1. Go to https://sentry.io
2. Create account
3. Create new project (Next.js)
4. Get DSN
5. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```

### Step 3: Add Analytics

#### Vercel Analytics (Free)
1. In Vercel dashboard
2. Go to Analytics tab
3. Enable Vercel Analytics
4. Done! (automatic)

### Step 4: Set Up Backups

#### Supabase:
1. Go to Database → Backups
2. Enable daily backups (free tier: 7 days)

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All features tested locally
- [ ] Git repository created
- [ ] .gitignore files added
- [ ] Environment variables documented

### Database
- [ ] Supabase account created
- [ ] Database created
- [ ] Schema migrated
- [ ] Connection string saved

### Backend
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set
- [ ] Backend deployed
- [ ] Backend URL obtained
- [ ] CORS configured

### Frontend
- [ ] Environment variables set
- [ ] Vercel project created
- [ ] Frontend deployed
- [ ] Frontend URL obtained
- [ ] API connection tested

### ML Service (Optional)
- [ ] ML service deployed
- [ ] Environment variables set
- [ ] Backend connected to ML service

### Post-Deployment
- [ ] All features tested in production
- [ ] Custom domain added (optional)
- [ ] Monitoring set up
- [ ] Analytics enabled
- [ ] Backups configured

---

## 🚨 Troubleshooting

### Issue: Frontend can't connect to Backend
**Solution**: Check CORS settings and API URL

### Issue: Database connection failed
**Solution**: Verify connection string and IP whitelist

### Issue: Build failed
**Solution**: Check build logs, verify dependencies

### Issue: Environment variables not working
**Solution**: Redeploy after adding variables

### Issue: 404 errors
**Solution**: Check routing and build output

---

## 💰 Cost Summary

### Free Tier (Recommended)
- **Vercel**: Free (100GB bandwidth)
- **Railway**: Free ($5 credit/month)
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Total**: $0/month

### When to Upgrade
- **Traffic**: > 10,000 visitors/month
- **Database**: > 500MB data
- **API Calls**: > 50,000/month

---

## 🎉 You're Live!

Your CineLib platform is now deployed and accessible worldwide!

**Share your URLs:**
- 🌐 Frontend: `https://cinelib.vercel.app`
- 🔧 Backend: `https://cinelib-backend.railway.app`
- 📊 Status: All systems operational

**Next Steps:**
1. Share with friends
2. Add to portfolio
3. Post on social media
4. Gather feedback
5. Iterate and improve

---

## 📞 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints
4. Check CORS settings
5. Review error messages

**Common Resources:**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs

---

## 🚀 Congratulations!

You've successfully deployed a full-stack movie platform with:
- ✅ Frontend (Next.js)
- ✅ Backend (Express)
- ✅ Database (PostgreSQL)
- ✅ ML Service (Flask)
- ✅ AI Recommendations
- ✅ Professional UI

**Your platform is live and ready for users!** 🎬

---

*Deployment time: 2-3 hours*
*Cost: $0/month (free tier)*
*Scalability: Ready for thousands of users*
