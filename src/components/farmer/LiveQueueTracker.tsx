import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { ArrowLeft, RefreshCw, Clock, Users, Building2, ChevronRight, Truck } from 'lucide-react';

interface LiveQueueTrackerProps {
  onBack: () => void;
  onViewToken: () => void;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({ onBack, onViewToken }) => {
  const { user } = useAuth();
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [centerQueue, setCenterQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      const qStatus = await api.getFarmerQueueStatus();
      setQueueStatus(qStatus);
      if (qStatus && qStatus.booking) {
        const cQueue = await api.getCenterQueue(qStatus.booking.center_id);
        setCenterQueue(cQueue);
      }
    } catch (err) {
      console.error('Queue tracking error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchQueueData();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-400">Connecting to Mandi Live Queue...</p>
      </div>
    );
  }

  if (!queueStatus || !queueStatus.hasActiveBooking) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4 px-4 text-emerald-100">
        <div className="w-16 h-16 rounded-3xl card-clean text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
          <Clock className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold font-outfit text-white">No Active Queue Position</h2>
        <p className="text-xs text-emerald-200/70">
          You don't currently have a confirmed booking in the active queue.
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md hover:scale-[1.02] transition">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { booking, tokenNumber, currentServingToken, peopleAhead, estimatedWaitMins } = queueStatus;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 shadow-xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Queue Status Dashboard */}
      <div className="card-clean p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-500">Procurement Center</div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>{booking.center_name}</span>
            </div>
          </div>
          <Badge status={booking.status} />
        </div>

        {/* Dual Tokens View: Serving vs Yours */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
            <div className="text-[11px] text-amber-800 uppercase tracking-wider font-bold">Now Serving</div>
            <div className="text-xl sm:text-2xl font-black font-outfit text-amber-700">
              {currentServingToken || 'AGR-2026-00118'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">At Weighbridge Bay 1</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <div className="text-[11px] text-emerald-800 uppercase tracking-wider font-bold">Your Token</div>
            <div className="text-xl sm:text-2xl font-black font-outfit text-emerald-700">
              {tokenNumber}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Scheduled {booking.slot_time}</div>
          </div>
        </div>

        {/* Key Metrics: Ahead & Wait Time */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center justify-center flex-shrink-0 font-bold">
              <Users className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <div className="text-2xl font-black font-outfit text-slate-900">{peopleAhead}</div>
              <div className="text-[11px] text-slate-500 font-medium">Farmers Ahead of You</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center flex-shrink-0 font-bold">
              <Clock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-2xl font-black font-outfit text-emerald-700">~{estimatedWaitMins}m</div>
              <div className="text-[11px] text-slate-500 font-medium">Estimated Waiting Time</div>
            </div>
          </div>
        </div>

        {/* Dynamic Queue Progression Visualizer */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-emerald-600" /> Queue Live Tracking</span>
            <span className="text-emerald-700 font-bold">{peopleAhead === 0 ? 'Your Turn Next!' : `${peopleAhead} ahead`}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.max(10, 100 - (peopleAhead * 20))}%` }}
            />
          </div>
        </div>

        {/* Arrival Advisory Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5 font-medium">
          <span className="text-base">📢</span>
          <div>
            <span className="font-bold text-emerald-800">Mandi Entry Advice:</span> Arrive at the center gate 15 minutes before your time slot ({booking.slot_time}) and present your digital QR token at the security kiosk.
          </div>
        </div>
      </div>

      {/* Button to View Digital Token */}
      <button
        onClick={onViewToken}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all duration-200 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
      >
        <span>Open My Digital QR Token Pass</span>
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
