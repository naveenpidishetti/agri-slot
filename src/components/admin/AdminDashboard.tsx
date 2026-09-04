import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Scale, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New center modal form
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterVillage, setNewCenterVillage] = useState('');
  const [newCenterDistrict, setNewCenterDistrict] = useState('Ranga Reddy');
  const [showAddCenter, setShowAddCenter] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, centersRes, cropsRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getCenters(),
        api.getCrops()
      ]);
      setAnalytics(analyticsRes);
      setCenters(centersRes.centers);
      setCrops(cropsRes.crops);
    } catch (err) {
      console.error('Error loading admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName || !newCenterVillage) return;

    try {
      const res = await fetch('/api/admin/centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('agrislot_token')}`
        },
        body: JSON.stringify({
          name: newCenterName,
          village: newCenterVillage,
          district: newCenterDistrict,
          daily_capacity_quintals: 1500,
          max_daily_slots: 60
        })
      });

      if (res.ok) {
        setShowAddCenter(false);
        setNewCenterName('');
        setNewCenterVillage('');
        loadAdminData();
      }
    } catch (err) {
      console.error('Add center error', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-agri-border bg-gradient-to-r from-purple-950/40 via-agri-surface1 to-agri-surface2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-outfit text-xl font-bold">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-outfit text-white">
                AgriSlot System Oversight & Analytics
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Administrator
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Logged in as <span className="font-bold text-white">{user?.name}</span> • System Health: <span className="text-emerald-400 font-bold">Optimal (Zero Queue Overload)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddCenter(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Procurement Center</span>
          </button>
          
          <button 
            onClick={loadAdminData}
            className="p-2 rounded-xl bg-agri-surface1 border border-agri-border text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">Total Season Bookings</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-white mt-1">
            {analytics?.totalBookings ?? 124}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">+18% vs Last Harvest</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">Total Grain Procured</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-emerald-400 mt-1">
            {analytics?.totalProcuredQuintals ?? 4200} <span className="text-sm font-semibold">Qtl</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">MSP Disbursed: ₹96.6 Lakh</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">Avg Farmer Waiting Time</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-blue-400 mt-1">
            {analytics?.avgWaitTimeMins ?? 14.5} <span className="text-sm font-semibold">min</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Reduced from 6.2 hrs</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-agri-border">
          <div className="text-xs text-gray-400">Registered Procurement Centers</div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-purple-400 mt-1">
            {centers.length}
          </div>
          <div className="text-[10px] text-purple-300/80 mt-0.5">Across 4 Districts</div>
        </div>
      </div>

      {/* Analytics Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Center Utilization Rates */}
        <div className="glass-panel p-6 rounded-3xl border border-agri-border space-y-4">
          <h3 className="text-base font-bold font-outfit text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Procurement Center Capacity Utilization</span>
          </h3>

          <div className="space-y-3">
            {centers.map((c) => {
              const utilPercent = Math.round((c.current_booked_slots / c.max_daily_slots) * 100);
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{c.name}</span>
                    <span className="text-emerald-400 font-bold">{c.current_booked_slots}/{c.max_daily_slots} slots ({utilPercent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-agri-surface1 rounded-full overflow-hidden border border-agri-border">
                    <div 
                      className={`h-full rounded-full ${utilPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${utilPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Booking Hours Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-agri-border space-y-4">
          <h3 className="text-base font-bold font-outfit text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Hourly Unloading Traffic Distribution</span>
          </h3>

          <div className="space-y-2.5">
            {[
              { hour: '09:00 - 10:00 AM', count: 18, pct: 60 },
              { hour: '10:00 - 11:00 AM (Peak)', count: 32, pct: 100 },
              { hour: '11:00 - 12:00 PM', count: 28, pct: 85 },
              { hour: '02:00 - 03:00 PM', count: 24, pct: 75 },
              { hour: '03:00 - 04:00 PM', count: 19, pct: 62 }
            ].map((slot, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="w-36 text-gray-300 font-medium truncate">{slot.hour}</span>
                <div className="flex-1 h-3 bg-agri-surface1 rounded-full overflow-hidden border border-agri-border">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-300 rounded-full"
                    style={{ width: `${slot.pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-bold text-white">{slot.count} bk</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Center Modal */}
      {showAddCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-2xl p-6 border border-agri-border w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold font-outfit text-white">Add New Procurement Center</h3>
            <form onSubmit={handleAddCenter} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  placeholder="e.g. Telangana Agro Procurement Center"
                  className="w-full px-3 py-2 rounded-xl bg-agri-surface1 border border-agri-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Village / Mandal</label>
                <input
                  type="text"
                  required
                  value={newCenterVillage}
                  onChange={(e) => setNewCenterVillage(e.target.value)}
                  placeholder="e.g. Shadnagar"
                  className="w-full px-3 py-2 rounded-xl bg-agri-surface1 border border-agri-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={newCenterDistrict}
                  onChange={(e) => setNewCenterDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-agri-surface1 border border-agri-border text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCenter(false)}
                  className="py-2 rounded-xl bg-agri-surface2 text-white border border-agri-border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition"
                >
                  Create Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
