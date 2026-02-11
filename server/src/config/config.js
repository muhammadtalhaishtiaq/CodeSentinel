const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
const envFile = '.env';
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

// Log the environment file being used
console.log('Loading environment from:', envFile);

const config = {
    env: process.env.NODE_ENV,
    port: process.env.BACKEND_PORT,
    frontendUrl: process.env.FRONTEND_URL,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE
};

// Validate required environment variables
const requiredEnvVars = [
    'NODE_ENV',
    'BACKEND_PORT',
    'FRONTEND_URL',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

module.exports = config;