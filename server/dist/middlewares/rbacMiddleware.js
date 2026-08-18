import { supabaseAdmin } from '../lib/supabaseAdmin.js';
/**
 * Unified Authorize Middleware
 */
export const authorize = (options) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized: User context missing' });
        }
        const { role, ownership, verification } = options;
        // Super Admins bypass standard checks
        if (req.user.permissionGroup === 'Super Admin' || req.user.role === 'Administrator') {
            return next();
        }
        // 1. Verification Check
        if (verification) {
            if (req.user.status === 'SUSPENDED') {
                return res.status(403).json({ success: false, error: 'Forbidden: Account is suspended' });
            }
            if (req.user.status !== 'APPROVED') {
                return res.status(403).json({ success: false, error: 'Forbidden: Account is not fully verified/approved' });
            }
        }
        // 2. Role Check
        if (role && role.length > 0) {
            if (!role.includes(req.user.role) && !role.includes(req.user.permissionGroup)) {
                return res.status(403).json({
                    success: false,
                    error: `Forbidden: Route requires one of roles: ${role.join(', ')}`
                });
            }
        }
        // 3. Ownership Check
        if (ownership) {
            const idParam = ownership.idParam || 'id';
            const resourceId = req.params[idParam] || req.body[idParam];
            const ownerColumn = ownership.column || 'restaurant_id';
            if (!resourceId) {
                // If no ID is provided, ownership is deferred to the controller
                return next();
            }
            try {
                const { data, error } = await supabaseAdmin
                    .from(ownership.model)
                    .select(ownerColumn)
                    .eq('id', resourceId)
                    .single();
                if (error || !data) {
                    return res.status(404).json({ success: false, error: 'Resource not found' });
                }
                const ownerId = data[ownerColumn];
                if (ownerId !== req.user.id) {
                    return res.status(403).json({ success: false, error: 'Forbidden: You do not own this resource' });
                }
            }
            catch (err) {
                return res.status(500).json({ success: false, error: 'Internal Server Error during ownership verification' });
            }
        }
        next();
    };
};
