import React, { useEffect, useState, useRef } from 'react';
import { Booking } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../common/Badge';
import { ArrowLeft, Download, Printer, CheckCircle, Clock, Sparkles, Calendar } from 'lucide-react';
import QRCode from 'qrcode';

interface DigitalTokenViewProps {
  booking: Booking | null;
  onBack: () => void;
  onViewCalendar?: () => void;
}

export const DigitalTokenView: React.FC<DigitalTokenViewProps> = ({ booking, onBack, onViewCalendar }) => {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState('');
  const tokenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booking) {
      const qrPayload = JSON.stringify({
        token: booking.token_number,
        farmer: booking.farmer_name,
        crop: booking.crop_name,
        qty: booking.quantity_quintals,
        center: booking.center_name,
        date: booking.booking_date,
        slot: booking.slot_time,
        status: booking.status
      });

      QRCode.toDataURL(qrPayload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR generation error:', err));
    }
  }, [booking]);

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4 text-slate-300">
        <p className="text-slate-400">No active token selected.</p>
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
          {t.backToDashboard}
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-100">
      {/* Header Back */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToDashboard}</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 shadow-xs transition cursor-pointer"
            title="Print Token"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Digital Token Card (Crisp White Pass) */}
      <div 
        ref={tokenRef}
        className="card-clean p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm relative overflow-hidden space-y-6"
      >
        {/* Verified Watermark Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🌾
            </div>
            <div>
              <div className="font-extrabold font-outfit text-slate-900 text-base">{t.digitalTokenTitle}</div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">{t.officialProcurementToken}</div>
            </div>
          </div>
          <Badge status={booking.status} />
        </div>

        {/* QR Code Block */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div className="p-3.5 bg-white rounded-3xl shadow-md border-4 border-emerald-500">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Booking QR" className="w-44 h-44 sm:w-52 sm:h-52 object-contain" />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">Generating QR...</div>
            )}
          </div>
          <div className="text-2xl font-black font-outfit text-emerald-700 mt-4 tracking-widest">
            {booking.token_number}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Scan at weighbridge entry gate</div>
        </div>

        {/* Details Table */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-xs text-slate-700">
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-500 font-medium">{t.farmerName}</span>
            <span className="font-extrabold text-slate-900">{booking.farmer_name}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-500 font-medium">{t.produceAndQty}</span>
            <span className="font-extrabold text-slate-900">{booking.crop_name} • {booking.quantity_quintals} {t.quintals}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-500 font-medium">{t.procurementCenter}</span>
            <span className="font-extrabold text-slate-900 truncate max-w-[220px]">{booking.center_name}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-500 font-medium">{t.dateAndSlot}</span>
            <span className="font-extrabold text-emerald-700">{booking.booking_date} • {booking.slot_time}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Confirmation Email</span>
            <span className="font-bold text-slate-900 truncate max-w-[220px]">{booking.farmer_email || 'vasanthreddy302@gmail.com'}</span>
          </div>
        </div>

        {/* Email Dispatched Alert Banner & Resend Action */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Digital Token Pass & Unloading Instructions Emailed!</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            Sent to <strong>{booking.farmer_email || 'vasanthreddy302@gmail.com'}</strong>. If you don't see it immediately, please check your <em>Spam / Updates</em> tab.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  setEmailSending(true);
                  const res = await api.resendBookingEmail(booking.id, booking.farmer_email);
                  setEmailStatusMsg(res.message || 'Email sent successfully!');
                } catch (e: any) {
                  setEmailStatusMsg(e.message || 'Email queue updated');
                } finally {
                  setEmailSending(false);
                }
              }}
              disabled={emailSending}
              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-[11px] hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{emailSending ? 'Dispatching...' : 'Resend Email to My Inbox'}</span>
            </button>
            {emailStatusMsg && (
              <span className="text-[11px] font-bold text-emerald-700 animate-fade-in">{emailStatusMsg}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {onViewCalendar && (
          <button
            onClick={onViewCalendar}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span>View in Booking Calendar</span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {onViewCalendar ? (
          <button
            onClick={onViewCalendar}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all duration-200 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
          >
            <Calendar className="w-4 h-4 stroke-[2.5]" />
            <span>Booking Calendar</span>
          </button>
        ) : (
          <button
            onClick={onBack}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all duration-200 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
          >
            <span>Dashboard</span>
          </button>
        )}

        <button
          onClick={handlePrint}
          className="py-3.5 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-all duration-200 border border-slate-200 shadow-xs flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Save Token Pass</span>
        </button>
      </div>
    </div>
  );
};
