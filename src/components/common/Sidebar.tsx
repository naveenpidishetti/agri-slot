import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  PlusCircle, 
  Clock, 
  Camera, 
  Calendar, 
  Stethoscope, 
  User as UserIcon, 
  Bot, 
  Globe, 
  Sparkles, 
  Sun,
  X,
  LogOut,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Mic,
  Volume2,
  Sprout,
  HelpCircle,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onToggleChat: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onToggleChat,
  isOpenMobile,
  onCloseMobile
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'farmer-dashboard', label: t.dashboard || 'Dashboard', icon: Home },
    { id: 'book-slot', label: t.bookSlot || 'Book Mandi Slot', icon: PlusCircle },
    { id: 'government-schemes', label: (t as any).govtSchemes || 'Govt Schemes & Subsidies', icon: Building2, isHighlight: true },
    { id: 'crop-advisory', label: t.seedsFertilizerAI || 'Seeds & Fertilizer AI', icon: Sprout },
    { id: 'price-predictor', label: t.pricePredictor || 'Price Predictor', icon: TrendingUp, isNew: true },
    { id: 'agritech', label: t.agritech || 'Emerging AgriTech', icon: Cpu },
    { id: 'disease-doctor', label: t.cropDoctor || 'Crop Doctor AI', icon: Stethoscope },
    { id: 'calendar', label: t.calendar || 'Booking Calendar', icon: Calendar },
    { id: 'help', label: t.helpDesk || 'Help & Support Centre', icon: HelpCircle },
    { id: 'profile', label: t.profile || 'Farmer Profile', icon: UserIcon }
  ];

  const handleItemClick = (viewId: string) => {
    onNavigate(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Vertical Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 sidebar-glass shadow-xl md:shadow-sm flex flex-col transition-transform duration-300 ease-in-out bg-white/95 border-r border-slate-200
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div 
            onClick={() => handleItemClick('farmer-dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-black text-2xl tracking-tight text-slate-900">
                  Agri<span className="text-emerald-600">Slot</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {t.allIndiaPortal || 'All India Portal'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Farmer Info Badge */}
        {isAuthenticated && (
          <div className="px-4 pt-3 pb-1">
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || 'Ramesh Kumar'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{user?.farmer_id || 'TS-WGL-2026-9428'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 group cursor-pointer
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
                    ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'}
                  `}>
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-bold tracking-tight">{item.label}</span>
                </div>

                {item.isHighlight && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    AI
                  </span>
                )}
                {item.isNew && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Panel: KisanAI Assistant + Language + Profile/Auth */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          
          {/* Kisan AI Trigger */}
          <div 
            onClick={onToggleChat}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white cursor-pointer hover:shadow-md hover:shadow-emerald-600/20 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black flex items-center gap-1">
                    <span>{t.openKisanAI || 'KisanAI Assistant'}</span>
                    <Sparkles className="w-3 h-3 text-emerald-200 animate-spin-slow" />
                  </div>
                  <div className="text-[10px] text-emerald-100 font-medium">Voice & Multi-language</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Language</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-emerald-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-white text-slate-900">English</option>
              <option value="te" className="bg-white text-slate-900">తెలుగు (Telugu)</option>
              <option value="hi" className="bg-white text-slate-900">हिन्दी (Hindi)</option>
              <option value="ta" className="bg-white text-slate-900">தமிழ் (Tamil)</option>
              <option value="kn" className="bg-white text-slate-900">ಕನ್ನಡ (Kannada)</option>
              <option value="mr" className="bg-white text-slate-900">मराठी (Marathi)</option>
              <option value="pa" className="bg-white text-slate-900">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="bn" className="bg-white text-slate-900">বাংলা (Bengali)</option>
            </select>
          </div>

          {/* Login / Logout */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logout || 'Sign Out'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onCloseMobile();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all duration-200 cursor-pointer"
            >
              {t.login || 'Sign In'}
            </button>
          )}

        </div>

      </aside>
    </>
  );
};
