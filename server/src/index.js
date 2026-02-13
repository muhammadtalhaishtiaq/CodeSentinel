const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');
const config = require('./config/config');

// Connect to database (non-blocking - won't crash if it fails)
connectDB().catch(err => {
    console.error('Database connection failed:', err.message);
    console.warn('⚠️  Server will continue without database');
});

// Route files
const authRoutes = require('./routes/auth');
const integrationRoutes = require('./routes/integration');
const projectRoutes = require('./routes/project');
const scanRoutes = require('./routes/scan');
const oauthRoutes = require('./routes/oauth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Body parser
app.use(express.json());

// File upload middleware
app.use(fileUpload({
    limits: { fileSize: 25 * 1024 * 1024 },
    abortOnLimit: true
}));

// CORS configuration - restrict to allowed origins
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Security headers
app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/oauth', oauthRoutes);

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
    console.log(`Server running in ${config.env} mode on port ${PORT}`);
});