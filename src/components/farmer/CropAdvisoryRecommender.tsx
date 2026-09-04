import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SoilTypeInfo, PreviousCropInfo, CropAdvisoryRecommendation } from '../../types';
import { AICaptionDisclaimer } from '../common/AICaptionDisclaimer';
import {
  Sprout,
  ArrowLeft,
  Sparkles,
  Layers,
  Calendar,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Beaker,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Printer,
  PlusCircle,
  HelpCircle,
  Zap,
  Info,
  Droplets,
  PackageCheck,
  Activity,
  Award
} from 'lucide-react';

interface CropAdvisoryRecommenderProps {
  onBack: () => void;
  onBookSlot?: () => void;
}

export const CropAdvisoryRecommender: React.FC<CropAdvisoryRecommenderProps> = ({ onBack, onBookSlot }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // Form State
  const [soilTypes, setSoilTypes] = useState<SoilTypeInfo[]>([]);
  const [seasons, setSeasons] = useState<{ id: string; name: string; description: string }[]>([]);
  const [previousCrops, setPreviousCrops] = useState<PreviousCropInfo[]>([]);
  const [cropList, setCropList] = useState<{ id: string; name: string }[]>([]);

  const [selectedSoil, setSelectedSoil] = useState<string>('black-soil');
  const [selectedSeason, setSelectedSeason] = useState<string>('kharif');
  const [selectedPrevCrop, setSelectedPrevCrop] = useState<string>('soybean');
  const [soilPH, setSoilPH] = useState<number>(7.2);
  const [fertilityLevel, setFertilityLevel] = useState<string>('Medium');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(user?.land_area_acres || 2.5);
  const [targetCrop, setTargetCrop] = useState<string>('auto'); // 'auto' for AI selection
  const [irrigationType, setIrrigationType] = useState<string>('Borewell / Canal Drip');

  // Recommendation State
  const [loading, setLoading] = useState<boolean>(false);
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [advisory, setAdvisory] = useState<CropAdvisoryRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'SEEDS' | 'FERTILIZER' | 'PROTECTION' | 'ROTATION'>('SEEDS');

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const res = await api.getCropAdvisoryMetadata();
      if (res.soilTypes) setSoilTypes(res.soilTypes);
      if (res.seasons) setSeasons(res.seasons);
      if (res.previousCrops) setPreviousCrops(res.previousCrops);
      if (res.crops) setCropList(res.crops);

      // Auto-trigger default recommendation
      generateAdvisory(res.soilTypes[0]?.id || 'black-soil', 'kharif', 'soybean', 2.5, 'auto');
    } catch (err) {
      console.error('Failed to load metadata', err);
    } finally {
      setInitLoading(false);
    }
  };

  const generateAdvisory = async (
    soilId = selectedSoil,
    seasonId = selectedSeason,
    prevCropId = selectedPrevCrop,
    acres = farmSizeAcres,
    target = targetCrop
  ) => {
    setLoading(true);
    try {
      const res = await api.getCropAdvisoryRecommendation({
        soilTypeId: soilId,
        season: seasonId,
        previousCropId: prevCropId,
        soilPH,
        fertilityLevel,
        farmSizeAcres: acres,
        targetCropId: target === 'auto' ? null : target,
        state: user?.state || 'Telangana',
        district: user?.district || 'Warangal',
        irrigationType,
        language
      });
      setAdvisory(res);
    } catch (err) {
      console.error('Advisory fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (soil: string, season: string, prevCrop: string, crop: string, ph: number, acres: number) => {
    setSelectedSoil(soil);
    setSelectedSeason(season);
    setSelectedPrevCrop(prevCrop);
    setTargetCrop(crop);
    setSoilPH(ph);
    setFarmSizeAcres(acres);
    generateAdvisory(soil, season, prevCrop, acres, crop);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-900">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 flex items-center justify-center transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                ICAR & KVK Scientific AI Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 mt-0.5">
              {t.advisoryTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {t.advisorySubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {advisory && (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>{t.printAdvisory}</span>
            </button>
          )}
          {onBookSlot && (
            <button
              onClick={onBookSlot}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/20 cursor-pointer hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{t.bookSlot}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick 1-Click Regional Presets */}
      <div className="card-clean p-4 border border-emerald-200 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-slate-50">
        <div className="flex items-center gap-2 mb-2.5">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            Quick Regional Scenario Presets (1-Click Test):
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('black-soil', 'kharif', 'soybean', 'cotton', 7.8, 3.0)}
            className="p-2.5 text-left rounded-xl bg-white hover:bg-emerald-100/50 border border-slate-200 hover:border-emerald-300 transition text-xs shadow-2xs group cursor-pointer"
          >
            <div className="font-extrabold text-slate-900 group-hover:text-emerald-800">🌾 Telangana Black Soil</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cotton after Soybean (3.0 Ac)</div>
          </button>

          <button
            onClick={() => applyPreset('alluvial-soil', 'rabi', 'paddy', 'wheat', 7.2, 4.0)}
            className="p-2.5 text-left rounded-xl bg-white hover:bg-emerald-100/50 border border-slate-200 hover:border-emerald-300 transition text-xs shadow-2xs group cursor-pointer"
          >
            <div className="font-extrabold text-slate-900 group-hover:text-emerald-800">🌽 Punjab / UP Alluvial</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Rabi Wheat after Paddy (4.0 Ac)</div>
          </button>

          <button
            onClick={() => applyPreset('red-soil', 'kharif', 'gram-pulses', 'chilli', 6.5, 2.0)}
            className="p-2.5 text-left rounded-xl bg-white hover:bg-emerald-100/50 border border-slate-200 hover:border-emerald-300 transition text-xs shadow-2xs group cursor-pointer"
          >
            <div className="font-extrabold text-slate-900 group-hover:text-emerald-800">🌶️ AP Red Loam Soil</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Guntur Chilli after Pulses (2.0 Ac)</div>
          </button>

          <button
            onClick={() => applyPreset('sandy-loam', 'rabi', 'paddy', 'groundnut', 6.8, 2.5)}
            className="p-2.5 text-left rounded-xl bg-white hover:bg-emerald-100/50 border border-slate-200 hover:border-emerald-300 transition text-xs shadow-2xs group cursor-pointer"
          >
            <div className="font-extrabold text-slate-900 group-hover:text-emerald-800">🥜 Sandy Loam Peanut</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Groundnut after Paddy (2.5 Ac)</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs Form & Output Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Farm & Land Parameter Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-clean p-5 sm:p-6 border border-slate-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black font-outfit text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Land & Soil Information</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Step 1 of 2
              </span>
            </div>

            {/* 1. Soil Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{t.soilClassification}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Texture & Nutrients</span>
              </label>
              <select
                value={selectedSoil}
                onChange={(e) => setSelectedSoil(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
              >
                {soilTypes.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Season */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{t.sowingSeason}</span>
                <span className="text-[10px] text-slate-500">Agri Calendar</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {seasons.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSeason(s.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedSeason === s.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Previous Crop History */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{t.previousCropHistory}</span>
                <span className="text-[10px] text-emerald-600 font-bold">Rotation Impact</span>
              </label>
              <select
                value={selectedPrevCrop}
                onChange={(e) => setSelectedPrevCrop(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
              >
                {previousCrops.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.category === 'Legume' || p.category === 'Legume / Oilseed' ? '🌱 (Nitrogen Fixer)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Target Crop Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{t.targetCropLabel}</span>
                <span className="text-[10px] text-purple-700 font-bold">🤖 Auto AI Mode</span>
              </label>
              <select
                value={targetCrop}
                onChange={(e) => setTargetCrop(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/50 font-bold text-xs text-purple-950 focus:outline-hidden focus:border-purple-500 focus:bg-white transition"
              >
                <option value="auto">{t.autoAiPick}</option>
                {cropList.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 5. Farm Area in Acres & Soil pH */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t.farmSizeLabel}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.25"
                    max="100"
                    value={farmSizeAcres}
                    onChange={(e) => setFarmSizeAcres(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-black text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">Acres</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t.soilPHLabel} ({soilPH})</label>
                <input
                  type="range"
                  min="5.5"
                  max="8.5"
                  step="0.1"
                  value={soilPH}
                  onChange={(e) => setSoilPH(parseFloat(e.target.value))}
                  className="w-full mt-3 accent-emerald-600"
                />
              </div>
            </div>

            {/* 6. Irrigation Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t.irrigationSetup}</label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs text-slate-800"
              >
                <option value="Borewell / Canal Drip">Borewell / Micro-Drip</option>
                <option value="Canal Flood Irrigation">Canal Flood Irrigation</option>
                <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                <option value="Rainfed / Dryland">Rainfed / Dryland (Monsoon)</option>
              </select>
            </div>

            {/* Calculate Button */}
            <button
              onClick={() => generateAdvisory()}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.analyzingSoilAdvisory}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generateAdvisoryBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Advisory Tabs & Results (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {loading ? (
            <div className="card-clean p-12 border border-emerald-200 bg-white text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-spin-slow">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black font-outfit text-slate-900">
                  Computing Optimal Seed, Fertilizer & Protection Advisory
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Cross-referencing {selectedSoil} nutrient buffers with {selectedSeason.toUpperCase()} sowing parameters and biological nitrogen credits...
                </p>
              </div>
            </div>
          ) : advisory ? (
            <div className="space-y-4">
              
              {/* Top Crop & Rotation Banner */}
              <div className="card-clean p-6 border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        {t.recommendedCrop}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {advisory.season} Season • {advisory.farmSizeAcres} Acres
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900">
                      {advisory.cropName}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                      <span>🌱 Soil: {advisory.soil.type} (pH {advisory.soil.pH})</span>
                      <span>•</span>
                      <span>Predecessor: {advisory.previousCrop.name}</span>
                    </p>
                  </div>

                  <div className="bg-white/95 px-4 py-3 rounded-2xl border border-emerald-200 shadow-xs flex-shrink-0 text-center sm:text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{t.targetYieldPotential}</div>
                    <div className="text-xl sm:text-2xl font-black font-outfit text-emerald-700">
                      {advisory.seeds.varieties[0]?.yieldPotentialQtlPerAcre || '25'} Qtl / Acre
                    </div>
                  </div>
                </div>

                {/* Predecessor Rotation Benefit Alert */}
                <div className="mt-4 p-3 rounded-xl bg-emerald-100/70 border border-emerald-300/80 flex items-start gap-2.5 text-xs text-emerald-950 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold">{advisory.previousCrop.rotationBenefitText}</span>
                  </div>
                </div>
              </div>

              {/* Navigation View Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('SEEDS')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'SEEDS'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>{t.tabSeeds}</span>
                </button>

                <button
                  onClick={() => setActiveTab('FERTILIZER')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'FERTILIZER'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Beaker className="w-4 h-4 text-emerald-600" />
                  <span>{t.tabFertilizer}</span>
                </button>

                <button
                  onClick={() => setActiveTab('PROTECTION')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'PROTECTION'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.tabProtection}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ROTATION')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'ROTATION'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>{t.tabRotation}</span>
                </button>
              </div>

              {/* TAB 1: Certified Seeds & Treatment */}
              {activeTab === 'SEEDS' && (
                <div className="space-y-4">
                  
                  {/* Varieties Grid */}
                  <div className="card-clean p-5 sm:p-6 border border-slate-200 bg-white shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-black font-outfit text-slate-900 flex items-center gap-2">
                          <Sprout className="w-5 h-5 text-emerald-600" />
                          <span>Top Certified Varieties for Your Land</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          High germination & disease-resistant certified seed varieties for {advisory.soil.type}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Total Needed: ~{advisory.seeds.varieties[0]?.totalSeedNeededKg} kg
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {advisory.seeds.varieties.map((v, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all duration-200 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-emerald-700">#{idx + 1}</span>
                                <h4 className="text-sm font-black text-slate-900">{v.name}</h4>
                              </div>
                              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                ⏱️ Maturity: {v.duration}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                {v.yieldPotentialQtlPerAcre} Qtl/Ac
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 font-medium">
                            {v.features}
                          </p>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>Seed Rate: {v.seedRateKgPerAcre} kg / acre</span>
                            <span className="text-emerald-700">For {advisory.farmSizeAcres} Ac: {v.totalSeedNeededKg} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seed Treatment Protocol */}
                  <div className="card-clean p-5 sm:p-6 border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-3">
                    <h3 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Mandatory 3-Step Seed Treatment Protocol (విత్తన శుద్ధి)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-1">
                        <div className="font-extrabold text-emerald-800">1. Chemical Fungicide Coat</div>
                        <div className="text-slate-600">{advisory.seeds.seedTreatment.fungicide}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs space-y-1">
                        <div className="font-extrabold text-emerald-800">2. Bio-Agent / Culture</div>
                        <div className="text-slate-600">{advisory.seeds.seedTreatment.bioAgent}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                      <span className="font-bold text-slate-900">Application Method: </span>
                      {advisory.seeds.seedTreatment.protocol}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Stage-wise Fertilizer Schedule */}
              {activeTab === 'FERTILIZER' && (
                <div className="space-y-4">
                  
                  {/* Total Commercial Bag Requirement Card */}
                  <div className="card-clean p-5 sm:p-6 border border-emerald-300 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-emerald-200" />
                        <h3 className="text-base font-black font-outfit">
                          Total Fertilizer Bags for {advisory.farmSizeAcres} Acres
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        Subsidy MRP Calculated
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-center border border-white/20">
                        <div className="text-[10px] uppercase font-bold text-emerald-200">Urea (45kg Bags)</div>
                        <div className="text-2xl font-black font-outfit mt-0.5">
                          {advisory.fertilizerSchedule.bagsEstimate.urea45kgBags} Bags
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-center border border-white/20">
                        <div className="text-[10px] uppercase font-bold text-emerald-200">DAP (50kg Bags)</div>
                        <div className="text-2xl font-black font-outfit mt-0.5">
                          {advisory.fertilizerSchedule.bagsEstimate.dap50kgBags} Bags
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-center border border-white/20">
                        <div className="text-[10px] uppercase font-bold text-emerald-200">MOP Potash (50kg)</div>
                        <div className="text-2xl font-black font-outfit mt-0.5">
                          {advisory.fertilizerSchedule.bagsEstimate.mop50kgBags} Bags
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-center border border-white/20">
                        <div className="text-[10px] uppercase font-bold text-emerald-200">Zinc Sulphate</div>
                        <div className="text-2xl font-black font-outfit mt-0.5">
                          {advisory.fertilizerSchedule.bagsEstimate.zincSulphateKg} kg
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stage-by-Stage Timeline */}
                  <div className="card-clean p-5 sm:p-6 border border-slate-200 bg-white shadow-sm space-y-4">
                    <h3 className="text-base font-black font-outfit text-slate-900 flex items-center gap-2">
                      <Beaker className="w-5 h-5 text-emerald-600" />
                      <span>Stage-wise Nutrient Application Schedule</span>
                    </h3>

                    <div className="space-y-3">
                      {/* Basal */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                            Stage 1: Basal Application (At Sowing / Puddling)
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">Day 0</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 pt-1">
                          {advisory.fertilizerSchedule.basal}
                        </p>
                      </div>

                      {/* Tillering / Vegetative */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md">
                            Stage 2: Vegetative / Tillering Split
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">20–35 Days</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 pt-1">
                          {advisory.fertilizerSchedule.tilleringOrVegetative}
                        </p>
                      </div>

                      {/* Flowering / Reproductive */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                            Stage 3: Flowering & Reproductive Stage
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">45–60 Days</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 pt-1">
                          {advisory.fertilizerSchedule.floweringOrReproductive}
                        </p>
                      </div>

                      {/* Foliar Spray */}
                      {advisory.fertilizerSchedule.foliarNutrients && (
                        <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md">
                              Stage 4: Micronutrient & Foliar Booster Spray
                            </span>
                          </div>
                          <p className="text-xs font-bold text-purple-950 pt-1">
                            {advisory.fertilizerSchedule.foliarNutrients}
                          </p>
                        </div>
                      )}

                      {/* Organic Manure Note */}
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span><strong>Organic Matter Strategy:</strong> {advisory.fertilizerSchedule.organicManure}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: Pesticides & IPM Crop Protection */}
              {activeTab === 'PROTECTION' && (
                <div className="space-y-4">
                  
                  {/* Weed Management Card */}
                  <div className="card-clean p-5 border border-slate-200 bg-white shadow-sm space-y-2">
                    <h3 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>1. Weed Management (కలుపు నివారణ)</span>
                    </h3>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                      {advisory.protectionPlan.weedManagement}
                    </div>
                  </div>

                  {/* Insect Pests & Chemicals */}
                  <div className="card-clean p-5 sm:p-6 border border-slate-200 bg-white shadow-sm space-y-3">
                    <h3 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>2. Key Insect Pests & Approved CIB&RC Insecticides</span>
                    </h3>

                    <div className="space-y-2.5">
                      {advisory.protectionPlan.pestControl.map((p, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                          <div className="flex items-center justify-between text-xs font-black text-amber-900">
                            <span>🐛 {p.pest}</span>
                            <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-md">{p.stage}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 pt-0.5">
                            {p.chemical}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fungicides & Diseases */}
                  <div className="card-clean p-5 sm:p-6 border border-slate-200 bg-white shadow-sm space-y-3">
                    <h3 className="text-sm font-black font-outfit text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>3. Major Diseases & Fungicide Prescriptions</span>
                    </h3>

                    <div className="space-y-2.5">
                      {advisory.protectionPlan.diseaseControl.map((d, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                          <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                            <span>🍄 {d.disease}</span>
                            <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-md">{d.timing}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 pt-0.5">
                            {d.fungicide}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio-Remedies */}
                  <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-300 text-xs text-emerald-950 font-medium flex items-start gap-2.5">
                    <Sparkles className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-emerald-900">🌿 Organic & Bio-Control Solution: </span>
                      {advisory.protectionPlan.bioRemedy}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: Crop Rotation & Soil Health */}
              {activeTab === 'ROTATION' && (
                <div className="space-y-4">
                  <div className="card-clean p-5 sm:p-6 border border-slate-200 bg-white shadow-sm space-y-4">
                    <h3 className="text-base font-black font-outfit text-slate-900 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-emerald-600" />
                      <span>Crop Rotation & Soil Nutrient Cycling</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-extrabold text-slate-500 uppercase text-[10px]">Preceding Crop Impact</div>
                        <div className="text-sm font-black text-slate-900">{advisory.previousCrop.name}</div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{advisory.previousCrop.soilImpact}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-extrabold text-slate-500 uppercase text-[10px]">Current Sowing Strategy</div>
                        <div className="text-sm font-black text-emerald-800">{advisory.cropName}</div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{advisory.soil.description}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                      <div className="font-black text-purple-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-700" />
                        <span>Long-Term Agronomic Benefits of this Sequence</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700">
                        <li>Breaks soil-borne pathogen cycles and root nematode build-up.</li>
                        <li>Balances macro-nutrient draw between shallow taproot and deep fibrous root architectures.</li>
                        <li>Saves chemical fertilizer inputs via biological nitrogen residue.</li>
                        <li>Improves soil water percolation and reduces monsoon soil crusting.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Expert Synthesis Card */}
              {advisory.aiAdvisorySummary && (
                <div className="card-clean p-5 border border-purple-200 bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-white shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>KisanAI Scientist Summary & Field Insights</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {advisory.aiAdvisorySummary}
                  </p>
                </div>
              )}

              {/* Universal AI Disclaimer */}
              <AICaptionDisclaimer featureName="Seeds, fertilizers, and pesticide advisory" />

            </div>
          ) : null}

        </div>

      </div>

    </div>
  );
};
