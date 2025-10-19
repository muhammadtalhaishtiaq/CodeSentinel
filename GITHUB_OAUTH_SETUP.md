# 🔐 GitHub OAuth Setup Guide

## Why Do You Need This?

**Your Client ID/Secret = YOUR APP's identity with GitHub**
- This identifies "CodeSentinel" as an application
- Each user who connects gets their own unique token dynamically
- Your credentials stay in .env (one-time setup)
- User tokens are generated on-the-fly and stored in database

Think of it like:
- Your Client ID/Secret = Your restaurant's business license
- User tokens = Individual customer orders (dynamic)

---

## 🚀 Step-by-Step Setup

### 1️⃣ Register Your App with GitHub

1. **Go to:** https://github.com/settings/developers
2. Click **"New OAuth App"** (green button, top right)

### 2️⃣ Fill in Application Details

```
Application name:       CodeSentinel Development
Homepage URL:           http://localhost:5173
Authorization callback: http://localhost:8080/api/oauth/github/callback
Application description: Code security analysis platform
```

⚠️ **CRITICAL:** The callback URL must be **EXACTLY** `http://localhost:8080/api/oauth/github/callback`

### 3️⃣ Register & Get Credentials

1. Click **"Register application"**
2. You'll see your **Client ID** (visible)
3. Click **"Generate a new client secret"** 
4. Copy both immediately (secret only shows once!)

### 4️⃣ Update Your `.env.development`

Open `.env.development` and replace the placeholders:

```env
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=abcdef1234567890abcdef1234567890abcdef12
GITHUB_CALLBACK_URL=http://localhost:8080/api/oauth/github/callback
```

✅ Keep the quotes removed!
✅ Paste the actual values from GitHub

### 5️⃣ Restart Your Server

```bash
npm run dev
```

### 6️⃣ Test It!

1. Go to: http://localhost:5173/api-integrations
2. Click the blue **"Connect with GitHub"** button
3. Popup opens → GitHub asks for authorization
4. Click **"Authorize"**
5. Success! You'll see: "Connected as @yourusername" ✅

---

## 🌐 For Production (Later)

When deploying to production domain (e.g., `https://codesentinel.com`):

1. Create a **NEW** OAuth App on GitHub (separate from dev)
2. Use production URLs:
   - Homepage: `https://codesentinel.com`
   - Callback: `https://codesentinel.com/api/oauth/github/callback`
3. Put credentials in `.env.production`

**Why separate apps?**
- Development and production have different callback URLs
- Keeps dev and prod isolated
- Can revoke access separately if needed

---

## 🔒 Security Notes

✅ **Client ID** = Public (safe to expose in frontend requests)
✅ **Client Secret** = PRIVATE (never commit to git, stays in .env)
✅ **User tokens** = Encrypted in database with AES-256-GCM
✅ **CSRF protection** = State validation via express-session
✅ **.env files** = Already in `.gitignore` (won't be committed)

---

## ❓ Common Questions

**Q: Why can't users just use their own Client ID?**
A: OAuth requires a **registered app** that users authorize. Users authorize YOUR app (CodeSentinel), not their own app.

**Q: Does this expose my GitHub account?**
A: No! This just identifies your APP to GitHub. Each user gets their own token for their own account.

**Q: What if I don't want to use my personal GitHub?**
A: Create a GitHub account specifically for CodeSentinel development. The Client ID/Secret just identifies the app name.

**Q: Can I use the same OAuth app for multiple developers?**
A: Yes! Team members can share the same .env file (via secure channel, not git). Or each developer can create their own dev OAuth app.

---

## 🎉 What Happens After Setup?

When any user (not just you) connects:
1. They click "Connect with GitHub"
2. GitHub shows: "**CodeSentinel** wants to access your repos"
3. User authorizes
4. YOUR backend receives a unique token for THAT user
5. Token is encrypted & saved to YOUR database
6. User sees: "Connected as @theirusername" ✅

Each user gets their own encrypted token - fully dynamic!

---

Need help? Check:
- GitHub OAuth docs: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
- Your server logs for detailed OAuth flow debugging

