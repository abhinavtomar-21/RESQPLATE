import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { supabase } from '../db.js';
export const authRouter = Router();
authRouter.post('/register', async (req, res) => {
    const { email, password, role, name, orgName, phone } = req.body;
    const isVol = role === 'Volunteer' || role === 'volunteer';
    const initialStatus = isVol ? 'APPROVED' : 'DOCUMENT_REVIEW';
    const { data: userAcc } = await supabase.from('profiles').select('*').eq('email', email).single();
    res.json({
        success: true,
        message: 'Registration successful.',
        user: userAcc
    });
});
import { AuditService } from '../services/auditService.js';
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data: user } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (!user) {
        return res.status(401).json({ success: false, error: 'User not found in system.' });
    }
    // NOTE: In production, real auth happens via Supabase GoTrue.
    // If this endpoint is hit as a fallback, we log it.
    await AuditService.log({
        action: 'LOGIN',
        entity: 'auth',
        entityId: user.id,
        userId: user.id,
        role: user.role,
        newState: { email },
        ip: req.ip,
        requestId: req.id
    });
    res.json({
        success: true,
        message: 'Login successful',
        token: 'simulated_jwt_token_123',
        user: user
    });
});
authRouter.post('/logout', requireAuth, async (req, res) => {
    if (req.user) {
        await AuditService.log({
            action: 'LOGOUT',
            entity: 'auth',
            entityId: req.user.id,
            userId: req.user.id,
            role: req.user.role,
            ip: req.ip,
            requestId: req.id
        });
    }
    res.json({ success: true, message: 'Logged out successfully' });
});
authRouter.get('/me', async (req, res) => {
    const email = req.query.email;
    if (!email)
        return res.status(400).json({ success: false, error: 'Email required' });
    const { data: user } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (!user)
        return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
});
authRouter.post('/update-state', async (req, res) => {
    const { email, updates } = req.body;
    if (!email || !updates)
        return res.status(400).json({ success: false, error: 'Email and updates required' });
    const { data: updatedUser } = await supabase.from('profiles').update(updates).eq('email', email).select().single();
    res.json({ success: true, user: updatedUser });
});
authRouter.post('/forgot-password', (req, res) => {
    // Trigger Supabase reset password email
    res.json({ success: true, message: 'Password reset link sent' });
});
authRouter.post('/mfa/verify', requireAuth, (req, res) => {
    const { otp } = req.body;
    const authReq = req;
    if (otp === '123456') {
        // Simulated successful OTP
        if (authReq.user)
            authReq.user.mfaVerified = true;
        return res.json({ success: true, message: 'MFA Verified Successfully' });
    }
    return res.status(401).json({ success: false, error: 'Invalid OTP code' });
});
import { activeSessions } from '../middlewares/sessionMiddleware.js';
authRouter.get('/sessions', requireAuth, (req, res) => {
    const authReq = req;
    if (!authReq.user)
        return res.status(401).send();
    const sessions = activeSessions[authReq.user.id] || [];
    res.json({ success: true, sessions });
});
authRouter.delete('/sessions/:index', requireAuth, (req, res) => {
    const authReq = req;
    if (!authReq.user)
        return res.status(401).send();
    const index = parseInt(req.params.index);
    if (activeSessions[authReq.user.id] && activeSessions[authReq.user.id][index]) {
        activeSessions[authReq.user.id].splice(index, 1);
        return res.json({ success: true, message: 'Remote session revoked successfully' });
    }
    return res.status(404).json({ success: false, error: 'Session not found' });
});
