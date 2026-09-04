import bcrypt from 'bcryptjs';

const passwordHash = bcrypt.hashSync('farmer123', 10);
const staffHash = bcrypt.hashSync('staff123', 10);
const adminHash = bcrypt.hashSync('admin123', 10);

export const initialCrops = [
  { id: 'crop-paddy', name: 'Paddy (Dhan / Rice)', code: 'PAD-01', category: 'Cereal', msp_price_per_quintal: 2300, max_moisture_percent: 14.0 },
  { id: 'crop-wheat', name: 'Wheat (Gehun)', code: 'WHT-02', category: 'Cereal', msp_price_per_quintal: 2275, max_moisture_percent: 12.0 },
  { id: 'crop-cotton', name: 'Cotton (Kapas)', code: 'COT-04', category: 'Fiber', msp_price_per_quintal: 7020, max_moisture_percent: 8.0 },
  { id: 'crop-maize', name: 'Maize (Makka)', code: 'MAZ-03', category: 'Coarse Cereal', msp_price_per_quintal: 2090, max_moisture_percent: 14.0 },
  { id: 'crop-soybean', name: 'Soybean', code: 'SOY-05', category: 'Oilseed', msp_price_per_quintal: 4892, max_moisture_percent: 10.0 },
  { id: 'crop-gram', name: 'Bengal Gram (Chana / Chickpea)', code: 'GRM-06', category: 'Pulses', msp_price_per_quintal: 5440, max_moisture_percent: 10.0 },
  { id: 'crop-turmeric', name: 'Turmeric (Haldi)', code: 'TUR-07', category: 'Spices', msp_price_per_quintal: 13500, max_moisture_percent: 10.0 },
  { id: 'crop-chilli', name: 'Chilli (Red Mirchi)', code: 'CHL-08', category: 'Spices', msp_price_per_quintal: 18200, max_moisture_percent: 10.0 },
  { id: 'crop-groundnut', name: 'Groundnut (Mungfali)', code: 'GND-09', category: 'Oilseed', msp_price_per_quintal: 6783, max_moisture_percent: 8.0 },
  { id: 'crop-mustard', name: 'Mustard / Rapeseed (Sarson)', code: 'MST-10', category: 'Oilseed', msp_price_per_quintal: 5650, max_moisture_percent: 8.0 },
  { id: 'crop-redgram', name: 'Red Gram (Tur / Arhar Dal)', code: 'RDG-11', category: 'Pulses', msp_price_per_quintal: 7550, max_moisture_percent: 10.0 },
  { id: 'crop-greengram', name: 'Green Gram (Moong Dal)', code: 'MNG-12', category: 'Pulses', msp_price_per_quintal: 8682, max_moisture_percent: 10.0 },
  { id: 'crop-blackgram', name: 'Black Gram (Urad Dal)', code: 'URD-13', category: 'Pulses', msp_price_per_quintal: 7400, max_moisture_percent: 10.0 },
  { id: 'crop-jowar', name: 'Jowar (Sorghum Millet)', code: 'JOW-14', category: 'Nutri Cereal', msp_price_per_quintal: 3180, max_moisture_percent: 12.0 },
  { id: 'crop-bajra', name: 'Bajra (Pearl Millet)', code: 'BAJ-15', category: 'Nutri Cereal', msp_price_per_quintal: 2625, max_moisture_percent: 12.0 },
  { id: 'crop-sugarcane', name: 'Sugarcane (Ganna)', code: 'SGC-16', category: 'Commercial', msp_price_per_quintal: 340, max_moisture_percent: 18.0 },
  { id: 'crop-sunflower', name: 'Sunflower Seed (Surajmukhi)', code: 'SNF-17', category: 'Oilseed', msp_price_per_quintal: 6760, max_moisture_percent: 9.0 },
  { id: 'crop-sesame', name: 'Sesame Seed (Til)', code: 'SES-18', category: 'Oilseed', msp_price_per_quintal: 9267, max_moisture_percent: 8.0 },
  { id: 'crop-onion', name: 'Onion (Pyaz)', code: 'ONN-19', category: 'Horticulture', msp_price_per_quintal: 2450, max_moisture_percent: 14.0 },
  { id: 'crop-tomato', name: 'Tomato (Tamatar)', code: 'TMT-20', category: 'Horticulture', msp_price_per_quintal: 1850, max_moisture_percent: 14.0 },
  { id: 'crop-potato', name: 'Potato (Aloo)', code: 'POT-21', category: 'Horticulture', msp_price_per_quintal: 1650, max_moisture_percent: 14.0 }
];

export const initialCenters = [
  {
    id: 'ctr-01',
    name: 'Rythu Seva Procurement Center',
    code: 'RSP-HYD-01',
    village: 'Shamshabad',
    district: 'Ranga Reddy',
    state: 'Telangana',
    address: 'Near Agriculture Market Yard, Main Road, Shamshabad',
    contact_phone: '+91 98765 43210',
    daily_capacity_quintals: 1500,
    max_daily_slots: 60,
    current_booked_slots: 38,
    operating_start_time: '08:30',
    operating_end_time: '17:30',
    avg_unloading_time_mins: 15,
    is_active: true,
    distance_km: 4.2,
    rating: 4.8
  },
  {
    id: 'ctr-02',
    name: 'Lakshmi Agricultural Procurement Center',
    code: 'LAK-MED-02',
    village: 'Medchal',
    district: 'Medchal-Malkajgiri',
    state: 'Telangana',
    address: 'Mandi Gate No. 3, Industrial Area Road, Medchal',
    contact_phone: '+91 98480 12345',
    daily_capacity_quintals: 1200,
    max_daily_slots: 50,
    current_booked_slots: 22,
    operating_start_time: '09:00',
    operating_end_time: '17:00',
    avg_unloading_time_mins: 20,
    is_active: true,
    distance_km: 11.5,
    rating: 4.6
  },
  {
    id: 'ctr-03',
    name: 'Green Harvest Center',
    code: 'GHC-SAN-03',
    village: 'Sangareddy',
    district: 'Sangareddy',
    state: 'Telangana',
    address: 'APMC Complex, Bypass Junction, Sangareddy',
    contact_phone: '+91 99887 76655',
    daily_capacity_quintals: 2000,
    max_daily_slots: 80,
    current_booked_slots: 65,
    operating_start_time: '08:00',
    operating_end_time: '18:00',
    avg_unloading_time_mins: 18,
    is_active: true,
    distance_km: 18.0,
    rating: 4.9
  },
  {
    id: 'ctr-04',
    name: 'Krishna Agro Procurement Center',
    code: 'KAP-NLG-04',
    village: 'Choutuppal',
    district: 'Yadadri Bhuvanagiri',
    state: 'Telangana',
    address: 'National Highway 65, Market Yard, Choutuppal',
    contact_phone: '+91 94400 99881',
    daily_capacity_quintals: 1000,
    max_daily_slots: 40,
    current_booked_slots: 15,
    operating_start_time: '09:00',
    operating_end_time: '16:30',
    avg_unloading_time_mins: 25,
    is_active: true,
    distance_km: 24.3,
    rating: 4.5
  },
  {
    id: 'ctr-05',
    name: 'Sri Sai Rice Procurement Center',
    code: 'SSR-NZB-05',
    village: 'Armoor',
    district: 'Nizamabad',
    state: 'Telangana',
    address: 'Rice Millers Cluster, Armoor Road',
    contact_phone: '+91 91234 56789',
    daily_capacity_quintals: 1800,
    max_daily_slots: 70,
    current_booked_slots: 44,
    operating_start_time: '08:30',
    operating_end_time: '17:30',
    avg_unloading_time_mins: 15,
    is_active: true,
    distance_km: 32.0,
    rating: 4.7
  }
];

export const initialUsers = [
  {
    id: 'usr-farmer-vasanth',
    name: 'Vasanth Reddy',
    email: 'vasanthreddy302@gmail.com',
    mobile: '9876543210',
    password_hash: passwordHash,
    role: 'FARMER',
    language: 'te',
    village: 'Warangal',
    district: 'Warangal Urban',
    state: 'Telangana',
    farmer_id: 'TS-WU-2026-9901',
    land_area_acres: 6.5,
    upi_id: 'vasanthreddy@okaxis',
    bank_account: 'SBIN0001428 - 98213847291',
    primary_crops: ['Paddy', 'Cotton', 'Chilli']
  },
  {
    id: 'usr-farmer-01',
    name: 'Ramesh Reddy',
    email: 'ramesh.farmer@gmail.com',
    mobile: '9876543210',
    password_hash: passwordHash,
    role: 'FARMER',
    language: 'te',
    village: 'Shamshabad',
    district: 'Ranga Reddy',
    state: 'Telangana',
    farmer_id: 'TS-RR-2024-8841',
    land_area_acres: 6.5,
    upi_id: 'ramesh@okaxis',
    bank_account: 'SBIN0001428 - 98213847291',
    primary_crops: ['Paddy', 'Cotton']
  },
  {
    id: 'usr-farmer-02',
    name: 'Suresh Kumar Patel',
    email: 'suresh.patel@gmail.com',
    mobile: '9876543211',
    password_hash: passwordHash,
    role: 'FARMER',
    language: 'hi',
    village: 'Medchal',
    district: 'Medchal-Malkajgiri',
    state: 'Telangana',
    farmer_id: 'TS-MM-2024-1290',
    land_area_acres: 4.0,
    upi_id: 'suresh@okaxis',
    bank_account: 'HDFC0002134 - 84729104829',
    primary_crops: ['Soybean', 'Wheat']
  },
  {
    id: 'usr-staff-01',
    name: 'K. Venkateshwarlu (Officer)',
    email: 'staff@agrislot.gov.in',
    mobile: '9876543220',
    password_hash: staffHash,
    role: 'STAFF',
    language: 'te',
    center_id: 'ctr-01',
    designation: 'Senior Procurement Officer',
    badge_number: 'RSP-STAFF-104'
  },
  {
    id: 'usr-admin-01',
    name: 'Dr. Ananya Sharma (Admin)',
    email: 'admin@agrislot.gov.in',
    mobile: '9876543230',
    password_hash: adminHash,
    role: 'ADMIN',
    language: 'en'
  }
];

export const initialBookings = [
  {
    id: 'bk-001',
    token_number: 'AGR-2026-00124',
    farmer_id: 'usr-farmer-01',
    farmer_name: 'Ramesh Reddy',
    farmer_mobile: '9876543210',
    center_id: 'ctr-01',
    center_name: 'Rythu Seva Procurement Center',
    crop_id: 'crop-paddy',
    crop_name: 'Paddy (Dhan)',
    quantity_quintals: 45.0,
    booking_date: new Date().toISOString().split('T')[0],
    slot_time: '10:30 AM – 11:00 AM',
    status: 'CONFIRMED',
    estimated_waiting_mins: 15,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'bk-002',
    token_number: 'AGR-2026-00118',
    farmer_id: 'usr-farmer-02',
    farmer_name: 'Suresh Kumar Patel',
    farmer_mobile: '9876543211',
    center_id: 'ctr-01',
    center_name: 'Rythu Seva Procurement Center',
    crop_id: 'crop-wheat',
    crop_name: 'Wheat (Gehun)',
    quantity_quintals: 30.0,
    booking_date: new Date().toISOString().split('T')[0],
    slot_time: '09:30 AM – 10:00 AM',
    status: 'PROCESSING',
    estimated_waiting_mins: 5,
    checked_in_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'bk-003',
    token_number: 'AGR-2026-00115',
    farmer_id: 'usr-farmer-03',
    farmer_name: 'Venkat Rao',
    farmer_mobile: '9876543213',
    center_id: 'ctr-01',
    center_name: 'Rythu Seva Procurement Center',
    crop_id: 'crop-paddy',
    crop_name: 'Paddy (Dhan)',
    quantity_quintals: 60.0,
    booking_date: new Date().toISOString().split('T')[0],
    slot_time: '09:00 AM – 09:30 AM',
    status: 'COMPLETED',
    estimated_waiting_mins: 0,
    checked_in_at: new Date(Date.now() - 5400000).toISOString(),
    completed_at: new Date(Date.now() - 1200000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'bk-004',
    token_number: 'AGR-2026-00122',
    farmer_id: 'usr-farmer-04',
    farmer_name: 'Mallesh Goud',
    farmer_mobile: '9876543214',
    center_id: 'ctr-01',
    center_name: 'Rythu Seva Procurement Center',
    crop_id: 'crop-cotton',
    crop_name: 'Cotton (Kapas)',
    quantity_quintals: 25.0,
    booking_date: new Date().toISOString().split('T')[0],
    slot_time: '10:00 AM – 10:30 AM',
    status: 'CHECKED_IN',
    estimated_waiting_mins: 10,
    checked_in_at: new Date(Date.now() - 900000).toISOString(),
    created_at: new Date(Date.now() - 10000000).toISOString()
  }
];

export const initialQueue = [
  {
    id: 'q-01',
    booking_id: 'bk-002',
    center_id: 'ctr-01',
    token_number: 'AGR-2026-00118',
    queue_position: 1,
    status: 'IN_SERVICE',
    called_at: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 'q-02',
    booking_id: 'bk-004',
    center_id: 'ctr-01',
    token_number: 'AGR-2026-00122',
    queue_position: 2,
    status: 'WAITING',
    called_at: null
  },
  {
    id: 'q-03',
    booking_id: 'bk-001',
    center_id: 'ctr-01',
    token_number: 'AGR-2026-00124',
    queue_position: 3,
    status: 'WAITING',
    called_at: null
  }
];

export const initialNotifications = [
  {
    id: 'notif-01',
    user_id: 'usr-farmer-01',
    title: 'Booking Confirmed!',
    message: 'Your slot at Rythu Seva Center is confirmed for today at 10:30 AM. Token: AGR-2026-00124.',
    type: 'BOOKING_CONFIRMED',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-02',
    user_id: 'usr-farmer-01',
    title: 'Queue Reminder',
    message: 'Current serving token is AGR-2026-00118. You have 2 farmers ahead of you. Please arrive 15 mins before your slot.',
    type: 'QUEUE_UPDATE',
    is_read: false,
    created_at: new Date(Date.now() - 600000).toISOString()
  }
];
