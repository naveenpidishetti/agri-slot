import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, Globe, Bot, Sparkles } from 'lucide-react';

interface TopBarProps {
  currentView: string;
  onOpenMobileSidebar: () => void;
  onOpenAuth: () => void;
  onToggleChat: () => void;
  onNavigate: (view: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onOpenMobileSidebar,
  onOpenAuth,
  onToggleChat,
  onNavigate
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const getPageTitle = () => {
    const titles = t.pageTitles || {};
    switch (currentView) {
      case 'farmer-dashboard': return titles.dashboard || '🌾 Farmer Dashboard';
      case 'book-slot': return titles.bookSlot || '📅 Book Mandi Slot';
      case 'crop-advisory': return titles.cropAdvisory || '🌱 Seeds & Fertilizer AI Recommender';
      case 'price-predictor': return titles.pricePredictor || '📈 Deep Price & Quality Predictor';
      case 'agritech': return titles.agritech || '🚀 Emerging AgriTech Innovations';
      case 'disease-doctor': return titles.diseaseDoctor || '🩺 Crop Doctor & Disease AI';
      case 'calendar': return titles.calendar || '🗓️ Booking Calendar';
      case 'profile': return titles.profile || '👤 Farmer Profile';
      case 'token-view': return titles.tokenView || '🎟️ Digital Token Pass';
      case 'help': return titles.help || '📞 Kisan Help & Support Centre';
      default: return '🌾 AgriSlot Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full header-glass border-b border-slate-200 shadow-xs bg-white/90">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black font-outfit text-slate-900 tracking-tight flex items-center gap-2">
              <span>{getPageTitle()}</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {t.taglineHeader || 'AI-Powered Mandi Scheduling & Crop Health'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 shadow-xs rounded-xl px-2.5 py-1.5 hover:border-emerald-500 transition-colors">
            <Globe className="w-4 h-4 text-emerald-600 mr-1.5" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              aria-label="Select Language"
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-white text-slate-900">English (EN)</option>
              <option value="te" className="bg-white text-slate-900">తెలుగు (TE)</option>
              <option value="hi" className="bg-white text-slate-900">हिन्दी (HI)</option>
              <option value="ta" className="bg-white text-slate-900">தமிழ் (TA)</option>
              <option value="kn" className="bg-white text-slate-900">ಕನ್ನಡ (KN)</option>
              <option value="mr" className="bg-white text-slate-900">मराठी (MR)</option>
              <option value="pa" className="bg-white text-slate-900">ਪੰਜਾਬੀ (PA)</option>
              <option value="bn" className="bg-white text-slate-900">বাংলা (BN)</option>
            </select>
          </div>

          {/* Kisan AI Trigger */}
          <button 
            onClick={onToggleChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 shadow-sm font-black text-xs hover:scale-105 cursor-pointer"
            title="Open KisanAI Assistant"
          >
            <Bot className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">KisanAI</span>
            <Sparkles className="w-3 h-3 text-white animate-spin-slow" />
          </button>

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <button 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition shadow-xs cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline truncate max-w-[100px]">
                {user?.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              {t.login}
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
