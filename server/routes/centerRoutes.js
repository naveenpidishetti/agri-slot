import express from 'express';
import { db } from '../config/db.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/centers/states-districts (All 28 States & Districts in India)
router.get('/states-districts', (req, res) => {
  const states = db.getIndianStates();
  return res.json({ states });
});

// GET /api/centers (List centers & mills with optional filters)
router.get('/', (req, res) => {
  const { state, district, search } = req.query;
  const centers = db.getCenters({ state, district, search });
  return res.json({ count: centers.length, centers });
});

// GET /api/centers/crops (List supported crops)
router.get('/crops/all', (req, res) => {
  const crops = db.getCrops();
  return res.json({ crops });
});

// GET /api/centers/:id (Center details)
router.get('/:id', (req, res) => {
  const center = db.getCenterById(req.params.id);
  if (!center) return res.status(404).json({ error: 'Procurement center or mill not found.' });

  const queue = db.getCenterQueue(center.id);
  const remainingSlots = Math.max(0, (center.max_daily_slots || 80) - (center.current_booked_slots || 0));

  return res.json({
    center,
    queueSummary: {
      totalWaiting: queue.totalWaiting,
      currentServingToken: queue.currentServingToken
    },
    capacityStatus: {
      totalSlots: center.max_daily_slots || 80,
      bookedSlots: center.current_booked_slots || 0,
      remainingSlots,
      percentageBooked: Math.round(((center.current_booked_slots || 0) / (center.max_daily_slots || 80)) * 100),
      statusLabel: remainingSlots > 15 ? 'Available' : remainingSlots > 0 ? 'Filling Fast' : 'Fully Booked'
    }
  });
});

// PUT /api/centers/:id/capacity (Staff/Admin updates center capacity & working hours)
router.put('/:id/capacity', authenticate, authorizeRoles('STAFF', 'ADMIN'), (req, res) => {
  const { max_daily_slots, daily_capacity_quintals, operating_start_time, operating_end_time, avg_unloading_time_mins, is_active } = req.body;
  
  const updated = db.updateCenter(req.params.id, {
    ...(max_daily_slots !== undefined && { max_daily_slots: Number(max_daily_slots) }),
    ...(daily_capacity_quintals !== undefined && { daily_capacity_quintals: Number(daily_capacity_quintals) }),
    ...(operating_start_time && { operating_start_time }),
    ...(operating_end_time && { operating_end_time }),
    ...(avg_unloading_time_mins !== undefined && { avg_unloading_time_mins: Number(avg_unloading_time_mins) }),
    ...(is_active !== undefined && { is_active: Boolean(is_active) })
  });

  if (!updated) return res.status(404).json({ error: 'Center not found.' });
  return res.json({ message: 'Center capacity updated successfully.', center: updated });
});

export default router;
