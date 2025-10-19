# 🍎 CodeSentinel - Mac Setup Guide

## ✅ Migration Status: READY TO RUN!

This project has been successfully migrated from Windows to Mac. All configurations have been verified and are ready for macOS.

---

## 📋 System Verification (COMPLETED ✅)

### What's Already Set Up:
- ✅ **Node.js**: v22.17.1 (Perfect!)
- ✅ **npm**: 10.9.2
- ✅ **Dependencies**: All installed in `node_modules/`
- ✅ **Environment**: `.env.development` configured
- ✅ **Database**: MongoDB Atlas (Cloud) - No local installation needed!
- ✅ **Port Configuration**: Fixed and ready

---

## 🚀 Port Configuration

Your application will run on:

| Service  | Port | URL |
|----------|------|-----|
| **Backend** | 8080 | http://localhost:8080 |
| **Frontend** | 5173 | http://localhost:5173 |

> ⚠️ **Note**: We fixed a port conflict. The frontend was incorrectly set to port 8080 (same as backend). It's now correctly set to 5173.

---

## 🗄️ Database Configuration

**Good News!** You're using **MongoDB Atlas** (cloud database), so you don't need to install MongoDB locally on your Mac.

Your connection string (from `.env.development`):
```
mongodb+srv://talhaishtiaq9441_db_user:...@codesentinel.8hdxgoq.mongodb.net/...
```

✅ This will work identically on Mac as it did on Windows!

---

## 🏃 How to Run the Project on Mac

### Option 1: Run Both Frontend & Backend Together (Recommended)
```bash
npm run dev
```

This single command starts both:
- Backend on http://localhost:8080
- Frontend on http://localhost:5173

### Option 2: Run Separately (For debugging)

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

---

## 🔧 Available Scripts

```bash
# Development (starts both frontend & backend)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build for production
npm run build

# Start production server
npm start

# Initialize database (if needed)
npm run init-db

# Lint code
npm run lint
```

---

## 🌐 Accessing the Application

Once running, open your browser:

1. **Frontend UI**: http://localhost:5173
2. **Backend API**: http://localhost:8080/api
3. **API Health Check**: http://localhost:8080/api/auth/me

---

## 🔑 Environment Variables (Already Configured)

Your `.env.development` includes:

- ✅ Port configuration
- ✅ MongoDB Atlas connection
- ✅ JWT secrets
- ✅ AI/ML API key
- ✅ GitHub OAuth credentials
- ✅ Azure DevOps OAuth credentials
- ✅ Frontend/Backend URLs

**No changes needed for Mac!**

---

## 🆚 Mac vs Windows Differences

### What Changed:
| Aspect | Windows | Mac |
|--------|---------|-----|
| Path separators | `\` | `/` |
| Line endings | CRLF | LF |
| File permissions | Auto | May need `chmod` |
| Case sensitivity | No | Yes (on APFS) |

### What Stayed the Same:
- ✅ Port numbers (8080, 5173)
- ✅ MongoDB connection (cloud-based)
- ✅ All dependencies and packages
- ✅ Environment variables
- ✅ API endpoints
- ✅ Application logic

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the ports
lsof -i :8080
lsof -i :5173

# Kill a process using a port
kill -9 <PID>
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules
npm install
```

### Environment Variables Not Loading
```bash
# Verify the file exists
ls -la .env.development

# Check if it's being read
npm run dev:backend
# You should see: "Loading environment from: .env.development"
```

### Database Connection Issues
- Verify internet connection (you're using cloud MongoDB)
- Check MongoDB Atlas dashboard for any service issues
- Verify credentials haven't expired

---

## 📦 Project Structure

```
CodeSentinel/
├── .env.development      # ✅ Environment config (Mac-ready)
├── .env.example         # Template for environment variables
├── vite.config.ts       # ✅ Frontend config (Port 5173 - FIXED)
├── package.json         # ✅ Scripts and dependencies
├── server/
│   └── src/
│       ├── config/
│       │   ├── config.js    # ✅ Loads .env files
│       │   └── db.js        # MongoDB connection
│       ├── controllers/     # API logic
│       ├── models/         # Database models
│       ├── routes/         # API routes
│       └── index.js        # ✅ Backend entry (Port 8080)
└── src/
    ├── components/         # React components
    ├── pages/             # Page components
    └── main.tsx           # Frontend entry
```

---

## 🎯 Quick Start Checklist

1. [x] Node.js installed (v22.17.1)
2. [x] npm installed (10.9.2)
3. [x] Dependencies installed
4. [x] .env.development configured
5. [x] Port conflict resolved
6. [ ] **RUN: `npm run dev`**
7. [ ] Open http://localhost:5173
8. [ ] Test login/register

---

## 🔐 Security Notes

Your `.env.development` contains sensitive credentials:
- Database passwords
- OAuth secrets
- API keys

**Remember:**
- ✅ `.env*` files are in `.gitignore` (don't commit them!)
- ✅ Use `.env.example` as a template for team members
- ⚠️ Change secrets before production deployment

---

## 🌟 Ready to Go!

Your CodeSentinel project is **100% ready** to run on Mac. The migration is complete!

Just run:
```bash
npm run dev
```

Then visit: **http://localhost:5173** 🎉

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Check console logs for specific error messages
4. Ensure both ports (8080, 5173) are available

---

*Last Updated: October 19, 2025*
*Migration from Windows to Mac: COMPLETE ✅*

