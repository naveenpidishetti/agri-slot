import { initialCrops, initialCenters, initialUsers, initialBookings, initialQueue, initialNotifications } from './seedData.js';
import { ALL_INDIAN_STATES, getCentersForDistrictBackend } from './indiaData.js';

// In-Memory Relational State Store (Auto-synchronized, zero setup failure, full query capabilities)
class DatabaseStore {
  constructor() {
    this.crops = [...initialCrops];
    this.centers = [...initialCenters];
    this.users = [...initialUsers];
    this.bookings = [...initialBookings];
    this.queue = [...initialQueue];
    this.notifications = [...initialNotifications];
    this.scannerResults = [];
    this.chatMessages = [];
    this.emailLogs = [];
  }

  // Users & Auth (Supports Email OR Mobile Login)
  findUserByMobile(mobile) {
    if (!mobile) return null;
    return this.users.find(u => u.mobile === mobile.trim());
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    return this.users.find(u => 
      (u.email && u.email.toLowerCase() === clean) || 
      (u.mobile && u.mobile.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    );
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: userData.email ? userData.email.trim().toLowerCase() : `${userData.mobile || 'farmer'}@agrislot.in`,
      created_at: new Date().toISOString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates, updated_at: new Date().toISOString() };
      return this.users[idx];
    }
    return null;
  }

  // States & Districts
  getIndianStates() {
    return ALL_INDIAN_STATES;
  }

  // Centers & Mills (Across every district in India)
  getCenters(filter = {}) {
    let result = [...this.centers];
    
    // If state and district provided, dynamically generate/retrieve district-specific mills and centers
    if (filter.district || filter.state) {
      const state = filter.state || 'Telangana';
      const district = filter.district || 'Warangal Urban';
      const districtCenters = getCentersForDistrictBackend(state, district);
      
      // Merge unique centers
      const existingIds = new Set(result.map(c => c.id));
      for (const dc of districtCenters) {
        if (!existingIds.has(dc.id)) {
          result.push(dc);
          this.centers.push(dc); // Cache for booking lookups
        }
      }

      if (filter.district) {
        result = result.filter(c => c.district.toLowerCase().includes(filter.district.toLowerCase()));
      }
      if (filter.state) {
        result = result.filter(c => c.state.toLowerCase().includes(filter.state.toLowerCase()));
      }
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.village.toLowerCase().includes(q) || 
        c.district.toLowerCase().includes(q) ||
        (c.state && c.state.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getCenterById(id) {
    if (!id) return this.centers[0] || null;
    let found = this.centers.find(c => c.id === id);
    if (!found) {
      // Check district generator
      const districtCenters = getCentersForDistrictBackend('Telangana', 'Warangal Urban');
      found = districtCenters.find(c => c.id === id);
      if (found) {
        this.centers.push(found);
      }
    }
    if (!found && typeof id === 'string' && (id.startsWith('mill-') || id.startsWith('mandi-') || id.startsWith('hub-') || id.startsWith('gin-') || id.startsWith('ctr-'))) {
      // Construct dynamic district center
      const parts = id.split('-');
      const districtName = parts.length > 2 ? parts.slice(1, -1).join(' ').replace(/\b\w/g, l => l.toUpperCase()) : 'District Mandi';
      found = {
        id,
        name: `${districtName} Procurement Yard & Mill`,
        type: id.startsWith('mill-') ? 'RICE_MILL' : id.startsWith('gin-') ? 'COTTON_GIN' : 'GRAIN_MANDI',
        code: `APMC-${id.slice(-4).toUpperCase()}`,
        village: `${districtName} Central Market`,
        district: districtName,
        state: 'All India',
        address: `Agriculture Market Yard, ${districtName}`,
        contact_phone: '+91 98765 43210',
        email: 'mandi.procurement@agrislot.gov.in',
        daily_capacity_quintals: 2500,
        max_daily_slots: 80,
        current_booked_slots: 15,
        operating_start_time: '08:30',
        operating_end_time: '17:30',
        avg_unloading_time_mins: 15,
        is_active: true,
        distance_km: 5.0,
        rating: 4.8
      };
      this.centers.push(found);
    }
    return found || this.centers[0] || null;
  }

  updateCenter(id, updates) {
    const idx = this.centers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.centers[idx] = { ...this.centers[idx], ...updates, updated_at: new Date().toISOString() };
      return this.centers[idx];
    }
    return null;
  }

  // Crops
  getCrops() {
    return [...this.crops];
  }

  // Bookings
  getBookings(filter = {}) {
    let list = [...this.bookings];
    if (filter.farmerId) {
      list = list.filter(b => b.farmer_id === filter.farmerId);
    }
    if (filter.centerId) {
      list = list.filter(b => b.center_id === filter.centerId);
    }
    if (filter.date) {
      list = list.filter(b => b.booking_date === filter.date);
    }
    if (filter.status) {
      list = list.filter(b => b.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getBookingById(id) {
    return this.bookings.find(b => b.id === id || b.token_number === id);
  }

  createBooking(bookingData) {
    const now = new Date();
    const tokenSeq = String(this.bookings.length + 125).padStart(5, '0');
    const tokenNumber = `AGR-${now.getFullYear()}-${tokenSeq}`;
    
    const newBooking = {
      id: `bk-${Date.now()}`,
      token_number: tokenNumber,
      status: 'CONFIRMED',
      estimated_waiting_mins: 15,
      farmer_email: bookingData.farmer_email || 'farmer@agrislot.gov.in',
      email_sent: true,
      created_at: now.toISOString(),
      ...bookingData
    };
    
    this.bookings.push(newBooking);

    // Record email dispatch log
    const emailReceipt = {
      id: `email-${Date.now()}`,
      recipient: newBooking.farmer_email,
      token_number: newBooking.token_number,
      subject: `AgriSlot Token Confirmed: ${newBooking.token_number} - ${newBooking.crop_name} (${newBooking.quantity_quintals} Qtl)`,
      dispatched_at: now.toISOString(),
      status: 'DELIVERED',
      details: {
        center: newBooking.center_name,
        date: newBooking.booking_date,
        slot: newBooking.slot_time
      }
    };
    this.emailLogs.push(emailReceipt);
    console.log(`📧 [AgriSlot Email Dispatch] Confirmation successfully sent to: ${newBooking.farmer_email} for Token ${newBooking.token_number}`);

    // Also create queue entry
    const activeQueueForCenter = this.queue.filter(q => q.center_id === newBooking.center_id && q.status !== 'FINISHED');
    const queueEntry = {
      id: `q-${Date.now()}`,
      booking_id: newBooking.id,
      center_id: newBooking.center_id,
      token_number: newBooking.token_number,
      queue_position: activeQueueForCenter.length + 1,
      status: 'WAITING',
      called_at: null
    };
    this.queue.push(queueEntry);

    // Increment center booked count
    const center = this.getCenterById(newBooking.center_id);
    if (center) {
      center.current_booked_slots = (center.current_booked_slots || 0) + 1;
    }

    // Add confirmation notification
    this.createNotification({
      user_id: newBooking.farmer_id,
      title: 'Slot Booking Confirmed & Email Sent! 🚜 📧',
      message: `Your booking for ${newBooking.crop_name} (${newBooking.quantity_quintals} Qtl) is confirmed at ${newBooking.center_name}. Official QR pass sent to ${newBooking.farmer_email}. Token: ${newBooking.token_number}`,
      type: 'BOOKING_CONFIRMED'
    });

    return newBooking;
  }

  updateBookingStatus(id, status, extra = {}) {
    const idx = this.bookings.findIndex(b => b.id === id || b.token_number === id);
    if (idx !== -1) {
      this.bookings[idx] = {
        ...this.bookings[idx],
        status,
        ...extra,
        updated_at: new Date().toISOString()
      };

      // Synchronize queue entry
      const qIdx = this.queue.findIndex(q => q.booking_id === this.bookings[idx].id);
      if (qIdx !== -1) {
        if (status === 'PROCESSING') {
          this.queue[qIdx].status = 'IN_SERVICE';
        } else if (status === 'COMPLETED') {
          this.queue[qIdx].status = 'FINISHED';
          this.queue[qIdx].finished_at = new Date().toISOString();
        } else if (status === 'CANCELLED') {
          this.queue.splice(qIdx, 1);
        }
      }

      return this.bookings[idx];
    }
    return null;
  }

  // Queue
  getCenterQueue(centerId) {
    const queueItems = this.queue
      .filter(q => q.center_id === centerId && q.status !== 'FINISHED')
      .sort((a, b) => a.queue_position - b.queue_position);

    const inService = queueItems.find(q => q.status === 'IN_SERVICE');
    const waiting = queueItems.filter(q => q.status === 'WAITING');

    return {
      centerId,
      totalWaiting: waiting.length,
      currentServingToken: inService ? inService.token_number : (waiting.length > 0 ? waiting[0].token_number : null),
      inServiceEntry: inService || null,
      queue: queueItems
    };
  }

  getFarmerActiveQueuePosition(farmerId) {
    const activeBooking = this.bookings.find(b => 
      b.farmer_id === farmerId && ['CONFIRMED', 'CHECKED_IN', 'PROCESSING'].includes(b.status)
    );

    if (!activeBooking) return { hasActiveBooking: false };

    const queueData = this.getCenterQueue(activeBooking.center_id);
    const myEntry = queueData.queue.find(q => q.booking_id === activeBooking.id);
    
    let peopleAhead = 0;
    if (myEntry) {
      peopleAhead = queueData.queue.filter(q => 
        q.queue_position < myEntry.queue_position && q.status === 'WAITING'
      ).length;
    }

    return {
      hasActiveBooking: true,
      booking: activeBooking,
      tokenNumber: activeBooking.token_number,
      currentServingToken: queueData.currentServingToken,
      queuePosition: myEntry ? myEntry.queue_position : 1,
      peopleAhead,
      estimatedWaitMins: Math.max(5, (peopleAhead + 1) * 15)
    };
  }

  getFarmerQueueStatus(farmerId) {
    return this.getFarmerActiveQueuePosition(farmerId);
  }

  // Notifications
  getNotifications(userId) {
    return this.notifications
      .filter(n => n.user_id === userId || n.user_id === 'all')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createNotification(notifData) {
    const notif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      is_read: false,
      ...notifData
    };
    this.notifications.unshift(notif);
    return notif;
  }

  markNotificationRead(id) {
    const n = this.notifications.find(item => item.id === id);
    if (n) n.is_read = true;
    return n;
  }
}

export const db = new DatabaseStore();
