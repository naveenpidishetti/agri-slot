import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Building2, 
  ExternalLink, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Coins, 
  Sun, 
  Droplet, 
  Wrench, 
  Sprout, 
  Scale, 
  Layers, 
  Volume2, 
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  name_te: string;
  name_hi: string;
  ministry: string;
  category: 'FINANCIAL' | 'INSURANCE' | 'IRRIGATION' | 'MACHINERY' | 'ORGANIC' | 'SOLAR' | 'INFRASTRUCTURE';
  benefitAmount: string;
  benefitAmount_te: string;
  benefitAmount_hi: string;
  description: string;
  description_te: string;
  description_hi: string;
  eligibility: string[];
  eligibility_te: string[];
  eligibility_hi: string[];
  documentsRequired: string[];
  officialPortalUrl: string;
  badge: string;
  icon: any;
}

const SCHEMES_DATA: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    name_te: 'పీఎం-కిసాన్ సమ్మాన్ నిధి',
    name_hi: 'पीएम-किसान सम्मान निधि योजना',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'FINANCIAL',
    benefitAmount: '₹6,000 / Year (₹2,000 in 3 direct installments)',
    benefitAmount_te: 'ఏడాదికి ₹6,000 (3 విడతల్లో ₹2,000 చొప్పున బ్యాంక్ ఖాతాలో జమ)',
    benefitAmount_hi: '₹6,000 प्रति वर्ष (3 किस्तों में ₹2,000 सीधे बैंक खाते में)',
    description: 'Direct income support scheme transferring ₹6,000 per year in three 4-monthly installments directly into the Aadhaar-linked bank accounts of landholding farmer families.',
    description_te: 'వ్యవసాయ భూమి ఉన్న రైతు కుటుంబాల బ్యాంక్ ఖాతాల్లో ప్రతి 4 నెలలకు ఒకసారి ₹2,000 చొప్పున ఏడాదికి ₹6,000 నేరుగా జమ చేసే కేంద్ర ప్రభుత్వ పథకం.',
    description_hi: 'भूमिधारक किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता सीधे उनके आधार से जुड़े बैंक खातों में डीबीटी के माध्यम से प्रदान की जाती है।',
    eligibility: [
      'All landholding farmer families with cultivable land in their names',
      'Small and marginal farmers across all Indian States & UTs',
      'Aadhaar-linked active bank account with e-KYC completed'
    ],
    eligibility_te: [
      'తమ పేరు మీద సాగు భూమి ఉన్న రైతు కుటుంబాలన్నీ అర్హులు',
      'అన్ని రాష్ట్రాల చిన్న మరియు సన్నకారు రైతులు',
      'ఆధార్ లింక్ చేయబడిన బ్యాంక్ ఖాతా మరియు e-KYC పూర్తయిన వారు'
    ],
    eligibility_hi: [
      'खेती योग्य भूमि वाले सभी भूमिधारक किसान परिवार',
      'सभी राज्यों के छोटे और सीमांत किसान',
      'आधार से जुड़ा सक्रिय बैंक खाता और ई-केवाईसी पूरा होना अनिवार्य'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Landholding Records (Pattadar Passbook / RoR / 7/12)',
      'Bank Account Passbook (with IFSC Code)',
      'Mobile Number linked to Aadhaar'
    ],
    officialPortalUrl: 'https://pmkisan.gov.in/',
    badge: '100% Central Funded',
    icon: Coins
  },
  {
    id: 'pmfby',
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    name_te: 'ప్రధాన మంత్రి ఫసల్ బీమా యోజన (పంటల బీమా)',
    name_hi: 'प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'INSURANCE',
    benefitAmount: 'Comprehensive Financial Coverage against Crop Failure & Pest Attacks',
    benefitAmount_te: 'కరువు, వరదలు, తెగుళ్ల నష్టానికి పూర్తి పంట బీమా పరిహారం',
    benefitAmount_hi: 'सूखा, बाढ़ और कीट हमलों से फसल नुकसान पर पूर्ण बीमा सुरक्षा',
    description: 'Comprehensive yield and crop damage insurance coverage against non-preventable natural risks (drought, flood, unseasonal rains, landslides, pests & diseases) at very nominal premium rates (1.5% to 2%).',
    description_te: 'కరువు, అకాల వర్షాలు, వరదలు మరియు పురుగుల తెగుళ్ల వల్ల పంట నష్టపోయిన రైతులకు పూర్తి పరిహారం అందించే అత్యంత తక్కువ ప్రీమియం పంట బీమా పథకం.',
    description_hi: 'प्राकृतिक आपदाओं, कीटों और बीमारियों से होने वाले फसल नुकसान की स्थिति में किसानों को व्यापक बीमा सुरक्षा और वित्तीय सहायता प्रदान की जाती है।',
    eligibility: [
      'All farmers growing notified crops in notified areas (both sharecroppers and tenant farmers)',
      'Loanee farmers and non-loanee farmers both eligible',
      'Must enroll before the cut-off date for Kharif / Rabi season'
    ],
    eligibility_te: [
      'నోటిఫై చేయబడిన ప్రాంతాల్లో సాగు చేసే రైతులు మరియు కౌలు రైతులు',
      'బ్యాంక్ లోన్ తీసుకున్న మరియు తీసుకోని రైతులందరూ అర్హులు',
      'ఖరీఫ్ / రబీ సీజన్ గడువు తేదీలోపు నమోదు చేసుకోవాలి'
    ],
    eligibility_hi: [
      'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान और बटाईदार',
      'ऋणी और गैर-ऋणी दोनों किसान पात्र हैं',
      'खरीफ/रबी सीजन की कट-ऑफ तिथि से पहले पंजीकरण आवश्यक'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land Possession Certificate / Sowing Certificate',
      'Bank Account Passbook',
      'Crop Sowing Declaration from Village Revenue Officer (VRO)'
    ],
    officialPortalUrl: 'https://pmfby.gov.in/',
    badge: 'Lowest Premium: 1.5% - 2%',
    icon: ShieldCheck
  },
  {
    id: 'pmksy',
    name: 'PMKSY (Per Drop More Crop - Micro Irrigation)',
    name_te: 'ప్రధాన మంత్రి కృషి సించాయి యోజన (బిందు & తుంపర సేద్యం)',
    name_hi: 'प्रधानमंत्री कृषि सिंचाई योजना (सूक्ष्म सिंचाई)',
    ministry: 'Department of Agriculture & Farmers Welfare',
    category: 'IRRIGATION',
    benefitAmount: 'Up to 55% – 70% Subsidy for Drip & Sprinkler Systems',
    benefitAmount_te: 'డ్రిప్ మరియు స్ప్రింక్లర్ పరికరాలపై 55% నుండి 70% వరకు ప్రభుత్వ సబ్సిడీ',
    benefitAmount_hi: 'ड्रिप और स्प्रिंकलर सिस्टम पर 55% से 70% तक सरकारी सब्सिडी',
    description: 'Financial assistance for installing micro-irrigation systems (Drip and Sprinkler) to optimize water use efficiency, improve farm productivity, and reduce water wastage.',
    description_te: 'నీటి కొరత ఉన్న ప్రాంతాల్లో తక్కువ నీటితో ఎక్కువ దిగుబడి సాధించడానికి డ్రిప్ మరియు స్ప్రింక్లర్ వ్యవస్థల ఏర్పాటుపై భారీ ప్రభుత్వ రాయితీ పథకం.',
    description_hi: 'पानी की बचत और अधिक फसल उत्पादन के लिए ड्रिप एवं स्प्रिंकलर सिंचाई प्रणालियों की स्थापना पर सब्सिडी सहायता।',
    eligibility: [
      'Farmers of all categories having cultivable land with an assured water source (borewell/well/canal)',
      'Special priority & higher subsidies for Small & Marginal farmers and Women farmers',
      'Self-Help Groups (SHGs) and Producer Companies'
    ],
    eligibility_te: [
      'నీటి వనరు (బోరుబావి / బావి) మరియు సాగు భూమి ఉన్న రైతులందరూ',
      'చిన్న, సన్నకారు మరియు మహిళా రైతులకు అదనపు సబ్సిడీ',
      'రైతు సంఘాలు మరియు ఉత్పత్తిదారుల సంఘాలు'
    ],
    eligibility_hi: [
      'जल स्रोत (बोरवेल/कुआं) और कृषि भूमि वाले सभी किसान',
      'छोटे, सीमांत और महिला किसानों के लिए अतिरिक्त सब्सिडी',
      'किसान उत्पादक संगठन (FPO) और स्वयं सहायता समूह'
    ],
    documentsRequired: [
      'Aadhaar Card & Passport Photo',
      'Land Ownership Record (Pahani / 1B / 7/12)',
      'Water & Electricity Connection Certificate',
      'Bank Account Details'
    ],
    officialPortalUrl: 'https://pmksy.gov.in/',
    badge: 'Water Saving Tech',
    icon: Droplet
  },
  {
    id: 'kcc',
    name: 'KCC (Kisan Credit Card Scheme)',
    name_te: 'కిసాన్ క్రెడిట్ కార్డ్ పథకం (తక్కువ వడ్డీ రుణాలు)',
    name_hi: 'किसान क्रेडिट कार्ड योजना (रियायती कृषि ऋण)',
    ministry: 'Reserve Bank of India & NABARD',
    category: 'FINANCIAL',
    benefitAmount: 'Loans up to ₹3,00,000 at 4% Effective Interest Rate',
    benefitAmount_te: 'రూ. 3 లక్షల వరకు కేవలం 4% నామమాత్రపు వడ్డీకే వ్యవసాయ పంట రుణాలు',
    benefitAmount_hi: '₹3,00,000 तक का फसली ऋण केवल 4% प्रभावी ब्याज दर पर',
    description: 'Timely and hassle-free institutional short-term credit facility to meet crop cultivation expenses, post-harvest expenses, animal husbandry, and maintenance of farm assets.',
    description_te: 'రైతులకు పంట ఖర్చులు, ఎరువులు, విత్తనాల కొనుగోలు కోసం ఎలాంటి హామీ లేకుండా రూ. 1.6 లక్షలు, భూమి తాకట్టుపై రూ. 3 లక్షల వరకు తక్కువ వడ్డీ రుణ సౌకర్యం.',
    description_hi: 'किसानों को खेती की लागत, बीज, खाद और पशुपालन की जरूरतों के लिए समय पर और किफायती ब्याज दर पर संस्थागत ऋण उपलब्ध कराना।',
    eligibility: [
      'All individual farmers, joint borrowers, tenant farmers, and sharecroppers',
      'Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers',
      'Animal Husbandry and Fishery farmers also eligible'
    ],
    eligibility_te: [
      'వ్యక్తిగత రైతులు, ఉమ్మడి రైతులు మరియు కౌలు రైతులు',
      'రైతు స్వయం సహాయక బృందాలు (SHG)',
      'పశుపోషణ మరియు మత్స్యకార రైతులు'
    ],
    eligibility_hi: [
      'सभी व्यक्तिगत किसान, संयुक्त उधारकर्ता और बटाईदार किसान',
      'किसान स्वयं सहायता समूह (SHG) और जेएलजी समूह',
      'पशुपालक और डेयरी/मत्स्य किसान भी पात्र'
    ],
    documentsRequired: [
      'Duly filled KCC Application Form',
      'Identity & Address Proof (Aadhaar / Voter ID)',
      'Land Record Documents (verified by Revenue Department)',
      'No Dues Certificate (for loans above ₹1.6 Lakh)'
    ],
    officialPortalUrl: 'https://agricoop.nic.in/en/kisan-credit-card',
    badge: 'Interest Subvention 3%',
    icon: Scale
  },
  {
    id: 'smam-machinery',
    name: 'SMAM (Farm Machinery & Equipment Subsidy)',
    name_te: 'వ్యవసాయ యంత్రీకరణ పథకం (ట్రాక్టర్లు & డ్రోన్ సబ్సిడీ)',
    name_hi: 'कृषि यंत्रीकरण उप-मिशन (एसएमएएम)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'MACHINERY',
    benefitAmount: '40% to 50% Subsidy on Tractors, Harvesters, Tillers & Agri Drones',
    benefitAmount_te: 'ట్రాక్టర్లు, హార్వెస్టర్లు, పవర్ టిల్లర్లు మరియు డ్రోన్లపై 40% నుండి 50% సబ్సిడీ',
    benefitAmount_hi: 'ट्रैक्टर, कंबाइन हार्वेस्टर, पावर टिलर और ड्रोन पर 40% से 50% सब्सिडी',
    description: 'Subsidy assistance for purchasing modern agricultural machinery (Tractors, Rotavators, Harvesters, Planters, and Kisan Drones) to promote mechanization and reduce labor costs.',
    description_te: 'వ్యవసాయంలో శ్రమను తగ్గించి దిగుబడి పెంచడానికి ట్రాక్టర్లు, వరి కోత యంత్రాలు, పిచికారీ డ్రోన్ల కొనుగోలుపై ప్రభుత్వ రాయితీ అందించే పథకం.',
    description_hi: 'खेती में आधुनिक मशीनों जैसे ट्रैक्टर, रीपर, हार्वेस्टर और किसान ड्रोन की खरीद पर वित्तीय सब्सिडी प्रदान करने की योजना।',
    eligibility: [
      'All small and marginal farmers, SC/ST, and Women farmers (up to 50% subsidy)',
      'General category farmers (up to 40% subsidy)',
      'Farmer Producer Organizations (FPOs) and Custom Hiring Centres (up to 80% project cost)'
    ],
    eligibility_te: [
      'చిన్న, సన్నకారు, SC/ST మరియు మహిళా రైతులకు 50% సబ్సిడీ',
      'జనరల్ కేటగిరీ రైతులకు 40% సబ్సిడీ',
      'కస్టమ్ హైరింగ్ కేంద్రాలు (CHCs) మరియు FPO లకు 80% వరకు సహాయం'
    ],
    eligibility_hi: [
      'छोटे, सीमांत, एससी/एसटी और महिला किसान (50% तक सब्सिडी)',
      'सामान्य वर्ग के किसान (40% तक सब्सिडी)',
      'कस्टम हायरिंग सेंटर (CHC) और एफपीओ समूह'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land Pattadar Passbook Copy',
      'Bank Account Passbook copy with Cancelled Cheque',
      'Quotation / Proforma Invoice from authorized machinery dealer'
    ],
    officialPortalUrl: 'https://agrimachinery.nic.in/',
    badge: 'Up to 50% Subsidy',
    icon: Wrench
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Solar Agriculture Pumps Scheme)',
    name_te: 'పీఎం కుసుమ్ సోలార్ వ్యవసాయ పంపుల పథకం',
    name_hi: 'पीएम-कुसुम योजना (सौर कृषि पंप)',
    ministry: 'Ministry of New and Renewable Energy (MNRE)',
    category: 'SOLAR',
    benefitAmount: 'Up to 90% Subsidy for Standalone Solar Agri Pumps',
    benefitAmount_te: 'సోలార్ వ్యవసాయ పంపుల ఏర్పాటుపై 90% వరకు కేంద్ర & రాష్ట్ర సబ్సిడీ',
    benefitAmount_hi: 'स्टैंडअलोन सोलर पंप लगाने के लिए 90% तक सरकारी सब्सिडी',
    description: 'Provides standalone off-grid solar water pumps for irrigation and solarization of existing grid-connected agriculture pumps, giving farmers reliable daylight power and energy security.',
    description_te: 'కరెంట్ కోతలతో సంబంధం లేకుండా పగటిపూట నిరంతరాయంగా పంటలకు నీరు అందించడానికి సోలార్ పంపుల ఏర్పాటుకు 90% వరకు ఆర్థిక సహాయం.',
    description_hi: 'सिंचाई के लिए सोलर पंपों की स्थापना और ग्रिड से जुड़े कृषि पंपों के सौरीकरण के लिए 90% तक वित्तीय सहायता।',
    eligibility: [
      'Individual farmers with agricultural land lacking reliable grid power',
      'Water User Associations and Community / Cluster based irrigation projects',
      'Farmers with existing diesel pumps wishing to replace with Solar'
    ],
    eligibility_te: [
      'వ్యవసాయ భూమి మరియు బోరుబావి ఉన్న రైతులందరూ',
      'డీజిల్ పంపుల స్థానంలో సోలార్ పంపులు ఏర్పాటు చేయాలనుకునే రైతులు'
    ],
    eligibility_hi: [
      'कृषि भूमि और बोरवेल वाले व्यक्तिगत किसान',
      'डीजल पंप को सौर पंप से बदलने के इच्छुक किसान'
    ],
    documentsRequired: [
      'Aadhaar Card & Photo',
      'Land Revenue Records / Jamabandi / 1B',
      'Bank Passbook Details',
      'Affidavit of pump requirement'
    ],
    officialPortalUrl: 'https://pmkusum.mnre.gov.in/',
    badge: 'Daylight Clean Power',
    icon: Sun
  },
  {
    id: 'rythu-bandhu',
    name: 'Rythu Bharosa / Rythu Bandhu Scheme',
    name_te: 'రైతు బంధు / రైతు భరోసా పథకం (రాష్ట్ర పెట్టుబడి సాయం)',
    name_hi: 'रायथु बंधु / रायथु भरोसा योजना',
    ministry: 'State Department of Agriculture',
    category: 'FINANCIAL',
    benefitAmount: '₹10,000 – ₹15,000 per Acre per Year Investment Support',
    benefitAmount_te: 'ఎకరాకు ఏడాదికి ₹10,000 నుండి ₹15,000 వరకు పంట పెట్టుబడి సాయం',
    benefitAmount_hi: 'प्रति वर्ष ₹10,000 से ₹15,000 प्रति एकड़ प्रत्यक्ष निवेश सहायता',
    description: 'Pioneering agricultural direct investment support scheme providing financial grant per acre per year for purchase of inputs like seeds, fertilizers, pesticides, and field preparation.',
    description_te: 'రైతులు విత్తనాలు, ఎరువులు మరియు పురుగుమందుల కొనుగోలుకు అప్పులు చేయకుండా ప్రతి పంట కాలానికి ఎకరాకు నేరుగా బ్యాంక్ ఖాతాలో జమ చేసే పెట్టుబడి సాయం.',
    description_hi: 'किसानों को बीज, खाद, कीटनाशक खरीदने और बुवाई की लागत के लिए प्रति एकड़ वित्तीय सहायता प्रदान की जाती है।',
    eligibility: [
      'All resident farmer landholders holding digital title deed passbooks',
      'Cultivable land registered under Dharani / Revenue land portal',
      'Both Kharif and Rabi crop seasons'
    ],
    eligibility_te: [
      'డిజిటల్ పట్టాదారు పాస్ పుస్తకం ఉన్న రైతు యజమానులందరూ',
      'ధరణి / రెవెన్యూ రికార్డుల్లో నమోదైన సాగు భూమి గలవారు'
    ],
    eligibility_hi: [
      'डिजिटल पट्टा पासबुक वाले सभी किसान भूमिधारक',
      'राजस्व रिकॉर्ड में पंजीकृत कृषि भूमि वाले किसान'
    ],
    documentsRequired: [
      'Pattadar Passbook (with Digital Passbook QR)',
      'Aadhaar Card copy',
      'Aadhaar Seeded Active Bank Account Details'
    ],
    officialPortalUrl: 'https://rythubandhu.telangana.gov.in/',
    badge: 'Direct DBT Per Acre',
    icon: Coins
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card (SHC) Scheme',
    name_te: 'సాయిల్ హెల్త్ కార్డ్ పథకం (భూసార పరీక్ష పత్రం)',
    name_hi: 'मृदा स्वास्थ्य कार्ड योजना (सॉइल हेल्थ कार्ड)',
    ministry: 'Department of Agriculture & Farmers Welfare',
    category: 'ORGANIC',
    benefitAmount: '100% Free Soil Testing & Nutrient Advisory Card',
    benefitAmount_te: '100% ఉచిత భూసార పరీక్ష మరియు ఎరువుల సిఫార్సు కార్డు',
    benefitAmount_hi: '100% नि:शुल्क मिट्टी परीक्षण और पोषक तत्व परामर्श कार्ड',
    description: 'Free soil testing laboratory analysis of 12 critical soil parameters (N, P, K, S, Zinc, Fe, Cu, Mn, Bo, pH, EC, OC) along with customized dosage recommendations to reduce chemical costs.',
    description_te: 'రైతుల పొలంలోని మట్టిని ఉచితంగా ల్యాబ్‌లో పరీక్షించి, భూమిలో ఉన్న పోషకాల ఆధారంగా ఏ పంటకు ఎంత ఎరువులు వాడాలో తెలిపే శాస్త్రీయ కార్డు.',
    description_hi: 'मिट्टी की उर्वरता जांचकर 12 प्रमुख पोषक तत्वों की स्थिति और संतुलित खाद के उपयोग की मुफ्त रिपोर्ट प्रदान की जाती है।',
    eligibility: [
      'All farmers cultivating any crop across all villages in India',
      'Samples collected by Agriculture Extension Officers (AEOs) every 2-3 years'
    ],
    eligibility_te: [
      'భారతదేశంలోని రైతులందరికీ ఉచితంగా భూసార పరీక్ష నిర్వహిస్తారు'
    ],
    eligibility_hi: [
      'देश के सभी किसान अपने खेत की मिट्टी की मुफ्त जांच करवा सकते हैं'
    ],
    documentsRequired: [
      'Farmer Aadhaar Card',
      'Survey Number and Field Location Details'
    ],
    officialPortalUrl: 'https://soilhealth.dac.gov.in/',
    badge: '100% Free Service',
    icon: Sprout
  },
  {
    id: 'enam',
    name: 'e-NAM (National Agriculture Market)',
    name_te: 'ఈ-నామ్ (జాతీయ వ్యవసాయ మార్కెట్ పోర్టల్)',
    name_hi: 'ई-नाम (राष्ट्रीय कृषि बाजार)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'INFRASTRUCTURE',
    benefitAmount: 'Direct Online Bidding Across 1,400+ Mandis with Best Prices',
    benefitAmount_te: 'దేశవ్యాప్తంగా 1,400+ మార్కెట్లలో ఆన్‌లైన్ బిడ్డింగ్ ద్వారా గరిష్ట ధర',
    benefitAmount_hi: '1,400+ मंडियों में ऑनलाइन बोली द्वारा फसल का उच्चतम मूल्य',
    description: 'Pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities with transparent online bidding.',
    description_te: 'మధ్యవర్తుల ప్రమేయం లేకుండా రైతులు తమ పంటను దేశవ్యాప్తంగా ఉన్న 1,400 కు పైగా మార్కెట్ యార్డుల్లోని వ్యాపారులకు ఆన్‌లైన్ ద్వారా అమ్ముకునే జాతీయ పోర్టల్.',
    description_hi: 'किसानों को उनकी उपज का पारदर्शी और प्रतिस्पर्धी मूल्य दिलाने के लिए देश की सभी मंडियों को जोड़ने वाला ऑनलाइन ट्रेडिंग प्लेटफॉर्म।',
    eligibility: [
      'All farmers bringing produce to registered e-NAM APMC mandis',
      'FPOs, Traders, and Commission Agents with verified trade licenses'
    ],
    eligibility_te: [
      'పంటను మార్కెట్ యార్డుకు తీసుకువచ్చే రైతులందరూ నమోదు చేసుకోవచ్చు'
    ],
    eligibility_hi: [
      'ई-नाम पंजीकृत मंडियों में अपनी फसल लाने वाले सभी किसान पात्र हैं'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Bank Account Passbook (for direct online payment settlement)',
      'Mobile Number for SMS alerts'
    ],
    officialPortalUrl: 'https://www.enam.gov.in/',
    badge: 'Direct Pan-India Mandi Sale',
    icon: Building2
  },
  {
    id: 'aif',
    name: 'AIF (Agriculture Infrastructure Fund)',
    name_te: 'వ్యవసాయ మౌలిక సదుపాయాల నిధి (కోల్డ్ స్టోరేజ్ & గోడౌన్లు)',
    name_hi: 'कृषि अवसंरचना कोष (एआईएफ योजना)',
    ministry: 'Department of Agriculture & Farmers Welfare',
    category: 'INFRASTRUCTURE',
    benefitAmount: 'Loans up to ₹2 Crore with 3% Interest Subvention for Post-Harvest Assets',
    benefitAmount_te: 'కోల్డ్ స్టోరేజ్, గోడౌన్ల నిర్మాణానికి 3% వడ్డీ సబ్సిడీతో రూ. 2 కోట్ల వరకు రుణం',
    benefitAmount_hi: 'गोदाम, कोल्ड स्टोरेज और प्रसंस्करण इकाइयों के लिए ₹2 करोड़ तक 3% ब्याज छूट ऋण',
    description: 'Medium-long term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets like warehouses, silos, cold chains, and sorting units.',
    description_te: 'పంట నిల్వ గోదాములు, శీతల గిడ్డంగులు (కోల్డ్ స్టోరేజీలు), ప్రాసెసింగ్ యూనిట్ల ఏర్పాటుకు తక్కువ వడ్డీతో రూ. 2 కోట్ల వరకు రుణాలు అందించే పథకం.',
    description_hi: 'फसल कटाई के बाद के बुनियादी ढांचे जैसे गोदाम, कोल्ड स्टोर, पैकेजिंग और प्राथमिक प्रसंस्करण इकाइयों के निर्माण के लिए रियायती ऋण।',
    eligibility: [
      'Primary Agricultural Credit Societies (PACS), Marketing Cooperative Societies',
      'Farmer Producer Organizations (FPOs), SHGs, Agri-entrepreneurs, and Startups'
    ],
    eligibility_te: [
      'రైతు ఉత్పత్తిదారుల సంఘాలు (FPOs), వ్యవసాయ సహకార సంఘాలు, అగ్రి స్టార్టప్‌లు'
    ],
    eligibility_hi: [
      'किसान उत्पादक संगठन (FPO), पैक्स (PACS), कृषि उद्यमी और स्टार्ट-अप'
    ],
    documentsRequired: [
      'Project Detailed Project Report (DPR)',
      'Entity Registration / Aadhaar & PAN Card',
      'Land Ownership or Long-term Lease Agreement',
      'Bank Account Statement'
    ],
    officialPortalUrl: 'https://agriinfra.dac.gov.in/',
    badge: '₹2 Crore Debt Financing',
    icon: Layers
  }
];

export const GovernmentSchemes: React.FC<{ onBack: () => void; onBookSlot?: () => void }> = ({ onBack, onBookSlot }) => {
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeSchemeModal, setActiveSchemeModal] = useState<Scheme | null>(null);

  // Text-to-speech for reading scheme overview aloud
  const speakScheme = (scheme: Scheme) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = language === 'te'
      ? `${scheme.name_te}. ప్రయోజనం: ${scheme.benefitAmount_te}. వివరాలు: ${scheme.description_te}. దరఖాస్తు కోసం అధికారిక పోర్టల్ లింక్ అందుబాటులో ఉంది.`
      : language === 'hi'
      ? `${scheme.name_hi}। लाभ: ${scheme.benefitAmount_hi}। विवरण: ${scheme.description_hi}। आवेदन करने के लिए आधिकारिक लिंक दिया गया है।`
      : `${scheme.name}. Benefit: ${scheme.benefitAmount}. Overview: ${scheme.description}. Click the apply online button to open official government portal.`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Filter schemes
  const filteredSchemes = SCHEMES_DATA.filter((scheme) => {
    const matchesCategory = selectedCategory === 'ALL' || scheme.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      scheme.name.toLowerCase().includes(query) ||
      scheme.name_te.toLowerCase().includes(query) ||
      scheme.name_hi.toLowerCase().includes(query) ||
      scheme.description.toLowerCase().includes(query) ||
      scheme.ministry.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'ALL', label: language === 'te' ? 'అన్నీ' : language === 'hi' ? 'सभी योजनाएं' : 'All Schemes', icon: Layers },
    { id: 'FINANCIAL', label: language === 'te' ? 'ఆర్థిక సాయం' : language === 'hi' ? 'वित्तीय सहायता' : 'Direct Financial Support', icon: Coins },
    { id: 'INSURANCE', label: language === 'te' ? 'పంట బీమా' : language === 'hi' ? 'फसल बीमा' : 'Crop Insurance', icon: ShieldCheck },
    { id: 'IRRIGATION', label: language === 'te' ? 'సాగునీరు & డ్రిప్' : language === 'hi' ? 'सिंचाई और ड्रिप' : 'Micro-Irrigation', icon: Droplet },
    { id: 'MACHINERY', label: language === 'te' ? 'ట్రాక్టర్ & యంత్రాలు' : language === 'hi' ? 'कृषि यंत्र सब्सिडी' : 'Machinery & Drones', icon: Wrench },
    { id: 'SOLAR', label: language === 'te' ? 'సోలార్ పంపులు' : language === 'hi' ? 'सोलर पंप' : 'Solar Power & Pumps', icon: Sun },
    { id: 'ORGANIC', label: language === 'te' ? 'భూసార పరీక్ష' : language === 'hi' ? 'मृदा स्वास्थ्य' : 'Soil & Organic', icon: Sprout },
    { id: 'INFRASTRUCTURE', label: language === 'te' ? 'గోడౌన్లు & మార్కెట్' : language === 'hi' ? 'मंडी और गोदाम' : 'Infrastructure & Mandis', icon: Building2 }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-900">
      
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'te' ? 'కేంద్ర & రాష్ట్ర ప్రభుత్వ పథకాలు' : language === 'hi' ? 'केंद्रीय एवं राज्य कृषि योजनाएं' : 'Central & State Government Schemes'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-outfit text-white tracking-tight">
              {language === 'te' 
                ? '🏛️ రైతు ప్రభుత్వ పథకాలు & రాయితీలు' 
                : language === 'hi'
                ? '🏛️ किसान सरकारी योजनाएं एवं सब्सिडी पोर्टल'
                : '🏛️ Farmer Government Schemes & Subsidies'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 max-w-2xl leading-relaxed font-medium">
              {language === 'te'
                ? 'రైతుల కోసం అన్ని ప్రధాన ప్రభుత్వ పథకాల వివరాలు, అర్హతలు, కావాల్సిన పత్రాలు మరియు నేరుగా అధికారిక పోర్టల్‌లో దరఖాస్తు చేసుకునే అధికారిక లింకులు.'
                : language === 'hi'
                ? 'सभी प्रमुख केंद्रीय और राज्य कृषि योजनाओं की संपूर्ण जानकारी, पात्रता, आवश्यक दस्तावेज और सीधे सरकारी पोर्टल पर आवेदन करने के आधिकारिक लिंक।'
                : 'Complete directory of Central and State agricultural schemes, subsidies, eligibility criteria, required documents, and direct 1-click links to official government application portals.'}
            </p>
          </div>

          <button
            onClick={onBack}
            className="self-start sm:self-center px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToDashboard || 'Back to Dashboard'}</span>
          </button>
        </div>

        {/* Stats summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div>
            <div className="text-emerald-400 font-black text-xl sm:text-2xl font-outfit">10+ Schemes</div>
            <div className="text-slate-300 text-[11px] font-medium">Central & State Portals</div>
          </div>
          <div>
            <div className="text-emerald-400 font-black text-xl sm:text-2xl font-outfit">Up to 90%</div>
            <div className="text-slate-300 text-[11px] font-medium">Subsidy on Equipment & Solar</div>
          </div>
          <div>
            <div className="text-emerald-400 font-black text-xl sm:text-2xl font-outfit">4% Loan</div>
            <div className="text-slate-300 text-[11px] font-medium">KCC Interest Rate</div>
          </div>
          <div>
            <div className="text-emerald-400 font-black text-xl sm:text-2xl font-outfit">1-Click Apply</div>
            <div className="text-slate-300 text-[11px] font-medium">Direct Official Portals</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'te' ? 'పథకం పేరు లేదా సబ్సిడీ కోసం వెతకండి (ఉదా: PM-KISAN, డ్రిప్, ట్రాక్టర్)...' : language === 'hi' ? 'योजना खोजें (जैसे पीएम-किसान, ड्रिप, ट्रैक्टर, सोलर)...' : 'Search schemes (e.g., PM-Kisan, Drip, Tractor, Solar, Insurance)...'}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchemes.map((scheme) => {
          const Icon = scheme.icon;
          const localizedName = language === 'te' ? scheme.name_te : language === 'hi' ? scheme.name_hi : scheme.name;
          const localizedBenefit = language === 'te' ? scheme.benefitAmount_te : language === 'hi' ? scheme.benefitAmount_hi : scheme.benefitAmount;
          const localizedDesc = language === 'te' ? scheme.description_te : language === 'hi' ? scheme.description_hi : scheme.description;
          const localizedEligibility = language === 'te' ? scheme.eligibility_te : language === 'hi' ? scheme.eligibility_hi : scheme.eligibility;

          return (
            <div
              key={scheme.id}
              className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-500 hover:shadow-lg transition-all duration-300 group shadow-xs space-y-4"
            >
              <div className="space-y-3">
                {/* Top Badge & Audio */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {scheme.badge}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {scheme.ministry}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakScheme(scheme)}
                    className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                    title="Read scheme details aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black font-outfit text-slate-900 group-hover:text-emerald-700 transition">
                      {localizedName}
                    </h2>
                  </div>
                </div>

                {/* Benefit Highlight Box */}
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                  <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Coins className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'te' ? 'ఆర్థిక ప్రయోజనం / రాయితీ' : language === 'hi' ? 'वित्तीय लाभ / सब्सिडी' : 'Financial Benefit & Subsidy'}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-950">
                    {localizedBenefit}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {localizedDesc}
                </p>

                {/* Key Eligibility Points */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'te' ? 'ప్రధాన అర్హతలు:' : language === 'hi' ? 'मुख्य पात्रता:' : 'Key Eligibility:'}</span>
                  </div>
                  <ul className="text-[11px] text-slate-500 space-y-1 pl-4 list-disc font-medium">
                    {localizedEligibility.slice(0, 2).map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSchemeModal(scheme)}
                  className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'పూర్తి వివరాలు & పత్రాలు' : language === 'hi' ? 'पूरा विवरण व दस्तावेज' : 'View Requirements'}</span>
                </button>

                {/* Direct External Application Link */}
                <a
                  href={scheme.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-transform group-hover:scale-[1.02] cursor-pointer"
                >
                  <span>{language === 'te' ? 'అధికారికంగా దరఖాస్తు చేయండి' : language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply on Govt Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No schemes match your search</h3>
          <p className="text-xs text-slate-500">Try changing the search query or selecting 'All Schemes'.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Scheme Detail & Documents Modal */}
      {activeSchemeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeSchemeModal.badge}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-outfit text-slate-900 mt-2">
                  {language === 'te' ? activeSchemeModal.name_te : language === 'hi' ? activeSchemeModal.name_hi : activeSchemeModal.name}
                </h2>
                <div className="text-xs text-slate-500 font-medium">{activeSchemeModal.ministry}</div>
              </div>
              <button
                onClick={() => setActiveSchemeModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Benefit Details */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="text-xs font-extrabold text-emerald-800">
                {language === 'te' ? 'ఆర్థిక ప్రయోజనం:' : language === 'hi' ? 'वित्तीय लाभ:' : 'Government Financial Benefit:'}
              </div>
              <div className="text-base font-black text-emerald-950 font-outfit">
                {language === 'te' ? activeSchemeModal.benefitAmount_te : language === 'hi' ? activeSchemeModal.benefitAmount_hi : activeSchemeModal.benefitAmount}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {language === 'te' ? 'పథకం సంక్షిప్త వివరాలు' : language === 'hi' ? 'योजना का विवरण' : 'Scheme Overview'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {language === 'te' ? activeSchemeModal.description_te : language === 'hi' ? activeSchemeModal.description_hi : activeSchemeModal.description}
              </p>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'te' ? 'ఎవరు అర్హులు?' : language === 'hi' ? 'कौन पात्र हैं?' : 'Eligibility Criteria'}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc font-medium">
                {(language === 'te' ? activeSchemeModal.eligibility_te : language === 'hi' ? activeSchemeModal.eligibility_hi : activeSchemeModal.eligibility).map((el, i) => (
                  <li key={i}>{el}</li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{language === 'te' ? 'కావలసిన పత్రాలు (Required Documents)' : language === 'hi' ? 'आवश्यक दस्तावेज' : 'Documents Required for Application'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSchemeModal.documentsRequired.map((doc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Direct Apply Action */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-medium">
                Official Portal: <span className="font-mono text-emerald-700">{activeSchemeModal.officialPortalUrl}</span>
              </div>

              <a
                href={activeSchemeModal.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'te' ? 'పోర్టల్ లో దరఖాస్తు చేయండి' : language === 'hi' ? 'सरकारी पोर्टल पर आवेदन करें' : 'Open Official Apply Portal'}</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
