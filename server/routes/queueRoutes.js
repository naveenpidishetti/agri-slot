import express from 'express';
import { db } from '../config/db.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/queue/farmer-status (Live queue status for logged-in farmer)
router.get('/farmer-status', authenticate, (req, res) => {
  const status = db.getFarmerQueueStatus(req.user.id);
  if (!status) {
    return res.json({ hasActiveBooking: false });
  }
  return res.json(status);
});

// GET /api/queue/center/:centerId (Queue details for a center)
router.get('/center/:centerId', (req, res) => {
  const queueData = db.getCenterQueue(req.params.centerId);
  return res.json(queueData);
});

// POST /api/queue/checkin (Staff checks in farmer by token or ID)
router.post('/checkin', authenticate, authorizeRoles('STAFF', 'ADMIN'), (req, res) => {
  const { tokenNumber } = req.body;
  if (!tokenNumber) return res.status(400).json({ error: 'Token number is required for check-in.' });

  const booking = db.getBookingById(tokenNumber.trim());
  if (!booking) return res.status(404).json({ error: `No booking found for token: ${tokenNumber}` });

  if (booking.status === 'COMPLETED') {
    return res.status(400).json({ error: 'This token has already completed procurement.' });
  }

  const updated = db.updateBookingStatus(booking.id, 'CHECKED_IN', {
    checked_in_at: new Date().toISOString()
  });

  // Notify farmer
  db.createNotification({
    user_id: booking.farmer_id,
    title: 'Checked-In at Center! 📍',
    message: `You have been checked in at ${booking.center_name}. Please stay near unloading bay 2.`,
    type: 'QUEUE_UPDATE'
  });

  return res.json({ message: 'Farmer checked in successfully!', booking: updated });
});

// POST /api/queue/start-processing (Staff starts unloading/weighing)
router.post('/start-processing', authenticate, authorizeRoles('STAFF', 'ADMIN'), (req, res) => {
  const { tokenNumber } = req.body;
  const booking = db.getBookingById(tokenNumber);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  const updated = db.updateBookingStatus(booking.id, 'PROCESSING');

  db.createNotification({
    user_id: booking.farmer_id,
    title: 'Procurement Processing Started! ⚖️',
    message: `Your produce is currently at the weighbridge/unloading bay for quality check.`,
    type: 'QUEUE_UPDATE'
  });

  return res.json({ message: 'Procurement processing started.', booking: updated });
});

// POST /api/queue/complete (Staff marks procurement as complete)
router.post('/complete', authenticate, authorizeRoles('STAFF', 'ADMIN'), (req, res) => {
  const { tokenNumber, verifiedQuantity, moistureLevel } = req.body;
  const booking = db.getBookingById(tokenNumber);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  const updated = db.updateBookingStatus(booking.id, 'COMPLETED', {
    completed_at: new Date().toISOString(),
    verified_quantity: verifiedQuantity || booking.quantity_quintals,
    moisture_level: moistureLevel || '13.2%'
  });

  db.createNotification({
    user_id: booking.farmer_id,
    title: 'Procurement Completed! 🎉',
    message: `Your produce procurement (${booking.crop_name} - ${booking.quantity_quintals} Qtl) is complete. Receipt generated. Payment will be credited directly to your bank account.`,
    type: 'BOOKING_CONFIRMED'
  });

  return res.json({ message: 'Procurement completed successfully!', booking: updated });
});

export default router;
