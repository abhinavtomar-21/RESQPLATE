import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { donationsRouter } from './routes/donations.js';
import { usersRouter } from './routes/users.js';
import { invitationsRouter } from './routes/invitations.js';
import { ngosRouter } from './routes/ngos.js';
import { volunteersRouter } from './routes/volunteers.js';
import { adminRouter } from './routes/admin.js';
import { notificationsRouter } from './routes/notifications.js';
import { TrustEngine } from './services/trustEngine.js';
TrustEngine.initializeListeners();
const app = express();
const PORT = process.env.PORT || 5000;
// Security Headers
app.use(helmet());
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    integrations: [
        nodeProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling
    profilesSampleRate: 1.0,
});
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
// Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 1 minute',
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts from this IP, please try again later',
});
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: 'Too many registration attempts, please try again later',
});
const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // 2 verification submissions per hour
    message: 'Too many verification submissions, please try again later',
});
app.use(globalLimiter);
import { v4 as uuidv4 } from 'uuid';
// Setup basic request logging/monitoring middleware
app.use((req, res, next) => {
    req.id = uuidv4();
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        if (ms > 1000) {
            console.warn(`[SLOW API] ${req.method} ${req.originalUrl} - ${ms}ms - ReqID: ${req.id}`);
        }
    });
    next();
});
import { healthRouter } from './routes/health.js';
// Health check endpoints
app.use('/api/health', healthRouter);
import { aiHealthState } from './services/aiService.js';
app.get('/api/health/ai', (req, res) => {
    res.json({
        OpenRouter: aiHealthState.openRouterConnected ? 'Connected' : 'Disconnected',
        Gemini: aiHealthState.geminiConnected ? 'Connected' : 'Disconnected',
        'Current Provider': aiHealthState.currentProvider,
        'Current Model': aiHealthState.currentModel,
        'Last Error': aiHealthState.lastError
    });
});
import { requireAuth } from './middlewares/authMiddleware.js';
import { authorize } from './middlewares/rbacMiddleware.js';
import { uploadRouter } from './routes/upload.js';
// API Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/donations', requireAuth, donationsRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/invitations', requireAuth, invitationsRouter);
// Test endpoints for IAM integration
app.use('/api/ngos', requireAuth, authorize({ role: ['NGO Admin', 'NGO', 'Administrator'] }), ngosRouter);
app.use('/api/volunteers', requireAuth, authorize({ role: ['Volunteer', 'Administrator'] }), volunteersRouter);
app.use('/api/admin', requireAuth, authorize({ role: ['Administrator'] }), adminRouter);
app.use('/api/notifications', requireAuth, notificationsRouter);
Sentry.setupExpressErrorHandler(app);
app.listen(PORT, () => {
    console.log(`🚀 ResQPlate Backend Engine running on http://localhost:${PORT}`);
});
