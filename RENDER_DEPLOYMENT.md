# Deploy Chat Platform to Render

## Prerequisites
- GitHub account with your code pushed
- Render account (free): https://render.com

---

## Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → **New +** → **PostgreSQL**
2. Configure:
   - **Name**: `chat-platform-db`
   - **Database**: `chat_platform`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: Free (or select paid)
3. Click **Create Database**
4. **Save these credentials** (from "Info" tab):
   ```
   Internal Database URL: postgres://user:pass@host:5432/chat_platform
   External Database URL: postgres://user:pass@host:5432/chat_platform
   ```

---

## Step 2: Create Redis Instance

1. Go to Render Dashboard → **New +** → **Redis**
2. Configure:
   - **Name**: `chat-platform-redis`
   - **Region**: Same as database
   - **Plan**: Free (25MB)
3. Click **Create Redis**
4. **Save the connection details**:
   ```
   Internal Redis URL: redis://host:6379
   ```

---

## Step 3: Deploy Backend (Node.js)

1. Go to Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository: `Chat-Plat`
3. Configure:
   - **Name**: `chat-platform-api`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```env
   NODE_ENV=production
   PORT=5000
   
   # Database (use Internal Database URL from Step 1)
   DB_HOST=<your-db-host>
   DB_PORT=5432
   DB_NAME=chat_platform
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   
   # Or use single connection string:
   DATABASE_URL=postgres://user:pass@host:5432/chat_platform
   
   # Redis (use Internal Redis URL from Step 2)
   REDIS_HOST=<your-redis-host>
   REDIS_PORT=6379
   REDIS_PASSWORD=<your-redis-password>
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # Frontend URL (will update after deploying frontend)
   CLIENT_URL=https://your-frontend.onrender.com
   
   # File uploads
   MAX_FILE_SIZE=52428800
   UPLOAD_PATH=./uploads
   ```

5. Click **Create Web Service**

---

## Step 4: Deploy Frontend (React)

### Option A: Static Site (Recommended)

1. Go to Render Dashboard → **New +** → **Static Site**
2. Connect your GitHub repository: `Chat-Plat`
3. Configure:
   - **Name**: `chat-platform-web`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Add Environment Variable**:
   ```env
   REACT_APP_API_URL=https://chat-platform-api.onrender.com
   ```

5. Click **Create Static Site**

### Option B: Web Service

If you need a Node server for the frontend:
1. Create another Web Service
2. Root Directory: `client`
3. Build: `npm install && npm run build`
4. Start: `npx serve -s build -l $PORT`

---

## Step 5: Update Backend CLIENT_URL

1. Go back to your backend service (`chat-platform-api`)
2. Update environment variable:
   ```env
   CLIENT_URL=https://chat-platform-web.onrender.com
   ```
3. Save and let it redeploy

---

## Step 6: Update Frontend API URL

1. Go to your frontend static site
2. Update environment variable:
   ```env
   REACT_APP_API_URL=https://chat-platform-api.onrender.com
   ```
3. Save and let it rebuild

---

## Step 7: Run Database Migrations

1. Go to your backend service
2. Click **Shell** tab
3. Run:
   ```bash
   npm run migrate
   ```

---

## ✅ Your App is Live!

- **Frontend**: https://chat-platform-web.onrender.com
- **Backend API**: https://chat-platform-api.onrender.com
- **Database**: Render PostgreSQL (managed)
- **Redis**: Render Redis (managed)

---

## 📝 Important Notes

### Free Tier Limitations:
- **Backend**: Spins down after 15 min of inactivity (cold starts ~30s)
- **Database**: 90 days free trial, then $7/month
- **Redis**: 25MB storage limit (free forever)
- **Static Site**: Free forever with bandwidth limits

### File Uploads:
- Files stored in `./uploads` folder
- ⚠️ **Render's filesystem is ephemeral** (files deleted on restart)
- For production, consider:
  - **Cloudinary** (free tier for images/videos)
  - **AWS S3** (pay-as-you-go)
  - **DigitalOcean Spaces**
  - **Render Persistent Disks** (paid add-on)

### Upgrade for Production:
- Backend: $7/month (no cold starts)
- Database: $7/month (after free trial)
- Persistent disk: $1/GB/month

---

## 🔧 Troubleshooting

### Database Connection Issues:
```javascript
// Update config/database.js to support DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL || {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // For Render
    }
  }
});
```

### CORS Issues:
Check `server.js` has correct CLIENT_URL in environment variables.

### Cold Starts:
First request after 15 min takes ~30s. Upgrade to paid plan to prevent.

---

## 🚀 Alternative: Just Database on Render

If you only want the database on Render and host backend elsewhere:

1. Create PostgreSQL database on Render (Step 1)
2. Use the **External Database URL** in your `.env`:
   ```env
   DATABASE_URL=<External Database URL from Render>
   ```
3. Deploy backend anywhere (Heroku, Railway, your own server)

---

## 📊 Cost Comparison

### Render (Recommended for you):
- Database: $7/month (after 90-day trial)
- Redis: Free (25MB) or $10/month (256MB)
- Backend: Free (with cold starts) or $7/month
- Frontend: Free forever
- **Total**: $0-14/month

### AWS:
- RDS PostgreSQL: ~$15-50/month
- ElastiCache Redis: ~$15-50/month
- EC2/ECS: ~$10-30/month
- S3: ~$1-5/month
- **Total**: $41-135/month + complexity

**Render is much simpler and cheaper for your use case!** ✅

