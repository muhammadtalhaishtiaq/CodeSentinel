const express = require('express');
const cors = require('cors');
const path = require('path');
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

app.listen(PORT, () => {
    console.log(`Server running in ${config.env} mode on port ${PORT}`);
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