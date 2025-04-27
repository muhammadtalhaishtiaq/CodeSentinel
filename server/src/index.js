const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { createServer: createViteServer } = require('vite');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/auth');

const startServer = async() => {
    const app = express();

    // Body parser
    app.use(express.json());

    // Enable CORS
    app.use(cors());

    // API routes
    app.use('/api/auth', authRoutes);

    // In development, use Vite for hot module replacement
    if (process.env.NODE_ENV !== 'production') {
        // Create Vite server in middleware mode
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
            root: path.resolve(__dirname, '../..')
        });

        // Use Vite's connect instance as middleware
        app.use(vite.middlewares);

        app.get('*', async(req, res, next) => {
            try {
                // Serve index.html when not an API request
                if (!req.url.startsWith('/api/')) {
                    const template = await vite.transformIndexHtml(
                        req.originalUrl,
                        await vite.ssrLoadModule(path.resolve(__dirname, '../../index.html'))
                    );
                    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
                } else {
                    next();
                }
            } catch (e) {
                vite.ssrFixStacktrace(e);
                console.error(e);
                next(e);
            }
        });
    } else {
        // In production, serve the built frontend
        app.use(express.static(path.join(__dirname, '../../dist')));

        // Any route not handled by API should be handled by React
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
        });
    }

    // Error handler middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Frontend available at http://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.log(`Error: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
};

startServer();