import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config';
import logger from './config/logger';
import { swaggerSpec } from './config/swagger';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import imageRoutes from './routes/image.routes';
import analysisRoutes from './routes/analysis.routes';
import rateRoutes from './routes/rate.routes';
import estimateRoutes from './routes/estimate.routes';
import boqRoutes from './routes/boq.routes';

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.cors.origin }));

// ─── Global Rate Limiter ─────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────
app.use(
    morgan('combined', {
        stream: { write: (message: string) => logger.info(message.trim()) },
    })
);

// ─── Health Check ────────────────────────────────────────────
/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Returns OK if the server is running
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/estimate', estimateRoutes);
app.use('/api/boq', boqRoutes);

// ─── Swagger Docs ────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────
app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        logger.error('Unhandled error:', err);
        res.status(500).json({
            error: env.nodeEnv === 'production' ? 'Internal server error' : err.message,
        });
    }
);

// ─── Start Server ────────────────────────────────────────────
app.listen(env.port, () => {
    logger.info(`🚀 Server running on port ${env.port}`);
    logger.info(`📖 API docs at http://localhost:${env.port}/api-docs`);
    logger.info(`🏥 Health check at http://localhost:${env.port}/health`);
});

export default app;
