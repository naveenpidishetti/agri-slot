import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { ALL_INDIAN_STATES } from '../../data/indiaData';
import { PricePredictionData, PricePredictionFactors } from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  Building2, 
  MapPin, 
  Droplets, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  Camera, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Layers, 
  Scale, 
  DollarSign, 
  Info,
  ChevronRight,
  Sliders,
  Sun
} from 'lucide-react';

import { AICaptionDisclaimer } from '../common/AICaptionDisclaimer';
interface PricePredictorProps {
  onBack?: () => void;
  onBookSlot?: () => void;
}

export const PricePredictor: React.FC<PricePredictorProps> = ({ onBack, onBookSlot }) => {
  const { language, t } = useLanguage();

  // Basic Location & Crop State
  const [selectedState, setSelectedState] = useState<string>('Telangana');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Warangal Urban');
  const [selectedCrop, setSelectedCrop] = useState<string>('Paddy (Dhan)');

  // Multi-Factor Inputs
  const [moisturePercent, setMoisturePercent] = useState<number>(13.5);
  const [daysAfterHarvest, setDaysAfterHarvest] = useState<number>(2);
  const [brokenGrainPercent, setBrokenGrainPercent] = useState<number>(2.0);
  const [foreignMatterPercent, setForeignMatterPercent] = useState<number>(1.0);
  const [appearingDisease, setAppearingDisease] = useState<string>('NONE');
  const [lotQuantity, setLotQuantity] = useState<number>(40);

  // Optional Yield Image Upload & Visual Analysis
  const [yieldImage, setYieldImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prediction, setPrediction] = useState<PricePredictionData | null>(null);
  const [loading, setLoading] = useState(false);

  const availableDistricts = ALL_INDIAN_STATES.find(s => s.state === selectedState)?.districts || ['Warangal Urban'];

  const supportedCrops = [
    { name: 'Paddy (Dhan)', icon: '🌾', category: 'Cereal', msp: 2300, faqMoisture: 14.0 },
    { name: 'Wheat (Gehun)', icon: '🌾', category: 'Cereal', msp: 2275, faqMoisture: 12.0 },
    { name: 'Cotton (Kapas)', icon: '☁️', category: 'Fiber', msp: 7020, faqMoisture: 8.0 },
    { name: 'Maize (Makka)', icon: '🌽', category: 'Coarse Cereal', msp: 2090, faqMoisture: 14.0 },
    { name: 'Soybean', icon: '🫘', category: 'Oilseed', msp: 4892, faqMoisture: 10.0 },
    { name: 'Bengal Gram (Chana)', icon: '🌱', category: 'Pulses', msp: 5440, faqMoisture: 10.0 },
    { name: 'Turmeric', icon: '🌿', category: 'Spices', msp: 13500, faqMoisture: 10.0 },
    { name: 'Chilli', icon: '🌶️', category: 'Spices', msp: 18200, faqMoisture: 10.0 }
  ];

  const currentCropMeta = supportedCrops.find(c => c.name === selectedCrop) || supportedCrops[0];

  const diseaseOptions = [
    { id: 'NONE', label: '✅ None / Clean Healthy Produce', desc: 'Zero visual infection or spots' },
    { id: 'BLAST_ROT', label: '🍂 Leaf/Neck Blast or Sheath Rot', desc: 'Brown lesions or grain discoloration (-₹65/Qtl)' },
    { id: 'BLIGHT_DISCOLOR', label: '🌾 Bacterial Blight / Discolored Grains', desc: 'Dull brownish glumes (-₹50/Qtl)' },
    { id: 'BOLLWORM_STAIN', label: '☁️ Cotton Bollworm / Staining', desc: 'Fibers stained, lower staple strength (-₹160/Qtl)' },
    { id: 'RUST_SMUT', label: '🌱 Rust / Smut Fungal Spots', desc: 'Powdery spores or blackened tips (-₹70/Qtl)' },
    { id: 'MOLD_SPOIL', label: '⚠️ Fungal Mold / High Moisture Spoilage', desc: 'High fungal spread, dockage penalty (-₹140/Qtl)' },
    { id: 'WEEVIL_INSECT', label: '🪲 Stored Grain Weevil / Borer Holes', desc: 'Storage insect tunneling (-₹90/Qtl)' }
  ];

  useEffect(() => {
    runPrediction();
  }, [
    selectedState, 
    selectedDistrict, 
    selectedCrop, 
    moisturePercent, 
    daysAfterHarvest, 
    brokenGrainPercent, 
    foreignMatterPercent, 
    appearingDisease, 
    lotQuantity,
    yieldImage
  ]);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const stateObj = ALL_INDIAN_STATES.find(s => s.state === stateName);
    if (stateObj && stateObj.districts.length > 0) {
      setSelectedDistrict(stateObj.districts[0]);
    }
  };

  const handleCropChange = (cropName: string) => {
    setSelectedCrop(cropName);
    const crop = supportedCrops.find(c => c.name === cropName);
    if (crop) {
      setMoisturePercent(crop.faqMoisture);
    }
  };

  const runPrediction = () => {
    setLoading(true);
    const factors: PricePredictionFactors = {
      moisturePercent,
      daysAfterHarvest,
      brokenGrainPercent,
      foreignMatterPercent,
      appearingDisease,
      yieldImage: yieldImage || undefined,
      lotQuantityQuintals: lotQuantity
    };

    setTimeout(() => {
      const data = api.predictCropPrice(selectedState, selectedDistrict, selectedCrop, factors);
      setPrediction(data);
      setLoading(false);
    }, 150);
  };

  // Image upload handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setYieldImage(base64);
      setTimeout(() => {
        setIsAnalyzingImage(false);
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setYieldImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const valuation = prediction?.valuation;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Multi-Factor Mandi Valuation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900">
            {t.pricePredictorTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.pricePredictorSubtitle}
          </p>
        </div>

        {onBookSlot && (
          <button
            onClick={onBookSlot}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>{t.bookSlotNow}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* AI Accuracy Disclaimer */}
      <AICaptionDisclaimer featureName="Mandi Price Intelligence & Quality AI" />

      {/* SECTION 1: Geography & Crop Selection */}
      <div className="card-clean p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Step 1 — Mandi District & Commodity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* State Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span>State (All India)</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer shadow-inner"
            >
              {ALL_INDIAN_STATES.map((s) => (
                <option key={s.state} value={s.state} className="bg-white text-slate-900">{s.state} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span>District APMC Yard</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer shadow-inner"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d} className="bg-white text-slate-900">{d}</option>
              ))}
            </select>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span>Harvested Crop</span>
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer shadow-inner"
            >
              {supportedCrops.map((c) => (
                <option key={c.name} value={c.name} className="bg-white text-slate-900">{c.icon} {c.name} (MSP: ₹{c.msp})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Crop Chips */}
        <div className="pt-2 flex flex-wrap gap-2">
          {supportedCrops.map((c) => {
            const isSelected = selectedCrop === c.name;
            return (
              <button
                key={c.name}
                onClick={() => handleCropChange(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-xs scale-105' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-80">(FAQ ≤{c.faqMoisture}%)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Multi-Factor Quality & Yield Parameters */}
      <div className="card-clean p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Step 2 — Quality & Harvest Condition Factors</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Govt FAQ Standard: ≤ {currentCropMeta.faqMoisture}% Moisture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Moisture Content */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Grain Moisture Level (%)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className={`text-base font-black font-outfit ${
                  moisturePercent <= currentCropMeta.faqMoisture ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {moisturePercent}%
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  (Standard: ≤{currentCropMeta.faqMoisture}%)
                </span>
              </div>
            </div>

            <input 
              type="range"
              min="8.0"
              max="24.0"
              step="0.5"
              value={moisturePercent}
              onChange={(e) => setMoisturePercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>8% (Bone Dry)</span>
              <span className="text-emerald-700 font-bold">{currentCropMeta.faqMoisture}% (FAQ Limit)</span>
              <span className="text-red-600 font-bold">24% (Wet / Penalty)</span>
            </div>

            {/* Live moisture badge */}
            <div className="text-[11px] font-medium pt-1">
              {moisturePercent <= currentCropMeta.faqMoisture ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Zero Government Moisture Deduction (Full Guaranteed Value)
                </span>
              ) : (
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {moisturePercent - currentCropMeta.faqMoisture}% above FAQ limit (Est. -₹{Math.round((moisturePercent - currentCropMeta.faqMoisture) * 45)}/Qtl cut)
                </span>
              )}
            </div>
          </div>

          {/* 2. Days Since Harvest & Lot Quantity */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Days Stored */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Harvest Age / Storage Duration</span>
                </label>
                <span className="text-sm font-extrabold text-slate-900">{daysAfterHarvest} Days</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { days: 2, label: '0-3 Days (Fresh)' },
                  { days: 7, label: '1 Week' },
                  { days: 18, label: '2-3 Weeks' },
                  { days: 40, label: '1+ Month' }
                ].map((d) => (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setDaysAfterHarvest(d.days)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                      daysAfterHarvest === d.days 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Lot Quantity */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Total Lot Quantity (Quintals)</span>
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="5" 
                  max="500" 
                  value={lotQuantity} 
                  onChange={(e) => setLotQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-2.5 py-1 text-right text-xs font-bold rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs text-slate-500 font-semibold">Qtl</span>
              </div>
            </div>
          </div>

          {/* 3. Appearing Crop Diseases & Defects */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-600" />
              <span>Visual Crop Defect / Appearing Disease (Optional)</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Select any disease symptoms or grain defects observed on your harvest to compute accurate refraction cuts.
            </p>

            <select
              value={appearingDisease}
              onChange={(e) => setAppearingDisease(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {diseaseOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} — {opt.desc}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* 4. OPTIONAL YIELD / PRODUCE PHOTO SCAN */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border-2 border-dashed border-emerald-300 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-xs font-extrabold text-slate-900">
                  Optional Yield & Grain Photo Deep AI Analysis
                </span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Optional
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Upload a close-up photo of your grain lot or leaf for deep visual grade verification
            </span>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
          />

          {!yieldImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition group text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-900">
                Click to Upload Yield / Grain Photo or Take a Snap
              </div>
              <div className="text-[10px] text-slate-500">
                Supports JPG, PNG, WEBP from mobile camera or storage
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-emerald-500 flex-shrink-0">
                <img src={yieldImage} alt="Yield sample" className="w-full h-full object-cover" />
                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-emerald-950/70 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                    <RefreshCw className="w-5 h-5 animate-spin mb-1 text-emerald-400" />
                    <span>AI Scanning...</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Yield Photo Analyzed by AI</span>
                  </span>
                  <button
                    onClick={clearImage}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Grain Luster: </span>
                    <span className="font-bold text-emerald-700">{valuation?.visualAnalysisSummary?.luster || 'HIGH'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Discoloration: </span>
                    <span className="font-bold text-slate-900">{valuation?.visualAnalysisSummary?.discolorationPercent || 2.5}%</span>
                  </div>
                </div>

                {valuation?.visualAnalysisSummary?.aiObservations && (
                  <div className="text-[11px] text-emerald-900 font-medium bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    🔍 {valuation.visualAnalysisSummary.aiObservations.join(' ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION 3: Valuation Results & Deep Pricing Breakdown */}
      {prediction && valuation && (
        <div className="space-y-6">
          
          {/* Hero Valuation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Predicted Net Realizable Mandi Price */}
            <div className="card-clean p-5 rounded-3xl bg-white border-2 border-emerald-500 space-y-1 shadow-md shadow-emerald-500/10">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                <span>Predicted Realizable Rate</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">
                  {valuation.qualityGrade === 'GRADE_A_PREMIUM' ? 'GRADE A' : valuation.qualityGrade === 'FAQ_STANDARD' ? 'FAQ' : 'DISCOUNT'}
                </span>
              </div>
              <div className="text-3xl font-black font-outfit text-emerald-800 flex items-baseline gap-1">
                <span>₹{valuation.realizablePricePerQuintal}</span>
                <span className="text-xs text-slate-500 font-bold">/ Qtl</span>
              </div>
              <div className="text-xs text-slate-600 font-medium pt-1">
                Base Mandi Rate: ₹{valuation.baseMandiRate}/Qtl
              </div>
            </div>

            {/* Total Net Lot Payout */}
            <div className="card-clean p-5 rounded-3xl bg-white border border-slate-200 space-y-1 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Total Payout</div>
              <div className="text-3xl font-black font-outfit text-slate-900 flex items-baseline gap-1">
                <span>₹{valuation.totalLotValue.toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-600 font-medium pt-1">
                For {lotQuantity} Quintals delivered at Mandi
              </div>
            </div>

            {/* Official Govt Floor MSP */}
            <div className="card-clean p-5 rounded-3xl bg-white border border-slate-200 space-y-1 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Govt. Floor MSP</div>
              <div className="text-3xl font-black font-outfit text-slate-800 flex items-baseline gap-1">
                <span>₹{prediction.mspPrice}</span>
                <span className="text-xs text-slate-500 font-bold">/ Qtl</span>
              </div>
              <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{valuation.realizablePricePerQuintal >= prediction.mspPrice ? 'At or Above MSP' : 'Floor Protected'}</span>
              </div>
            </div>

            {/* Overall Purity & Quality Grade */}
            <div className="card-clean p-5 rounded-3xl bg-white border border-slate-200 space-y-1 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Quality Index</div>
              <div className="text-3xl font-black font-outfit text-teal-700 flex items-baseline gap-1">
                <span>{valuation.purityScore}%</span>
              </div>
              <div className="text-xs text-slate-600 font-medium pt-1 truncate">
                {valuation.gradeName}
              </div>
            </div>
          </div>

          {/* Detailed Valuation Waterfall Breakdown */}
          <div className="card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-outfit flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Quality Value Adjustments Breakdown (Govt FAQ Standard)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Moisture Adjustment</div>
                <div className={`text-base font-bold font-outfit mt-1 ${
                  valuation.moistureAdjustment >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {valuation.moistureAdjustment >= 0 ? `+₹${valuation.moistureAdjustment}` : `-₹${Math.abs(valuation.moistureAdjustment)}`}/Qtl
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tested at {moisturePercent}%</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Storage Age Factor</div>
                <div className={`text-base font-bold font-outfit mt-1 ${
                  valuation.storageAgeAdjustment >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {valuation.storageAgeAdjustment >= 0 ? `+₹${valuation.storageAgeAdjustment}` : `-₹${Math.abs(valuation.storageAgeAdjustment)}`}/Qtl
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{daysAfterHarvest} days post-harvest</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Disease / Defect Impact</div>
                <div className={`text-base font-bold font-outfit mt-1 ${
                  valuation.diseaseAdjustment === 0 ? 'text-slate-700' : 'text-red-600'
                }`}>
                  {valuation.diseaseAdjustment === 0 ? '₹0' : `-₹${Math.abs(valuation.diseaseAdjustment)}`}/Qtl
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{appearingDisease}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Refraction & Foreign Matter</div>
                <div className={`text-base font-bold font-outfit mt-1 ${
                  valuation.foreignMatterAdjustment === 0 ? 'text-slate-700' : 'text-red-600'
                }`}>
                  {valuation.foreignMatterAdjustment === 0 ? '₹0' : `-₹${Math.abs(valuation.foreignMatterAdjustment)}`}/Qtl
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{brokenGrainPercent}% broken, {foreignMatterPercent}% dust</div>
              </div>
            </div>

            {/* Drying & Remediation Advice */}
            {valuation.dryingAdvice && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 text-slate-800 text-xs flex items-start gap-3">
                <Sun className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-amber-900 mb-0.5">Kisan Advisory & Value Maximization Tip:</div>
                  <div className="leading-relaxed font-medium">{valuation.dryingAdvice}</div>
                </div>
              </div>
            )}
          </div>

          {/* AI Selling Strategy & 30-Day Outlook */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-300 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Smart Mandi Selling Strategy for {prediction.district}</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              "{prediction.recommendation}"
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-700 border-t border-emerald-200">
              <div>
                <span className="text-slate-500">Recommended Selling Window: </span>
                <span className="font-bold text-emerald-800">{prediction.bestSellingWindow}</span>
              </div>
              <div>
                <span className="text-slate-500">Target Region: </span>
                <span className="font-bold text-slate-900">{prediction.district}, {prediction.state}</span>
              </div>
            </div>
          </div>

          {/* Historical Trend Chart & Regional Mandis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Price Trend Visualization */}
            <div className="lg:col-span-2 card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-outfit flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Price Movement & AI Forecast Curve</span>
                </h3>
                <p className="text-xs text-slate-500">Monthly average modal price history + October AI projection</p>
              </div>

              {/* Bar visualization */}
              <div className="pt-6 pb-2 grid grid-cols-7 gap-2 sm:gap-3 items-end h-52 border-b border-slate-200">
                {prediction.priceHistory.map((item, idx) => {
                  const maxPrice = Math.max(...prediction.priceHistory.map(p => p.price));
                  const minPrice = Math.min(...prediction.priceHistory.map(p => p.price)) * 0.8;
                  const heightPercent = Math.max(20, Math.round(((item.price - minPrice) / (maxPrice - minPrice)) * 100));
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-slate-800 group-hover:scale-110 transition-transform">₹{item.price}</span>
                      <div 
                        className={`w-full max-w-[38px] rounded-t-xl transition-all duration-500 ${
                          item.forecast 
                            ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-sm ring-2 ring-purple-300 group-hover:scale-105' 
                            : idx === 5 
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-sm group-hover:scale-105' 
                            : 'bg-slate-200 group-hover:bg-slate-300'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className={`text-[9px] text-center font-semibold ${item.forecast ? 'text-purple-700 font-bold' : 'text-slate-500'}`}>
                        {item.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-slate-200 border border-slate-300"></span>
                  <span>Historical Mandi Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-emerald-600 to-teal-500"></span>
                  <span>Current Spot Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-purple-600 to-purple-400"></span>
                  <span>AI Predictive Model</span>
                </div>
              </div>
            </div>

            {/* Nearby District Mandis Compare */}
            <div className="card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 font-outfit flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Regional Mandis Comparison</span>
              </h3>
              <p className="text-xs text-slate-500">Live rates across nearby milling clusters</p>

              <div className="space-y-3 pt-1">
                {prediction.nearbyDistricts.map((mandi, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-400 transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{mandi.district}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Distance: {mandi.distanceKm} km</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-700 font-outfit">₹{mandi.modalPrice}/Qtl</div>
                      <div className="text-[9px] text-slate-500 font-bold">Modal Rate</div>
                    </div>
                  </div>
                ))}
              </div>

              {onBookSlot && (
                <button
                  onClick={onBookSlot}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-sm mt-4 hover:scale-102 cursor-pointer"
                >
                  <span>Book Slot in {prediction.district}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PricePredictor;
