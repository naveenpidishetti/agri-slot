import React from 'react';
import { Home, PlusCircle, Clock, TrendingUp, Calendar, Stethoscope } from 'lucide-react';
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
    { id: 'farmer-dashboard', label: t.dashboard, icon: Home },
    { id: 'book-slot', label: t.bookSlot, icon: PlusCircle },
    { id: 'price-predictor', label: 'Price AI', icon: TrendingUp },
    { id: 'disease-doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'calendar', label: t.calendar || 'Calendar', icon: Calendar }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 sidebar-glass border-t border-emerald-500/25 shadow-2xl px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-emerald-300 font-bold bg-emerald-900/60 scale-105 shadow-md border border-emerald-400/50' 
                  : 'text-emerald-200/60 hover:text-emerald-100'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-300 stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
