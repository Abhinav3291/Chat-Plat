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

# Optional (for Redis/scaling - leave unset for free tier)
# ENABLE_REDIS=true
# REDIS_URL=redis://...
```

### Frontend (Static Site)
Create `client/.env.production`:
```bash
REACT_APP_API_URL=https://your-backend-name.onrender.com
REACT_APP_WS_URL=https://your-backend-name.onrender.com
```

---

## 🎯 Key Points

### ✅ **Free Tier Works Perfectly!**
- No Redis required
- Single-instance mode
- All features work (messaging, video calls, file uploads, etc.)
- PostgreSQL database included

### ⚠️ **Free Tier Limitations**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free compute time

### 🚀 **To Enable Redis (Optional)**
Only needed for horizontal scaling (multiple instances):
1. Add Redis service on Render
2. Set `ENABLE_REDIS=true`
3. Set `REDIS_URL` from Redis service

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

### Issue: "Redis connection error"
- **Solution**: Make sure you don't have `ENABLE_REDIS=true` set (it should be unset for free tier)

### Issue: "Service is slow"
- **Cause**: Free tier spins down after inactivity
- **Solution**: First request takes ~30 seconds. Subsequent requests are fast.

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Portfolio)
- **Backend**: Free (750 hours/month)
- **Frontend**: Free (100 GB bandwidth/month)
- **PostgreSQL**: Free (1 GB storage)
- **Total**: **$0/month** ✅

### With Redis (Production Scale)
- **Backend**: Free or $7/month (for always-on)
- **Frontend**: Free
- **PostgreSQL**: Free or $7/month (for 10 GB)
- **Redis**: $7/month
- **Total**: **~$7-21/month** (only when you need scaling)

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

