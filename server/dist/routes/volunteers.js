import { Router } from 'express';
export const volunteersRouter = Router();
// GET pickup requests for volunteers
volunteersRouter.get('/requests', (req, res) => {
    res.json({
        success: true,
        requests: [
            { id: 'R-891', donor: 'The Grand Spice', food: 'Biryani (18 kg)', pickup: '2.3 km', deadline: '45 min', priority: 'High', score: 87 },
            { id: 'R-890', donor: 'Baker Street Co.', food: 'Pastries (8 kg)', pickup: '1.1 km', deadline: '2 hrs', priority: 'Normal', score: 79 },
            { id: 'R-889', donor: 'Metro Hotel', food: 'Mixed Veg (25 kg)', pickup: '3.8 km', deadline: '1 hr', priority: 'Urgent', score: 91 }
        ]
    });
});
// POST accept pickup request
volunteersRouter.post('/accept', (req, res) => {
    const { requestId } = req.body;
    res.json({
        success: true,
        message: `Pickup request ${requestId} accepted. Routing map generated.`,
        assignment: {
            id: requestId,
            donor: 'The Grand Spice',
            deliverTo: 'Asha Foundation',
            distance: '2.3 km',
            eta: '~18 min',
            deadline: '45 min remaining',
            qrCode: 'D-4822-PKP'
        }
    });
});
// GET volunteer leaderboard
volunteersRouter.get('/leaderboard', (req, res) => {
    res.json({
        success: true,
        city: 'Mumbai',
        leaderboard: [
            { rank: '🥇', name: 'Priya Mehta', trips: 234, meals: 8420 },
            { rank: '🥈', name: 'Rohan Kumar', trips: 189, meals: 6840, you: true },
            { rank: '🥉', name: 'Amit Shah', trips: 156, meals: 5620 },
            { rank: '4️⃣', name: 'Sneha Joshi', trips: 134, meals: 4800 }
        ]
    });
});
