import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://agrislot-procurement.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_D-3I6QeDhVECNvr_2K1vHg_F2RZbCzB';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function syncBookingToSupabase(booking: any) {
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
      console.warn('⚠️ [Supabase Sync Note]:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn('⚠️ [Supabase Exception]:', err.message);
    return { success: false, error: err.message };
  }
}
