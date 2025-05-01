# CodeSentinel

A modern code security analysis platform built with MERN stack (MongoDB, Express, React, Node.js).
## Project info
![image](https://github.com/user-attachments/assets/839b6385-36e9-4367-9a6b-9080bf1c746e)

# Dashboard
![image](https://github.com/user-attachments/assets/b27c9ea5-94e9-4620-bf20-49d3816ad401)

# Scanned Projects
![image](https://github.com/user-attachments/assets/f3a6751a-8572-49c5-a8a4-a0f73d66d838)

# Security Scan
![image](https://github.com/user-attachments/assets/7b901ccd-9f46-457a-a682-2570bd26b8ed)

# Project Detail
![ezgif com-animated-gif-maker](https://github.com/user-attachments/assets/7aa8ade0-a8f5-4471-8361-0d76374a0056)

# Integrations
![image](https://github.com/user-attachments/assets/d9a5a4f7-859d-47a5-bd96-b671abde36ce)

# Guarding Your Code with Intelligent Precision

## Project Structure

```
CodeSentinel/
├── server/           # Backend code
│   └── src/
│       ├── config/   # Database configuration
│       ├── controllers/ # API controllers
│       ├── middleware/ # Express middleware
│       ├── models/   # Mongoose models
│       ├── routes/   # API routes
│       ├── scripts/  # Database scripts
│       └── utils/    # Utility functions
├── src/              # Frontend code
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── pages/        # Page components
│   └── App.tsx       # Main app component
├── public/           # Static assets
└── .env              # Environment variables
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Quick Start

1. **Install dependencies**

```bash
npm install
```

2. **Initialize the database**

```bash
npm run init-db
```

3. **Start the development server**

```bash
npm run dev
```

This will start both the backend and frontend on http://localhost:8080.

## Production Build

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the frontend for production
- `npm run start` - Start production server
- `npm run init-db` - Initialize MongoDB database
- `npm run lint` - Run linter

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

## License

MIT

## Features

- User authentication (login, register, password reset)
- Secure password handling with bcrypt
- MongoDB database integration
- Protected routes for authenticated users
- User-friendly form validation
- Dashboard for security analysis

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- MongoDB Compass (optional, for GUI)

### Setup Instructions

#### MongoDB Setup

1. Install MongoDB from [MongoDB's website](https://docs.mongodb.com/manual/installation/)
2. Start MongoDB:
   - Windows: MongoDB should run as a service after installation
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
3. Verify MongoDB is running by connecting with `mongosh` command
4. The application will automatically create the database and collections

#### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Configure the `.env` file with your settings:
```
PORT=8080
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/code_sentinel
# Email settings for password reset...
```

4. Initialize the database:

```bash
npm run init-db
```

5. Start the development server:

```bash
npm run dev
```

The backend will run on http://localhost:8080.

#### Frontend Setup

1. From the project root, install frontend dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The frontend will run on http://localhost:5173.

## Using MongoDB Compass to View Database Data

1. Download and install [MongoDB Compass](https://www.mongodb.com/products/compass)

2. Connect to your database:
   - Connection string: `mongodb://localhost:27017/`
   - Click "Connect"

3. Once connected:
   - Select the `code_sentinel` database
   - Explore collections like `users`
   - View, edit, or filter documents
   - Create queries and aggregations

4. Useful features:
   - Document viewer and editor
   - Query builder
   - Performance profiling
   - Schema analysis
   - Export/import data

## Authentication Flow

1. Register a new account at `/register`
2. Login with your credentials at `/login`
3. If you forget your password:
   - Go to `/forgot-password`
   - Enter your email
   - Check your email for a reset link
   - Follow the link to reset your password

## Production Deployment

For production deployment:

1. Set strong JWT secrets in .env
2. Configure a production email service
3. Use MongoDB Atlas for database hosting
4. Set up CI/CD pipelines
5. Enable HTTPS
6. Implement rate limiting

## License

[MIT License](LICENSE)



## How can I run this project locally?
If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?
