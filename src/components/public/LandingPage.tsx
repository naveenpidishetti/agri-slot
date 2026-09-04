import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  QrCode, 
  Bot,
  Stethoscope,
  Camera
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const handleStartBooking = () => {
    if (isAuthenticated) {
      onNavigate('book-slot');
    } else {
      onOpenAuth();
    }
  };

  return (
    <div className="space-y-16 pb-20 text-slate-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold mb-6 shadow-xs backdrop-blur-md animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>AI-Powered Smart Procurement Queue System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-outfit text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Book Your Mandi Slot. <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
            Skip the Long Road Queue.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          {t.heroDescription}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleStartBooking}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base transition duration-300 shadow-lg shadow-emerald-600/25 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.bookSlotNow}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <button 
            onClick={() => onNavigate('farmer-dashboard')}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl card-clean text-slate-800 font-bold text-base hover:text-emerald-700 hover:border-emerald-400 transition duration-300 flex items-center justify-center gap-2 cursor-pointer bg-white"
          >
            <span>Open Farmer Dashboard</span>
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="card-clean p-5 rounded-3xl text-center bg-white border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-outfit">15 Mins</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Average Turnaround</div>
          </div>
          <div className="card-clean p-5 rounded-3xl text-center bg-white border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-teal-600 font-outfit">100%</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Direct MSP Payment</div>
          </div>
          <div className="card-clean p-5 rounded-3xl text-center bg-white border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-outfit">0 Hours</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">No Highway Congestion</div>
          </div>
          <div className="card-clean p-5 rounded-3xl text-center bg-white border border-slate-200">
            <div className="text-2xl sm:text-3xl font-black text-slate-800 font-outfit">3 Languages</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">English, Telugu, Hindi</div>
          </div>
        </div>
      </section>

      {/* Visual Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900">
            How AgriSlot Transforms Mandi Selling
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Smart digital features built specifically for rural farmers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-clean p-6 rounded-3xl space-y-3 bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-outfit">Digital QR Token Pass</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Get an official digital pass on your phone with your assigned weighbridge bay and entry time.
            </p>
          </div>

          <div className="card-clean p-6 rounded-3xl space-y-3 bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-outfit">Live Queue Radar</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Track exactly how many tractor trolleys are ahead of you in real-time from the comfort of your home.
            </p>
          </div>

          <div className="card-clean p-6 rounded-3xl space-y-3 bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-outfit">KisanAI Voice Mitra</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Speak naturally in Telugu or Hindi to check slot timings, required documents, and moisture guidelines.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
