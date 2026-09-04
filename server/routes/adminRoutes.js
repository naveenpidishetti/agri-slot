import express from 'express';
import { db } from '../config/db.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate, authorizeRoles('ADMIN'));

// GET /api/admin/analytics
router.get('/analytics', (req, res) => {
  const analytics = db.getAnalytics();
  return res.json(analytics);
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  const users = db.users.map(({ password_hash, ...u }) => u);
  return res.json({ count: users.length, users });
});

// POST /api/admin/centers
router.post('/centers', (req, res) => {
  const { name, code, village, district, state, address, contact_phone, daily_capacity_quintals, max_daily_slots } = req.body;
  if (!name || !village || !district) {
    return res.status(400).json({ error: 'Name, village, and district are required.' });
  }

  const newCenter = {
    id: `ctr-${Date.now()}`,
    name,
    code: code || `CTR-${Math.floor(100 + Math.random() * 900)}`,
    village,
    district,
    state: state || 'Telangana',
    address: address || '',
    contact_phone: contact_phone || '+91 90000 00000',
    daily_capacity_quintals: Number(daily_capacity_quintals) || 1000,
    max_daily_slots: Number(max_daily_slots) || 50,
    current_booked_slots: 0,
    operating_start_time: '08:30',
    operating_end_time: '17:30',
    avg_unloading_time_mins: 15,
    is_active: true,
    distance_km: Math.floor(5 + Math.random() * 20),
    rating: 4.8
  };

  db.centers.push(newCenter);
  return res.status(201).json({ message: 'Center created successfully.', center: newCenter });
});

// POST /api/admin/crops
router.post('/crops', (req, res) => {
  const { name, code, category, msp_price_per_quintal, max_moisture_percent } = req.body;
  const newCrop = {
    id: `crop-${Date.now()}`,
    name,
    code: code || `CRP-${Math.floor(10 + Math.random() * 90)}`,
    category: category || 'Cereal',
    msp_price_per_quintal: Number(msp_price_per_quintal) || 2000,
    max_moisture_percent: Number(max_moisture_percent) || 14.0
  };
  db.crops.push(newCrop);
  return res.status(201).json({ message: 'Crop added successfully.', crop: newCrop });
});

export default router;
