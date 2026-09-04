import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, QueueEntry } from '../../types';
import { Badge } from '../common/Badge';
import { 
  Building2, 
  Search, 
  QrCode, 
  CheckCircle, 
  Play, 
  CheckCheck, 
  Clock, 
  Users, 
  Scale, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchToken, setSearchToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Verification dialog
  const [activeProcessingToken, setActiveProcessingToken] = useState<string | null>(null);
  const [verifiedQty, setVerifiedQty] = useState<string>('40');
  const [moistureReading, setMoistureReading] = useState<string>('13.2%');

  useEffect(() => {
    loadStaffData();
  }, [user]);

  const loadStaffData = async () => {
    setLoading(true);
    try {
      const [queueRes, bookingsRes] = await Promise.all([
        api.getCenterQueue(user?.center_id || 'ctr-01'),
        api.getBookings()
      ]);
      setQueueData(queueRes);
      setBookings(bookingsRes.bookings);
    } catch (err) {
      console.error('Error loading staff dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (token: string) => {
    try {
      await api.checkInFarmer(token);
      setActionMsg(`Farmer with token ${token} checked-in successfully!`);
      setTimeout(() => setActionMsg(null), 3500);
      loadStaffData();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleStartProcessing = async (token: string) => {
    try {
      await api.startProcessing(token);
      setActionMsg(`Weighbridge & unloading started for ${token}`);
      setTimeout(() => setActionMsg(null), 3500);
      loadStaffData();
    } catch (err: any) {
      alert(err.message || 'Failed to start processing');
    }
  };

  const handleCompleteProcurement = async (token: string) => {
    try {
      await api.completeProcurement(token, Number(verifiedQty), moistureReading);
      setActionMsg(`Procurement completed for ${token}. Receipt recorded.`);
      setActiveProcessingToken(null);
      setTimeout(() => setActionMsg(null), 3500);
      loadStaffData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete procurement');
    }
  };

  const todayBookings = bookings.filter(b => b.center_id === (user?.center_id || 'ctr-01'));
  const checkedInCount = todayBookings.filter(b => b.status === 'CHECKED_IN').length;
  const inProcessingCount = todayBookings.filter(b => b.status === 'PROCESSING').length;
  const completedCount = todayBookings.filter(b => b.status === 'COMPLETED').length;

  const searchedBookings = searchToken.trim() 
    ? todayBookings.filter(b => b.token_number.toLowerCase().includes(searchToken.toLowerCase()) || b.farmer_name.toLowerCase().includes(searchToken.toLowerCase()))
    : todayBookings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Staff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-agri-border bg-gradient-to-r from-agri-surface2 to-agri-surface1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-outfit text-xl font-bold">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-outfit text-white">
                Procurement Staff Operations Hub
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Staff Station
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Officer: <span className="font-bold text-white">{user?.name}</span> • Center: <span className="text-emerald-400 font-bold">Rythu Seva Procurement Center</span>
            </p>
          </div>
        </div>

        <button 
          onClick={loadStaffData}
          className="px-4 py-2 rounded-xl bg-agri-surface1 border border-agri-border text-xs text-gray-300 hover:text-white flex items-center justify-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Operational Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">Total Today's Farmers</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-white mt-1">{todayBookings.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Capacity: 60 Slots</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">Checked-In / Arrived</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-blue-400 mt-1">{checkedInCount}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Waiting at entrance bay</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">At Weighbridge / Processing</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-amber-400 mt-1">{inProcessingCount}</div>
          <div className="text-[10px] text-amber-300/70 mt-0.5">Unloading in progress</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">Completed Procurements</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-emerald-400 mt-1">{completedCount}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">MSP Receipts Issued</div>
        </div>
      </div>

      {/* Search & Check-in Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-agri-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            placeholder="Search by Token (e.g. AGR-2026-00124) or Farmer Name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-agri-surface1 border border-agri-border text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Today's Queue & Bookings Operational Table */}
      <div className="glass-panel rounded-3xl border border-agri-border overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-agri-border/50 flex items-center justify-between">
          <h2 className="text-base font-bold font-outfit text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Operational Mandi Queue Schedule</span>
          </h2>
          <span className="text-xs text-gray-400">{searchedBookings.length} bookings listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-agri-surface1/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-agri-border/40">
              <tr>
                <th className="px-4 py-3">Token No</th>
                <th className="px-4 py-3">Farmer Details</th>
                <th className="px-4 py-3">Crop & Qty</th>
                <th className="px-4 py-3">Slot Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agri-border/30">
              {searchedBookings.map((b) => (
                <tr key={b.id} className="hover:bg-agri-surface1/40 transition">
                  <td className="px-4 py-3.5 font-bold font-outfit text-white">
                    {b.token_number}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{b.farmer_name}</div>
                    <div className="text-[11px] text-gray-400">{b.farmer_mobile}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-300">
                    <span className="font-bold text-emerald-300">{b.crop_name}</span>
                    <span className="text-gray-400"> ({b.quantity_quintals} Qtl)</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-300">
                    {b.slot_time}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={b.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCheckIn(b.token_number)}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition"
                      >
                        Check-in
                      </button>
                    )}
                    {b.status === 'CHECKED_IN' && (
                      <button
                        onClick={() => handleStartProcessing(b.token_number)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex-inline items-center gap-1"
                      >
                        Start Weighing
                      </button>
                    )}
                    {b.status === 'PROCESSING' && (
                      <button
                        onClick={() => {
                          setActiveProcessingToken(b.token_number);
                          setVerifiedQty(String(b.quantity_quintals));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition"
                      >
                        Complete Sale
                      </button>
                    )}
                    {b.status === 'COMPLETED' && (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Procured</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Procurement Modal */}
      {activeProcessingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-2xl p-6 border border-agri-border w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold font-outfit text-white">
              Complete Procurement: {activeProcessingToken}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Final Weighbridge Verified Quantity (Qtl)</label>
                <input
                  type="number"
                  value={verifiedQty}
                  onChange={(e) => setVerifiedQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-agri-surface1 border border-agri-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Moisture Meter Reading (%)</label>
                <input
                  type="text"
                  value={moistureReading}
                  onChange={(e) => setMoistureReading(e.target.value)}
                  placeholder="e.g. 13.2%"
                  className="w-full px-3 py-2 rounded-xl bg-agri-surface1 border border-agri-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveProcessingToken(null)}
                className="py-2 rounded-xl bg-agri-surface2 text-white border border-agri-border text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteProcurement(activeProcessingToken)}
                className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition"
              >
                Confirm & Issue Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
