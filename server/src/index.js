const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for safety
    abortOnLimit: true,
    useTempFiles: false,
    debug: process.env.NODE_ENV === 'development'
}));

// Enable CORS
app.use(cors());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scans', scanRoutes);

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
    // In development mode, we'll use Vite's dev server
    const { createServer: createViteServer } = require('vite');

    const setupVite = async() => {
        try {
            // Create Vite server
            const vite = await createViteServer({
                server: { middlewareMode: true },
                appType: 'spa',
                root: path.resolve(__dirname, '../../')
            });

            // Use Vite's connect middleware
            app.use(vite.middlewares);

            console.log('Vite middleware enabled for development');
        } catch (error) {
            console.error('Failed to initialize Vite middleware:', error);
            process.exit(1);
        }
    };

    setupVite();
} else {
    // In production, serve static files from the build directory
    app.use(express.static(path.join(__dirname, '../../dist')));

    // For any other request, send the React app
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
        }
    });
}

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});