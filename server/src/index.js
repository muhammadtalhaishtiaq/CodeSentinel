const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
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

const app = express();

// Body parser
app.use(express.json());

// File upload middleware
app.use(fileUpload({
    limits: { fileSize: 25 * 1024 * 1024 },
    abortOnLimit: true
}));

// CORS configuration - allow requests from the same origin
app.use(cors({
    origin: true, // Allow requests from the same origin
    credentials: true
}));

// API routes
app.use('/api/auth', authRoutes);
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