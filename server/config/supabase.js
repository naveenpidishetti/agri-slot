import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://agrislot-procurement.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_D-3I6QeDhVECNvr_2K1vHg_F2RZbCzB';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Syncs a booking record into Supabase database table
 */
export async function syncBookingToSupabase(booking) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .upsert({
        id: booking.id,
        token_number: booking.token_number,
        farmer_id: booking.farmer_id,
        farmer_name: booking.farmer_name,
        farmer_mobile: booking.farmer_mobile,
        farmer_email: booking.farmer_email,
        center_id: booking.center_id,
        center_name: booking.center_name,
        crop_id: booking.crop_id,
        crop_name: booking.crop_name,
        quantity_quintals: booking.quantity_quintals,
        booking_date: booking.booking_date,
        slot_time: booking.slot_time,
        status: booking.status || 'CONFIRMED',
        created_at: booking.created_at || new Date().toISOString()
      });

    if (error) {
      console.warn('⚠️ [Supabase Database Sync Note]:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ [Supabase Database] Successfully synced booking ${booking.token_number}`);
    return { success: true, data };
  } catch (err) {
    console.warn('⚠️ [Supabase Database Exception]:', err.message);
    return { success: false, error: err.message };
  }
}
