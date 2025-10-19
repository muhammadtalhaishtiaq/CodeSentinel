const path = require('path');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

// Log the environment file being used
console.log('Loading environment from:', envFile);

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '24h',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    
    // OAuth Configuration for all providers
    oauth: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/api/oauth/github/callback'
        },
        bitbucket: {
            clientId: process.env.BITBUCKET_CLIENT_ID,
            clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
            callbackUrl: process.env.BITBUCKET_CALLBACK_URL || 'http://localhost:8080/api/oauth/bitbucket/callback'
        },
        azure: {
            clientId: process.env.AZURE_CLIENT_ID,
            clientSecret: process.env.AZURE_CLIENT_SECRET,
            callbackUrl: process.env.AZURE_CALLBACK_URL || 'http://localhost:8080/api/oauth/azure/callback',
            tenantId: process.env.AZURE_TENANT_ID || 'common'
        }
    }
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

module.exports = config;