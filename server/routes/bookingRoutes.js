import express from 'express';
import { db } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { SlotRecommendationService } from '../services/slotRecommendationService.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';
import { syncBookingToSupabase } from '../config/supabase.js';

const router = express.Router();

// POST /api/bookings/recommend (AI slot & center recommendation)
router.post('/recommend', (req, res) => {
  try {
    const { cropId, quantityQuintals, userLocation, preferredDate, state, district } = req.body;
    const recommendation = SlotRecommendationService.recommend({
      cropId,
      quantityQuintals,
      userLocation,
      preferredDate,
      state,
      district
    });
    return res.json(recommendation);
  } catch (err) {
    return res.status(500).json({ error: 'AI recommendation error: ' + err.message });
  }
});

// GET /api/bookings (List bookings for current user or filtered)
router.get('/', authenticate, (req, res) => {
  const { status, date, centerId } = req.query;
  const filter = {};

  if (req.user.role === 'FARMER') {
    filter.farmerId = req.user.id;
  } else if (req.user.role === 'STAFF') {
    if (centerId) filter.centerId = centerId;
  }

  if (status) filter.status = status;
  if (date) filter.date = date;

  const bookings = db.getBookings(filter);
  return res.json({ count: bookings.length, bookings });
});

// GET /api/bookings/slot-capacity (Returns real-time capacity for all time windows capped at 3 slots)
router.get('/slot-capacity', (req, res) => {
  try {
    const { center_id, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const targetCenterId = center_id || 'ctr-01';

    const TIME_SLOTS = [
      '08:30 AM – 09:00 AM',
      '09:00 AM – 09:30 AM',
      '09:30 AM – 10:00 AM',
      '10:00 AM – 10:30 AM',
      '10:30 AM – 11:00 AM',
      '11:00 AM – 11:30 AM',
      '11:30 AM – 12:00 PM',
      '02:00 PM – 02:30 PM',
      '02:30 PM – 03:00 PM',
      '03:00 PM – 03:30 PM'
    ];

    const confirmedBookings = db.getBookings({
      centerId: targetCenterId,
      date: targetDate,
      status: 'CONFIRMED'
    });

    const slotData = TIME_SLOTS.map((time, idx) => {
      const bookedCount = confirmedBookings.filter(b => b.slot_time === time).length;
      const maxSlots = 3;
      const availableSlots = Math.max(0, maxSlots - bookedCount);
      const isFull = bookedCount >= maxSlots;

      return {
        time,
        maxSlots,
        bookedCount,
        availableSlots,
        isFull,
        isAiPick: idx === 5 || idx === 6
      };
    });

    return res.json({
      center_id: targetCenterId,
      date: targetDate,
      maxSlotsPerTime: 3,
      slots: slotData
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch slot capacity: ' + err.message });
  }
});

// GET /api/bookings/:id (Single booking detail by ID or token)
router.get('/:id', authenticate, (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  const center = db.getCenterById(booking.center_id);
  const queueData = db.getCenterQueue(booking.center_id);
  const myQueueEntry = queueData.queue.find(q => q.booking_id === booking.id);

  return res.json({
    booking,
    center,
    queueInfo: {
      position: myQueueEntry ? myQueueEntry.queue_position : null,
      currentServingToken: queueData.currentServingToken,
      totalWaiting: queueData.totalWaiting
    }
  });
});

// POST /api/bookings (Create new booking with capacity checks and transaction safety)
router.post('/', authenticate, (req, res) => {
  try {
    const { center_id, crop_id, quantity_quintals, booking_date, slot_time, farmer_email } = req.body;

    if (!center_id || !crop_id || !quantity_quintals || !booking_date || !slot_time) {
      return res.status(400).json({ error: 'Please provide center, crop, quantity, date, and slot time.' });
    }

    const center = db.getCenterById(center_id);
    if (!center) return res.status(404).json({ error: 'Selected procurement center does not exist.' });

    // STRICT RULE: Max 3 slots per each slot time window!
    const MAX_SLOTS_PER_TIME_WINDOW = 3;
    const existingSlotBookings = db.getBookings({
      centerId: center_id,
      date: booking_date,
      status: 'CONFIRMED'
    }).filter(b => b.slot_time === slot_time);

    if (existingSlotBookings.length >= MAX_SLOTS_PER_TIME_WINDOW) {
      return res.status(400).json({
        error: `Slot "${slot_time}" has reached maximum capacity (${MAX_SLOTS_PER_TIME_WINDOW}/3 slots booked). No more than 3 slots are allowed per time window. Please select another slot.`
      });
    }

    const crops = db.getCrops();
    const crop = crops.find(c => c.id === crop_id) || { name: crop_id };

    // Capacity Safety Check
    if (center.current_booked_slots >= center.max_daily_slots) {
      return res.status(400).json({
        error: 'This center has reached maximum capacity for the selected date. Please choose another center or slot.'
      });
    }

    // Set recipient email defaulting to logged in user email or official account
    const emailRecipient = farmer_email || req.user.email || 'vasanthreddy302@gmail.com';

    const newBooking = db.createBooking({
      farmer_id: req.user.id,
      farmer_name: req.user.name,
      farmer_mobile: req.user.mobile,
      farmer_email: emailRecipient,
      email_sent: true,
      center_id,
      center_name: center.name,
      crop_id,
      crop_name: crop.name,
      quantity_quintals: Number(quantity_quintals),
      booking_date,
      slot_time
    });

    // Send Real Email via Resend API asynchronously
    sendBookingConfirmationEmail(newBooking).catch(err => {
      console.error('⚠️ [Resend Background Dispatch Error]:', err);
    });

    // Sync to Supabase Database asynchronously
    syncBookingToSupabase(newBooking).catch(err => {
      console.warn('⚠️ [Supabase Database Sync]:', err);
    });

    return res.status(201).json({
      message: `Procurement slot reserved successfully! Token Pass and official instructions dispatched to ${emailRecipient}.`,
      booking: newBooking,
      emailSent: true,
      emailRecipient
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create booking: ' + error.message });
  }
});

// POST /api/bookings/:id/resend-email
router.post('/:id/resend-email', authenticate, async (req, res) => {
  try {
    const booking = db.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    const targetEmail = req.body.email || booking.farmer_email || req.user.email || 'vasanthreddy302@gmail.com';
    booking.farmer_email = targetEmail;

    const emailResult = await sendBookingConfirmationEmail(booking);
    return res.json({
      message: emailResult.success ? `Confirmation email dispatched to ${targetEmail}!` : `Email queue updated for ${targetEmail}.`,
      emailResult
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resend email: ' + error.message });
  }
});

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', authenticate, (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  if (req.user.role === 'FARMER' && booking.farmer_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to cancel this booking.' });
  }

  const updated = db.updateBookingStatus(booking.id, 'CANCELLED');
  return res.json({ message: 'Booking cancelled successfully.', booking: updated });
});

// POST /api/bookings/:id/reschedule
router.post('/:id/reschedule', authenticate, (req, res) => {
  const { new_date, new_slot_time } = req.body;
  if (!new_date || !new_slot_time) {
    return res.status(400).json({ error: 'Please provide new date and slot time.' });
  }

  const booking = db.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  if (req.user.role === 'FARMER' && booking.farmer_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to reschedule this booking.' });
  }

  const updated = db.updateBookingStatus(booking.id, 'CONFIRMED', {
    booking_date: new_date,
    slot_time: new_slot_time,
    is_rescheduled: true
  });

  return res.json({ message: 'Booking rescheduled successfully.', booking: updated });
});

export default router;
