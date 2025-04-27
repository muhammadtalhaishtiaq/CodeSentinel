# CodeSentinel

A security analysis platform for your codebase with a complete authentication system.

## Features

- User authentication (login, register, password reset)
- Secure password handling with bcrypt
- MongoDB database integration
- Protected routes for authenticated users
- User-friendly form validation
- Dashboard for security analysis

## Project Structure

- `/src` - Frontend React application
- `/server` - Backend Node.js/Express server

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

## API Endpoints

### Authentication

- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Get Current User**: `GET /api/auth/me`
- **Forgot Password**: `POST /api/auth/forgotpassword`
- **Reset Password**: `PUT /api/auth/resetpassword/:resettoken`

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

## Project info

# Guarding Your Code with Intelligent Precision

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
