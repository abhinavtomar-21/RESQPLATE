import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { requireActiveAccount } from '../middlewares/statusMiddleware.js';

export const usersRouter = Router();

usersRouter.get('/:id', requireAuth, requireActiveAccount, authorize({ role: ['Administrator'] }), (req, res) => {
  res.json({ success: true, message: 'Fetched profile for ' + req.params.id });
});

usersRouter.patch('/profile', requireAuth, requireActiveAccount, (req, res) => {
  res.json({ success: true, message: 'Profile updated successfully' });
});

usersRouter.patch('/:id/status', requireAuth, authorize({ role: ['Administrator'] }), (req, res) => {
  const { status } = req.body;
  res.json({ success: true, message: 'User ' + req.params.id + ' status changed to ' + status });
});

usersRouter.delete('/:id', requireAuth, authorize({ role: ['Administrator'] }), (req, res) => {
  res.json({ success: true, message: 'User ' + req.params.id + ' soft deleted' });
});
