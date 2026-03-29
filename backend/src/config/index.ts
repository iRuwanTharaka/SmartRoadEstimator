import dotenv from 'dotenv';
dotenv.config();

export const env = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || '',
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    ai: {
        serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        timeout: parseInt(process.env.AI_SERVICE_TIMEOUT || '30000', 10),
        retries: parseInt(process.env.AI_SERVICE_RETRIES || '3', 10),
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
};
