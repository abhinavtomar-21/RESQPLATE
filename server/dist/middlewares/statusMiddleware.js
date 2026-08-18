/**
 * Checks if the user's account is in an active/approved state.
 * Prevents Suspended or Deleted users from taking action, even if their JWT is technically unexpired.
 */
export const requireActiveAccount = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const { status } = req.user;
    if (status === 'SUSPENDED') {
        return res.status(403).json({ success: false, error: 'Forbidden: Account is suspended. Please contact support.' });
    }
    if (status === 'DELETED') {
        return res.status(403).json({ success: false, error: 'Forbidden: Account no longer exists.' });
    }
    if (status === 'PENDING' || status === 'EMAIL_VERIFIED' || status === 'DOCUMENT_REVIEW') {
        // In a real app, we might allow them to hit the /profile endpoint to complete setup, 
        // but block them from creating donations.
        // For this general middleware, we'll let it pass but rely on RBAC to block specific actions.
    }
    next();
};
