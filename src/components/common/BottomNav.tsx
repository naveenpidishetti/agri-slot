import React from 'react';
import { Home, PlusCircle, TrendingUp, Calendar, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'farmer-dashboard', label: t.dashboard || 'Home', icon: Home },
    { id: 'book-slot', label: t.bookSlot || 'Book Slot', icon: PlusCircle, isPrimary: true },
    { id: 'price-predictor', label: 'Price AI', icon: TrendingUp },
    { id: 'disease-doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'calendar', label: t.calendar || 'Calendar', icon: Calendar }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-2xl px-2 pt-1.5 pb-safe pb-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95 cursor-pointer"
              >
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white ring-4 ring-emerald-500/30 scale-105 shadow-emerald-500/40'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-900/50 hover:scale-105'
                }`}>
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className={`text-[10px] font-black mt-1 ${isActive ? 'text-emerald-300 font-extrabold' : 'text-slate-300'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-90 cursor-pointer ${
                isActive 
                  ? 'text-emerald-300 font-black bg-emerald-950/60 border border-emerald-400/30 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400 stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

