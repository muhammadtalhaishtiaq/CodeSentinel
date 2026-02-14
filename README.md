# 🛡️ CodeSentinel

> **Intelligent Code Security Analysis Platform**  
> Modern security scanning for GitHub, Bitbucket, and Azure DevOps repositories

[![MERN Stack](https://img.shields.io/badge/MERN-Stack-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()

---

## 📸 Preview

<details>
<summary>🖼️ Click to view screenshots</summary>

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/b27c9ea5-94e9-4620-bf20-49d3816ad401)

### Security Scan in Action
![Scanning](https://github.com/user-attachments/assets/7fb147b8-70ed-40a6-b279-e4203aa9ac6a)

### Project Details
![Project Detail](https://github.com/user-attachments/assets/7aa8ade0-a8f5-4471-8361-0d76374a0056)

### OAuth Integrations
![Integrations](https://github.com/user-attachments/assets/d9a5a4f7-859d-47a5-bd96-b671abde36ce)

</details>

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file (see setup below)
# Create .env in the root and update values

# 3. Run the application
npm run dev
```

**Open browser:** `http://localhost:5173`

---

## 🎯 Features

- ✅ **Multi-Platform OAuth** - GitHub, Bitbucket, Azure DevOps
- ✅ **Security Scanning** - Analyze pull requests for vulnerabilities
- ✅ **Real-time Dashboard** - Monitor security metrics
- ✅ **User Authentication** - JWT-based secure auth
- ✅ **Project Management** - Track and manage scanned projects

---

## 🔧 Environment Setup

<details open>
<summary><b>📝 Step-by-Step Configuration</b></summary>

### 1. Create Environment File

1. Create `.env` in root directory
2. Update these required values:

```env
# Required
NODE_ENV=development
BACKEND_PORT=8080
FRONTEND_PORT=5173
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codesentinel
JWT_SECRET=your_secret_minimum_32_characters_long
JWT_EXPIRE=24h

# URLs
BASE_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

# OAuth (Optional - for integrations)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/oauth/github/callback

BITBUCKET_CLIENT_ID=your_bitbucket_client_id
BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret
BITBUCKET_CALLBACK_URL=http://localhost:8080/api/oauth/bitbucket/callback

AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_CALLBACK_URL=http://localhost:8080/api/oauth/azure/callback

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# AI/ML API
AIMLAPI_KEY=your_aimlapi_key
AIML_MODEL=gpt-4o-mini  # Options: gpt-4o-mini, gpt-4o, claude-3-5-sonnet, etc.
```

### 2. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (free tier available)
3. **Database Access** → Add User (username + password)
4. **Network Access** → Add IP → Allow from Anywhere (`0.0.0.0/0`)
5. **Connect** → Connect Application → Copy connection string
6. Update `MONGODB_URI` in `.env`

</details>

---

## 🔐 OAuth Setup (Optional)

<details>
<summary><b>GitHub OAuth Configuration</b></summary>

1. Go to **GitHub Settings** → **Developer Settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in details:
   - **Application name:** CodeSentinel
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:8080/api/oauth/github/callback`
4. Click **Register application**
5. Copy **Client ID** and **Client Secret** to `.env`

</details>

<details>
<summary><b>Azure DevOps OAuth Configuration</b></summary>

1. Go to **Azure Portal** → **App Registrations**
2. Click **New Registration**
3. Fill in details:
   - **Name:** CodeSentinel
   - **Redirect URI:** `http://localhost:8080/api/oauth/azure/callback`
4. Go to **API Permissions** → **Add Permission** → **Azure DevOps**
5. Add delegated permissions:
   - `vso.code` - Code (read)
   - `vso.project` - Project and team (read)
   - `vso.build` - Build (read)
6. Go to **Certificates & secrets** → Create new client secret
7. Copy **Client ID**, **Client Secret**, and **Tenant ID** to `.env`

**Azure OAuth URLs:**
- Auth: `https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/authorize`
- Token: `https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token`
- Profile: `https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0`

</details>

<details>
<summary><b>Bitbucket OAuth Configuration</b></summary>

1. Go to **Bitbucket Settings** → **OAuth**
2. Click **Add Consumer**
3. Fill in details:
   - **Name:** CodeSentinel
   - **Callback URL:** `http://localhost:8080/api/oauth/bitbucket/callback`
   - **Permissions:**
     - `Account` (Read)
     - `Repositories` (Read)
     - `Pull requests` (Read)
4. Save and copy **Key** (Client ID) and **Secret** to `.env`

</details>

---

## 🚀 Running the Application

<details>
<summary><b>Development Commands</b></summary>

```bash
# Run both frontend and backend
npm run dev

# Run frontend only (port 5173)
npm run dev:frontend

# Run backend only (port 8080)
npm run dev:backend

# Build for production
npm run build

# Start production server
npm start
```

**Ports:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API: `http://localhost:8080/api`

</details>

<details>
<summary><b>Changing Ports</b></summary>

Update `.env`:
```env
BACKEND_PORT=3000   # Change backend port
FRONTEND_PORT=8000  # Change frontend port
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8000
BASE_URL=http://localhost:8000
```

**Important:** Update OAuth callback URLs if you change `BACKEND_PORT`:
```env
GITHUB_CALLBACK_URL=http://localhost:3000/api/oauth/github/callback
BITBUCKET_CALLBACK_URL=http://localhost:3000/api/oauth/bitbucket/callback
AZURE_CALLBACK_URL=http://localhost:3000/api/oauth/azure/callback
```

</details>

---

## 📁 Project Structure

```
CodeSentinel/
├── .env                   # Environment variables
├── vite.config.ts         # Frontend config (reads FRONTEND_PORT)
├── package.json           # Dependencies and scripts
├── src/                   # Frontend React app
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts (Auth)
│   └── main.tsx          # Entry point
└── server/
    └── src/
        ├── config/
        │   ├── config.js      # Backend config (reads BACKEND_PORT)
        │   └── db.js          # MongoDB connection
        ├── controllers/       # Route handlers
        │   ├── auth.js       # Authentication
        │   ├── oauth.js      # OAuth flows
        │   ├── project.js    # Project management
        │   └── scan.js       # Security scanning
        ├── models/           # MongoDB schemas
        │   ├── User.js
        │   ├── Project.js
        │   ├── SourceCredential.js
        │   └── Scan.js
        ├── routes/           # API routes
        └── index.js          # Backend entry point
```

---

## 🔗 API Endpoints

<details>
<summary><b>View API Documentation</b></summary>

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password

### OAuth
- `GET /api/oauth/:provider/connect` - Initiate OAuth flow (GitHub/Bitbucket/Azure)
- `GET /api/oauth/:provider/callback` - Handle OAuth callback
- `DELETE /api/oauth/:provider/disconnect` - Disconnect provider
- `GET /api/oauth/status` - Get all OAuth connection status

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/recent` - Get recent projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Integrations
- `GET /api/integrations/credentials` - Get source credentials
- `POST /api/integrations/test` - Test connection
- `POST /api/integrations/sync` - Sync repositories

### Scans
- `POST /api/scans/start` - Start security scan
- `GET /api/scans/:id` - Get scan results

</details>

---

## 🐛 Troubleshooting

<details>
<summary><b>Port Already in Use</b></summary>

**Error:** `EADDRINUSE: address already in use :::8080`

**Windows:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Or find specific process
netstat -ano | findstr :8080
taskkill /PID <process_id> /F
```

**Mac/Linux:**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

</details>

<details>
<summary><b>Environment Variables Not Loading</b></summary>

1. Ensure `.env` is in **root directory** (not `server/`)
2. File name must be exactly `.env`
3. No quotes around values: `PORT=8080` not `PORT="8080"`
4. Restart dev server: `Ctrl+C` then `npm run dev`

</details>

<details>
<summary><b>MongoDB Connection Failed</b></summary>

1. Check `MONGODB_URI` format (no quotes, no spaces)
2. Verify username/password are correct
3. Check IP whitelist in MongoDB Atlas (should be `0.0.0.0/0`)
4. Test connection string in [MongoDB Compass](https://www.mongodb.com/products/compass)

</details>

<details>
<summary><b>OAuth Callback Errors</b></summary>

1. Verify callback URLs match exactly in OAuth app settings
2. Ensure backend is running on correct port
3. Check `FRONTEND_URL` is set correctly
4. Clear browser cookies/cache for OAuth provider

</details>

---

## 🔒 Security Notes

- ⚠️ Never commit `.env` to Git
- ✅ Use strong JWT secrets (32+ characters minimum)
- ✅ Keep OAuth client secrets secure
- ✅ Regularly rotate secrets and API keys
- ✅ In production, use environment variables (not `.env` files)

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Authentication:** JWT, OAuth 2.0
- **DevOps:** GitHub, Bitbucket, Azure DevOps integrations

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📞 Support

Need help? Check the troubleshooting section above or review the `.env` section for configuration reference.

---

**Built with ❤️ for developers who care about security**
