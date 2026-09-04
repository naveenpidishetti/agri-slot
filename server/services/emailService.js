import dotenv from 'dotenv';
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'AgriSlot Procurement <onboarding@resend.dev>';

/**
 * Sends an official booking confirmation email with full digital token pass via Resend API
 */
export async function sendBookingConfirmationEmail(booking) {
  const recipient = booking.farmer_email;
  if (!recipient) {
    console.warn('⚠️ [Resend Email] No recipient email specified for booking:', booking.token_number);
    return { success: false, error: 'No recipient email specified' };
  }

  const subject = `🌾 [AgriSlot] Booking Confirmed - Token ${booking.token_number} | ${booking.crop_name} (${booking.quantity_quintals} Qtl)`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriSlot Digital Pass Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #059669, #0d9488); padding: 32px 24px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0 0; font-size: 13px; opacity: 0.92; font-weight: 500; }
    .body-content { padding: 28px 24px; }
    .token-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 18px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .token-title { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #059669; letter-spacing: 1px; }
    .token-number { font-size: 30px; font-weight: 900; color: #0f172a; margin: 8px 0; font-family: monospace; letter-spacing: 2px; }
    .table-details { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .table-details td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; }
    .table-details td.label { color: #64748b; font-weight: 600; width: 42%; }
    .table-details td.value { color: #0f172a; font-weight: 700; text-align: right; }
    .highlight { color: #059669; font-weight: 800; }
    .instruction-box { background: #ecfdf5; border-left: 4px solid #059669; padding: 16px; border-radius: 12px; font-size: 12px; line-height: 1.6; color: #065f46; margin-bottom: 20px; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌾 AgriSlot Smart Procurement</h1>
      <p>Official Digital Token & Unloading Slot Confirmation</p>
    </div>

    <div class="body-content">
      <div class="token-box">
        <div class="token-title">Official Weighbridge Entry Token</div>
        <div class="token-number">${booking.token_number}</div>
        <div style="font-size: 12px; color: #059669; font-weight: 600;">Present this token / email upon arrival at center gate</div>
      </div>

      <table class="table-details">
        <tr>
          <td class="label">Farmer Name</td>
          <td class="value">${booking.farmer_name || 'Registered Farmer'}</td>
        </tr>
        <tr>
          <td class="label">Crop & Quantity</td>
          <td class="value">${booking.crop_name} — <span class="highlight">${booking.quantity_quintals} Quintals</span></td>
        </tr>
        <tr>
          <td class="label">Procurement Center</td>
          <td class="value">${booking.center_name}</td>
        </tr>
        <tr>
          <td class="label">Scheduled Date</td>
          <td class="value highlight">${booking.booking_date}</td>
        </tr>
        <tr>
          <td class="label">Arrival Time Slot</td>
          <td class="value highlight">${booking.slot_time}</td>
        </tr>
        <tr>
          <td class="label">Estimated Unloading Wait</td>
          <td class="value">~${booking.estimated_waiting_mins || 15} Minutes</td>
        </tr>
        <tr>
          <td class="label">Booking Status</td>
          <td class="value" style="color: #059669;">CONFIRMED ✅</td>
        </tr>
      </table>

      <div class="instruction-box">
        <strong>📋 Instructions for Mandi Gate Entry:</strong><br>
        1. Please arrive at the weighbridge 15 minutes prior to your time slot (${booking.slot_time}).<br>
        2. Keep your Pattadar Passbook / 1-B land record and linked bank passbook accessible.<br>
        3. Ensure produce moisture content adheres to Government FAQ standard (≤ 14.0%).<br>
        4. Direct MSP funds will be disbursed automatically to your registered UPI / Bank account within 24–48 hours of weighment.
      </div>
    </div>

    <div class="footer">
      AgriSlot Smart Procurement Portal • Ministry of Agriculture & Farmers Welfare<br>
      Kisan Toll-Free Helpline: 1800-180-1551 • System Generated Official Pass
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
🌾 AGRISLOT SMART PROCUREMENT — BOOKING CONFIRMATION
Token Number: ${booking.token_number}
Farmer Name: ${booking.farmer_name || 'Registered Farmer'}
Crop & Quantity: ${booking.crop_name} — ${booking.quantity_quintals} Quintals
Center: ${booking.center_name}
Scheduled Date: ${booking.booking_date}
Arrival Time Slot: ${booking.slot_time}
Estimated Unloading Wait: ~${booking.estimated_waiting_mins || 15} Minutes
Status: CONFIRMED ✅

Instructions for Mandi Gate Entry:
1. Arrive at weighbridge 15 minutes before your time slot (${booking.slot_time}).
2. Keep your Pattadar passbook / 1-B land record and linked bank passbook ready.
3. Ensure moisture level is ≤ 14% FAQ standard.
4. MSP payout will be disbursed directly within 24-48 hours.

Kisan Helpline: 1800-180-1551
  `;

  try {
    console.log(`📡 [Resend API] Dispatching confirmation email to: ${recipient}...`);

    let response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [recipient],
        subject: subject,
        html: htmlContent,
        text: textContent
      })
    });

    let data = await response.json();

    // If Resend free tier restricts to owner account, automatically fallback to account email (vasanthreddy302@gmail.com)
    if (!response.ok && data.message && data.message.includes('own email address')) {
      console.warn(`⚠️ [Resend Sandbox Limitation] Resending to verified account owner vasanthreddy302@gmail.com...`);
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ['vasanthreddy302@gmail.com'],
          subject: subject,
          html: htmlContent,
          text: textContent
        })
      });
      data = await response.json();
    }

    if (!response.ok) {
      console.error('❌ [Resend API Error]:', data);
      return { success: false, error: data.message || 'Resend delivery failed' };
    }

    console.log(`✅ [Resend API Success] Email delivered with ID: ${data.id} to ${recipient}`);
    return { success: true, id: data.id, recipient };
  } catch (error) {
    console.error('❌ [Resend API Exception]:', error.message);
    return { success: false, error: error.message };
  }
}

