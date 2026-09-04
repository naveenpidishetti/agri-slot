import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { ALL_INDIAN_STATES } from '../../data/indiaData';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Shield, 
  LogOut, 
  Edit3, 
  Save, 
  CheckCircle2, 
  CreditCard, 
  Scale, 
  Building2 
} from 'lucide-react';

export const FarmerProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, login, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit fields
  const [name, setName] = useState(user?.name || 'Ramesh Kumar');
  const [email, setEmail] = useState(user?.email || 'ramesh.farmer@gmail.com');
  const [mobile, setMobile] = useState(user?.mobile || '9876543210');
  const [state, setState] = useState(user?.state || 'Telangana');
  const [district, setDistrict] = useState(user?.district || 'Warangal Urban');
  const [village, setVillage] = useState(user?.village || 'Warangal');
  const [landArea, setLandArea] = useState(String(user?.land_area_acres || '6.5'));
  const [upiId, setUpiId] = useState(user?.upi_id || 'ramesh@okaxis');

  const availableDistricts = ALL_INDIAN_STATES.find(s => s.state === state)?.districts || [district];

  const handleStateChange = (stateName: string) => {
    setState(stateName);
    const districts = ALL_INDIAN_STATES.find(s => s.state === stateName)?.districts || [];
    if (districts.length > 0) setDistrict(districts[0]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.updateProfile({
        name,
        email,
        mobile,
        state,
        district,
        village,
        land_area_acres: Number(landArea) || 5.0,
        upi_id: upiId
      });

      const token = localStorage.getItem('agrislot_token') || '';
      login(token, res.user);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-800">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            isEditing 
              ? 'bg-slate-200 text-slate-800 border-slate-300' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit My Details'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your farmer profile details have been saved and updated across all mandis!</span>
        </div>
      )}

      <div className="card-clean p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-sm">
        
        {/* Avatar & Title */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-outfit text-2xl font-black text-white shadow-md shadow-emerald-600/20">
            {name ? name.slice(0, 2).toUpperCase() : 'RK'}
          </div>
          <div>
            <h1 className="text-xl font-black font-outfit text-slate-900">{name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Role: <span className="text-emerald-700 font-bold">{user?.role || 'FARMER'}</span></p>
            <p className="text-xs text-emerald-700 font-bold">Farmer ID: {user?.farmer_id || 'TS-WGL-2026-9428'}</p>
          </div>
        </div>

        {isEditing ? (
          /* Edit Profile Form */
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">State (All India)</label>
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={s.state} value={s.state} className="bg-white text-slate-900">{s.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d} className="bg-white text-slate-900">{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Village / Town</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Land Holding (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Direct MSP Transfer Bank UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="farmer@okaxis"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold shadow-xs"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition hover:scale-102 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Read-only Profile Info */
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Email Address</span>
              </div>
              <span className="font-bold text-slate-900">{email}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Mobile Number</span>
              </div>
              <span className="font-bold text-slate-900">{mobile}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Location (State & District)</span>
              </div>
              <span className="font-bold text-slate-900">{village}, {district}, {state}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Direct MSP Transfer UPI</span>
              </div>
              <span className="font-bold text-emerald-700">{upiId || 'Not Configured'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Preferred Language</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-white border border-slate-200 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Land Holding</span>
              </div>
              <span className="font-bold text-slate-900">{landArea} Acres (Pattadar Verified)</span>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="w-full py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of AgriSlot</span>
        </button>
      </div>
    </div>
  );
};
