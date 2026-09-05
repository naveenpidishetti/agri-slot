import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Clock,
  Sparkles,
  Info,
  AlertCircle,
  CheckCircle2,
  Search,
  X,
  Sun,
  Moon,
  Navigation,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { ALL_INDIAN_STATES } from '../../data/indiaData';
import AICaptionDisclaimer from '../common/AICaptionDisclaimer';
import { Crop, ProcurementCenter } from '../../types';

interface SlotCapacity {
  time: string;
  maxSlots: number;
  bookedCount: number;
  availableSlots: number;
  isFull: boolean;
}

interface SlotBookingWizardProps {
  onBack: () => void;
  onBookingSuccess: (booking: any) => void;
}

export const SlotBookingWizard: React.FC<SlotBookingWizardProps> = ({
  onBack,
  onBookingSuccess
}) => {
  const { language } = useLanguage();

  // Step flow state
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form selections
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [cropSearch, setCropSearch] = useState<string>('');
  const [cropCategory, setCropCategory] = useState<string>('all');

  const [quantity, setQuantity] = useState<number>(25);
  const [location, setLocation] = useState<{ state: string; district: string; village: string }>({
    state: 'Telangana',
    district: 'Warangal Urban',
    village: 'Hasanparthy'
  });
  const [farmerEmail, setFarmerEmail] = useState<string>('vasanthreddy302@gmail.com');

  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<ProcurementCenter | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM – 11:30 AM');
  const [slotCapacities, setSlotCapacities] = useState<SlotCapacity[]>([]);
  const [slotTimeFilter, setSlotTimeFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  const [aiRec, setAiRec] = useState<any>(null);

  // Load Crops & Initial Centers
  useEffect(() => {
    loadCrops();
    loadCentersForDistrict(location.state, location.district);
  }, []);

  const loadCrops = async () => {
    try {
      const data = await api.getCrops();
      if (data?.crops && data.crops.length > 0) {
        setCrops(data.crops);
        if (!selectedCrop) setSelectedCrop(data.crops[0]);
      }
    } catch (e) {
      console.warn('Could not load crops', e);
    }
  };

  const loadCentersForDistrict = async (stateName: string, districtName: string) => {
    try {
      const data = await api.getCenters(stateName, districtName);
      if (data?.centers && data.centers.length > 0) {
        setCenters(data.centers);
        if (!selectedCenter || !data.centers.some((c: ProcurementCenter) => c.id === selectedCenter.id)) {
          setSelectedCenter(data.centers[0]);
        }
      }
    } catch (e) {
      console.warn('Could not load centers', e);
    }
  };

  const handleStateChange = (stateName: string) => {
    const stateObj = ALL_INDIAN_STATES.find((s: any) => s.state === stateName);
    const firstDistrict = stateObj?.districts[0] || 'District Hub';
    setLocation({
      ...location,
      state: stateName,
      district: firstDistrict
    });
    loadCentersForDistrict(stateName, firstDistrict);
  };

  const handleDistrictChange = (districtName: string) => {
    setLocation({
      ...location,
      district: districtName
    });
    loadCentersForDistrict(location.state, districtName);
  };

  useEffect(() => {
    if (selectedCenter?.id && selectedDate) {
      loadCapacities(selectedCenter.id, selectedDate);
    }
  }, [selectedCenter?.id, selectedDate]);

  const loadCapacities = async (centerId: string, date: string) => {
    try {
      const res = await api.getSlotCapacity(centerId, date);
      if (res?.slots) {
        setSlotCapacities(res.slots);
        const currentSlotInfo = res.slots.find((s: SlotCapacity) => s.time === selectedSlot);
        if (currentSlotInfo && currentSlotInfo.isFull) {
          const firstOpen = res.slots.find((s: SlotCapacity) => !s.isFull);
          if (firstOpen) setSelectedSlot(firstOpen.time);
        }
      }
    } catch (e) {
      console.warn('Could not load dynamic slot capacity', e);
    }
  };

  // Helper to get crop emoji icon
  const getCropIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('paddy') || n.includes('rice')) return '🌾';
    if (n.includes('cotton')) return '☁️';
    if (n.includes('wheat')) return '🌾';
    if (n.includes('maize') || n.includes('corn')) return '🌽';
    if (n.includes('chilli') || n.includes('mirchi')) return '🌶️';
    if (n.includes('turmeric') || n.includes('haldi')) return '🫚';
    if (n.includes('soybean') || n.includes('gram') || n.includes('pulse')) return '🫘';
    if (n.includes('onion')) return '🧅';
    if (n.includes('tomato')) return '🍅';
    if (n.includes('sugarcane')) return '🎋';
    return '🌱';
  };

  // Actions
  const handleFetchAiRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const rec = await api.getSlotRecommendation({
        cropId: selectedCrop?.id || 'crop-paddy',
        quantityQuintals: quantity,
        userLocation: `${location.village}, ${location.district}, ${location.state}`,
        preferredDate: selectedDate,
        state: location.state,
        district: location.district
      });
      setAiRec(rec);
      if (rec?.recommendedCenter) {
        setSelectedCenter(rec.recommendedCenter);
      }
      if (rec?.recommendedSlot) {
        setSelectedSlot(rec.recommendedSlot);
      }
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Could not fetch AI recommendation');
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedCenter || !selectedCrop) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.createBooking({
        center_id: selectedCenter.id,
        crop_id: selectedCrop.id,
        quantity_quintals: quantity,
        booking_date: selectedDate,
        slot_time: selectedSlot,
        farmer_email: farmerEmail
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      onBookingSuccess(res.booking);
    } catch (err: any) {
      setError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Select Crop' },
    { num: 2, title: 'Quantity' },
    { num: 3, title: 'Location' },
    { num: 4, title: 'Email Pass' },
    { num: 5, title: 'Mandi Center' },
    { num: 6, title: 'Time Slot' },
    { num: 7, title: 'Confirm' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6 pb-32 text-slate-900">

      {/* Top Header - Minimal Phone Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
          Step {step} of 7
        </span>
      </div>

      {/* Progress Stepper - Clean & Minimal */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        {/* Desktop Stepper */}
        <div className="hidden sm:flex items-center justify-between mb-1">
          {stepsList.map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              className={`flex items-center gap-1.5 cursor-pointer transition-all ${
                s.num === step
                  ? 'text-emerald-700 font-extrabold scale-105'
                  : s.num < step
                  ? 'text-slate-700 font-semibold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  s.num === step
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                    : s.num < step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {s.num < step ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
              </div>
              <span className="text-xs">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Mobile Simple Stepper Bar */}
        <div className="sm:hidden flex items-center justify-between text-xs font-bold text-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
              {step}
            </span>
            <span>Step {step} of 7: <strong className="text-emerald-700">{stepsList[step - 1]?.title}</strong></span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">{Math.round((step / 7) * 100)}%</span>
        </div>

        {/* Clean Linear Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SELECT CROP */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="card-clean p-4 sm:p-6 space-y-4 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
              <span>🌾</span>
              <span>Select Crop for Mandi Procurement</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Choose the crop you want to sell at verified MSP rates.
            </p>
          </div>

          {/* Clean Search Bar & Category Filter Pills for Mobile */}
          <div className="space-y-2 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder="Search crop name (e.g. Paddy, Cotton, Wheat)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              {cropSearch && (
                <button
                  type="button"
                  onClick={() => setCropSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All Crops' },
                { id: 'cereal', label: '🌾 Cereals' },
                { id: 'fiber', label: '☁️ Fiber' },
                { id: 'oilseed', label: '🌻 Oilseeds' },
                { id: 'spices', label: '🌶️ Spices' },
                { id: 'horticulture', label: '🥔 Vegetables' },
                { id: 'commercial', label: '🎋 Commercial' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCropCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    cropCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Crops Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[440px] overflow-y-auto p-1">
            {crops
              .filter((c) => {
                const matchesCat =
                  cropCategory === 'all' ||
                  c.category.toLowerCase().includes(cropCategory.toLowerCase());
                const matchesQuery =
                  c.name.toLowerCase().includes(cropSearch.toLowerCase());
                return matchesCat && matchesQuery;
              })
              .map((c) => {
                const isSelected = selectedCrop?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCrop(c);
                      setStep(2);
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-400/40'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{getCropIcon(c.name)}</span>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-1.5">{c.name}</h3>
                      <div className="text-[11px] text-slate-500">{c.category}</div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">MSP:</span>
                      <span className="font-black text-emerald-700">₹{c.msp_price_per_quintal}/Q</span>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-3 flex items-center justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (selectedCrop) setStep(2);
                else setError('Please select a crop');
              }}
              disabled={!selectedCrop}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: QUANTITY SELECTION (CLEAN STEPPER + PRESETS) */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="card-clean p-4 sm:p-6 space-y-4 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
              <span>⚖️</span>
              <span>Enter Harvest Quantity</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Selected: <strong className="text-emerald-700">{selectedCrop?.name}</strong> (MSP: ₹{selectedCrop?.msp_price_per_quintal}/Q)
            </p>
          </div>

          {/* Big Bold Stepper Counter */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(5, quantity - 5))}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-black text-xl flex items-center justify-center shadow-xs active:scale-90 cursor-pointer"
              >
                -5
              </button>

              <div className="px-6 py-2 rounded-2xl bg-white border border-emerald-300 shadow-sm min-w-[140px]">
                <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-outfit">{quantity}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quintals ({(quantity * 100).toLocaleString('en-IN')} kg)</div>
              </div>

              <button
                type="button"
                onClick={() => setQuantity(Math.min(500, quantity + 5))}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-black text-xl flex items-center justify-center shadow-xs active:scale-90 cursor-pointer"
              >
                +5
              </button>
            </div>

            {/* Quick Preset Chips */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              {[10, 25, 50, 75, 100, 150].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    quantity === preset
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset} Q
                </button>
              ))}
            </div>

            {/* Price Preview */}
            <div className="pt-2 text-xs font-bold text-slate-600">
              Estimated Total MSP Value:{' '}
              <strong className="text-emerald-700 text-sm font-black">
                ₹{((selectedCrop?.msp_price_per_quintal || 0) * quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: FARM LOCATION */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="card-clean p-4 sm:p-6 space-y-4 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
                <span>📍</span>
                <span>Farm Location & Mandi Hub</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Matches you with the nearest APMC procurement centers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setLocation({
                  state: 'Telangana',
                  district: 'Warangal Urban',
                  village: 'Hasanparthy, Warangal Rural'
                });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-Detect GPS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <select
                value={location.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {ALL_INDIAN_STATES.map((s: any) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District / Mandi Division</label>
              <select
                value={location.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {(ALL_INDIAN_STATES.find((s: any) => s.state === location.state)?.districts || ['District Hub']).map(
                  (d: string) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Village / Mandal / Town</label>
              <input
                type="text"
                value={location.village}
                onChange={(e) => setLocation({ ...location, village: e.target.value })}
                placeholder="e.g. Hasanparthy, Warangal"
                className="w-full p-3 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Found <strong>{centers.length}</strong> official procurement centers operating in <strong>{location.district}</strong>.
            </span>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: EMAIL GATE PASS */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="card-clean p-4 sm:p-6 space-y-4 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
              <span>📧</span>
              <span>Digital QR Token & Email Confirmation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              We send your official QR Gate Pass & Schedule to this email.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Farmer Contact Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={farmerEmail}
                  onChange={(e) => setFarmerEmail(e.target.value)}
                  placeholder="e.g. vasanthreddy302@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant Delivery:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-emerald-800 text-[11px]">
                <li>Gate Entry QR Code Pass for zero-queue entry</li>
                <li>Live Queue Position & Assigned Weighbridge Counter</li>
              </ul>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleFetchAiRecommendation}
              disabled={loading || !farmerEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing...' : 'Get AI Mandi Match'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: APMC CENTER SELECTION */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="card-clean p-4 sm:p-6 space-y-4 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
              <span>🏢</span>
              <span>Select APMC Procurement Center</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {location.district}, {location.state}
            </p>
          </div>

          {/* AI Recommendation Banner */}
          {aiRec && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <span>AI Optimal Mandi Match</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    Fastest Weighbridge
                  </span>
                </div>
                <p className="text-slate-700 mt-0.5 font-medium text-[11px]">
                  {aiRec.reason || `Recommended based on low congestion and proximity.`}
                </p>
              </div>
            </div>
          )}

          {/* Centers List */}
          <div className="space-y-2">
            {centers.map((c: ProcurementCenter) => {
              const isSelected = selectedCenter?.id === c.id;
              const isAiPick = aiRec?.recommendedCenter?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCenter(c);
                    setStep(6);
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-400/40'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">{c.name}</h3>
                      {isAiPick && (
                        <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full">
                          AI Pick
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                      <span>{c.village || location.district}</span>
                      <span>•</span>
                      <span>~{c.distance_km || 8.5} km</span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedCenter) setStep(6);
                else setError('Please select a center');
              }}
              disabled={!selectedCenter}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: TIME SLOT SELECTION */}
      {/* ========================================================================= */}
      {step === 6 && (
        <div className="card-clean p-4 sm:p-6 space-y-4 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
                <span>⏰</span>
                <span>Choose Date & Preferred Time Slot</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Max 3 trucks per 30-minute window for zero wait time.
              </p>
            </div>

            {/* Morning / Afternoon filter chips */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSlotTimeFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  slotTimeFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSlotTimeFilter('morning')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  slotTimeFilter === 'morning'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Morning</span>
              </button>
              <button
                type="button"
                onClick={() => setSlotTimeFilter('afternoon')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  slotTimeFilter === 'afternoon'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Afternoon</span>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Arrival Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-60 p-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Time Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(slotCapacities.length > 0
              ? slotCapacities
              : [
                  { time: '09:00 AM – 09:30 AM', maxSlots: 3, bookedCount: 1, availableSlots: 2, isFull: false },
                  { time: '09:30 AM – 10:00 AM', maxSlots: 3, bookedCount: 3, availableSlots: 0, isFull: true },
                  { time: '10:00 AM – 10:30 AM', maxSlots: 3, bookedCount: 2, availableSlots: 1, isFull: false },
                  { time: '10:30 AM – 11:00 AM', maxSlots: 3, bookedCount: 1, availableSlots: 2, isFull: false },
                  { time: '11:00 AM – 11:30 AM', maxSlots: 3, bookedCount: 1, availableSlots: 2, isFull: false },
                  { time: '11:30 AM – 12:00 PM', maxSlots: 3, bookedCount: 0, availableSlots: 3, isFull: false },
                  { time: '02:00 PM – 02:30 PM', maxSlots: 3, bookedCount: 2, availableSlots: 1, isFull: false },
                  { time: '02:30 PM – 03:00 PM', maxSlots: 3, bookedCount: 3, availableSlots: 0, isFull: true },
                  { time: '03:00 PM – 03:30 PM', maxSlots: 3, bookedCount: 1, availableSlots: 2, isFull: false },
                  { time: '03:30 PM – 04:00 PM', maxSlots: 3, bookedCount: 0, availableSlots: 3, isFull: false }
                ]
            )
              .filter((slotInfo) => {
                if (slotTimeFilter === 'morning') return slotInfo.time.includes('AM');
                if (slotTimeFilter === 'afternoon') return slotInfo.time.includes('PM');
                return true;
              })
              .map((slotInfo) => {
                const isSelected = selectedSlot === slotInfo.time;
                const isFull = slotInfo.isFull;

                return (
                  <button
                    key={slotInfo.time}
                    type="button"
                    disabled={isFull}
                    onClick={() => {
                      setSelectedSlot(slotInfo.time);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                      isFull
                        ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-300'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{slotInfo.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isFull ? (
                          <span className="text-rose-600 font-bold">Full</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">
                            {slotInfo.availableSlots} spots left
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isFull
                          ? 'bg-rose-100 text-rose-700'
                          : isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isFull ? '✕' : isSelected ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedSlot) setStep(7);
                else setError('Please select a time slot');
              }}
              disabled={!selectedSlot}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: REVIEW & CONFIRM */}
      {/* ========================================================================= */}
      {step === 7 && (
        <div className="card-clean p-4 sm:p-6 space-y-4 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
              <span>📋</span>
              <span>Review & Confirm Slot Booking</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Review your appointment summary and tap confirm.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crop Details</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{selectedCrop?.name}</div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  MSP: ₹{selectedCrop?.msp_price_per_quintal} / Q
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity & Value</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{quantity} Quintals</div>
                <div className="text-[11px] font-black text-emerald-700">
                  Total: ₹{((selectedCrop?.msp_price_per_quintal || 0) * quantity).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mandi Procurement Center</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{selectedCenter?.name}</div>
                <div className="text-[11px] text-slate-500">
                  {location.village}, {location.district}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time Slot</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{selectedDate}</div>
                <div className="text-[11px] font-bold text-emerald-700">{selectedSlot}</div>
              </div>

            </div>

            <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span className="truncate">QR Token: {farmerEmail}</span>
              </div>
              <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded-md">Instant QR</span>
            </div>
          </div>

          <AICaptionDisclaimer />

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(6)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Confirming...' : 'Confirm & Generate Digital Token'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📱 STICKY MOBILE ACTION BAR FOR ONE-THUMB STEPPING */}
      {/* ========================================================================= */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl px-3 py-2 flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else onBack();
          }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{step === 1 ? 'Exit' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (step === 1 && selectedCrop) setStep(2);
            else if (step === 2) setStep(3);
            else if (step === 3) setStep(4);
            else if (step === 4) handleFetchAiRecommendation();
            else if (step === 5 && selectedCenter) setStep(6);
            else if (step === 6 && selectedSlot) setStep(7);
            else if (step === 7) handleConfirmBooking();
          }}
          disabled={
            (step === 1 && !selectedCrop) ||
            (step === 4 && (!farmerEmail.trim() || loading)) ||
            (step === 5 && !selectedCenter) ||
            (step === 6 && !selectedSlot) ||
            (step === 7 && loading)
          }
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {step === 7 ? (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Confirming...' : 'Confirm & Generate Token'}</span>
            </>
          ) : step === 4 ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing...' : 'Get AI Mandi Match'}</span>
            </>
          ) : (
            <>
              <span>Continue (Step {step + 1})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
