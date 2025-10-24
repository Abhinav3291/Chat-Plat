# 🚀 Deploy to Render (Free Tier)

## Quick Start (5 Minutes)

### 1. **Backend Deployment**

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chat-platform-backend` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-123456
   PORT=5000
   CLIENT_URL=https://your-frontend-url.onrender.com
   ```
   
   **Note**: No Redis configuration needed! App uses in-memory storage for socket management.

6. **Add PostgreSQL Database**:
   - In your web service dashboard, go to **"Environment"**
   - Scroll down and click **"New Database"**
   - Select **"PostgreSQL"** (Free tier available)
   - Database URL will be automatically set as `DATABASE_URL`

7. Click **"Create Web Service"**

**Your backend will be deployed at**: `https://your-service-name.onrender.com`

---

### 2. **Frontend Deployment**

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `chat-platform-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`

4. **Add Environment Variable** (in `client/.env.production`):
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com
   REACT_APP_WS_URL=https://your-backend-name.onrender.com
   ```

5. Click **"Create Static Site"**

**Your frontend will be deployed at**: `https://your-frontend-name.onrender.com`

---

### 3. **Update Backend CLIENT_URL**

Go back to your backend service:
1. Go to **"Environment"**
2. Update `CLIENT_URL` to your actual frontend URL:
   ```
   CLIENT_URL=https://your-frontend-name.onrender.com
   ```
3. Save changes (service will auto-redeploy)

---

## ✅ Required Environment Variables

### Backend (Web Service)
```bash
# Required
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-123456
DATABASE_URL=postgresql://... (auto-set by Render PostgreSQL)
CLIENT_URL=https://your-frontend-url.onrender.com
PORT=5000

# That's it! No Redis needed - uses in-memory storage
```

### Frontend (Static Site)
Create `client/.env.production`:
```bash
REACT_APP_API_URL=https://your-backend-name.onrender.com
REACT_APP_WS_URL=https://your-backend-name.onrender.com
```

---

## 🎯 Key Points

### ✅ **Super Simple Setup!**
- **No Redis needed** - Uses in-memory storage
- **Only PostgreSQL required** - Included in free tier
- **All features work** - Messaging, video calls, file uploads, reactions, etc.
- **Entry-level friendly** - Minimal dependencies

### ⚠️ **Free Tier Limitations**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free compute time
- Single instance only (perfect for portfolio projects!)

---

## 🧪 Testing Your Deployment

1. **Visit your frontend URL**
2. **Register a new account**
3. **Create a channel**
4. **Send messages**
5. **Test video calling**
6. **Upload files**

Everything should work perfectly! 🎉

---

## 📝 Troubleshooting

### Issue: "Database connection failed"
- **Solution**: Make sure PostgreSQL database is attached and `DATABASE_URL` is set

### Issue: "CORS error"
- **Solution**: Make sure `CLIENT_URL` in backend matches your frontend URL exactly

### Issue: "Service is slow"
- **Cause**: Free tier spins down after inactivity
- **Solution**: First request takes ~30 seconds. Subsequent requests are fast.

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Portfolio & Entry-Level Projects)
- **Backend**: Free (750 hours/month)
- **Frontend**: Free (100 GB bandwidth/month)
- **PostgreSQL**: Free (1 GB storage)
- **No Redis needed**: Free!
- **Total**: **$0/month** ✅

### Upgrade Options (When You Need Them)
- **Always-on backend**: $7/month (no spin-down)
- **More storage**: $7/month (10 GB PostgreSQL)
- **Total**: **~$7-14/month** (only if needed)

---

## 🎓 For Your Resume

You can now add:
- ✅ "Deployed full-stack real-time chat application to production"
- ✅ "Configured CI/CD pipeline with automatic deployments"
- ✅ "Managed PostgreSQL database in cloud environment"
- ✅ "Architected application for both free-tier and production deployment"

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Free Tier Limits](https://render.com/docs/free)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**Need help?** Check the logs in your Render dashboard for any errors.

**Enjoy your deployed chat platform!** 🚀

