import { Router } from 'express';
import { supabase } from '../db.js';
export const ngosRouter = Router();
// GET nearby donations for NGO
ngosRouter.get('/nearby', async (req, res) => {
    const { data: donations } = await supabase.from('donations').select('*');
    res.json({
        success: true,
        donations: donations || [],
        aiMatchRankings: [
            { name: 'Asha Foundation', dist: '0.8 km', match: 98 },
            { name: 'Green Hope NGO', dist: '1.4 km', match: 94 },
            { name: 'CityFeed Trust', dist: '2.1 km', match: 88 }
        ]
    });
});
// POST accept donation
ngosRouter.post('/accept', async (req, res) => {
    const { donationId } = req.body;
    const { data: updatedDonation } = await supabase
        .from('donations')
        .update({ status: 'CLAIMED', claimed_at: new Date().toISOString() })
        .eq('id', donationId)
        .select()
        .single();
    res.json({
        success: true,
        message: 'Donation accepted by NGO. Delivery volunteer dispatched.',
        donation: updatedDonation
    });
});
// GET NGO inventory
ngosRouter.get('/inventory', (req, res) => {
    res.json({
        success: true,
        inventory: [
            { name: 'Mixed Veg Biryani', kg: 18, expires: '3h', temp: '65°C', status: 'Fresh' },
            { name: 'Dal & Roti', kg: 12, expires: '5h', temp: '60°C', status: 'Fresh' },
            { name: 'Paneer Curry', kg: 8, expires: '1.5h', temp: '58°C', status: 'Urgent' },
            { name: 'Assorted Breads', kg: 22, expires: '8h', temp: 'Room', status: 'Good' }
        ]
    });
});
