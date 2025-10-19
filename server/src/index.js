const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');
const config = require('./config/config');

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/auth');
const integrationRoutes = require('./routes/integration');
const projectRoutes = require('./routes/project');
const scanRoutes = require('./routes/scan');
const oauthRoutes = require('./routes/oauthMulti'); // Multi-provider OAuth routes
const repositoryRoutes = require('./routes/repository'); // Repository routes

const app = express();

// Body parser
app.use(express.json());

// Session middleware (for OAuth state management)
app.use(session({
    secret: config.jwtSecret, // Use JWT secret for session encryption
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.env === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 10 * 60 * 1000 // 10 minutes (enough for OAuth flow)
    }
}));

// File upload middleware
app.use(fileUpload({
    limits: { fileSize: 25 * 1024 * 1024 },
    abortOnLimit: true
}));

// CORS configuration
app.use(cors({
    origin: config.env === 'production' 
        ? false // In production, frontend is served from same origin
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Dev: allow Vite on any port
    credentials: true
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/oauth', oauthRoutes); // OAuth routes
app.use('/api/repositories', repositoryRoutes); // Repository routes

// Serve static files in production
if (config.env === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
        }
    });
}

// Error handler
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🛡️  CodeSentinel Server Started     ║
╚════════════════════════════════════════╝
    
Mode:     ${config.env}
Port:     ${PORT}
Database: ${config.mongoUri ? '✓ Connected' : '✗ Not configured'}
${config.env === 'development' ? `
Frontend: http://localhost:5173
Backend:  http://localhost:${PORT}
` : `
App URL:  http://localhost:${PORT}
`}
Press Ctrl+C to stop
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});