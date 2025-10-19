# CodeSentinel Backend

This is the backend server for the CodeSentinel application, providing authentication, user management, and API services.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- MongoDB Compass (optional, for GUI management)

### MongoDB Setup

1. Install MongoDB:
   - [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
   - [macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   - [Linux](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. Start MongoDB:
   - Windows: MongoDB should run as a service after installation
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. Verify MongoDB is running:
   ```
   mongosh
   ```
   You should see the MongoDB shell connect. Type `exit` to exit.

4. The database and collections will be created automatically when the app runs.

### Environment Configuration

1. Update the `.env` file with your MongoDB connection string and other settings:

```
PORT=8080
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=24h

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/code_sentinel

# Email Configuration (for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

> Note: For Gmail, you'll need to use an App Password if you have 2FA enabled.

### Installation

1. Install dependencies:

```bash
npm install
```

2. Initialize the database:

```bash
npm run init-db
```

3. Start the server in development mode:

```bash
npm run dev
```

Or in production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- **Register**: `POST /api/auth/register`
  - Body: `{ firstName, lastName, email, password }`

- **Login**: `POST /api/auth/login`
  - Body: `{ email, password }`

- **Get Current User**: `GET /api/auth/me`
  - Header: `Authorization: Bearer YOUR_TOKEN`

- **Forgot Password**: `POST /api/auth/forgotpassword`
  - Body: `{ email }`

- **Reset Password**: `PUT /api/auth/resetpassword/:resettoken`
  - Body: `{ password }`

## Database Management with MongoDB Compass

MongoDB Compass is an excellent GUI tool for MongoDB management:

1. **Install MongoDB Compass**:
   - Download from [MongoDB's website](https://www.mongodb.com/products/compass)
   - Install following their instructions

2. **Connect to Your Database**:
   - Open MongoDB Compass
   - Use the connection string: `mongodb://localhost:27017/`
   - Click "Connect"

3. **View Collections**:
   - Select the `code_sentinel` database
   - You'll see collections like `users` once they're created

4. **View/Edit Data**:
   - Click on any collection to view documents
   - Use the interface to filter, sort, and modify data
   - Use the query bar to run MongoDB queries

5. **Create Indexes**:
   - Navigate to the "Indexes" tab for a collection
   - Create new indexes to optimize query performance

## Deployment Considerations

For production deployment:

1. Use a strong, unique JWT secret
2. Set up proper email credentials 
3. Consider using MongoDB Atlas for hosted MongoDB
4. Implement rate limiting
5. Use HTTPS
6. Set up CI/CD pipelines

## Troubleshooting

- **MongoDB Connection Issues**: 
  - Ensure MongoDB is running with `mongosh`
  - Check if your connection string is correct
  - Verify network settings if using a remote database

- **Email Sending Fails**: 
  - Check your email provider settings and credentials
  - Many email providers require app-specific passwords

- **Token Validation Errors**: 
  - Ensure your JWT secret is consistent 