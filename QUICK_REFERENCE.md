# 🚀 CodeSentinel - Quick Reference Guide

## 📋 5-Page Application Flow

### **1️⃣ Dashboard** (`/dashboard`)
**What it does:** Shows overview of all projects, stats, and recent activity

**Data Sources:**
- Stats Cards: `/api/projects/recent` (⚠️ currently mock data)
- Project Cards: `/api/projects/recent` (last 3 projects)
- Activity Feed: Recent scans and vulnerabilities

**Key Info:**
- Total projects count
- Secure vs vulnerable projects
- Total open issues across all projects
- Last scan timestamp

---

### **2️⃣ New Project** (`/new-project`)
**What it does:** Create a new security scan for a repository or pull request

**Flow:**
```
1. Select Repository (dropdown from synced repos)
   ↓
2. Select Branch or PR (fetched from GitHub API)
   ↓
3. Project Name (auto-filled, optional)
   ↓
4. Description (optional)
   ↓
5. Click "Start Security Scan" or "Scan Pull Request"
   ↓
6. Redirects to /project-scan/:scanId (real-time progress)
```

**API Calls:**
- `GET /api/integrations/repositories` - Get synced repos
- `GET /api/repositories/:repoId/refs?type=all` - Get branches + PRs
- `POST /api/projects` - Create project
- `POST /api/projects/:id/start-scan` - Start scan
- `GET /api/projects/:projectId/scans/:scanId/stream` - SSE progress

**Supports:**
- ✅ GitHub repositories
- ✅ Bitbucket repositories
- ✅ Branch scanning
- ✅ Pull Request scanning

---

### **3️⃣ My Projects** (`/projects`)
**What it does:** Lists all scanned projects with filtering and sorting

**Features:**
- 🔍 Search by name or repository
- 🎛️ Filter by status (all, completed, in-progress, failed)
- 📊 Sort by: newest, oldest, name, vulnerabilities

**Data:**
- `GET /api/projects` - All user's projects
- Shows: Name, repo, provider, vulnerabilities, last scanned, status

**Card Info:**
- Project name
- Repository (owner/repo)
- Provider icon (GitHub/Bitbucket)
- Status badge (healthy/warning/critical)
- Vulnerability counts: Critical, High, Medium, Low
- Last scanned date
- "View Details" → `/project/:id`

---

### **4️⃣ API & Integrations** (`/api-integrations`)
**What it does:** Connect source code providers (GitHub, Bitbucket)

**Tabs:**
1. **Default Repository Provider**
   - Toggle: GitHub / Bitbucket
   - Sets which provider to use for new projects

2. **Repository Access**
   - **GitHub:**
     - Option 1: OAuth (Recommended) ← Click "Connect with GitHub"
     - Option 2: Personal Access Token (Manual)
     - Shows: Connected as @username (if OAuth)
     - Button: "Sync Repositories"
   
   - **Bitbucket:**
     - Username + App Password
     - Test Connection → Save

**OAuth Flow:**
```
Click "Connect" 
  → Popup opens
  → GitHub authorization
  → User approves
  → Popup closes
  → Green "Connected" card appears
  → Can now sync repositories
```

**API Calls:**
- `GET /api/oauth/github` - Initiate OAuth
- `GET /api/oauth/github/callback` - OAuth callback
- `DELETE /api/oauth/github/disconnect` - Disconnect
- `POST /api/integrations/save-credentials` - Save manual token
- `POST /api/integrations/sync-repositories` - Sync repos

---

### **5️⃣ Settings** (`/settings`)
**What it does:** Update user profile and password

**Profile Tab:**
- First Name (editable)
- Last Name (editable)
- Email (read-only)
- Current Password (for changes)
- New Password (optional)
- Confirm Password (optional)
- "Save Changes" button

**API Call:**
- `PUT /api/auth/update-profile`

**Validations:**
- Password change requires current password
- New password must match confirm password
- New password >= 6 characters

**Notifications Tab:**
- ⚠️ Placeholder - not yet implemented

---

## 🔑 Authentication Flow

### **Registration:**
```
1. User fills: firstName, lastName, email, password
2. POST /api/auth/register
3. Backend hashes password (bcrypt)
4. Saves to MongoDB
5. Returns JWT token + user data
6. Frontend stores token in localStorage
7. AuthContext updates: isAuthenticated = true
8. Redirect to /dashboard
```

### **Login:**
```
1. User enters: email, password
2. POST /api/auth/login
3. Backend verifies password
4. Returns JWT token + user data
5. Frontend stores token in localStorage
6. Redirect to /dashboard
```

### **Protected Routes:**
**All API calls include:**
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

**Backend middleware checks:**
1. Extract token from Authorization header
2. Verify JWT signature
3. Find user by decoded ID
4. Attach user to req.user
5. Continue to route handler

---

## 📊 Database Collections

### **users**
- firstName, lastName, email, password (hashed)
- Authentication data

### **projects**
- name, description, repository, user
- latestScan, scanHistory
- summary (totalScans, vulnerabilityCounts)

### **scans**
- repositoryUrl, status, totalFiles, scannedFiles
- result: { vulnerabilities[], summary }
- createdBy, createdAt, completedAt

### **repositories**
- name (owner/repo), provider (github/bitbucket)
- repoId, user, connectedAt

### **sourcecredentials**
- user, provider, authType (manual/oauth)
- githubToken (encrypted), providerUsername
- isActive, isDefault

---

## 🔄 Scan Process (Detailed)

### **Step 1: User Initiates Scan**
```
POST /api/projects/:id/start-scan
Body: { branch: "main" }
```

### **Step 2: Create Scan Record**
```javascript
const scan = await Scan.create({
  project: projectId,
  user: userId,
  status: 'pending',
  branch: 'main'
});
```

### **Step 3: Background Process Starts**
```javascript
processScan(scanId, projectId, branch)
```

**Process Flow:**
```
1. Update status: 'in-progress'
2. Get project & repository info
3. Get user's OAuth credentials
4. Decrypt token
5. Fetch code from GitHub:
   - GET /repos/:owner/:repo/contents?ref=branch
   - Download all files
6. Extract to temp directory
7. Get all scannable files (.js, .ts, .py, etc.)
8. Update totalFiles count
9. Process files in batches (5 at a time):
   For each batch:
     a. Read file contents
     b. Send to Claude AI:
        POST https://api.aimlapi.com/chat/completions
        Prompt: "Analyze this code for vulnerabilities..."
     c. Parse AI response
     d. Extract vulnerabilities
     e. Update scan.result.vulnerabilities
     f. Update progress %
     g. Emit SSE event
10. Generate summary (counts by severity)
11. Update scan status: 'completed'
12. Update project summary
13. Emit completion event
14. Cleanup temp files
```

### **Step 4: Frontend Real-time Updates**
```javascript
// SSE connection
const eventSource = new EventSource(
  `/api/projects/${projectId}/scans/${scanId}/stream`
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data: { progress, message, status }
  
  setProgress(data.progress);
  setMessage(data.message);
  
  if (data.status === 'completed') {
    // Redirect to results
    navigate(`/project/${projectId}`);
  }
};
```

---

## 🔐 OAuth Implementation

### **GitHub OAuth Complete Flow:**

**1. Frontend Click:**
```javascript
window.open(
  `/api/oauth/github?token=${localStorage.getItem('token')}`,
  'OAuth',
  'width=600,height=700'
);
```

**2. Backend - Initiate:**
```javascript
// GET /api/oauth/github
1. Verify user token (from query)
2. Generate CSRF state: crypto.randomBytes(32)
3. Store in session: req.session.oauthState = state
4. Redirect to GitHub:
   https://github.com/login/oauth/authorize?
     client_id=YOUR_ID&
     redirect_uri=http://localhost:8080/api/oauth/github/callback&
     scope=repo read:user&
     state=CSRF_STATE
```

**3. GitHub Redirect Back:**
```
GET /api/oauth/github/callback?code=AUTH_CODE&state=CSRF_STATE
```

**4. Backend - Callback:**
```javascript
1. Validate state matches session (CSRF protection)
2. Exchange code for token:
   POST https://github.com/login/oauth/access_token
   Body: { client_id, client_secret, code, redirect_uri }
   
3. Get access_token from response

4. Fetch user info:
   GET https://api.github.com/user
   Headers: { Authorization: 'token ACCESS_TOKEN' }

5. Encrypt token:
   const encryptedToken = encrypt(access_token);
   // Uses AES-256-GCM

6. Save to database:
   SourceCredential.create({
     user: userId,
     provider: 'github',
     authType: 'oauth',
     githubToken: encryptedToken,
     providerUserId: githubUser.id,
     providerUsername: githubUser.login,
     isActive: true
   });

7. Send success HTML with postMessage:
   window.opener.postMessage({
     type: 'oauth-success',
     provider: 'github',
     username: 'muhammadtalhaishtiaq'
   }, '*');
```

**5. Frontend - Receive Message:**
```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'oauth-success') {
    // Show toast
    toast({ title: 'Connected!' });
    
    // Refresh credentials
    fetchCredentials();
    
    // Close popup
    popup.close();
  }
});
```

---

## 🛠️ Key Utility Functions

### **Encryption** (`server/src/utils/encryption.js`)
```javascript
encrypt(text) → encryptedString
decrypt(encryptedString) → text
// Uses AES-256-GCM with JWT_SECRET as key
```

### **JWT** (`server/src/utils/jwtUtils.js`)
```javascript
generateToken(userId) → jwtToken
// Signs with JWT_SECRET, expires in 24h
```

### **GitHub Utils** (`server/src/utils/githubUtils.js`)
```javascript
getGitHubToken(userId) → decryptedToken
getUserRepositories(userId) → repos[]
getRepositoryPullRequests(userId, owner, repo) → prs[]
getPullRequestFiles(userId, owner, repo, prNumber) → files[]
```

### **LLM Utils** (`server/src/utils/llmUtils.js`)
```javascript
scanCodeWithLLM({ files }) → vulnerabilities[]
// Sends code to Claude AI, parses response
```

---

## 📡 API Endpoints Reference

### **Auth**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `POST /api/auth/forgotpassword` - Request reset
- `PUT /api/auth/resetpassword/:token` - Reset password

### **Projects**
- `GET /api/projects` - Get all user's projects
- `GET /api/projects/recent` - Get recent 5 projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `POST /api/projects/:id/start-scan` - Start scan
- `GET /api/projects/:projectId/scans/:scanId/status` - Poll status
- `GET /api/projects/:projectId/scans/:scanId/stream` - SSE stream

### **Integrations**
- `GET /api/integrations/credentials` - Get credentials
- `POST /api/integrations/save-credentials` - Save credentials
- `POST /api/integrations/test-connection` - Test connection
- `POST /api/integrations/sync-repositories` - Sync repos
- `GET /api/integrations/repositories` - Get synced repos

### **OAuth**
- `GET /api/oauth/github` - Initiate GitHub OAuth
- `GET /api/oauth/github/callback` - GitHub callback
- `DELETE /api/oauth/github/disconnect` - Disconnect

### **Repositories**
- `GET /api/repositories/:repoId/refs?type=all` - Get branches & PRs

---

## 🚨 Important Notes

### **Environment Variables Required:**
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:5173
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/oauth/github/callback
AIMLAPI_KEY=your-aimlapi-key
```

### **Common Issues:**

**1. "Authentication token is missing"**
- User not logged in → Redirect to /login
- Token expired → Re-login required

**2. "OAuth popup blocked"**
- Browser blocking popups → Allow popups for localhost

**3. "No repositories found"**
- Haven't synced yet → Click "Sync Repositories"
- No OAuth connection → Connect GitHub first

**4. "Scan failed"**
- Invalid credentials → Reconnect provider
- Repository access denied → Check token permissions
- AI API error → Check AIMLAPI_KEY

---

## 📚 File Structure Reference

```
CodeSentinel/
├── src/                      # Frontend
│   ├── pages/
│   │   ├── Dashboard.tsx     # Page 1
│   │   ├── NewProject.tsx    # Page 2
│   │   ├── MyProjects.tsx    # Page 3
│   │   ├── ApiIntegrations.tsx # Page 4
│   │   └── Settings.tsx      # Page 5
│   ├── components/
│   │   ├── Sidebar.tsx       # Navigation
│   │   └── ui/               # shadcn components
│   ├── contexts/
│   │   └── AuthContext.tsx   # Auth state
│   └── utils/
│       └── authUtils.ts      # API helpers
│
└── server/
    ├── src/
    │   ├── controllers/      # Business logic
    │   │   ├── auth.js       # Auth operations
    │   │   ├── project.js    # Project CRUD
    │   │   ├── scan.js       # Scanning logic
    │   │   ├── integration.js # Provider credentials
    │   │   ├── oauth.js      # OAuth flow
    │   │   └── repository.js # Fetch branches/PRs
    │   ├── models/           # MongoDB schemas
    │   │   ├── User.js
    │   │   ├── Project.js
    │   │   ├── Scan.js
    │   │   ├── Repository.js
    │   │   └── SourceCredential.js
    │   ├── routes/           # API routes
    │   ├── middleware/       # Auth, error handling
    │   └── utils/            # Helper functions
    │       ├── encryption.js # AES-256-GCM
    │       ├── jwtUtils.js   # JWT generation
    │       ├── llmUtils.js   # AI scanning
    │       └── githubUtils.js # GitHub API wrapper
    └── temp/                 # Scan temp files
```

---

**For Full Details:** See `CODESENTINEL_DEVELOPER_DOCUMENTATION.md`
**For Code Review:** See `CODE_REVIEW_SUMMARY.md`

