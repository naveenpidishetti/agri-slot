import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AgriTechArticle } from '../../types';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  Zap, 
  Leaf, 
  Radio, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Calculator,
  Compass
} from 'lucide-react';
import { AICaptionDisclaimer } from '../common/AICaptionDisclaimer';

export const AgriTechInnovations: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeArticle, setActiveArticle] = useState<AgriTechArticle | null>(null);

  // ROI Calculator state
  const [landAcres, setLandAcres] = useState<number>(5);
  const [selectedTech, setSelectedTech] = useState<string>('DRONES');

  const articles: AgriTechArticle[] = [
    {
      id: 'tech-01',
      title: 'AI Kisan Drones & Precision Ultra-Low Volume Spraying',
      teluguTitle: 'AI కిసాన్ డ్రోన్లు మరియు ఖచ్చితమైన స్ప్రేయింగ్ టెక్నాలజీ',
      hindiTitle: 'एआई किसान ड्रोन और सटीक छिड़काव तकनीक',
      category: 'DRONES',
      tag: '80% Govt Subsidy Available',
      icon: '🛸',
      summary: 'Automated GPS-guided agricultural drones spray 1 acre in just 7 minutes with 90% water reduction and zero pesticide toxicity exposure.',
      fullDetails: 'Equipped with LiDAR obstacle avoidance, multispectral cameras, and intelligent atomizing nozzles, Kisan Drones deliver micron-sized droplets directly onto the crop canopy. This eliminates operator chemical poisoning, ensures uniform pest coverage, and prevents pesticide run-off into groundwater.',
      keyBenefits: [
        'Sprays 1 acre in 6–8 minutes vs 4 hours of manual labor',
        'Saves up to 90% water and 30% chemical pesticide volume',
        'Eliminates human inhalation of toxic organophosphates',
        'Night-spraying capability during calm winds'
      ],
      governmentSubsidy: 'Under the Namo Drone Didi & Sub-Mission on Agricultural Mechanization (SMAM), FPOs receive up to 80% subsidy (up to ₹8 Lakhs), and individual farmers receive 40–50% financial assistance.',
      estimatedRoi: 'Saves ~₹1,800/acre per season in manual labor and pesticide savings. Payback period: ~1.2 seasons.',
      realWorldImpact: 'Over 25,000 villages across Telangana, Punjab, and Andhra Pradesh already use drone clusters for paddy and cotton pest management.'
    },
    {
      id: 'tech-02',
      title: 'IoT Soil Moisture Probes & Wireless Smart Drip Automation',
      teluguTitle: 'IoT నేల తేమ సెన్సార్లు మరియు ఆటోమేటిక్ డ్రిప్ సిస్టమ్',
      hindiTitle: 'आईओटी मृदा नमी सेंसर और स्वचालित ड्रिप प्रणाली',
      category: 'IOT_SENSORS',
      tag: '50% Water Savings',
      icon: '📡',
      summary: 'LoRaWAN wireless soil sensors monitor volumetric water content, NPK levels, and root zone temperature to automatically trigger solar pumps via mobile app.',
      fullDetails: 'Instead of flooding fields blindly, IoT sensor nodes placed at root depths (15cm & 30cm) transmit live soil parameters to your smartphone. The smart irrigation controller opens electric solenoid valves only when soil tension drops below optimal thresholds.',
      keyBenefits: [
        'Cuts electricity and water consumption by 45–55%',
        'Prevents root rot and fungal wilt caused by over-watering',
        'Direct automated Fertigation (liquid fertilizer dosing) to root zones',
        'Automated SMS alerts when soil NPK nutrients are depleted'
      ],
      governmentSubsidy: 'PM Krishi Sinchayee Yojana (PMKSY) provides 45% to 55% subsidy on micro-irrigation and smart sensor setups.',
      estimatedRoi: 'Increases crop yields by 22% while cutting pump electricity bills by half. Payback: ~1 crop cycle.',
      realWorldImpact: 'Over 40% yield boost reported in chilli, sugarcane, and pomegranate farms in Maharashtra and Karnataka.'
    },
    {
      id: 'tech-03',
      title: 'Satellite Hyper-Spectral NDVI Health Mapping & Early Pest Radar',
      teluguTitle: 'ఉపగ్రహ హైపర్‌స్పెక్ట్రల్ పంట ఆరోగ్య మ్యాపింగ్',
      hindiTitle: 'उपग्रह हाइपर-स्पेक्ट्रल फसल स्वास्थ्य मैपिंग',
      category: 'SATELLITE_AI',
      tag: 'Early Warning 10 Days Before',
      icon: '🛰️',
      summary: 'Sentinel-2 & Landsat-9 high-resolution satellite imagery analyzed with AI to detect moisture stress, nitrogen deficiency, and pest outbreaks 10 days before human eyes can see them.',
      fullDetails: 'Hyper-spectral infrared reflectance measures chlorophyll absorption. When leaves experience drought or stem borer attacks, their cellular infrared signature drops days before visible yellowing occurs, allowing micro-targeted spot treatment.',
      keyBenefits: [
        'Pinpoints exact hectare coordinates where pests are breeding',
        'No physical equipment needed on the ground — works via smartphone',
        'Weekly NDVI satellite updates sent directly via WhatsApp/AgriSlot',
        'Historical soil moisture trends to plan ideal sowing week'
      ],
      governmentSubsidy: 'Integrated for free through AgriSlot Kisan Portal in collaboration with ISRO Bhuvan and PM Fasal Bima Yojana.',
      estimatedRoi: 'Prevents 15–30% harvest loss from surprise late-stage armyworm and brown planthopper blights.',
      realWorldImpact: 'Enabled early containment of yellow rust in Punjab wheat farms across 1.2 million acres in 2025.'
    },
    {
      id: 'tech-04',
      title: 'Decentralized Solar Micro-Cold Storage & Grain Drying Silos',
      teluguTitle: 'సౌర శక్తితో నడిచే కోల్డ్ స్టోరేజ్ & ధాన్యపు సైలోలు',
      hindiTitle: 'सौर ऊर्जा संचालित कोल्ड स्टोरेज और अनाज सुखाने के साइलो',
      category: 'COLD_STORAGE',
      tag: 'Zero Spoilage',
      icon: '❄️',
      summary: 'Off-grid thermal energy storage rooms powered by rooftop solar panels keep fruits, vegetables, and perishables fresh at farm gate without grid power.',
      fullDetails: 'Thermal energy storage batteries freeze phase-change material during sunny hours to maintain 4°C cooling for over 36 hours of cloud cover. Allows smallholder farmers to avoid distress selling at bottom prices during mandi glut.',
      keyBenefits: [
        'Extends produce shelf life from 2 days to 28 days',
        '100% solar powered — ₹0 monthly electricity bill',
        'Allows selling produce during high-price market windows',
        'Integrated moisture-controlled grain drying fans prevent aflatoxin'
      ],
      governmentSubsidy: 'Mission for Integrated Development of Horticulture (MIDH) offers 35% to 50% capital subsidy on farm-gate cold units.',
      estimatedRoi: 'Increases net realization by ₹4,000–₹8,000 per quintal for tomatoes, mangoes, chillies, and onions.',
      realWorldImpact: 'Reduced post-harvest tomato wastage from 32% down to 2.8% in Chittoor and Kolar horticulture belts.'
    },
    {
      id: 'tech-05',
      title: 'Autonomous Electric Farm Robots & AI Laser Weeders',
      teluguTitle: 'స్వయంప్రతిపత్తి కలిగిన ఎలక్ట్రిక్ వ్యవసాయ రోబోట్లు',
      hindiTitle: 'स्वायत्त इलेक्ट्रिक कृषि रोबोट और लेजर वीडर',
      category: 'ROBOTICS',
      tag: 'Zero Labor Shortage',
      icon: '🤖',
      summary: 'Computer-vision weeders classify weeds at 20 frames/sec and use targeted high-energy laser pulses or micro-blades to destroy unwanted plants without disturbing crop roots.',
      fullDetails: 'Tackles acute agricultural labor shortages during peak weeding windows. The lightweight solar-electric rover moves autonomously between furrows using RTK GPS navigation with centimetre-level accuracy.',
      keyBenefits: [
        '100% chemical herbicide-free organic weeding',
        'Lightweight footprint prevents heavy tractor soil compaction',
        'Runs 12 hours on a single battery charge',
        'Works 24/7 day and night autonomously'
      ],
      governmentSubsidy: 'Eligible under Agriculture Infrastructure Fund (AIF) at 3% interest subvention with credit guarantee support.',
      estimatedRoi: 'Saves ₹2,500/acre in manual weeding expenses per weeding pass.',
      realWorldImpact: 'Piloted successfully in cotton and soybean fields in Vidarbha and Telangana.'
    },
    {
      id: 'tech-06',
      title: 'Farmer Carbon Credit Marketplace & Regenerative Biochar',
      teluguTitle: 'రైతు కార్బన్ క్రెడిట్ మార్కెట్ & బయోచార్ ఆదాయం',
      hindiTitle: 'किसान कार्बन क्रेडिट मार्केटप्लेस और बायोचार आय',
      category: 'CARBON_CREDITS',
      tag: 'Earn ₹4,000 Extra / Acre',
      icon: '🌱',
      summary: 'Earn direct cash payments for avoiding crop residue burning, practicing direct seeded rice (DSR), and incorporating biochar into your soil.',
      fullDetails: 'Satellite verification measures soil organic carbon sequestration and methane reduction. Verified carbon credits are purchased by international green companies, and funds are wired straight to farmer bank accounts via DBT.',
      keyBenefits: [
        'Earn ₹3,000 to ₹6,000 per acre in annual carbon dividend cash',
        'Biochar application doubles soil moisture retention and microbial health',
        'Zero penalty for stubble management — turn paddy straw into profit',
        'Improves long-term farm soil fertility for future generations'
      ],
      governmentSubsidy: 'Recognized under the National Mission for Sustainable Agriculture (NMSA) and Voluntary Carbon Market framework.',
      estimatedRoi: 'Direct supplemental income with zero capital risk.',
      realWorldImpact: 'Over 85,000 farmers in Haryana and Punjab earned cumulative ₹42 Crores in carbon dividends in 2025.'
    }
  ];

  const categories = [
    { id: 'ALL', label: 'All Technologies', icon: '✨' },
    { id: 'DRONES', label: 'AI Drones', icon: '🛸' },
    { id: 'IOT_SENSORS', label: 'IoT & Smart Drip', icon: '📡' },
    { id: 'SATELLITE_AI', label: 'Satellite NDVI', icon: '🛰️' },
    { id: 'COLD_STORAGE', label: 'Solar Cold Storage', icon: '❄️' },
    { id: 'ROBOTICS', label: 'Robotics', icon: '🤖' },
    { id: 'CARBON_CREDITS', label: 'Carbon Credits', icon: '🌱' }
  ];

  const filteredArticles = selectedCategory === 'ALL'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  // Calculate estimated savings
  const calculateSavings = () => {
    if (selectedTech === 'DRONES') return landAcres * 1800;
    if (selectedTech === 'IOT_SENSORS') return landAcres * 3200;
    if (selectedTech === 'COLD_STORAGE') return landAcres * 6500;
    if (selectedTech === 'CARBON_CREDITS') return landAcres * 4500;
    return landAcres * 2200;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 pb-24 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Next-Generation Agriculture Innovations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900">
            Newly Emerging AgriTech & Smart Farming
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Explore cutting-edge tools, government subsidies (up to 80%), and high-ROI technologies transforming Indian agriculture
          </p>
        </div>
      </div>

      {/* AI Accuracy Disclaimer */}
      <AICaptionDisclaimer featureName="AgriTech Subsidy & Precision ROI AI" />

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md shadow-emerald-600/20 scale-105'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-emerald-300'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Innovation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="card-clean p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xs">
                  {art.icon}
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {art.tag}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black font-outfit text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              {/* Key Benefits Checklist */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {art.keyBenefits.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                <span className="font-bold text-emerald-700">ROI: </span>
                <span>{art.estimatedRoi.split('.')[0]}</span>
              </div>

              <button
                onClick={() => setActiveArticle(art)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer"
              >
                <span>Read Full Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Farmer ROI & Subsidy Calculator */}
      <div className="card-clean p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Calculator className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black font-outfit text-slate-900">Smart AgriTech Profit & Subsidy Estimator</h2>
            <p className="text-xs text-slate-500">Calculate how much money you can save per season by adopting modern farm technologies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Technology</label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
              >
                <option value="DRONES">🛸 AI Kisan Drone Spraying (80% Subsidy)</option>
                <option value="IOT_SENSORS">📡 IoT Soil Sensors & Automated Drip (50% Subsidy)</option>
                <option value="COLD_STORAGE">❄️ Solar Micro-Cold Storage (50% Subsidy)</option>
                <option value="CARBON_CREDITS">🌱 Carbon Credits & Stubble Biochar</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Land Area (Acres)</span>
                <span className="text-emerald-700 font-extrabold">{landAcres} Acres</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={landAcres}
                onChange={(e) => setLandAcres(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 text-center sm:text-left shadow-xs">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Annual Net Gain</div>
              <div className="text-3xl sm:text-4xl font-black font-outfit text-emerald-700 mt-1">
                ₹{calculateSavings().toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Labor savings + water reduction + yield protection across {landAcres} acres
              </div>
            </div>

            <div className="text-[11px] text-slate-700 font-semibold bg-white p-2.5 rounded-xl border border-slate-200">
              💡 Government Subsidies cover 40%–80% of initial equipment cost under PM-KUSUM & SMAM schemes.
            </div>
          </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh] space-y-5">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeArticle.icon}</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black font-outfit text-slate-900 leading-snug">
                    {activeArticle.title}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    {activeArticle.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p className="text-sm font-medium text-slate-900">{activeArticle.fullDetails}</p>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <h4 className="font-extrabold text-emerald-800 font-outfit text-sm">Key Advantages</h4>
                {activeArticle.keyBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-extrabold text-slate-900 font-outfit text-sm">🏛️ Government Subsidy Details</h4>
                <p>{activeArticle.governmentSubsidy}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <h4 className="font-extrabold text-amber-800 font-outfit text-sm">🌾 Real-World Ground Impact</h4>
                <p className="text-amber-900">{activeArticle.realWorldImpact}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveArticle(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
