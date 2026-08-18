import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import os from 'os';
export const healthRouter = Router();
// Comprehensive Health Check
healthRouter.get('/', async (req, res) => {
    const health = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        buildNumber: process.env.BUILD_NUMBER || 'dev',
        memoryUsage: process.memoryUsage(),
        osLoad: os.loadavg(),
        services: {
            database: 'UNKNOWN',
            supabaseAuth: 'UNKNOWN',
            storage: 'UNKNOWN',
            smtp: 'UNKNOWN',
            environment: 'UNKNOWN'
        }
    };
    // 1. Environment Checks
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'FRONTEND_URL'];
    const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);
    health.services.environment = missingEnvVars.length === 0 ? 'UP' : `DOWN (Missing: ${missingEnvVars.join(', ')})`;
    try {
        // 2. Database Check
        const { data: dbData, error: dbError } = await supabaseAdmin.from('profiles').select('id').limit(1);
        health.services.database = dbError ? 'DOWN' : 'UP';
        // 3. Supabase Auth Check
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
        health.services.supabaseAuth = authError ? 'DOWN' : 'UP';
        // 4. Storage Check
        const { data: storageData, error: storageError } = await supabaseAdmin.storage.listBuckets();
        health.services.storage = storageError ? 'DOWN' : 'UP';
        // 5. Mock SMTP
        health.services.smtp = 'UP (Mock Service Active)';
    }
    catch (err) {
        console.error('Health check partial failure:', err);
    }
    // Determine overall status
    const isHealthy = Object.values(health.services).every((status) => status.startsWith('UP'));
    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        ...health
    });
});
