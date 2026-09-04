import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { ALL_INDIAN_STATES } from '../../data/indiaData';
import { Phone, Lock, User as UserIcon, AlertCircle, Mail, MapPin, Building2, CreditCard, Scale } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, loginWithGoogle } = useAuth();
  const { language } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [emailOrMobile, setEmailOrMobile] = useState('vasanthreddy302@gmail.com');
  const [password, setPassword] = useState('farmer123');
  
  // Registration custom fields
  const [name, setName] = useState('Vasanth Reddy');
  const [regEmail, setRegEmail] = useState('vasanthreddy302@gmail.com');
  const [regMobile, setRegMobile] = useState('9876543210');
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('Warangal Urban');
  const [village, setVillage] = useState('Warangal');
  const [landArea, setLandArea] = useState('6.5');
  const [upiId, setUpiId] = useState('vasanthreddy@okaxis');

  const availableDistricts = ALL_INDIAN_STATES.find(s => s.state === state)?.districts || [district];

  const handleStateChange = (stateName: string) => {
    setState(stateName);
    const districts = ALL_INDIAN_STATES.find(s => s.state === stateName)?.districts || [];
    if (districts.length > 0) setDistrict(districts[0]);
  };

  const handleQuickFill = (email: string, pass: string, isReg = false) => {
    setIsRegister(isReg);
    setEmailOrMobile(email);
    setPassword(pass);
    setRegEmail(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email: regEmail,
          mobile: regMobile,
          password,
          state,
          district,
          village,
          land_area_acres: Number(landArea) || 5.0,
          upi_id: upiId,
          language,
          role: 'FARMER'
        });
        login(res.token, res.user);
      } else {
        const res = await api.login(emailOrMobile, password);
        login(res.token, res.user);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isRegister ? 'New Farmer Registration' : 'Farmer Sign In'} maxWidth={isRegister ? 'max-w-xl' : 'max-w-md'}>
      <div className="space-y-4 text-slate-800">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Accounts Pill Selection */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
          <div className="text-[11px] font-bold text-emerald-900 flex items-center justify-between">
            <span>⚡ 1-Tap Quick Demo Logins:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('vasanthreddy302@gmail.com', 'farmer123')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                emailOrMobile === 'vasanthreddy302@gmail.com'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              🌾 Vasanth Reddy
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ramesh.farmer@gmail.com', 'farmer123')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                emailOrMobile === 'ramesh.farmer@gmail.com'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              🚜 Ramesh Reddy
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff@agrislot.gov.in', 'staff123')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                emailOrMobile === 'staff@agrislot.gov.in'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              🏛️ Staff Officer
            </button>
          </div>
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 transition shadow-xs border border-slate-200 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold">Or enter login details</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister ? (
            <>
              {/* Registration Form with full details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full farmer name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="farmer@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* State & District Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {ALL_INDIAN_STATES.map((s) => (
                      <option key={s.state} value={s.state} className="bg-white text-slate-900">{s.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d} value={d} className="bg-white text-slate-900">{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Village / Town</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Land Holding (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder="5.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Direct MSP Transfer UPI / Bank ID (Optional)</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="farmername@okaxis"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Set Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sign In Form (Email OR Mobile) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address or Mobile Number</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    placeholder="farmer@gmail.com or 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition duration-300 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register & Save Profile' : 'Sign In with Email / Mobile'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-bold cursor-pointer"
          >
            {isRegister ? 'Already registered? Sign In with Email' : "New Farmer? Create Account with Your Own Details"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
