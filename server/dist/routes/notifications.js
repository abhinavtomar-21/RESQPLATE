import { Router } from 'express';
import { supabase } from '../db.js';
export const notificationsRouter = Router();
// GET all notifications
notificationsRouter.get('/', async (req, res) => {
    try {
        const { data: notifs, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({
            success: true,
            unreadCount: notifs.filter(n => !n.read).length,
            notifications: notifs
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST mark all notifications read
notificationsRouter.post('/mark-read', async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('read', false); // Only update unread ones
        if (error)
            throw error;
        res.json({
            success: true,
            message: 'All notifications marked as read.'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
