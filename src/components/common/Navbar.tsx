import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Globe, Bot, Sparkles, Stethoscope } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onToggleChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth, onToggleChat }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full header-glass border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('farmer-dashboard')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-outfit font-black text-2xl tracking-tight text-slate-900">
                Agri<span className="text-emerald-600">Slot</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Farmer App
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Smart Mandi Queue & Slot Booking</p>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => onNavigate('farmer-dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'farmer-dashboard' 
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t.dashboard}
          </button>
          <button 
            onClick={() => onNavigate('book-slot')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'book-slot' 
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t.bookSlot}
          </button>
          <button 
            onClick={() => onNavigate('agritech')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'agritech' 
                ? 'bg-white text-purple-700 shadow-sm border border-purple-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            AgriTech
          </button>
          <button 
            onClick={() => onNavigate('disease-doctor')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'disease-doctor' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Crop Doctor</span>
          </button>
          <button 
            onClick={() => onNavigate('price-predictor')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'price-predictor' 
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Price Predictor
          </button>
          <button 
            onClick={() => onNavigate('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'calendar' 
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t.calendar}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl px-2.5 py-1.5 hover:border-emerald-300 transition-colors">
            <Globe className="w-4 h-4 text-emerald-600 mr-1.5" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              aria-label="Select Language"
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Kisan AI Trigger */}
          <button 
            onClick={onToggleChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition shadow-sm font-bold text-xs"
            title="Open KisanAI Assistant"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">KisanAI</span>
            <Sparkles className="w-3 h-3 text-emerald-200" />
          </button>

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs border border-emerald-300">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline truncate max-w-[100px]">
                  {user?.name.split(' ')[0]}
                </span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
            >
              {t.login}
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
