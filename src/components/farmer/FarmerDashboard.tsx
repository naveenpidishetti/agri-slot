import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { Badge } from '../common/Badge';
import { 
  PlusCircle, 
  Clock, 
  Camera, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Eye,
  Umbrella,
  Stethoscope,
  Cpu,
  BarChart3,
  Sprout,
  HelpCircle
} from 'lucide-react';

interface FarmerDashboardProps {
  onNavigate: (view: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigate, onSelectBooking }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [bookingsRes, queueRes] = await Promise.all([
        api.getBookings('CONFIRMED'),
        api.getFarmerQueueStatus().catch(() => null)
      ]);

      if (bookingsRes.bookings && bookingsRes.bookings.length > 0) {
        setActiveBooking(bookingsRes.bookings[0]);
      }
      setQueueStatus(queueRes);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-900">
      
      {/* Farmer Welcome Header Banner */}
      <div className="card-clean p-6 sm:p-8 border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-emerald-100/50 shadow-sm relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-outfit text-2xl font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900">
                  {user?.name ? `${user.name}!` : (t.welcomeFarmer || 'Welcome, Farmer!')}
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-emerald"></span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-2 font-medium flex-wrap">
                <span>📍 {user?.village || 'Warangal'}, {user?.district || 'Warangal Urban'}, {user?.state || 'Telangana'}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">ID: {user?.farmer_id || 'TS-WGL-2026-9428'}</span>
              </p>
            </div>
          </div>

          {/* Weather & Book Action Right Box */}
          <div className="flex items-center gap-3">
            <div className="bg-white/90 px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sun className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">{t.mandiWeather || 'Mandi Weather'}</div>
                <div className="text-sm font-extrabold text-slate-900">{t.sunny || '29°C • Sunny'}</div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('book-slot')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all duration-200 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>{t.bookSlot}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Government Schemes & Subsidies Spotlight Banner */}
      <div 
        onClick={() => onNavigate('government-schemes')}
        className="p-5 sm:p-6 rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 transition-all duration-300 shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-emerald-900 shadow-xs">
                🏛️ {t.allIndiaPortal || 'Official Govt Portal'}
              </span>
              <span className="text-[11px] font-bold text-emerald-100">Direct Online Applications & Subsidies</span>
            </div>
            <h2 className="text-base sm:text-xl font-black font-outfit text-white mt-1 flex items-center gap-2">
              <span>{language === 'te' ? 'రైతు సంక్షేమ పథకాలు & సబ్సిడీల పోర్టల్' : language === 'hi' ? 'सरकारी योजनाएं और प्रत्यक्ष सब्सिडी पोर्टल' : 'Government Schemes, Grants & Direct Subsidies Hub'}</span>
            </h2>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              {language === 'te' ? 'PM-కిసాన్ ₹6000, ఫసల్ బీమా, డ్రిప్ ఇరిగేషన్, KCC 4% రుణాలు & సోలార్ పంపుల దరఖాస్తు లింకులు' : language === 'hi' ? 'पीएम-किसान ₹6000, फसल बीमा, केसीसी ऋण, सोलर पंप और ट्रैक्टर सब्सिडी के लिए तुरंत आवेदन करें' : 'Apply online for PM-KISAN, PMFBY Crop Insurance, KCC 4% Loans, Solar Pumps, Micro-Irrigation & Machinery.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10 flex-shrink-0">
          <span className="hidden sm:inline-block text-xs font-black bg-white/20 px-3 py-1.5 rounded-xl text-white group-hover:bg-white group-hover:text-emerald-800 transition-colors">
            {language === 'te' ? 'దరఖాస్తు చేసుకోండి' : language === 'hi' ? 'आवेदन करें' : 'Explore & Apply'} →
          </span>
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>

      {/* Feature Spotlights: Price Predictor & Emerging AgriTech */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Price Predictor Banner */}
        <div 
          onClick={() => onNavigate('price-predictor')}
          className="p-5 sm:p-6 rounded-3xl border border-emerald-200 bg-white hover:bg-emerald-50/40 flex items-center justify-between gap-4 cursor-pointer hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  📈 {t.allIndiaPortal || 'All India'}
                </span>
                <span className="text-xs font-semibold text-slate-500">{t.pricePredictor || 'Price Intelligence'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-outfit text-slate-900 mt-0.5">
                {t.bannerPriceTitle || 'District Price Predictor & Mandi Trends'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.bannerPriceDesc || 'Check 30-day AI price forecasts & MSP across every district in India.'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
        </div>

        {/* Emerging AgriTech Banner */}
        <div 
          onClick={() => onNavigate('agritech')}
          className="p-5 sm:p-6 rounded-3xl border border-purple-200 bg-white hover:bg-purple-50/40 flex items-center justify-between gap-4 cursor-pointer hover:border-purple-400 hover:-translate-y-1 transition-all duration-300 shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
              <Cpu className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  🚀 80% Subsidy
                </span>
                <span className="text-xs font-semibold text-slate-500">Next-Gen Tech</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-outfit text-slate-900 mt-0.5">
                {t.bannerAgriTechTitle || 'Newly Emerging AgriTech & Innovations'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.bannerAgriTechDesc || 'AI Kisan Drones, IoT Drip Sensors, Solar Cold Rooms & Carbon Credits.'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
        </div>

      </div>

      {/* AI Crop Advisory & Disease Doctor Dual Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Seeds & Fertilizer Recommendation Banner */}
        <div 
          onClick={() => onNavigate('crop-advisory')}
          className="card-clean p-5 sm:p-6 border border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 flex items-center justify-between gap-4 cursor-pointer hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform flex-shrink-0">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  🌱 ICAR / KVK AI
                </span>
                <span className="text-xs font-semibold text-slate-500">{t.seedsFertilizerAI || 'Seed & NPK Advisor'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-outfit text-slate-900 mt-0.5">
                {t.bannerSeedFertilizerTitle || 'Seeds & Fertilizer Recommender'}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {t.bannerSeedFertilizerDesc || 'AI recommends best seed hybrids, split NPK doses & pesticides based on soil, season & previous crop.'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
        </div>

        {/* AI Crop Doctor Disease Diagnosis Banner */}
        <div 
          onClick={() => onNavigate('disease-doctor')}
          className="card-clean p-5 sm:p-6 border border-teal-200 bg-white flex items-center justify-between gap-4 cursor-pointer hover:border-teal-400 hover:-translate-y-1 transition-all duration-300 shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-300 text-teal-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform flex-shrink-0">
              <Stethoscope className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  ✨ {t.cropDoctor || 'Instant AI Doctor'}
                </span>
                <span className="text-xs font-semibold text-slate-500">Leaf & Pest Scan</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-outfit text-slate-900 mt-0.5">
                {t.bannerDoctorTitle || 'Crop Doctor AI (కిసాన్ డాక్టర్)'}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {t.bannerDoctorDesc || 'Snap leaf photo. Get disease identification, CIB&RC chemical doses & organic solutions.'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1.5 transition-transform flex-shrink-0" />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ⛅ AGRICULTURAL WEATHER & MANDI MICRO-CLIMATE ADVISORY HUB */}
      {/* ========================================================================= */}
      <div className="card-clean p-6 sm:p-8 border-2 border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-emerald-50/40 shadow-sm relative overflow-hidden space-y-6">
        
        {/* Top Header of Weather Widget */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 flex-shrink-0">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  🛰️ {language === 'te' ? 'లైవ్ శాటిలైట్ వాతావరణం' : language === 'hi' ? 'लाइव सैटेलाइट मौसम' : 'Live Satellite Weather'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  📍 {user?.village || 'Warangal'}, {user?.district || 'Warangal Urban'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 mt-0.5">
                {language === 'te' ? 'రైతు వాతావరణ సమాచారం & పంట సలహా' : language === 'hi' ? 'कृषि मौसम पूर्वानुमान एवं दैनिक फसल सलाह' : 'Agricultural Weather & Micro-Climate Advisory'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-800 shadow-xs">
              Updated: Just Now • 29°C
            </span>
          </div>
        </div>

        {/* Live Weather Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          
          {/* 1. Main Temp Card */}
          <div className="col-span-2 sm:col-span-2 p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md flex items-center justify-between">
            <div>
              <div className="text-xs text-sky-100 font-bold uppercase tracking-wider">
                {language === 'te' ? 'ప్రస్తుత ఉష్ణోగ్రత' : language === 'hi' ? 'वर्तमान तापमान' : 'Current Temp'}
              </div>
              <div className="text-3xl sm:text-4xl font-black font-outfit mt-1">
                29°C
              </div>
              <div className="text-xs font-semibold text-sky-100 mt-0.5">
                {language === 'te' ? 'ఎండగా ఉంది • స్పష్టమైన ఆకాశం' : language === 'hi' ? 'धूप और साफ आसमान' : 'Sunny & Clear Skies'}
              </div>
            </div>
            <Sun className="w-12 h-12 text-amber-300 animate-spin-slow" />
          </div>

          {/* 2. Humidity */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase">{language === 'te' ? 'తేమ' : language === 'hi' ? 'नमी' : 'Humidity'}</span>
              <Droplets className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl font-black font-outfit text-slate-900 mt-2">
              58%
            </div>
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block w-max">
              {language === 'te' ? 'అనుకూలం' : language === 'hi' ? 'अनुकूल' : 'Optimal'}
            </div>
          </div>

          {/* 3. Wind Speed */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase">{language === 'te' ? 'గాలి వేగం' : language === 'hi' ? 'हवा की गति' : 'Wind Speed'}</span>
              <Wind className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-xl font-black font-outfit text-slate-900 mt-2">
              12 <span className="text-xs text-slate-500">km/h</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-1">
              ENE Direction
            </div>
          </div>

          {/* 4. Rain Chance */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase">{language === 'te' ? 'వర్షం అవకాశం' : language === 'hi' ? 'वर्षा की संभावना' : 'Rain Chance'}</span>
              <Umbrella className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-black font-outfit text-slate-900 mt-2">
              5%
            </div>
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block w-max">
              {language === 'te' ? 'వర్షం లేదు' : language === 'hi' ? 'शुष्क दिन' : 'Dry Day'}
            </div>
          </div>

          {/* 5. UV Index & Air Quality */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase">{language === 'te' ? 'UV ఇండెక్స్' : language === 'hi' ? 'यूवी इंडेक्स' : 'UV Index'}</span>
              <Eye className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black font-outfit text-slate-900 mt-2">
              6 <span className="text-xs text-slate-500">Mod</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-1">
              AQI: 42 (Clean)
            </div>
          </div>

        </div>

        {/* 5-Day Farm Weather Forecast Strip */}
        <div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{language === 'te' ? 'రాబోయే 5 రోజుల వాతావరణ సూచన' : language === 'hi' ? 'अगले 5 दिनों का कृषि मौसम पूर्वानुमान' : '5-Day Agricultural Forecast'}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">{user?.district || 'Warangal'} Region</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { day: 'Today', day_te: 'ఈరోజు', day_hi: 'आज', temp: '29° / 20°', condition: 'Sunny', condition_te: 'ఎండగా', condition_hi: 'धूप', icon: Sun, color: 'text-amber-500' },
              { day: 'Tomorrow', day_te: 'రేపు', day_hi: 'कल', temp: '31° / 21°', condition: 'Clear Sky', condition_te: 'నిర్మల ఆకాశం', condition_hi: 'साफ', icon: CloudSun, color: 'text-sky-500' },
              { day: 'Wed', day_te: 'బుధవారం', day_hi: 'बुधवार', temp: '30° / 22°', condition: 'Partly Cloudy', condition_te: 'కొద్దిగా మబ్బులు', condition_hi: 'आंशिक बादल', icon: Cloud, color: 'text-slate-500' },
              { day: 'Thu', day_te: 'గురువారం', day_hi: 'गुरुवार', temp: '28° / 19°', condition: 'Light Shower', condition_te: 'చిరుజల్లులు', condition_hi: 'हल्की बारिश', icon: CloudRain, color: 'text-blue-500' },
              { day: 'Fri', day_te: 'శుక్రవారం', day_hi: 'शुक्रवार', temp: '30° / 20°', condition: 'Sunny', condition_te: 'ఎండగా', condition_hi: 'धूप', icon: Sun, color: 'text-amber-500' }
            ].map((d, i) => {
              const IconComponent = d.icon;
              return (
                <div key={i} className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all text-center flex flex-col items-center justify-between shadow-xs">
                  <div className="text-[11px] font-black text-slate-800">
                    {language === 'te' ? d.day_te : language === 'hi' ? d.day_hi : d.day}
                  </div>
                  <IconComponent className={`w-7 h-7 my-1.5 ${d.color}`} />
                  <div className="text-xs font-black text-slate-900 font-outfit">{d.temp}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {language === 'te' ? d.condition_te : language === 'hi' ? d.condition_hi : d.condition}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Agricultural Weather Advisories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* 1. Harvest Drying */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
            <span className="text-xl">🌾</span>
            <div className="text-xs">
              <div className="font-extrabold text-emerald-900">
                {language === 'te' ? 'పంట ఎండబెట్టడం (Drying)' : language === 'hi' ? 'फसल सुखाना एवं नमी नियंत्रण' : 'Harvest Drying Advisory'}
              </div>
              <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">
                {language === 'te' ? 'ఎండ తీవ్రత బాగుంది. వరి/పత్తి తేమను 14% లోపుకు తగ్గించడానికి ఉత్తమ సమయం.' : language === 'hi' ? 'अच्छी धूप उपलब्ध है। एमएसपी मानक (14% से कम नमी) के लिए धान सुखाने का सही समय।' : 'Clear sun conditions. Ideal for sun-drying harvested Paddy/Cotton to reach <14% MSP moisture norm.'}
              </p>
            </div>
          </div>

          {/* 2. Spraying Window */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <span className="text-xl">🚜</span>
            <div className="text-xs">
              <div className="font-extrabold text-amber-900">
                {language === 'te' ? 'పురుగుమందుల స్ప్రే సమయం' : language === 'hi' ? 'कीटनाशक छिड़काव समय' : 'Spraying Window Alert'}
              </div>
              <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">
                {language === 'te' ? 'గాలి వేగం తక్కువగా ఉంది. ఉదయం 7:00 నుండి 10:30 వరకు స్ప్రే చేయడానికి అనుకూలం.' : language === 'hi' ? 'सुबह 7:00 से 10:30 बजे तक कम हवा में कीटनाशक व पोषक तत्वों का छिड़काव करें।' : 'Wind speed is low (<12 km/h). Safe spraying window is 07:00 AM – 10:30 AM.'}
              </p>
            </div>
          </div>

          {/* 3. Irrigation */}
          <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-start gap-3">
            <span className="text-xl">💧</span>
            <div className="text-xs">
              <div className="font-extrabold text-sky-900">
                {language === 'te' ? 'నీటిపారుదల సలహా' : language === 'hi' ? 'सिंचाई सलाह' : 'Irrigation Advisory'}
              </div>
              <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">
                {language === 'te' ? 'నేలలో తేమ సాధారణంగా ఉంది. కూరగాయలు మరియు ఉద్యానవన పంటలకు సాయంత్రం తక్కువ నీరు చాలు.' : language === 'hi' ? 'मृदा नमी सामान्य है। शाम के समय ड्रिप सिंचाई से हल्की पानी की खुराक दें।' : 'Soil moisture normal. Light evening drip irrigation recommended for vegetables and orchards.'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Primary Highlight: Active Booking Card */}
      {activeBooking ? (
        <div className="card-clean p-6 sm:p-8 border-2 border-emerald-300 bg-white relative overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-emerald"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {t.activeBookingTitle}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 tracking-tight flex items-center gap-3">
                <span>{activeBooking.token_number}</span>
                <Badge status={activeBooking.status} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSelectBooking(activeBooking);
                  onNavigate('token-view');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-sm cursor-pointer"
              >
                View Token Pass
              </button>
              <button
                onClick={() => onNavigate('calendar')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Calendar</span>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-slate-800">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">Produce & Quantity</div>
              <div className="text-sm font-extrabold text-slate-900">
                {activeBooking.crop_name} • {activeBooking.quantity_quintals} Qtl
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">Procurement Center</div>
              <div className="text-sm font-extrabold text-slate-900 truncate max-w-[180px]">
                {activeBooking.center_name}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">Date & Slot Time</div>
              <div className="text-sm font-extrabold text-emerald-700">
                {activeBooking.booking_date} • {activeBooking.slot_time}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">Queue Status Ahead</div>
              <div className="text-sm sm:text-base font-extrabold text-amber-600 font-outfit">
                {queueStatus?.peopleAhead ?? 2} Ahead (~{queueStatus?.estimatedWaitMins ?? 15} min wait)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-clean p-8 border border-slate-200 text-center space-y-4 bg-white">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto animate-float-gentle">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-bold text-slate-900 font-outfit">{t.noActiveBooking}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Ready to sell your harvested crops at guaranteed MSP? Reserve your mandi slot in 2 minutes.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('book-slot')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/20 hover:scale-105 cursor-pointer"
          >
            {t.bookFirstSlot}
          </button>
        </div>
      )}

      {/* Quick Action Tiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
            <span>⚡</span>
            <span>{t.quickActions}</span>
          </h2>
          <span className="text-xs font-semibold text-emerald-700">1-Tap Fast Actions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
          <div 
            onClick={() => onNavigate('book-slot')}
            className="card-clean p-4 cursor-pointer flex flex-col items-center text-center group hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 bg-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0.5">{t.bookSlot}</div>
            <div className="text-[10px] text-slate-500">Mandi center slot</div>
          </div>

          <div 
            onClick={() => onNavigate('crop-advisory')}
            className="card-clean p-4 cursor-pointer flex flex-col items-center text-center group hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 bg-white border-emerald-100"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0.5">Seeds & Fertilizer</div>
            <div className="text-[10px] text-emerald-700 font-bold">NPK & Crop AI</div>
          </div>

          <div 
            onClick={() => onNavigate('agritech')}
            className="card-clean p-4 cursor-pointer flex flex-col items-center text-center group hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 bg-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs">
              <Cpu className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0.5">Emerging Tech</div>
            <div className="text-[10px] text-purple-700 font-bold">Drones & IoT</div>
          </div>

          <div 
            onClick={() => onNavigate('calendar')}
            className="card-clean p-4 cursor-pointer flex flex-col items-center text-center group hover:border-cyan-500 hover:-translate-y-1 transition-all duration-300 bg-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-2xs">
              <Calendar className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0.5">{t.calendar || 'Calendar'}</div>
            <div className="text-[10px] text-slate-500">Mandi schedule</div>
          </div>

          <div 
            onClick={() => onNavigate('disease-doctor')}
            className="card-clean p-4 cursor-pointer flex flex-col items-center text-center group hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 bg-white border-emerald-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
              <Stethoscope className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0.5">Crop Doctor</div>
            <div className="text-[10px] text-emerald-700 font-bold">Disease & Pest AI</div>
          </div>

          <div 
            onClick={() => onNavigate('price-predictor')}
            className="card-clean p-4 cursor-pointer flex flex-col items-center text-center group hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 bg-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0.5">Price Predictor</div>
            <div className="text-[10px] text-emerald-700 font-bold">Moisture & Yield AI</div>
          </div>

          <div 
            onClick={() => onNavigate('help')}
            className="card-clean p-4 cursor-pointer flex flex-col items-center text-center group hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 bg-white border-amber-100 col-span-2 sm:col-span-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs">
              <HelpCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-0.5">{t.helpDesk || 'Help Centre'}</div>
            <div className="text-[10px] text-amber-700 font-bold">1800-180-1551</div>
          </div>
        </div>
      </div>

      {/* Live MSP Mandi Rates Ticker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-outfit text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Today's Mandi Market Rates (MSP)</span>
          </h2>
          <button 
            onClick={() => onNavigate('price-predictor')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open All Districts Predictor</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-clean p-5 border border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 text-2xl flex items-center justify-center shadow-2xs">
                🌾
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Paddy (Grade A)</div>
                <div className="text-xs text-slate-500">Govt MSP Benchmark</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold font-outfit text-slate-900">₹2,300<span className="text-xs font-normal text-slate-500">/Qtl</span></div>
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">▲ +2.4%</span>
            </div>
          </div>

          <div className="card-clean p-5 border border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 text-2xl flex items-center justify-center shadow-2xs">
                ☁️
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Cotton (Long Staple)</div>
                <div className="text-xs text-slate-500">Warangal Market</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold font-outfit text-slate-900">₹7,020<span className="text-xs font-normal text-slate-500">/Qtl</span></div>
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">▲ +1.8%</span>
            </div>
          </div>

          <div className="card-clean p-5 border border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 text-2xl flex items-center justify-center shadow-2xs">
                🌽
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Maize (Yellow)</div>
                <div className="text-xs text-slate-500">Direct Procurement</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold font-outfit text-slate-900">₹2,090<span className="text-xs font-normal text-slate-500">/Qtl</span></div>
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">▲ +0.9%</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
