import { FeatherlessAIService } from './featherlessService.js';

// Comprehensive Agronomy Database according to ICAR, KVK & State Agricultural Universities
export const SOIL_TYPES = [
  {
    id: 'black-soil',
    name: 'Black Soil (Regur / Clayey)',
    description: 'High moisture retention, rich in lime, iron, magnesium and alumina. Ideal for Cotton, Soybean, Wheat, Gram, and Chilli.',
    defaultPH: 7.8,
    nitrogenStatus: 'Medium',
    phosphorusStatus: 'Medium',
    potassiumStatus: 'High',
    bestCrops: ['Cotton (Kapas)', 'Soybean', 'Wheat (Gehun)', 'Bengal Gram (Chana / Chickpea)', 'Paddy (Dhan / Rice)', 'Chilli (Mirchi)', 'Turmeric (Haldi)', 'Maize (Makka)', 'Red Gram (Tur / Arhar)']
  },
  {
    id: 'alluvial-soil',
    name: 'Alluvial Soil (Gangetic & River Basins)',
    description: 'Highly fertile, rich in potash and humus. Highly suitable for Paddy, Wheat, Sugarcane, Maize, Mustard, and Pulses.',
    defaultPH: 7.2,
    nitrogenStatus: 'Medium',
    phosphorusStatus: 'Medium',
    potassiumStatus: 'High',
    bestCrops: ['Paddy (Dhan / Rice)', 'Wheat (Gehun)', 'Sugarcane', 'Maize (Makka)', 'Mustard (Sarson)', 'Green Gram (Moong)', 'Potato', 'Tomato', 'Onion']
  },
  {
    id: 'red-soil',
    name: 'Red Soil (Red & Yellow Loam)',
    description: 'Porous, well-drained, rich in iron, low in nitrogen, phosphorus, and humus. Great for Groundnut, Cotton, Millets, Pulses, and Maize.',
    defaultPH: 6.5,
    nitrogenStatus: 'Low',
    phosphorusStatus: 'Low',
    potassiumStatus: 'Medium',
    bestCrops: ['Groundnut (Mungfali)', 'Cotton (Kapas)', 'Chilli (Mirchi)', 'Maize (Makka)', 'Red Gram (Tur / Arhar)', 'Ragi (Finger Millet)', 'Castor', 'Jowar', 'Bajra']
  },
  {
    id: 'sandy-loam',
    name: 'Sandy Loam Soil (Well Drained)',
    description: 'Warm, aerated, easy to till with rapid drainage. Ideal for Groundnut, Mustard, Vegetables, Potato, Watermelon, and Millets.',
    defaultPH: 6.8,
    nitrogenStatus: 'Low',
    phosphorusStatus: 'Medium',
    potassiumStatus: 'Medium',
    bestCrops: ['Groundnut (Mungfali)', 'Mustard (Sarson)', 'Potato', 'Tomato', 'Onion', 'Chilli (Mirchi)', 'Maize (Makka)', 'Green Gram (Moong)', 'Bajra (Pearl Millet)', 'Sesame (Til)']
  },
  {
    id: 'clay-loam',
    name: 'Clay Loam / Heavy Soil',
    description: 'Excellent nutrient and moisture capacity. Highly suitable for wetland Paddy, Sugarcane, and Wheat.',
    defaultPH: 7.0,
    nitrogenStatus: 'High',
    phosphorusStatus: 'Medium',
    potassiumStatus: 'High',
    bestCrops: ['Paddy (Dhan / Rice)', 'Sugarcane', 'Wheat (Gehun)', 'Soybean', 'Bengal Gram (Chana)']
  },
  {
    id: 'laterite-soil',
    name: 'Laterite Soil (Acidic / Leached)',
    description: 'Formed under high temperature and heavy rainfall. Deficient in lime, magnesium, and nitrogen. Good for Cashew, Rubber, Tea, Spices, and Turmeric.',
    defaultPH: 5.6,
    nitrogenStatus: 'Low',
    phosphorusStatus: 'Low',
    potassiumStatus: 'Low',
    bestCrops: ['Turmeric (Haldi)', 'Groundnut (Mungfali)', 'Paddy (Dhan / Rice)', 'Pulses', 'Ginger', 'Ragi']
  }
];

export const SEASONS = [
  { id: 'kharif', name: 'Kharif (Monsoon: June – October)', description: 'Monsoon season crops requiring abundant rainfall and warm temperatures.' },
  { id: 'rabi', name: 'Rabi (Winter: October – March)', description: 'Winter season crops requiring cool climates during growth and warm during ripening.' },
  { id: 'zaid', name: 'Zaid (Summer: March – June)', description: 'Short duration summer crops grown under assured irrigation.' }
];

export const PREVIOUS_CROPS = [
  { id: 'paddy', name: 'Paddy (Dhan / Rice)', category: 'Cereal', residualNitrogen: 'Low', soilImpact: 'Causes soil compaction, heavy nutrient depletion. Subsequent crop should be tap-root pulse or oilseed.' },
  { id: 'cotton', name: 'Cotton (Kapas)', category: 'Fiber', residualNitrogen: 'Low', soilImpact: 'Deep root extraction. Needs nitrogen-rich rotation or short legumes to replenish soil.' },
  { id: 'soybean', name: 'Soybean', category: 'Legume / Oilseed', residualNitrogen: 'High (+20 to 30 kg N/acre fixed biologically)', soilImpact: 'Fixes atmospheric nitrogen. Wheat or Maize sown after soybean requires 20% less basal urea.' },
  { id: 'gram-pulses', name: 'Pulses / Gram / Moong / Urad', category: 'Legume', residualNitrogen: 'High (+25 kg N/acre)', soilImpact: 'Leaves abundant rhizobial nitrogen and improves soil micro-flora.' },
  { id: 'maize', name: 'Maize (Makka)', category: 'Coarse Cereal', residualNitrogen: 'Low', soilImpact: 'Exhaustive crop for Potash and Zinc. Needs balanced NPK replenishment.' },
  { id: 'wheat', name: 'Wheat (Gehun)', category: 'Cereal', residualNitrogen: 'Medium', soilImpact: 'Good stubble incorporation adds organic carbon. Excellent for summer moong or green manure.' },
  { id: 'sugarcane', name: 'Sugarcane', category: 'Cash Crop', residualNitrogen: 'Low', soilImpact: 'Heavy nutrient and water consumption over 12 months. Mandatory green manuring (Dhaincha/Sunhemp) recommended.' },
  { id: 'groundnut', name: 'Groundnut (Mungfali)', category: 'Oilseed Legume', residualNitrogen: 'High (+20 kg N/acre)', soilImpact: 'Loosens soil, fixes nitrogen, ideal predecessor for Rabi Wheat or Vegetables.' },
  { id: 'chilli-veg', name: 'Chilli / Vegetables', category: 'Vegetable', residualNitrogen: 'Medium', soilImpact: 'High pesticide and fertilizer residue. Good to rotate with cereal or pulse to break nematode cycle.' },
  { id: 'fallow', name: 'Fallow / Uncultivated Land', category: 'Resting', residualNitrogen: 'Neutral', soilImpact: 'Rested soil, good moisture conservation if weeded.' }
];

export const AGRONOMY_KNOWLEDGE = {
  'paddy': {
    name: 'Paddy (Dhan / Rice)',
    varieties: [
      { name: 'BPT-5204 (Samba Mahsuri)', duration: '140–145 days', seedRateKgPerAcre: 10, yieldPotentialQtlPerAcre: '24–28', features: 'Super fine grain, premium market price, excellent cooking quality.' },
      { name: 'RNR-15048 (Telangana Sona)', duration: '120–125 days', seedRateKgPerAcre: 10, yieldPotentialQtlPerAcre: '26–30', features: 'Low Glycemic Index (sugar-free), blast resistant, short duration.' },
      { name: 'MTU-1010 (Cottondora Sannalu)', duration: '120 days', seedRateKgPerAcre: 12, yieldPotentialQtlPerAcre: '28–32', features: 'High tillering, non-lodging, widely adaptable across India.' },
      { name: 'PB-1509 / PB-1121 (Basmati)', duration: '120–140 days', seedRateKgPerAcre: 8, yieldPotentialQtlPerAcre: '18–22', features: 'Aromatic extra-long grain, top export value.' }
    ],
    seedTreatment: {
      fungicide: 'Carbendazim 50% WP @ 2g/kg seed OR Tricyclazole 75% WP @ 2g/kg seed',
      bioAgent: 'Pseudomonas fluorescens @ 10g/kg seed',
      protocol: 'Soak seeds in solution for 24 hours, incubate for 24 hours in gunny bag for uniform sprouting before nursery sowing.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 40 kg + MOP (Potash): 20 kg + Zinc Sulphate (21%): 10 kg at final puddling',
      tilleringStage: 'Urea: 25 kg (20–25 days after transplanting)',
      panicleInitiation: 'Urea: 20 kg + MOP: 15 kg (45–50 days after transplanting)',
      floweringSpray: 'NPK 13-0-45 (Potassium Nitrate) @ 5g/L + Boron 20% @ 1g/L at 5% panicle emergence',
      organicNote: 'Apply 2 tonnes of Farm Yard Manure (FYM) or green manure with Sesbania/Dhaincha.'
    },
    protectionSchedule: {
      weedManagement: 'Pretilachlor 50% EC @ 500 ml/acre within 3 days of transplanting in standing water (2-3 cm).',
      pestControl: [
        { pest: 'Stem Borer & Leaf Folder', chemical: 'Chlorantraniliprole 18.5% SC (Coragen) @ 60 ml/acre OR Cartap Hydrochloride 50% SP @ 400 g/acre', stage: 'Tillering to Panicle stage' },
        { pest: 'Brown Plant Hopper (BPH)', chemical: 'Pymetrozine 50% WDG (Chess) @ 120 g/acre OR Trifiumezopprim 10% SC (Pexalon) @ 94 ml/acre', stage: 'Boot leaf to milky grain stage' }
      ],
      diseaseControl: [
        { disease: 'Rice Blast & Neck Blast', fungicide: 'Tricyclazole 75% WP (Beam) @ 120 g/acre OR Azoxystrobin + Difenoconazole (Amistar Top) @ 200 ml/acre', timing: 'At initial spotting or pre-heading' },
        { disease: 'Sheath Blight & Stem Rot', fungicide: 'Hexaconazole 5% SC @ 400 ml/acre OR Validamycin 3% L @ 500 ml/acre', timing: 'At maximum tillering' }
      ],
      bioRemedy: 'Install 4 pheromone traps/acre for stem borer. Spray Neem Oil 10,000 ppm @ 2 ml/L as repellent.'
    }
  },
  'cotton': {
    name: 'Cotton (Kapas)',
    varieties: [
      { name: 'RCH-659 BG-II', duration: '150–160 days', seedRateKgPerAcre: 1.8, yieldPotentialQtlPerAcre: '12–16', features: 'Bollgard-II, drought tolerant, big boll size with high ginning percentage.' },
      { name: 'Bhakti (Bio-seed 6588 BG-II)', duration: '155–165 days', seedRateKgPerAcre: 1.8, yieldPotentialQtlPerAcre: '14–18', features: 'High sucking pest tolerance, excellent rejuvenation capacity.' },
      { name: 'Mallika BG-II (Nuziveedu)', duration: '160 days', seedRateKgPerAcre: 1.8, yieldPotentialQtlPerAcre: '13–17', features: 'High yielding hybrid suited for medium to heavy black soils.' }
    ],
    seedTreatment: {
      fungicide: 'Imidacloprid 70% WS @ 5g/kg + Carboxin + Thiram @ 3g/kg seed',
      bioAgent: 'Trichoderma viride @ 5g/kg seed',
      protocol: 'Delinted certified seeds are pre-treated. For farm seed, treat with fungicide followed by Azotobacter biofertilizer.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 40 kg + MOP: 25 kg + Magnesium Sulphate: 10 kg + Zinc Sulphate: 10 kg in planting rows',
      firstTopDressing: 'Urea: 30 kg + MOP: 15 kg at 30–35 days (Square formation)',
      secondTopDressing: 'Urea: 30 kg at 60–65 days (Boll development stage)',
      floweringSpray: '13-0-45 @ 10g/L + Planofix (NAA) @ 4 ml/15L pump to prevent square/boll dropping',
      organicNote: 'Apply Castor / Neem cake @ 100 kg/acre to improve soil porosity and repel white grubs.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 38.7% CS @ 700 ml/acre within 48 hours of sowing with sufficient soil moisture.',
      pestControl: [
        { pest: 'Sucking Pests (Whitefly, Thrips, Jassids)', chemical: 'Diafenthiuron 50% WP (Pegasus) @ 250 g/acre OR Flonicamid 50% WG (Ulala) @ 80 g/acre', stage: 'Early vegetative to squaring' },
        { pest: 'Pink Bollworm (PBW)', chemical: 'Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Emamectin Benzoate 5% SG (Proclaim) @ 88 g/acre', stage: '60–90 days after sowing' }
      ],
      diseaseControl: [
        { disease: 'Bacterial Blight / Black Arm', fungicide: 'Copper Oxychloride 50% WP @ 500 g + Streptocycline @ 6 g in 200 L water/acre', timing: 'At leaf appearance' },
        { disease: 'Alternaria Leaf Spot & Grey Mildew', fungicide: 'Pyraclostrobin 20% WG (Cabrio Top) @ 200 g/acre', timing: 'At square and boll stage' }
      ],
      bioRemedy: 'Fix 5 yellow sticky traps and 4 pink bollworm pheromone traps per acre. Spray 5% NSKE (Neem Seed Kernel Extract).'
    }
  },
  'wheat': {
    name: 'Wheat (Gehun)',
    varieties: [
      { name: 'HD-2967', duration: '140–145 days', seedRateKgPerAcre: 40, yieldPotentialQtlPerAcre: '20–24', features: 'High adaptability, rust resistant, excellent chapati making quality.' },
      { name: 'HD-3086 (Pusa Gautami)', duration: '135–140 days', seedRateKgPerAcre: 40, yieldPotentialQtlPerAcre: '22–26', features: 'Heat stress tolerant, bold lustrous amber grains.' },
      { name: 'PBW-550 / DBW-187 (Karan Vandana)', duration: '120–130 days', seedRateKgPerAcre: 42, yieldPotentialQtlPerAcre: '24–28', features: 'Rich in iron and protein, high tillering, rust immune.' }
    ],
    seedTreatment: {
      fungicide: 'Tebuconazole 2% DS @ 1g/kg OR Carboxin 37.5% + Thiram 37.5% @ 2.5g/kg',
      bioAgent: 'Azotobacter & PSB culture @ 250g per 10 kg seed',
      protocol: 'Treat seeds dry with fungicide first, then coat with jaggery water slurry and Azotobacter bio-culture.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 50 kg + MOP: 25 kg + Zinc Sulphate: 10 kg at time of sowing (drilled with seed)',
      crownRootInitiation: 'Urea: 35 kg at 21–25 days (CRI stage with 1st irrigation)',
      jointingStage: 'Urea: 30 kg at 40–45 days (2nd irrigation)',
      floweringSpray: 'NPK 0-52-34 @ 1 kg/acre + Boron 20% @ 100 g/acre in 150 L water at boot leaf stage',
      organicNote: 'Incorporate preceding crop residue/straw using Super Seeder or Happy Seeder.'
    },
    protectionSchedule: {
      weedManagement: 'Clodinafop-propargyl 15% WP @ 160 g/acre for Phalaris minor + Metsulfuron-methyl 20% WP @ 8 g/acre for broadleaf weeds at 30–35 DAS.',
      pestControl: [
        { pest: 'Aphids & Termites', chemical: 'Imidacloprid 17.8% SL @ 60 ml/acre OR Thiamethoxam 25% WG @ 40 g/acre', stage: 'Earing stage during cloudy weather' }
      ],
      diseaseControl: [
        { disease: 'Yellow Stripe Rust & Brown Rust', fungicide: 'Propiconazole 25% EC (Tilt) @ 200 ml/acre in 200 L water', timing: 'At first appearance of yellow stripes' },
        { disease: 'Loose Smut & Karnal Bunt', fungicide: 'Tebuconazole 25.9% EC (Folicur) @ 200 ml/acre', timing: 'At flowering heading' }
      ],
      bioRemedy: 'Spray bio-control agent Trichoderma harzianum @ 5g/L.'
    }
  },
  'maize': {
    name: 'Maize (Makka / Corn)',
    varieties: [
      { name: 'Pioneer P3396 / P3522', duration: '105–115 days', seedRateKgPerAcre: 7.5, yieldPotentialQtlPerAcre: '30–36', features: 'Extra high yield, stay-green trait, sturdy stalk non-lodging.' },
      { name: 'DKC-9108 / DKC-9144 (Bayer)', duration: '110–120 days', seedRateKgPerAcre: 8, yieldPotentialQtlPerAcre: '28–34', features: 'Tight husk cover, drought tolerance, high grain weight.' },
      { name: 'NK-6240 (Syngenta)', duration: '100–110 days', seedRateKgPerAcre: 7.5, yieldPotentialQtlPerAcre: '28–32', features: 'Uniform cob placement, rapid grain filling.' }
    ],
    seedTreatment: {
      fungicide: 'Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS (Fortenza Duo) @ 4 ml/kg seed',
      bioAgent: 'Azospirillum & PSB culture @ 10g/kg',
      protocol: 'Fortenza seed coat protects young seedlings from Fall Armyworm for 20 days after germination.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 40 kg + MOP: 25 kg + Zinc Sulphate: 10 kg + Urea: 15 kg at sowing',
      kneeHighStage: 'Urea: 35 kg at 30–35 days (Knee-high stage)',
      tasselingSilking: 'Urea: 25 kg + MOP: 15 kg at 50–55 days (Tasseling stage)',
      floweringSpray: 'NPK 19-19-19 @ 5g/L + Micronutrient mix at 40 days',
      organicNote: 'Apply 3 tonnes well-decomposed cow dung manure.'
    },
    protectionSchedule: {
      weedManagement: 'Atrazine 50% WP @ 800 g/acre as pre-emergence within 2 days of sowing.',
      pestControl: [
        { pest: 'Fall Armyworm (Spodoptera frugiperda)', chemical: 'Spinetoram 11.7% SC (Delegate) @ 100 ml/acre OR Chlorantraniliprole 18.5% SC @ 80 ml/acre directly into central whorls', stage: '15 to 45 days after germination' },
        { pest: 'Stem Borer (Chilo partellus)', chemical: 'Carbofuran 3% CG @ 5 kg/acre or Cartap 4G @ 5 kg/acre in leaf whorls', stage: '25–30 days' }
      ],
      diseaseControl: [
        { disease: 'Turcicum Leaf Blight & Maydis Blight', fungicide: 'Mancozeb 75% WP @ 600 g/acre OR Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 200 ml/acre', timing: 'At initial leaf lesions' }
      ],
      bioRemedy: 'Release Trichogramma chilonis egg parasitoids @ 50,000/acre at 15 & 25 days. Apply Bacillus thuringiensis (Bt) @ 2g/L.'
    }
  },
  'soybean': {
    name: 'Soybean',
    varieties: [
      { name: 'JS-335 / JS-9560', duration: '90–95 days', seedRateKgPerAcre: 25, yieldPotentialQtlPerAcre: '10–14', features: 'Early maturity, resistant to shattering, high oil content (21%).' },
      { name: 'JS-20-34 / NRC-127', duration: '85–90 days', seedRateKgPerAcre: 25, yieldPotentialQtlPerAcre: '12–15', features: 'Drought tolerant, early harvest enables timely Rabi Wheat sowing.' },
      { name: 'RVS-2001-4 (Rajmata Vijayaraje)', duration: '95–100 days', seedRateKgPerAcre: 24, yieldPotentialQtlPerAcre: '12–16', features: 'High pod count, resistant to yellow mosaic virus.' }
    ],
    seedTreatment: {
      fungicide: 'Carboxin + Thiram @ 3g/kg seed OR Penflufen + Trifloxystrobin (EverGol Xtend) @ 1 ml/kg',
      bioAgent: 'Bradyrhizobium japonicum & PSB @ 5g/kg seed',
      protocol: 'Fungicide first, shade dry for 30 mins, then coat with Rhizobium culture before immediate sowing.'
    },
    fertilizerPerAcre: {
      basal: 'SSP (Single Super Phosphate): 100 kg (provides 16% P + 11% Sulphur) + MOP: 20 kg + Urea: 15 kg',
      podDevelopment: 'NPK 0-52-34 @ 1 kg/acre + Water Soluble Boron 20% @ 100 g/acre spray at 45–50 days',
      floweringSpray: 'Urea 2% (20g/L) foliar spray at flower initiation to prevent flower drop',
      organicNote: 'Bio-fertilizer inoculation is crucial for maximizing biological nitrogen fixation.'
    },
    protectionSchedule: {
      weedManagement: 'Imazethapyr 10% SL (Pursuit) @ 400 ml/acre at 15–20 days (2-3 leaf stage of weeds).',
      pestControl: [
        { pest: 'Girdle Beetle & Semilooper', chemical: 'Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Flubendiamide 39.35% SC (Fame) @ 40 ml/acre', stage: '30–45 days' },
        { pest: 'Whitefly (Transmits YMV)', chemical: 'Thiamethoxam 25% WG @ 40 g/acre OR Acetamiprid 20% SP @ 50 g/acre', stage: 'Early vegetative' }
      ],
      diseaseControl: [
        { disease: 'Soybean Rust & Charcoal Rot', fungicide: 'Hexaconazole 5% EC @ 300 ml/acre OR Tebuconazole 25.9% EC @ 250 ml/acre', timing: 'At first sign of rust pustules' }
      ],
      bioRemedy: 'Spray Beauveria bassiana @ 5g/L for caterpillars. Install 4 pheromone traps/acre.'
    }
  },
  'chilli': {
    name: 'Chilli (Red Mirchi)',
    varieties: [
      { name: 'Teja / Guntur Sannam S4', duration: '150–180 days', seedRateKgPerAcre: 0.15, yieldPotentialQtlPerAcre: '20–30 (dry)', features: 'Extra pungent, high SHU, deep red color retention, high commercial demand.' },
      { name: 'Byadagi Dabbi / KDL', duration: '160 days', seedRateKgPerAcre: 0.15, yieldPotentialQtlPerAcre: '18–25 (dry)', features: 'High oleoresin and color value (ASTA), mild pungency.' },
      { name: 'Armoor / US-341 Hybrid', duration: '140–160 days', seedRateKgPerAcre: 0.10, yieldPotentialQtlPerAcre: '25–35 (dry)', features: 'Heavy continuous flushes, uniform smooth long fruits.' }
    ],
    seedTreatment: {
      fungicide: 'Thiram + Carbendazim @ 2g/kg OR Metalaxyl 35% WS @ 3g/kg seed',
      bioAgent: 'Trichoderma asperellum @ 10g/kg',
      protocol: 'Nursery root dip: Dip seedling roots in Pseudomonas solution (10g/L) for 15 mins before transplanting.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 50 kg + MOP: 35 kg + Magnesium Sulphate: 10 kg + Neem Cake: 150 kg in raised beds',
      fertigationOrTopDress: '19-19-19 @ 5 kg/week via drip OR split top dress Urea 25 kg + MOP 15 kg at 30, 60, 90 days',
      floweringSpray: 'Calcium Nitrate @ 5g/L + Boron @ 1g/L + 0-52-34 @ 5g/L to prevent blossom end rot and fruit drop',
      organicNote: 'Apply Trichoderma enriched FYM @ 5 tonnes/acre to prevent damping off and wilt.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-transplanting + Silver-Black Plastic Mulch (25–30 micron).',
      pestControl: [
        { pest: 'Black Thrips (Thrips parvispinus)', chemical: 'Spinetoram 11.7% SC @ 160 ml/acre OR Broflanilide 300 SC (Expedition) @ 25 ml/acre', stage: 'Flowering to fruit set' },
        { pest: 'Mites & Murda Leaf Curl Complex', chemical: 'Spiromesifen 22.9% SC (Oberon) @ 200 ml/acre OR Diafenthiuron 50% WP @ 250 g/acre', stage: 'Vegetative flushes' }
      ],
      diseaseControl: [
        { disease: 'Anthracnose / Fruit Rot / Dieback', fungicide: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top) @ 200 ml/acre OR Pyraclostrobin + Fluxapyroxad (Priaxor) @ 120 ml/acre', timing: 'At flowering and fruit ripening' },
        { disease: 'Powdery Mildew', fungicide: 'Myclobutanil 10% WP @ 150 g/acre OR Wettable Sulphur 80% WDG @ 600 g/acre', timing: 'During cool dry spells' }
      ],
      bioRemedy: 'Install blue sticky traps for thrips (20 traps/acre) and yellow sticky traps for whitefly. Spray Neem Oil 10,000 ppm @ 3 ml/L.'
    }
  },
  'groundnut': {
    name: 'Groundnut (Mungfali)',
    varieties: [
      { name: 'K-6 (Kadiri 6)', duration: '100–105 days', seedRateKgPerAcre: 45, yieldPotentialQtlPerAcre: '12–16', features: 'Drought tolerant bunch type, high shelling percentage (75%).' },
      { name: 'TAG-24', duration: '95–100 days', seedRateKgPerAcre: 50, yieldPotentialQtlPerAcre: '14–18', features: 'Semi-dwarf bunch type, early harvest, uniform pod maturity.' },
      { name: 'TMV-2 / GJG-9', duration: '105–110 days', seedRateKgPerAcre: 45, yieldPotentialQtlPerAcre: '13–17', features: 'High oil yield (49%), widely cultivated in sandy loam soils.' }
    ],
    seedTreatment: {
      fungicide: 'Mancozeb 75% WP @ 3g/kg OR Tebuconazole 2% DS @ 1.5g/kg kernel',
      bioAgent: 'Rhizobium culture @ 10g/kg + Trichoderma viride @ 4g/kg',
      protocol: 'Treat shelled kernels gently to avoid breaking the seed coat. Air dry before sowing.'
    },
    fertilizerPerAcre: {
      basal: 'SSP (Single Super Phosphate): 125 kg (essential for Phosphorus + Sulphur) + MOP: 25 kg + Urea: 15 kg + Zinc Sulphate: 10 kg',
      peggingStage: 'Gypsum: 200 kg/acre at 40–45 days (pegging stage) - Calcium is critical for bold pod filling and preventing pop pods',
      floweringSpray: 'Boron 20% @ 1g/L + NPK 19-19-19 @ 5g/L at 30 days',
      organicNote: 'Apply farmyard manure @ 2 tonnes/acre.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-emergence within 2 days of sowing.',
      pestControl: [
        { pest: 'Spodoptera & Leaf Miner', chemical: 'Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Emamectin Benzoate 5% SG @ 80 g/acre', stage: '30–50 days' },
        { pest: 'White Grubs / Root Borer', chemical: 'Chlorpyriphos 20% EC @ 1 L/acre soil drenching or Imidacloprid 600 FS seed treat', stage: 'Early stage' }
      ],
      diseaseControl: [
        { disease: 'Tikka Disease (Cercospora Leaf Spot) & Rust', fungicide: 'Tebuconazole 25.9% EC @ 200 ml/acre OR Chlorothalonil 75% WP @ 400 g/acre', timing: 'At first appearance of spots (45–60 days)' },
        { disease: 'Collar Rot & Stem Rot', fungicide: 'Trichoderma harzianum @ 2 kg mixed in 100 kg FYM broadcast in furrows', timing: 'At sowing' }
      ],
      bioRemedy: 'Pheromone traps for Spodoptera @ 4/acre. Neem cake @ 100 kg/acre.'
    }
  },
  'gram-chana': {
    name: 'Bengal Gram (Chana / Chickpea)',
    varieties: [
      { name: 'JG-11 / JG-14', duration: '95–100 days', seedRateKgPerAcre: 25, yieldPotentialQtlPerAcre: '8–12', features: 'Desi type, wilt resistant, heat tolerant during grain filling.' },
      { name: 'JAKI-9218', duration: '100–105 days', seedRateKgPerAcre: 30, yieldPotentialQtlPerAcre: '10–14', features: 'Bold grains, attractive yellow-brown color, excellent market value.' },
      { name: 'KAK-2 / MNK-1 (Kabuli)', duration: '105–115 days', seedRateKgPerAcre: 40, yieldPotentialQtlPerAcre: '9–13', features: 'Large white grain Kabuli type, fetches 50% premium price.' }
    ],
    seedTreatment: {
      fungicide: 'Carbendazim 12% + Mancozeb 63% WP (SAAF) @ 2.5g/kg seed',
      bioAgent: 'Rhizobium ciceri & Trichoderma viride @ 5g/kg',
      protocol: 'Fungicide coating first, then shade dry, followed by Rhizobium slurry with 5% jaggery solution.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 40 kg + MOP: 15 kg + Sulphur 90% WDG: 5 kg drilled at 5 cm below seed level',
      floweringStage: '2% Urea or 2% DAP foliar spray (20g/L) at flower initiation to boost pod setting',
      podFilling: 'NPK 0-52-34 @ 1 kg/acre + Boron 20% @ 100 g/acre in 150 L water',
      organicNote: 'Pulses fix their own nitrogen; avoid excess nitrogen fertilizer to prevent vegetative lodging.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-emergence within 48 hours of sowing.',
      pestControl: [
        { pest: 'Gram Pod Borer (Helicoverpa armigera)', chemical: 'Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Emamectin Benzoate 5% SG @ 88 g/acre OR Flubendiamide 39.35% SC @ 40 ml/acre', stage: 'At flowering and podding (vital to spray before larvae enter pods)' }
      ],
      diseaseControl: [
        { disease: 'Fusarium Wilt & Dry Root Rot', fungicide: 'Seed treatment with Trichoderma viride @ 4g/kg + Carbendazim @ 2g/kg', timing: 'Preventative at sowing' },
        { disease: 'Ascochyta Blight', fungicide: 'Mancozeb 75% WP @ 500 g/acre', timing: 'During humid winter spells' }
      ],
      bioRemedy: "Install 'T' shaped bird perches @ 15/acre for natural bird predation of pod borer larvae. Install 4 Helicoverpa pheromone traps/acre."
    }
  },
  'mustard': {
    name: 'Mustard / Rapeseed (Sarson)',
    varieties: [
      { name: 'Pusa Bold / Pusa Mustard 25', duration: '110–120 days', seedRateKgPerAcre: 1.5, yieldPotentialQtlPerAcre: '8–12', features: 'Bold seeds, 40% oil content, high frost resistance.' },
      { name: 'Giriraj (DRMRIJ-31)', duration: '125–130 days', seedRateKgPerAcre: 1.5, yieldPotentialQtlPerAcre: '10–14', features: 'High branching, heavy siliqua density, widely adopted across North India.' },
      { name: 'RH-725 / RH-749', duration: '130–135 days', seedRateKgPerAcre: 1.5, yieldPotentialQtlPerAcre: '10–15', features: 'High yield potential, excellent resistance to white rust.' }
    ],
    seedTreatment: {
      fungicide: 'Metalaxyl 35% WS @ 6g/kg OR Thiram 75% WP @ 3g/kg seed',
      bioAgent: 'Trichoderma viride @ 5g/kg',
      protocol: 'Treat seeds to prevent white rust and downy mildew in seedling stages.'
    },
    fertilizerPerAcre: {
      basal: 'SSP: 100 kg (Provides Phosphorus + essential Sulphur for oil synthesis) + Urea: 25 kg + MOP: 15 kg + Zinc Sulphate: 10 kg',
      floweringStage: 'Urea: 25 kg at 30–35 days with 1st irrigation',
      foliarSpray: 'NPK 0-52-34 @ 5g/L + Sulphur 80% WDG @ 2g/L at flowering',
      organicNote: 'Sulphur application is critical: increases mustard seed oil content by 2% to 4%.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-emergence.',
      pestControl: [
        { pest: 'Mustard Aphid (Lipaphis erysimi)', chemical: 'Dimethoate 30% EC @ 300 ml/acre OR Thiamethoxam 25% WG @ 40 g/acre', stage: 'Flowering & pod formation when cloudy' },
        { pest: 'Sawfly & Painted Bug', chemical: 'Malathion 50% EC @ 400 ml/acre', stage: 'Early seedling stage' }
      ],
      diseaseControl: [
        { disease: 'White Rust & Alternaria Blight', fungicide: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 400 g/acre OR Iprodione 50% WP @ 400 g/acre', timing: 'At first sign of white pustules under leaves' },
        { disease: 'Sclerotinia Stem Rot', fungicide: 'Carbendazim 50% WP @ 300 g/acre', timing: 'At 50% flowering' }
      ],
      bioRemedy: 'Yellow sticky traps @ 10/acre for aphids. Spray Verticillium lecanii @ 5g/L.'
    }
  },
  'turmeric': {
    name: 'Turmeric (Haldi)',
    varieties: [
      { name: 'Prathibha (IISR)', duration: '210–225 days', seedRateKgPerAcre: 800, yieldPotentialQtlPerAcre: '100–120 (fresh rhizomes)', features: 'High curcumin (6.25%), bold mother rhizomes, tolerant to rhizome rot.' },
      { name: 'Salem / Duggirala', duration: '240–260 days', seedRateKgPerAcre: 800, yieldPotentialQtlPerAcre: '110–130 (fresh)', features: 'Bright golden yellow color, strong aroma, high market preference in South India.' }
    ],
    seedTreatment: {
      fungicide: 'Mancozeb 75% WP @ 3g/L + Dimethoate 30% EC @ 2ml/L + Pseudomonas fluorescens @ 10g/L',
      bioAgent: 'Trichoderma viride slurry dip',
      protocol: 'Dip healthy mother/finger seed rhizomes in fungicide-insecticide solution for 30 minutes, shade dry for 2 hours before furrow planting.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 50 kg + MOP: 35 kg + Magnesium Sulphate: 10 kg + Zinc Sulphate: 10 kg + Neem Cake: 200 kg in raised beds',
      firstTopDress: 'Urea: 30 kg + MOP: 20 kg at 45 days (Tillering)',
      secondTopDress: 'Urea: 30 kg + MOP: 20 kg at 90 days (Rhizome initiation)',
      thirdTopDress: 'MOP: 20 kg + Potassium Schoenite at 120 days (Rhizome enlargement)',
      organicNote: 'Apply 8 to 10 tonnes well-rotted FYM and apply green leaf mulching (Sesbania/Neem leaves) @ 4 tonnes/acre at planting and 45 days.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-emergence + Heavy green leaf mulching.',
      pestControl: [
        { pest: 'Shoot Borer & Scale Insects', chemical: 'Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Dimethoate 30% EC @ 350 ml/acre', stage: '60–120 days' }
      ],
      diseaseControl: [
        { disease: 'Rhizome Rot (Pythium aphanidermatum)', fungicide: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) @ 2.5 g/L drenching around plant bases', timing: 'At first sign of leaf yellowing / monsoon onset' },
        { disease: 'Leaf Spot (Colletotrichum capsici)', fungicide: 'Propiconazole 25% EC @ 200 ml/acre OR Azoxystrobin @ 200 ml/acre', timing: 'During humid rainy periods' }
      ],
      bioRemedy: 'Soil drenching with Trichoderma viride + Pseudomonas fluorescens (2 kg each in 200 L water) at 30 & 60 days prevents 90% rhizome rot.'
    }
  },
  'redgram': {
    name: 'Red Gram (Tur / Arhar Dal)',
    varieties: [
      { name: 'ICPH-2740 (Pigeonpea Hybrid)', duration: '160–170 days', seedRateKgPerAcre: 5, yieldPotentialQtlPerAcre: '10–14', features: 'High branching, wilt and sterility mosaic resistant hybrid.' },
      { name: 'PRG-176 (Ujwala)', duration: '130–140 days', seedRateKgPerAcre: 6, yieldPotentialQtlPerAcre: '8–12', features: 'Medium duration, drought hardy, well suited for rainfed intercropping.' },
      { name: 'Asha (ICPL-87119)', duration: '180 days', seedRateKgPerAcre: 5, yieldPotentialQtlPerAcre: '9–13', features: 'Popular bold seed variety with high dhal recovery.' }
    ],
    seedTreatment: {
      fungicide: 'Trichoderma viride @ 5g/kg + Carbendazim @ 2g/kg',
      bioAgent: 'Rhizobium culture @ 10g/kg seed',
      protocol: 'Coat seeds with biofertilizer slurry with jaggery water.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 40 kg + MOP: 15 kg + Sulphur 90% WDG: 5 kg + Zinc Sulphate: 10 kg',
      podDevelopment: 'NPK 0-52-34 @ 1 kg/acre + Boron @ 100 g/acre foliar spray at podding',
      floweringSpray: '19-19-19 @ 5g/L at 50% flowering to maximize pod set',
      organicNote: 'Red gram adds extensive leaf fall organic matter to soil.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-emergence within 2 days of sowing.',
      pestControl: [
        { disease: 'Fusarium Wilt & Sterility Mosaic', fungicide: 'Carbendazim 50% WP @ 2g/L seed treatment + Propargite 57% EC @ 2ml/L for mite vector control', timing: 'At vegetative stage' }
      ],
      bioRemedy: 'Bird perches @ 20/acre and Pheromone traps @ 4/acre for Helicoverpa.'
    }
  },
  'greengram': {
    name: 'Green Gram (Moong Dal)',
    varieties: [
      { name: 'IPM-02-03', duration: '60–65 days', seedRateKgPerAcre: 8, yieldPotentialQtlPerAcre: '6–8', features: 'Short duration summer/Kharif crop, MYMV resistant, synchronous maturity.' },
      { name: 'WGG-42 (Yadadri)', duration: '65 days', seedRateKgPerAcre: 8, yieldPotentialQtlPerAcre: '6–9', features: 'Bold lustrous green seeds, ideal for rice fallows.' },
      { name: 'Samrat (PDM-139)', duration: '60 days', seedRateKgPerAcre: 8.5, yieldPotentialQtlPerAcre: '7–9', features: 'Super early maturity, fits perfectly in Zaid summer slot.' }
    ],
    seedTreatment: {
      fungicide: 'Carbendazim + Thiram @ 2.5g/kg seed',
      bioAgent: 'Rhizobium phaseoli @ 10g/kg + Trichoderma viride @ 5g/kg',
      protocol: 'Treat seeds with Rhizobium slurry in jaggery water to maximize root nodulation.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 30 kg + MOP: 10 kg + Sulphur 90% WDG: 5 kg drilled at sowing',
      podDevelopment: '2% DAP or 19-19-19 foliar spray at flowering',
      floweringSpray: 'Planofix (NAA) @ 4 ml/15L pump to reduce flower drop + 0-52-34 @ 5g/L',
      organicNote: 'Excellent green manure and biological nitrogen restoring short rotation.'
    },
    protectionSchedule: {
      weedManagement: 'Imazethapyr 10% SL (Pursuit) @ 300 ml/acre at 15–20 days (2-3 leaf weed stage).',
      pestControl: [
        { pest: 'Whitefly (transmits MYMV) & Thrips', chemical: 'Acetamiprid 20% SP @ 50 g/acre OR Thiamethoxam 25% WG @ 40 g/acre', stage: 'Seedling to flowering' },
        { pest: 'Pod Borer & Maruca', chemical: 'Emamectin Benzoate 5% SG @ 80 g/acre OR Chlorantraniliprole 18.5% SC @ 60 ml/acre', stage: 'Pod formation' }
      ],
      diseaseControl: [
        { disease: 'Yellow Mosaic Virus (MYMV) & Powdery Mildew', fungicide: 'Hexaconazole 5% EC @ 250 ml/acre + vector control for whitefly', timing: 'At flowering' },
        { disease: 'Cercospora Leaf Spot', fungicide: 'Mancozeb 75% WP @ 500 g/acre', timing: 'At early spotting' }
      ],
      bioRemedy: 'Yellow sticky traps @ 10/acre for whitefly. Spray Neem oil 10,000 ppm @ 3 ml/L.'
    }
  },
  'blackgram': {
    name: 'Black Gram (Urad Dal)',
    varieties: [
      { name: 'PU-31 / Shekhar 2', duration: '75–80 days', seedRateKgPerAcre: 8, yieldPotentialQtlPerAcre: '6–8', features: 'High yield, resistant to powdery mildew and yellow mosaic virus.' },
      { name: 'LBG-752 (Telugu Blackgram)', duration: '75 days', seedRateKgPerAcre: 8, yieldPotentialQtlPerAcre: '7–9', features: 'Lustrous black grains, high batter fermentation quality for South Indian cuisine.' }
    ],
    seedTreatment: {
      fungicide: 'Carbendazim 50% WP @ 2g/kg seed',
      bioAgent: 'Rhizobium & Trichoderma viride @ 5g/kg',
      protocol: 'Coat seeds with Rhizobium slurry 30 minutes before sowing in shade.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 35 kg + MOP: 15 kg + Sulphur: 5 kg',
      tilleringStage: 'Foliar spray of 2% Urea at 30 days',
      floweringSpray: 'NPK 19-19-19 @ 5g/L + Boron 20% @ 1g/L at flowering',
      organicNote: 'Fixes ~25 kg atmospheric Nitrogen per acre.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-emergence.',
      pestControl: [
        { pest: 'Whitefly & Pod Borer', chemical: 'Dimethoate 30% EC @ 300 ml/acre OR Chlorantraniliprole @ 60 ml/acre', stage: 'Flowering & pod setting' }
      ],
      diseaseControl: [
        { disease: 'Powdery Mildew & Rust', fungicide: 'Propiconazole 25% EC @ 200 ml/acre', timing: 'At initial infection' }
      ],
      bioRemedy: 'Neem seed kernel extract 5% spray.'
    }
  },
  'onion': {
    name: 'Onion (Pyaz / Ullipayalu)',
    varieties: [
      { name: 'Bhima Super / Bhima Red', duration: '110–120 days', seedRateKgPerAcre: 4, yieldPotentialQtlPerAcre: '120–160', features: 'Deep red color, excellent storage longevity (3–4 months).' },
      { name: 'Agrifound Dark Red (ADR)', duration: '120 days', seedRateKgPerAcre: 4, yieldPotentialQtlPerAcre: '130–170', features: 'Globe shaped dark red bulbs, tight scale leaves.' },
      { name: 'Bhima Shweta (White Onion)', duration: '110–115 days', seedRateKgPerAcre: 4, yieldPotentialQtlPerAcre: '110–140', features: 'High TSS (12%), premium for dehydration processing.' }
    ],
    seedTreatment: {
      fungicide: 'Thiram 75% WP @ 2.5g/kg OR Trichoderma harzianum @ 5g/kg',
      bioAgent: 'Pseudomonas fluorescens seedling root dip for 20 mins',
      protocol: 'Dip 45-day nursery seedling roots in Pseudomonas slurry before transplanting in flat beds.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 50 kg + MOP: 35 kg + Sulphur 90% WDG: 10 kg (Sulphur is crucial for pungency) + Zinc Sulphate: 10 kg',
      tilleringStage: 'Urea: 30 kg at 30 days after transplanting',
      floweringSpray: 'Urea: 25 kg + MOP: 20 kg at 45–50 days (Bulb enlargement stage)',
      foliarNutrients: '0-52-34 @ 5g/L + Boron 20% @ 1g/L at 60 days to prevent split bulbs',
      organicNote: 'Apply 8 tonnes FYM per acre.'
    },
    protectionSchedule: {
      weedManagement: 'Oxyfluorfen 23.5% EC (Goal) @ 150 ml/acre OR Pendimethalin 30% EC @ 1 L/acre pre-transplanting.',
      pestControl: [
        { pest: 'Onion Thrips (Thrips tabaci)', chemical: 'Fipronil 5% SC @ 300 ml/acre OR Diafenthiuron 50% WP @ 250 g/acre', stage: 'Vegetative to bulb formation' }
      ],
      diseaseControl: [
        { disease: 'Purple Blotch & Stemphylium Blight', fungicide: 'Mancozeb 75% WP @ 500 g + Hexaconazole 5% EC @ 250 ml/acre OR Azoxystrobin @ 200 ml/acre', timing: 'At first purple spot appearance on leaves' },
        { disease: 'Basal Rot (Fusarium)', fungicide: 'Trichoderma enriched FYM in soil + Carbendazim drenching', timing: 'At planting' }
      ],
      bioRemedy: 'Blue sticky traps @ 15/acre. Spray Beauveria bassiana @ 5g/L.'
    }
  },
  'sunflower': {
    name: 'Sunflower (Surajmukhi)',
    varieties: [
      { name: 'KBSH-44 / KBSH-53', duration: '90–95 days', seedRateKgPerAcre: 2.5, yieldPotentialQtlPerAcre: '8–12', features: 'High oil content (42%), uniform head size, drought hardy.' },
      { name: 'DRSH-1 / Sunbred 275', duration: '95–100 days', seedRateKgPerAcre: 2.5, yieldPotentialQtlPerAcre: '9–13', features: 'Sturdy thick stem, high seed filling percentage.' }
    ],
    seedTreatment: {
      fungicide: 'Carboxin + Thiram @ 3g/kg seed OR Metalaxyl 35% WS @ 4g/kg',
      bioAgent: 'Azotobacter & PSB @ 10g/kg',
      protocol: 'Soak seeds in 0.5% Boric acid solution for 4 hours for uniform germination.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 40 kg + MOP: 25 kg + Sulphur: 10 kg + Zinc Sulphate: 10 kg',
      tilleringStage: 'Urea: 25 kg at 30 days (Button/Star stage)',
      floweringSpray: 'Boron 20% @ 2g/L foliar spray at ray floret opening (Essential for seed setting in center of head)',
      organicNote: 'Sunflower responds exceptionally well to Sulphur and Boron.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 1 L/acre pre-emergence.',
      pestControl: [
        { pest: 'Helicoverpa Head Borer', chemical: 'Emamectin Benzoate 5% SG @ 80 g/acre OR Chlorantraniliprole @ 60 ml/acre', stage: 'Ray floret opening' }
      ],
      diseaseControl: [
        { disease: 'Alternaria Leaf Blight & Rust', fungicide: 'Mancozeb 75% WP @ 600 g/acre OR Tebuconazole @ 200 ml/acre', timing: 'Button stage' }
      ],
      bioRemedy: 'Maintain 2-3 honeybee boxes per acre to boost pollination and seed setting by 30%.'
    }
  },
  'bajra': {
    name: 'Bajra / Pearl Millet (Sajjalu)',
    varieties: [
      { name: 'HHB-67 Improved', duration: '65–70 days', seedRateKgPerAcre: 1.5, yieldPotentialQtlPerAcre: '12–16', features: 'Extra early maturity, highly drought tolerant, resistant to downy mildew.' },
      { name: 'Proagro 9444 / Pioneer 86M84', duration: '80–85 days', seedRateKgPerAcre: 1.5, yieldPotentialQtlPerAcre: '15–20', features: 'Bold grains, long compact heads, high fodder quality.' }
    ],
    seedTreatment: {
      fungicide: 'Metalaxyl-M 31.8% ES @ 2 ml/kg seed',
      bioAgent: 'Azospirillum culture @ 10g/kg',
      protocol: 'Brine water test: immerse seeds in 10% salt water, remove floating ergot sclerotia, wash and dry before fungicide coating.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 30 kg + MOP: 15 kg + Zinc Sulphate: 10 kg + Urea: 15 kg',
      tilleringStage: 'Urea: 25 kg at 25–30 days with rainfall/irrigation',
      floweringSpray: '19-19-19 @ 5g/L at boot leaf stage',
      organicNote: 'Tolerates low fertility and rocky sandy soils.'
    },
    protectionSchedule: {
      weedManagement: 'Atrazine 50% WP @ 500 g/acre within 2 days of sowing.',
      pestControl: [
        { pest: 'Shoot Fly & Stem Borer', chemical: 'Dimethoate 30% EC @ 300 ml/acre OR Cartap Hydrochloride @ 400 g/acre', stage: 'Seedling stage' }
      ],
      diseaseControl: [
        { disease: 'Downy Mildew (Green Ear) & Ergot', fungicide: 'Metalaxyl 8% + Mancozeb 64% WP @ 400 g/acre', timing: 'At tillering' }
      ],
      bioRemedy: 'Pheromone traps for borer.'
    }
  },
  'jowar': {
    name: 'Jowar / Sorghum (Jonnalu)',
    varieties: [
      { name: 'CSH-16 / CSH-25', duration: '105–110 days', seedRateKgPerAcre: 3.5, yieldPotentialQtlPerAcre: '16–22', features: 'High grain and stover yield, drought hardy, resistant to grain mold.' },
      { name: 'M-35-1 (Maldandi)', duration: '120 days', seedRateKgPerAcre: 3.5, yieldPotentialQtlPerAcre: '12–16', features: 'Pearly white bold grain, premier taste for Jowar rotis in Rabi season.' }
    ],
    seedTreatment: {
      fungicide: 'Thiram @ 3g/kg seed OR Carbendazim @ 2g/kg',
      bioAgent: 'Azospirillum & PSB @ 10g/kg',
      protocol: 'Treat seeds to prevent shoot fly and smut.'
    },
    fertilizerPerAcre: {
      basal: 'DAP: 40 kg + MOP: 20 kg + Zinc: 10 kg',
      tilleringStage: 'Urea: 30 kg at 30–35 days',
      floweringSpray: '0-52-34 @ 5g/L at flowering',
      organicNote: 'Deep root system extracts nutrients from deep clay layers.'
    },
    protectionSchedule: {
      weedManagement: 'Atrazine 50% WP @ 600 g/acre pre-emergence.',
      pestControl: [
        { pest: 'Sorghum Shoot Fly & Stem Borer', chemical: 'Chlorantraniliprole @ 60 ml/acre OR Carbofuran 3G whorl application', stage: '10–25 days' }
      ],
      diseaseControl: [
        { disease: 'Grain Mold & Anthracnose', fungicide: 'Propiconazole 25% EC @ 200 ml/acre', timing: 'Milky grain stage' }
      ],
      bioRemedy: 'Neem spray 5%.'
    }
  },
  'sesame': {
    name: 'Sesame / Til (Nuvvulu)',
    varieties: [
      { name: 'Swetha (JCS-96)', duration: '80–85 days', seedRateKgPerAcre: 2, yieldPotentialQtlPerAcre: '4–6', features: 'White seeded, 50% high grade oil, phyllody tolerant.' },
      { name: 'GT-10 / YLM-66', duration: '75–80 days', seedRateKgPerAcre: 2, yieldPotentialQtlPerAcre: '4–7', features: 'Bold seeds, early harvest, ideal for summer cultivation.' }
    ],
    seedTreatment: {
      fungicide: 'Carbendazim @ 2g/kg + Thiram @ 2g/kg seed',
      bioAgent: 'Trichoderma viride @ 5g/kg',
      protocol: 'Mix fine sand with seeds (1:4 ratio) for uniform broadcast/line sowing.'
    },
    fertilizerPerAcre: {
      basal: 'SSP: 60 kg + MOP: 15 kg + Urea: 15 kg + Sulphur: 5 kg',
      tilleringStage: 'Urea: 15 kg at 25 days with weeding',
      floweringSpray: 'Planofix (NAA) @ 3 ml/15L pump + 19-19-19 @ 5g/L at flowering',
      organicNote: 'High economic return with low water requirement.'
    },
    protectionSchedule: {
      weedManagement: 'Pendimethalin 30% EC @ 800 ml/acre pre-emergence.',
      pestControl: [
        { pest: 'Leaf & Pod Caterpillar (Antigastra) & Gall Fly', chemical: 'Chlorantraniliprole 18.5% SC @ 50 ml/acre OR Emamectin Benzoate @ 70 g/acre', stage: 'Vegetative to capsule stage' }
      ],
      diseaseControl: [
        { disease: 'Phyllody (transmitted by Leafhopper) & Phytophthora Blight', fungicide: 'Imidacloprid @ 60 ml/acre (for vector) + Mancozeb @ 500 g/acre', timing: 'At vegetative stage' }
      ],
      bioRemedy: 'Yellow sticky traps @ 10/acre.'
    }
  }
};

// Crop alias normalization helper
function normalizeCropKey(key) {
  if (!key || key === 'auto') return 'auto';
  const clean = key.toLowerCase().replace('crop-', '').trim();
  if (clean.includes('paddy') || clean.includes('rice') || clean.includes('dhan')) return 'paddy';
  if (clean.includes('cotton') || clean.includes('kapas')) return 'cotton';
  if (clean.includes('wheat') || clean.includes('gehun')) return 'wheat';
  if (clean.includes('maize') || clean.includes('makka') || clean.includes('corn')) return 'maize';
  if (clean.includes('soybean')) return 'soybean';
  if (clean.includes('chilli') || clean.includes('mirchi')) return 'chilli';
  if (clean.includes('groundnut') || clean.includes('mungfali') || clean.includes('peanut')) return 'groundnut';
  if (clean.includes('gram') || clean.includes('chana') || clean.includes('chickpea')) return 'gram-chana';
  if (clean.includes('mustard') || clean.includes('sarson') || clean.includes('rai')) return 'mustard';
  if (clean.includes('turmeric') || clean.includes('haldi')) return 'turmeric';
  if (clean.includes('redgram') || clean.includes('tur') || clean.includes('arhar')) return 'redgram';
  if (clean.includes('greengram') || clean.includes('moong')) return 'greengram';
  if (clean.includes('blackgram') || clean.includes('urad')) return 'blackgram';
  if (clean.includes('sugarcane') || clean.includes('ganna')) return 'sugarcane';
  if (clean.includes('tomato') || clean.includes('tamatar')) return 'tomato';
  if (clean.includes('potato') || clean.includes('aloo')) return 'potato';
  if (clean.includes('onion') || clean.includes('pyaz') || clean.includes('ulli')) return 'onion';
  if (clean.includes('sunflower') || clean.includes('surajmukhi')) return 'sunflower';
  if (clean.includes('bajra') || clean.includes('sajjalu') || clean.includes('millet')) return 'bajra';
  if (clean.includes('jowar') || clean.includes('jonnalu') || clean.includes('sorghum')) return 'jowar';
  if (clean.includes('sesame') || clean.includes('til') || clean.includes('nuvvulu')) return 'sesame';
  return AGRONOMY_KNOWLEDGE[clean] ? clean : 'paddy';
}

export class RecommendationService {
  /**
   * Generates tailored seed, fertilizer, and pesticide recommendations
   */
  static async generateRecommendation({
    soilTypeId = 'black-soil',
    season = 'kharif',
    previousCropId = 'paddy',
    soilPH = 7.2,
    fertilityLevel = 'Medium',
    farmSizeAcres = 2.0,
    targetCropId = null,
    state = 'Telangana',
    district = 'Warangal',
    irrigationType = 'Borewell / Canal Drip',
    language = 'en'
  }) {
    const soil = SOIL_TYPES.find(s => s.id === soilTypeId) || SOIL_TYPES[0];
    const prevCrop = PREVIOUS_CROPS.find(p => p.id === previousCropId) || PREVIOUS_CROPS[0];
    const numAcres = Math.max(0.25, parseFloat(farmSizeAcres) || 1.0);

    // Normalize target crop choice
    let normalizedTarget = normalizeCropKey(targetCropId);

    // If auto mode, select the best fitting crop based on soil and season
    if (!normalizedTarget || normalizedTarget === 'auto') {
      if (soilTypeId === 'black-soil') {
        normalizedTarget = season === 'rabi' ? 'gram-chana' : 'cotton';
      } else if (soilTypeId === 'alluvial-soil') {
        normalizedTarget = season === 'rabi' ? 'wheat' : 'paddy';
      } else if (soilTypeId === 'red-soil') {
        normalizedTarget = season === 'rabi' ? 'groundnut' : 'chilli';
      } else if (soilTypeId === 'sandy-loam') {
        normalizedTarget = season === 'rabi' ? 'mustard' : 'groundnut';
      } else if (soilTypeId === 'laterite-soil') {
        normalizedTarget = 'turmeric';
      } else {
        normalizedTarget = 'paddy';
      }
    }

    const agronomy = AGRONOMY_KNOWLEDGE[normalizedTarget] || AGRONOMY_KNOWLEDGE['paddy'];

    // Adjust for previous crop nitrogen credit
    let nitrogenDiscountPercent = 0;
    let rotationBenefitText = '';

    if (prevCrop.id === 'soybean' || prevCrop.id === 'gram-pulses' || prevCrop.id === 'groundnut' || prevCrop.id === 'greengram' || prevCrop.id === 'redgram' || prevCrop.id === 'blackgram') {
      nitrogenDiscountPercent = 20;
      if (language === 'te') {
        rotationBenefitText = `🌱 ప్రయోజనకరమైన పప్పుధాన్యాల మునుపటి పంట (${prevCrop.name}): గాల్లోని నత్రజనిని నేలలో స్థిరీకరించడం ద్వారా ఎకరానికి 20–25 కేజీల సహజ నత్రజని లభిస్తుంది. ప్రారంభ యూరియా మోతాదును 20% తగ్గించి పెట్టుబడి ఆదా చేసుకోండి.`;
      } else if (language === 'hi') {
        rotationBenefitText = `🌱 लाभकारी दलहनी पूर्व फसल (${prevCrop.name}): जैविक नाइट्रोजन स्थिरीकरण से प्रति एकड़ 20–25 किग्रा प्राकृतिक नाइट्रोजन प्राप्त होती है। बेसल यूरिया में 20% कटौती कर लागत घटाएं।`;
      } else {
        rotationBenefitText = `🌱 Beneficial Legume Predecessor (${prevCrop.name}): Biological nitrogen fixation leaves 20–25 kg available N/acre. Basal Urea dosage reduced by 20% to save input costs.`;
      }
    } else if (prevCrop.id === 'paddy') {
      if (language === 'te') {
        rotationBenefitText = `🌾 వరి తర్వాత పంట మార్పిడి: గట్టిపడిన నేల పొరను తేలికపరచి, నేలలోని తేమను ఉపయోగించుకుంటూ వ్యాధుల చక్రం విచ్ఛిన్నం చేస్తుంది.`;
      } else if (language === 'hi') {
        rotationBenefitText = `🌾 धान के बाद फसल चक्र: मिट्टी की सघनता कम कर जड़ विकास तेज करता है और जल जनित कीट-रोगों के चक्र को तोड़ता है।`;
      } else {
        rotationBenefitText = `🌾 Cereal Rotation after Paddy: Helps aerate compacted puddle layer, disrupts wetland disease cycles, and utilizes residual sub-soil moisture.`;
      }
    } else if (prevCrop.id === 'cotton') {
      if (language === 'te') {
        rotationBenefitText = `🌿 పత్తి తర్వాత పంట మార్పిడి: గులాబీ రంగు కాయతొలుచు పురుగు (Pink Bollworm) చక్రాన్ని విచ్ఛిన్నం చేసి నేల సారాన్ని పెంచుతుంది.`;
      } else if (language === 'hi') {
        rotationBenefitText = `🌿 कपास के बाद फसल चक्र: गुलाबी सुंडी (Pink Bollworm) के चक्र को समाप्त कर मिट्टी की उर्वरता लौटाता है।`;
      } else {
        rotationBenefitText = `🌿 Break Crop after Cotton: Sowing shallow to medium-rooted crops breaks the Pink Bollworm and sucking pest cycle in your soil.`;
      }
    } else {
      if (language === 'te') {
        rotationBenefitText = `✨ సమతుల్య పంట మార్పిడి: నేలలోని సూక్ష్మజీవుల సమతుల్యతను కాపాడి నేల సారాన్ని స్థిరంగా ఉంచుతుంది.`;
      } else if (language === 'hi') {
        rotationBenefitText = `✨ संतुलित फसल चक्र: मिट्टी के सूक्ष्मजीवों की रक्षा करता है और पोषक तत्वों का संतुलन बनाए रखता है।`;
      } else {
        rotationBenefitText = `✨ Balanced Rotation: Maintains soil microbial diversity and prevents nutrient exhaustion.`;
      }
    }

    // Call Featherless AI for intelligent personalized agronomy analysis
    let aiSummary = null;
    try {
      const systemPrompt = `You are a Senior Agronomist and Soil Scientist at ICAR / KVK India.
Provide practical, scientific, high-yield guidance for an Indian farmer.
Language: ${language === 'te' ? 'Telugu (తెలుగు)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Keep tone supportive, precise with commercial brand names, seed varieties, and fertilizer timings.`;

      const userPrompt = `Farmer Profile & Land Data:
- State & District: ${state}, ${district}
- Farm Area: ${numAcres} Acres
- Soil Type: ${soil.name} (pH: ${soilPH}, Fertility: ${fertilityLevel})
- Season: ${season.toUpperCase()}
- Previous Crop Harvested: ${prevCrop.name} (${prevCrop.soilImpact})
- Recommended Target Crop: ${agronomy.name}
- Irrigation: ${irrigationType}

Please provide a concise, high-impact agronomy advisory including:
1. Why this crop & seed variety is the highest-profit selection for this soil and season.
2. Soil Health & Fertilizer Strategy (including the previous crop rotation benefit).
3. 2 Key pest/disease warnings and recommended preventative sprays.
Answer directly and clearly in ${language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English'}.`;

      aiSummary = await FeatherlessAIService.generateChatCompletion({
        systemPrompt,
        userMessage: userPrompt,
        temperature: 0.4,
        maxTokens: 550
      });
    } catch (err) {
      console.warn('AI advisory generation fallback:', err.message);
    }

    // Fallback if offline or AI call throttled
    if (!aiSummary) {
      if (language === 'te') {
        aiSummary = `🌾 ${agronomy.name} సిఫార్సు సలహా:\n• ఎంపిక చేసిన ${soil.name} నేలకు మరియు ${season.toUpperCase()} కాలానికి ఈ పంట అత్యుత్తమ దిగుబడిని (~${agronomy.varieties[0]?.yieldPotentialQtlPerAcre} క్వి/ఎకరా) ఇస్తుంది.\n• ${prevCrop.name} తర్వాత సాగు చేయడం వలన నత్రజని ఆదా అవుతుంది.\n• విత్తన శుద్ధి తప్పనిసరిగా చేసి, సకాలంలో కలుపు మరియు పురుగు నివారణ మందులు పిచికారీ చేయండి.`;
      } else if (language === 'hi') {
        aiSummary = `🌾 ${agronomy.name} कृषि परामर्श:\n• चयनित ${soil.name} मिट्टी एवं ${season.toUpperCase()} मौसम में यह फसल अधिकतम पैदावार (~${agronomy.varieties[0]?.yieldPotentialQtlPerAcre} क्विंटल/एकड़) देने में सक्षम है।\n• पूर्व फसल ${prevCrop.name} के प्रभाव से यूरिया में बचत होगी।\n• प्रमाणित बीज उपचार एवं समयबद्ध खरपतवार/कीटनाशक प्रबंधन अपनाएं।`;
      } else {
        aiSummary = `🌾 ${agronomy.name} Advisory:\n• Optimal selection for ${soil.name} during ${season.toUpperCase()} with potential yield of ~${agronomy.varieties[0]?.yieldPotentialQtlPerAcre} Qtl/Acre.\n• Rotation benefit after ${prevCrop.name} optimizes soil nitrogen.\n• Follow mandatory 3-step seed treatment and split fertilizer applications for peak harvest.`;
      }
    }

    // Prepare response object
    return {
      success: true,
      cropKey: normalizedTarget,
      cropName: agronomy.name,
      farmSizeAcres: numAcres,
      soil: {
        type: soil.name,
        pH: soilPH,
        fertilityLevel,
        description: soil.description
      },
      season: season.toUpperCase(),
      previousCrop: {
        name: prevCrop.name,
        category: prevCrop.category,
        soilImpact: prevCrop.soilImpact,
        nitrogenDiscountPercent,
        rotationBenefitText
      },
      seeds: {
        varieties: agronomy.varieties.map(v => ({
          ...v,
          totalSeedNeededKg: Math.round(v.seedRateKgPerAcre * numAcres * 10) / 10
        })),
        seedTreatment: agronomy.seedTreatment
      },
      fertilizerSchedule: {
        basal: agronomy.fertilizerPerAcre.basal,
        tilleringOrVegetative: agronomy.fertilizerPerAcre.tilleringStage || agronomy.fertilizerPerAcre.firstTopDressing || agronomy.fertilizerPerAcre.crownRootInitiation || agronomy.fertilizerPerAcre.kneeHighStage || agronomy.fertilizerPerAcre.fertigationOrTopDress || agronomy.fertilizerPerAcre.earthingUp || 'Apply recommended split urea during vegetative flush',
        floweringOrReproductive: agronomy.fertilizerPerAcre.panicleInitiation || agronomy.fertilizerPerAcre.secondTopDressing || agronomy.fertilizerPerAcre.jointingStage || agronomy.fertilizerPerAcre.tasselingSilking || agronomy.fertilizerPerAcre.podDevelopment || agronomy.fertilizerPerAcre.grandGrowth || 'Top-dress Nitrogen and Potash during reproductive stage',
        foliarNutrients: agronomy.fertilizerPerAcre.floweringSpray || agronomy.fertilizerPerAcre.podFilling || agronomy.fertilizerPerAcre.tuberBulking,
        organicManure: agronomy.fertilizerPerAcre.organicNote,
        // Calculated commercial fertilizer bag estimates for the farm size
        bagsEstimate: {
          urea45kgBags: Math.max(1, Math.round(1.5 * numAcres * (1 - nitrogenDiscountPercent / 100))),
          dap50kgBags: Math.max(1, Math.round(1.0 * numAcres)),
          mop50kgBags: Math.max(1, Math.round(0.7 * numAcres)),
          zincSulphateKg: Math.round(10 * numAcres)
        }
      },
      protectionPlan: agronomy.protectionSchedule,
      aiAdvisorySummary: aiSummary,
      disclaimer: language === 'te' 
        ? 'ఈ AI సిఫార్సులు ICAR మరియు వ్యవసాయ విశ్వవిద్యాలయాల ప్రామాణిక నిబంధనలపై ఆధారపడి ఉన్నాయి. మీ స్థానిక రైతు భరోసా కేంద్రం / కేవీకే సిఫార్సులను కూడా పరిశీలించండి.'
        : language === 'hi'
        ? 'यह AI परामर्श ICAR व कृषि विज्ञान केंद्र के वैज्ञानिक मानकों पर आधारित है। कीटनाशकों के प्रयोग से पहले लेबल निर्देशों का पालन करें।'
        : 'AI recommendations are indicative agronomy advisories based on ICAR/KVK standard benchmarks. Always test soil at your local Rythu Bharosa Kendra / KVK and follow label directions for agrochemicals.'
    };
  }
}
