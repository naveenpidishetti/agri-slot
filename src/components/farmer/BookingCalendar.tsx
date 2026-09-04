import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Booking } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { AICaptionDisclaimer } from '../common/AICaptionDisclaimer';
import { 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Clock, 
  Building2, 
  RefreshCw, 
  Bell, 
  BellRing, 
  ChevronLeft, 
  ChevronRight, 
  CalendarPlus, 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  Download, 
  ExternalLink, 
  Trash2, 
  Plus, 
  FileText,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';

interface Reminder {
  id: string;
  bookingId: string;
  tokenNumber: string;
  cropName: string;
  centerName: string;
  bookingDate: string;
  slotTime: string;
  reminderType: '1_DAY_BEFORE' | '2_HOURS_BEFORE' | '30_MINS_BEFORE' | 'CUSTOM';
  customTime?: string;
  note: string;
  checklist: string[];
  createdAt: string;
}

export const BookingCalendar: React.FC<{ 
  onBack: () => void; 
  onSelectBooking: (b: Booking) => void;
  onViewToken?: (b: Booking) => void;
}> = ({ onBack, onSelectBooking, onViewToken }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'MONTH' | 'LIST' | 'REMINDERS'>('MONTH');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  
  // Current calendar month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Reminders state (persisted to localStorage)
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem('agrislot_calendar_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reminder Modal State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [targetBookingForReminder, setTargetBookingForReminder] = useState<Booking | null>(null);
  const [reminderType, setReminderType] = useState<Reminder['reminderType']>('2_HOURS_BEFORE');
  const [reminderNote, setReminderNote] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState<string[]>([
    'Bring original Aadhaar Card & Bank Passbook',
    'Verify moisture content is within government FAQ standard (≤ 14%)',
    'Arrange tractor / transport trolley'
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reschedule / Cancel Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('11:00 AM – 11:30 AM');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('agrislot_calendar_reminders', JSON.stringify(reminders));
    } catch (e) {
      console.warn('Failed to persist reminders to localStorage', e);
    }
  }, [reminders]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings in calendar', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await api.cancelBooking(selectedBooking.id);
      setIsCancelOpen(false);
      showToast(`Slot for Token ${selectedBooking.token_number} has been cancelled.`);
      loadBookings();
    } catch (err) {
      console.error('Cancel failed', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!selectedBooking || !newDate) return;
    setActionLoading(true);
    try {
      await api.rescheduleBooking(selectedBooking.id, newDate, newSlot);
      setIsRescheduleOpen(false);
      showToast(`Slot rescheduled to ${newDate} (${newSlot}).`);
      loadBookings();
    } catch (err) {
      console.error('Reschedule failed', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openReminderModal = (b: Booking) => {
    setTargetBookingForReminder(b);
    const existing = reminders.find(r => r.bookingId === b.id);
    if (existing) {
      setReminderType(existing.reminderType);
      setReminderNote(existing.note || '');
      setSelectedChecklist(existing.checklist || []);
    } else {
      setReminderType('2_HOURS_BEFORE');
      setReminderNote(`Prepare ${b.quantity_quintals} Qtl of ${b.crop_name} for procurement at ${b.center_name}.`);
    }
    setIsReminderModalOpen(true);
  };

  const handleSaveReminder = () => {
    if (!targetBookingForReminder) return;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      bookingId: targetBookingForReminder.id,
      tokenNumber: targetBookingForReminder.token_number,
      cropName: targetBookingForReminder.crop_name,
      centerName: targetBookingForReminder.center_name,
      bookingDate: targetBookingForReminder.booking_date,
      slotTime: targetBookingForReminder.slot_time,
      reminderType,
      note: reminderNote,
      checklist: selectedChecklist,
      createdAt: new Date().toISOString()
    };

    setReminders([newReminder, ...reminders.filter(r => r.bookingId !== targetBookingForReminder.id)]);
    setIsReminderModalOpen(false);
    setReminderNote('');
    showToast(`🔔 Reminder alert successfully configured for Token ${targetBookingForReminder.token_number}!`);
  };

  const handleCreateReminder = handleSaveReminder;

  const handleDeleteReminder = (idOrBookingId: string) => {
    setReminders(reminders.filter(r => r.id !== idOrBookingId && r.bookingId !== idOrBookingId));
    showToast('🗑️ Reminder alert removed.');
  };

  const handleToggleChecklistItem = (item: string) => {
    if (selectedChecklist.includes(item)) {
      setSelectedChecklist(selectedChecklist.filter(i => i !== item));
    } else {
      setSelectedChecklist([...selectedChecklist, item]);
    }
  };

  // Google Calendar Integration URL generator
  const getGoogleCalendarUrl = (b: Booking, note = '') => {
    const title = encodeURIComponent(`AgriSlot Mandi Delivery: ${b.crop_name} (${b.quantity_quintals} Qtl)`);
    const details = encodeURIComponent(
      `Official Procurement Delivery Slot\nToken: ${b.token_number}\nCenter: ${b.center_name}\nCrop: ${b.crop_name} (${b.quantity_quintals} Quintals)\nStatus: ${b.status}\n\nNotes: ${note}\nChecklist:\n- Bring original Aadhaar Card\n- Bank Passbook for direct DBT payment\n- Moisture FAQ level <= 14%`
    );
    const location = encodeURIComponent(b.center_name);
    
    // Parse Date and Time (approximate 30 min window)
    const dateFormatted = b.booking_date.replace(/-/g, '');
    const startTime = '090000'; // Standard slot start
    const endTime = '113000';
    const dates = `${dateFormatted}T${startTime}/${dateFormatted}T${endTime}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  const generateGoogleCalendarUrl = getGoogleCalendarUrl;

  // Apple / iCal .ics file download generator
  const downloadIcsFile = (b: Booking, note = '') => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AgriSlot//Smart Procurement Queue//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:agrislot-${b.token_number}@agrislot.gov.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${b.booking_date.replace(/-/g, '')}`,
      `SUMMARY:AgriSlot Mandi: ${b.crop_name} (${b.quantity_quintals} Qtl)`,
      `DESCRIPTION:Token: ${b.token_number}\\nCenter: ${b.center_name}\\nSlot: ${b.slot_time}\\nFarmer: ${b.farmer_name}\\nNote: ${note}`,
      `LOCATION:${b.center_name}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `AgriSlot_${b.token_number}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`📅 Calendar file generated for Token ${b.token_number}`);
  };

  // Filter Bookings by Tab
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'ACTIVE') return ['CONFIRMED', 'CHECKED_IN', 'PROCESSING'].includes(b.status);
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  // Bookings for selected date in Month View
  const bookingsForSelectedDate = bookings.filter(b => b.booking_date === selectedDateStr);

  // Calendar Month Matrix Generation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToDashboard}</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer border border-slate-200"
          >
            Today
          </button>
          <button 
            onClick={loadBookings}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-xs transition cursor-pointer"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2 shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Procurement Calendar & Reminders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900">
            {t.calendarTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            View booked appointments, sync with Google / Apple Calendar, and set automated alerts before delivery.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveView('MONTH')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeView === 'MONTH' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.monthGridTab}
          </button>
          <button
            onClick={() => setActiveView('LIST')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeView === 'LIST' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.slotListTab} ({filteredBookings.length})
          </button>
          <button
            onClick={() => setActiveView('REMINDERS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'REMINDERS' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t.remindersTab} ({reminders.length})</span>
          </button>
        </div>
      </div>

      {/* AI Advisory Caption */}
      <AICaptionDisclaimer featureName="AgriSlot Appointment & Reminder System" />

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE MONTH CALENDAR GRID */}
      {/* ========================================================================= */}
      {activeView === 'MONTH' && (
        <div className="space-y-6">
          
          {/* Month Navigation Card */}
          <div className="card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900">
                  {monthName}
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {bookings.filter(b => b.booking_date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} Slots Scheduled
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of the Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 py-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1 uppercase text-[10px] tracking-wider text-slate-600">{d}</div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading padding cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[85px] rounded-2xl bg-slate-50/40 opacity-40 border border-transparent" />
              ))}

              {/* Month Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;

                // Bookings on this day
                const dayBookings = bookings.filter(b => b.booking_date === dateStr);
                const hasReminder = reminders.some(r => r.bookingDate === dateStr);

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[72px] sm:min-h-[85px] p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : isToday
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                        isToday 
                          ? 'bg-amber-500 text-white' 
                          : isSelected 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-slate-700'
                      }`}>
                        {dayNum}
                      </span>

                      {hasReminder && (
                        <span className="text-[10px] text-amber-600 animate-pulse" title="Active Reminder Set">
                          🔔
                        </span>
                      )}
                    </div>

                    {/* Booking indicators / mini chips */}
                    <div className="space-y-1 w-full mt-1">
                      {dayBookings.slice(0, 2).map((bk, idx) => (
                        <div 
                          key={idx}
                          className="px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 truncate leading-tight flex items-center gap-1"
                        >
                          <span>🌾</span>
                          <span className="truncate">{bk.crop_name.split(' ')[0]}</span>
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[8px] font-black text-emerald-800 text-right">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Appointments Section */}
          <div className="card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selected Date Appointments
                </span>
                <h3 className="text-lg font-black font-outfit text-slate-900 mt-0.5">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                {bookingsForSelectedDate.length} Bookings on this day
              </span>
            </div>

            {bookingsForSelectedDate.length === 0 ? (
              <div className="p-8 text-center space-y-2 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-semibold">No procurement slots booked for this date.</p>
                <button
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Book Slot for {selectedDateStr}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookingsForSelectedDate.map((b) => {
                  const reminder = reminders.find(r => r.bookingId === b.id);
                  return (
                    <div 
                      key={b.id}
                      className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200 hover:border-emerald-300 transition-all space-y-3.5 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                            <span>{b.token_number}</span>
                            <Badge status={b.status} />
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {b.slot_time}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 font-semibold">
                          🌾 <strong>{b.crop_name}</strong> • {b.quantity_quintals} Quintals
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{b.center_name}</span>
                        </div>

                        {/* Reminder Badge if active */}
                        {reminder && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                              <span>Reminder Active ({reminder.reminderType.replace(/_/g, ' ')})</span>
                            </div>
                            <button
                              onClick={() => handleDeleteReminder(b.id)}
                              className="text-red-600 hover:text-red-800 text-[10px] underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action Button Bar */}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Add Reminder Button */}
                          <button
                            onClick={() => openReminderModal(b)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                            <span>{reminder ? 'Edit Reminder' : 'Set Reminder'}</span>
                          </button>

                          {/* Sync Google Calendar */}
                          <a
                            href={generateGoogleCalendarUrl(b, reminder?.note)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition cursor-pointer"
                            title="Add to Google Calendar"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                          </a>

                          {/* Download iCal */}
                          <button
                            onClick={() => downloadIcsFile(b, reminder?.note)}
                            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition cursor-pointer"
                            title="Download iCal (.ics)"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        </div>

                        {onViewToken && (
                          <button
                            onClick={() => onViewToken(b)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                          >
                            View Token →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: BOOKINGS LIST / AGENDA VIEW */}
      {/* ========================================================================= */}
      {activeView === 'LIST' && (
        <div className="space-y-4">
          
          {/* Tab Filter */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start w-fit">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Bookings' : tab === 'ACTIVE' ? 'Active Slots' : 'Completed'}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-10 rounded-3xl text-center space-y-2 card-clean bg-white border border-slate-200 shadow-sm">
              <CalendarIcon className="w-10 h-10 text-emerald-600/50 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No bookings found in this view</h3>
              <p className="text-xs text-slate-500">Reserve a slot from the dashboard to see it listed here.</p>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const reminder = reminders.find(r => r.bookingId === b.id);
              return (
                <div 
                  key={b.id}
                  className="p-5 sm:p-6 rounded-3xl card-clean bg-white border border-slate-200 shadow-sm space-y-4 hover:border-emerald-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-200 shadow-xs">
                        🌾
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 font-outfit flex items-center gap-2">
                          <span>{b.token_number}</span>
                          <Badge status={b.status} />
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {b.crop_name} • <strong>{b.quantity_quintals} Quintals</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <div className="text-xs font-black text-emerald-700 font-outfit">
                        📅 {b.booking_date}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        ⏰ {b.slot_time}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{b.center_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Estimated Wait: ~{b.estimated_waiting_mins || 15} mins</span>
                    </div>
                  </div>

                  {/* Reminder Bar */}
                  {reminder && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
                        <span>Reminder: {reminder.reminderType.replace(/_/g, ' ')} — "{reminder.note}"</span>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(b.id)}
                        className="text-red-700 hover:text-red-900 text-xs font-bold underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openReminderModal(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-600" />
                        <span>{reminder ? 'Edit Reminder' : 'Set Reminder'}</span>
                      </button>

                      <a
                        href={generateGoogleCalendarUrl(b, reminder?.note)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span>Google Calendar</span>
                      </a>

                      <button
                        onClick={() => downloadIcsFile(b, reminder?.note)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>iCal File</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {['CONFIRMED', 'CHECKED_IN'].includes(b.status) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setNewDate(b.booking_date);
                              setNewSlot(b.slot_time);
                              setIsRescheduleOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition cursor-pointer"
                          >
                            Reschedule
                          </button>

                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setIsCancelOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition cursor-pointer"
                          >
                            Cancel Slot
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ACTIVE REMINDERS DASHBOARD */}
      {/* ========================================================================= */}
      {activeView === 'REMINDERS' && (
        <div className="card-clean p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black font-outfit text-slate-900">
                Scheduled Slot Reminders & Pre-Delivery Checklists
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your active alerts, device push notifications, and dispatch checklists.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300">
              {reminders.length} Active
            </span>
          </div>

          {reminders.length === 0 ? (
            <div className="p-10 text-center space-y-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <Bell className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No active reminders configured</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Set Reminder" on any booked procurement slot to receive alerts and pre-delivery preparation checklists.
              </p>
              <button
                onClick={() => setActiveView('MONTH')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Go to Calendar to Set a Reminder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map((r) => (
                <div 
                  key={r.id}
                  className="p-5 rounded-3xl bg-amber-50/50 border border-amber-200 space-y-3.5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-outfit">
                        {r.tokenNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        ⏰ {r.bookingDate} ({r.slotTime})
                      </span>
                    </div>

                    <div className="text-sm font-black text-slate-900">
                      🌾 {r.cropName} — {r.centerName}
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-amber-950 flex items-center gap-1">
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
                        <span>Alert: {r.reminderType.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">"{r.note}"</p>
                    </div>

                    {/* Pre-Delivery Checklist */}
                    {r.checklist && r.checklist.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Pre-Delivery Checklist:</span>
                        {r.checklist.map((c, i) => (
                          <div key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Scheduled for mobile & calendar</span>
                    <button
                      onClick={() => handleDeleteReminder(r.bookingId)}
                      className="px-3 py-1 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SET SMART REMINDER MODAL */}
      {/* ========================================================================= */}
      <Modal 
        isOpen={isReminderModalOpen} 
        onClose={() => setIsReminderModalOpen(false)} 
        title="🔔 Set Smart Mandi Slot Reminder"
      >
        <div className="space-y-5 text-slate-800">
          
          {targetBookingForReminder && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <div className="font-extrabold">{targetBookingForReminder.crop_name} ({targetBookingForReminder.token_number})</div>
                <div className="text-[11px] text-emerald-800">{targetBookingForReminder.center_name}</div>
              </div>
              <div className="text-right font-black">
                <div>{targetBookingForReminder.booking_date}</div>
                <div className="text-[10px] text-emerald-700">{targetBookingForReminder.slot_time}</div>
              </div>
            </div>
          )}

          {/* Alert Timing Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">When would you like to be reminded?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: '2_HOURS_BEFORE', label: '⏰ 2 Hours Before Slot', sub: 'Optimal for loading & travel' },
                { id: '1_DAY_BEFORE', label: '📅 1 Day Before (08:00 AM)', sub: 'Time to winnow & dry grains' },
                { id: '30_MINS_BEFORE', label: '⚡ 30 Mins Before Entry', sub: 'Weighbridge gate check-in' },
                { id: 'CUSTOM', label: '🔔 Morning of Delivery', sub: 'Day-of reminder at 6:00 AM' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReminderType(opt.id as Reminder['reminderType'])}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    reminderType === opt.id
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-extrabold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Custom Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Custom Reminder Note</label>
            <input
              type="text"
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              placeholder="e.g. Check moisture meter reading and fuel tractor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>

          {/* Pre-Delivery Checklist Config */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pre-Delivery Mandatory Checklist</label>
            <div className="space-y-1.5 text-xs">
              {[
                'Bring original Aadhaar Card & Bank Passbook',
                'Verify moisture content is within government FAQ standard (≤ 14%)',
                'Arrange tractor / transport trolley',
                'Download or print digital token QR pass'
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChecklist.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedChecklist(prev => [...prev, item]);
                      } else {
                        setSelectedChecklist(prev => prev.filter(c => c !== item));
                      }
                    }}
                    className="accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className="text-slate-800 text-[11px] font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(false)}
              className="py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReminder}
              className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>Save & Schedule Alarm</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: CANCEL MODAL */}
      {/* ========================================================================= */}
      <Modal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="Cancel Procurement Slot">
        <div className="space-y-4 text-slate-800">
          <p className="text-xs sm:text-sm text-slate-600">
            Are you sure you want to cancel booking <span className="font-bold text-slate-900">{selectedBooking?.token_number}</span>? This will release your reserved slot back to other farmers.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCancelOpen(false)}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Keep Slot
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleCancelBooking}
              className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: RESCHEDULE MODAL */}
      {/* ========================================================================= */}
      <Modal isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} title="Reschedule Procurement Slot">
        <div className="space-y-4 text-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Booking Date</label>
            <input 
              type="date"
              value={newDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Time Slot</label>
            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="09:00 AM – 09:30 AM">09:00 AM – 09:30 AM</option>
              <option value="09:30 AM – 10:00 AM">09:30 AM – 10:00 AM</option>
              <option value="10:00 AM – 10:30 AM">10:00 AM – 10:30 AM</option>
              <option value="10:30 AM – 11:00 AM">10:30 AM – 11:00 AM</option>
              <option value="11:00 AM – 11:30 AM">11:00 AM – 11:30 AM (Low Traffic)</option>
              <option value="02:00 PM – 02:30 PM">02:00 PM – 02:30 PM</option>
              <option value="02:30 PM – 03:00 PM">02:30 PM – 03:00 PM</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRescheduleBooking}
              className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Saving...' : 'Confirm New Slot'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

