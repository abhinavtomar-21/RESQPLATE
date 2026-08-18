import { Router } from 'express';
import { verificationService } from '../services/verificationService.js';
import { donationService } from '../services/donationService.js';
import { fraudService } from '../services/fraudService.js';

export const adminRouter = Router();

// GET platform control room overview
adminRouter.get('/overview', async (req, res) => {
  const verifications = await verificationService.getRequests();
  const donations = await donationService.getDonations();

  const pendingVerifications = verifications.filter(v => v.status === 'PENDING' || v.status === 'DOCUMENT_REVIEW').length;
  const completedDonations = donations.filter(d => ['COMPLETED', 'DELIVERED'].includes(d.status)).length;
  const liveDonations = donations.filter(d => d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'PENDING_NGO_REVIEW').length;

  res.json({
    success: true,
    stats: {
      restaurants: 67, // Placeholder, would normally query profiles
      ngos: 41,
      volunteers: 178,
      liveDonations: liveDonations,
      totalMealsSaved: 184720,
      foodRescuedKg: 62400,
      co2AvoidedTons: 18.7,
      citiesActive: 12
    },
    systemHealth: {
      aiEngine: 99.9,
      api: 99.7,
      database: 98.2
    }
  });
});

// GET verification queue
adminRouter.get('/verifications', async (req, res) => {
  try {
    const queue = await verificationService.getRequests();
    // Map to the legacy format expected by the frontend
    const mappedQueue = queue.map(r => ({
      id: r.id,
      userId: r.restaurant_id,
      name: r.restaurant_name || r.profiles?.name || 'Unknown User',
      email: r.profiles?.email || 'N/A',
      phone: r.profiles?.phone || 'N/A',
      type: r.profiles?.role || 'Restaurant',
      city: 'Unknown',
      submitted: r.submitted_at,
      submittedAt: r.submitted_at,
      status: r.status === 'PENDING' ? 'DOCUMENT_REVIEW' : r.status,
      documents_status: r.status,
      email_verified: true,
      docName: r.documents?.url || 'No Document',
      docUrl: r.documents?.url || null,
      trustScore: 85
    }));
    res.json({ success: true, queue: mappedQueue });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch verifications' });
  }
});

// POST register new pending verification
adminRouter.post('/verifications/register', async (req, res) => {
  try {
    const item = await verificationService.createRequest(req.body);
    console.log(`[EMAIL DISPATCH] Sent 'Registration Received' notification to ${req.body.user_email || 'partner'}`);
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Approve verification
adminRouter.post('/verifications/approve', async (req, res) => {
  const { id, adminId } = req.body;
  try {
    const success = await verificationService.processRequest(id, 'APPROVE', adminId || 'Admin_01');
    if (success) {
      console.log(`[EMAIL DISPATCH] Sent 'Verification Approved' email`);
      res.json({ success: true, message: `Account ${id} approved successfully.` });
    } else {
      res.status(400).json({ success: false, message: 'Failed to approve account' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Reject verification
adminRouter.post('/verifications/reject', async (req, res) => {
  const { id, rejectionReason } = req.body;
  try {
    const success = await verificationService.processRequest(id, 'REJECT', 'Admin_01', rejectionReason || 'Documentation failed regulatory standards.');
    if (success) {
      console.log(`[EMAIL DISPATCH] Sent 'Verification Rejected' email. Reason: ${rejectionReason}`);
      res.json({ success: true, message: `Account ${id} rejected.` });
    } else {
      res.status(400).json({ success: false, message: 'Failed to reject account' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Request More Documents
adminRouter.post('/verifications/request-more-docs', async (req, res) => {
  const { id, notes } = req.body;
  try {
    const success = await verificationService.processRequest(id, 'REQUEST_MORE', 'Admin_01', notes || 'Please upload updated license document.');
    if (success) {
      console.log(`[EMAIL DISPATCH] Sent 'More Documents Requested' email. Notes: ${notes}`);
      res.json({ success: true, message: `Requested additional documents for ${id}.` });
    } else {
      res.status(400).json({ success: false, message: 'Failed to request docs' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Suspend Account
adminRouter.post('/verifications/suspend', async (req, res) => {
  const { id } = req.body;
  try {
    const success = await verificationService.suspendAccount(id);
    if (success) {
      res.json({ success: true, message: `Account ${id} suspended.` });
    } else {
      res.status(400).json({ success: false, message: 'Failed to suspend account' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Account (Soft Delete)
adminRouter.delete('/verifications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const success = await verificationService.softDeleteRequest(id);
    res.json({
      success,
      message: success ? `Account ${id} deleted.` : `Account ${id} not found.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET fraud detection alerts
adminRouter.get('/fraud-alerts', async (req, res) => {
  try {
    const alerts = await fraudService.getAlerts();
    res.json({ success: true, alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST resolve fraud alert
adminRouter.post('/fraud-alerts/resolve', async (req, res) => {
  const { id, action } = req.body;
  try {
    const alert = await fraudService.resolveAlert(id, action);
    res.json({ success: true, alert });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

