import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ALL_INDIAN_STATES } from '../../data/indiaData';
import { 
  ArrowLeft, 
  Phone, 
  HelpCircle, 
  MessageSquare, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Search, 
  X, 
  Scale, 
  Sparkles,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  Layers,
  FileCheck2
} from 'lucide-react';

interface HelpPageProps {
  onBack: () => void;
  onBookSlot?: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onBack, onBookSlot }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // District Locator State
  const defaultState = useMemo(() => {
    const userState = user?.state;
    if (userState && ALL_INDIAN_STATES.some(s => s.state.toLowerCase() === userState.toLowerCase())) {
      return ALL_INDIAN_STATES.find(s => s.state.toLowerCase() === userState.toLowerCase())!.state;
    }
    return 'Telangana';
  }, [user]);

  const [selectedState, setSelectedState] = useState<string>(defaultState);
  
  const availableDistricts = useMemo(() => {
    return ALL_INDIAN_STATES.find(s => s.state === selectedState)?.districts || ['Warangal Urban'];
  }, [selectedState]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    if (user?.district && availableDistricts.includes(user.district)) {
      return user.district;
    }
    return availableDistricts[0] || 'Warangal Urban';
  });

  // Keep district synced when state changes
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = ALL_INDIAN_STATES.find(s => s.state === stateName)?.districts || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    }
  };

  // FAQ Tab State
  const [activeFaqTab, setActiveFaqTab] = useState<'SLOTS' | 'QUALITY' | 'PAYMENT' | 'AGRONOMY'>('SLOTS');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [expandedSearchResult, setExpandedSearchResult] = useState<number | null>(0);

  // Grievance Ticket Form State
  const [ticketCategory, setTicketCategory] = useState<string>('SLOT_RESCHEDULE');
  const [farmerName, setFarmerName] = useState<string>(user?.name || '');
  const [farmerMobile, setFarmerMobile] = useState<string>(user?.mobile || '');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [ticketSubmitting, setTicketSubmitting] = useState<boolean>(false);
  const [generatedTicket, setGeneratedTicket] = useState<{ id: string; category: string; time: string } | null>(null);

  useEffect(() => {
    if (user?.name && !farmerName) setFarmerName(user.name);
    if (user?.mobile && !farmerMobile) setFarmerMobile(user.mobile);
  }, [user]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!farmerName.trim()) {
      setFormError(language === 'te' ? 'దయచేసి మీ పేరు నమోదు చేయండి.' : language === 'hi' ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter farmer name.');
      return;
    }

    const cleanMobile = farmerMobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      setFormError(language === 'te' ? 'దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : language === 'hi' ? 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!ticketMessage.trim() || ticketMessage.trim().length < 5) {
      setFormError(language === 'te' ? 'దయచేసి మీ సమస్య వివరాలను రాయండి (కనీసం 5 అక్షరాలు).' : language === 'hi' ? 'कृपया अपनी समस्या का विवरण लिखें।' : 'Please describe your issue (minimum 5 characters).');
      return;
    }

    setTicketSubmitting(true);
    setTimeout(() => {
      const newTicket = {
        id: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        category: ticketCategory,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setGeneratedTicket(newTicket);
      setTicketSubmitting(false);
      setTicketMessage('');
      setFormError('');
    }, 600);
  };

  // Multilingual Content
  const strings = {
    en: {
      badge: '24x7 Kisan Assistance & Grievance Desk',
      title: '📞 Kisan Help & Support Centre',
      subtitle: 'Official toll-free assistance, district agriculture officer directory & instant support tickets',
      bookSlotBtn: 'Book Procurement Slot',
      searchTitle: 'Search Kisan Help Centre & FAQs',
      searchSubtitle: 'Search questions on 3-slot cap, moisture dockage rules, MSP bank payments, crop doctor, or toll-free numbers',
      searchPlaceholder: "Type your question or keyword (e.g., 'moisture', 'slot limit', 'payment', 'reschedule')...",
      popularTopics: 'Popular Topics:',
      searchResultsFor: 'Search Results for',
      matchesFound: 'matches found',
      clearSearch: 'Clear Search & Show All',
      noResultsTitle: 'No Direct Results for',
      noResultsDesc: 'Try searching with simpler terms like "slot", "moisture", "payment", or "helpline". You can also directly contact our Kisan Call Centre or submit a support ticket.',
      callHelplineBtn: 'Call 1800-180-1551 (Toll-Free)',
      resetSearch: 'Reset Search',
      matchingHelplines: 'Matching Emergency Helplines',
      matchingFaqs: 'Matching Questions & Official Answers',
      tapToCall: 'Tap to Call 📞',
      callNow: 'Call Now 📞',
      officeLocatorTitle: 'Local Agriculture Office & RBK Locator',
      officialDirectory: 'Official Directory',
      selectState: 'Select State',
      selectDistrict: 'Select District',
      activeOfficer: 'Active Officer',
      submitTicketTitle: 'Submit Grievance / Support Ticket',
      ticketSuccessTitle: 'Grievance Ticket Registered!',
      ticketSuccessDesc: 'Your request has been routed to the District Procurement Officer. An SMS update with tracking details has been sent to',
      submitAnotherBtn: 'Submit Another Query',
      issueCategory: 'Issue Category',
      farmerNameLabel: 'Farmer Name',
      farmerMobileLabel: 'Mobile Number',
      describeIssue: 'Describe Your Issue / Question',
      describePlaceholder: 'Enter details of your procurement query or issue...',
      submitTicketBtn: 'Submit Support Ticket',
      submittingTicketBtn: 'Registering Ticket...',
      faqTitle: 'Frequently Asked Questions (MSP Guidelines & Portal Rules)',
      faqSubtitle: 'Instant answers on slot policies, quality norms, and payment processes',
      tabSlots: '📅 Slots & Pass',
      tabQuality: '🌾 Quality & Moisture',
      tabPayment: '💰 Bank & Payments',
      tabAgronomy: '🌱 Seeds & AI Advisory'
    },
    te: {
      badge: '24x7 కిసాన్ సహాయం మరియు ఫిర్యాదుల విభాగం',
      title: '📞 కిసాన్ సహాయ కేంద్రం (Help Centre)',
      subtitle: 'అధికారిక టోల్-ఫ్రీ నంబర్లు, జిల్లా వ్యవసాయ అధికారి (DAO/RBK) వివరాలు & సమస్య పరిష్కార టికెట్లు',
      bookSlotBtn: 'స్లాట్ బుక్ చేయండి',
      searchTitle: 'సహాయ కేంద్రం మరియు ప్రశ్నలను శోధించండి',
      searchSubtitle: '3-స్లాట్ల పరిమితి, తేమ నిబంధనలు, MSP బ్యాంక్ చెల్లింపులు లేదా టోల్ ఫ్రీ నంబర్లపై శోధించండి',
      searchPlaceholder: "మీ ప్రశ్న లేదా పదాన్ని రాయండి (ఉదా: 'తేమ', 'స్లాట్', 'చెల్లింపు', 'సహాయం')...",
      popularTopics: 'ముఖ్యమైన అంశాలు:',
      searchResultsFor: 'శోధన ఫలితాలు:',
      matchesFound: 'ఫలితాలు లభించాయి',
      clearSearch: 'అన్నీ చూపించు (Clear)',
      noResultsTitle: 'ఎటువంటి ఫలితాలు లభించలేదు:',
      noResultsDesc: 'దయచేసి "స్లాట్", "తేమ", "చెల్లింపు" వంటి సాధారణ పదాలతో వెతకండి లేదా కిసాన్ కాల్ సెంటర్‌కు కాల్ చేయండి.',
      callHelplineBtn: '1800-180-1551 కి కాల్ చేయండి (టోల్-ఫ్రీ)',
      resetSearch: 'మళ్ళీ శోధించండి',
      matchingHelplines: 'సంబంధిత అత్యవసర హెల్ప్‌లైన్లు',
      matchingFaqs: 'సంబంధిత ప్రశ్నలు & అధికారిక సమాధానాలు',
      tapToCall: 'కాల్ చేయండి 📞',
      callNow: 'ఇప్పుడే కాల్ చేయండి 📞',
      officeLocatorTitle: 'స్థానిక వ్యవసాయ శాఖ & రైతు భరోసా కేంద్రం (RBK) వివరాలు',
      officialDirectory: 'అధికారిక వివరాలు',
      selectState: 'రాష్ట్రం ఎంచుకోండి',
      selectDistrict: 'జిల్లా ఎంచుకోండి',
      activeOfficer: 'అందుబాటులో ఉన్న అధికారి',
      submitTicketTitle: 'సమస్య / మద్దతు టికెట్ నమోదు చేయండి',
      ticketSuccessTitle: 'ఫిర్యాదు టికెట్ విజయవంతంగా నమోదైంది!',
      ticketSuccessDesc: 'మీ అభ్యర్థన జిల్లా సేకరణ అధికారికి చేరింది. ట్రాకింగ్ వివరాలతో SMS ఈ నంబర్‌కు పంపబడింది:',
      submitAnotherBtn: 'మరో సమస్యను నమోదు చేయండి',
      issueCategory: 'సమస్య రకం',
      farmerNameLabel: 'రైతు పేరు',
      farmerMobileLabel: 'మొబైల్ నంబర్',
      describeIssue: 'మీ సమస్య లేదా ప్రశ్నను వివరించండి',
      describePlaceholder: 'సేకరణ, స్లాట్ లేదా చెల్లింపు సమస్యల వివరాలు ఇక్కడ రాయండి...',
      submitTicketBtn: 'సమస్యను సమర్పించండి',
      submittingTicketBtn: 'నమోదు అవుతోంది...',
      faqTitle: 'తరచుగా అడిగే ప్రశ్నలు (FAQ & నిబంధనలు)',
      faqSubtitle: 'స్లాట్ విధానాలు, తేమ నిబంధనలు మరియు బ్యాంక్ బదిలీపై పూర్తి స్పష్టత',
      tabSlots: '📅 స్లాట్లు & పాస్',
      tabQuality: '🌾 నాణ్యత & తేమ',
      tabPayment: '💰 బ్యాంక్ & చెల్లింపులు',
      tabAgronomy: '🌱 విత్తనాలు & సలహాలు'
    },
    hi: {
      badge: '24x7 किसान सहायता एवं शिकायत निवारण केंद्र',
      title: '📞 किसान सहायता केंद्र (Help Centre)',
      subtitle: 'आधिकारिक टोल-फ्री हेल्पलाइन, जिला कृषि अधिकारी निर्देशिका एवं तुरंत सहायता टिकट',
      bookSlotBtn: 'स्लॉट बुक करें',
      searchTitle: 'किसान सहायता केंद्र एवं प्रश्न खोजें',
      searchSubtitle: '3-स्लॉट सीमा, नमी मानक, एमएसपी बैंक भुगतान या टोल-फ्री नंबर पर जानकारी खोजें',
      searchPlaceholder: "अपना प्रश्न या शब्द लिखें (उदा: 'नमी', 'स्लॉट', 'भुगतान', 'हेल्पलाइन')...",
      popularTopics: 'लोकप्रिय विषय:',
      searchResultsFor: 'खोज परिणाम:',
      matchesFound: 'परिणाम मिले',
      clearSearch: 'सभी देखें (Clear)',
      noResultsTitle: 'कोई परिणाम नहीं मिला:',
      noResultsDesc: 'कृपया "स्लॉट", "नमी", "भुगतान" जैसे सरल शब्दों से खोजें या किसान कॉल सेंटर पर संपर्क करें।',
      callHelplineBtn: '1800-180-1551 पर कॉल करें (टोल-फ्री)',
      resetSearch: 'पुनः खोजें',
      matchingHelplines: 'संबंधित आपातकालीन हेल्पलाइन',
      matchingFaqs: 'संबंधित प्रश्न और आधिकारिक उत्तर',
      tapToCall: 'कॉल करें 📞',
      callNow: 'अभी कॉल करें 📞',
      officeLocatorTitle: 'स्थानीय कृषि कार्यालय एवं केंद्र लोकेटर',
      officialDirectory: 'आधिकारिक निर्देशिका',
      selectState: 'राज्य चुनें',
      selectDistrict: 'ज़िला चुनें',
      activeOfficer: 'सक्रिय अधिकारी',
      submitTicketTitle: 'शिकायत / सहायता टिकट दर्ज करें',
      ticketSuccessTitle: 'शिकायत टिकट सफलतापूर्वक दर्ज!',
      ticketSuccessDesc: 'आपका अनुरोध ज़िला खरीद अधिकारी को भेज दिया गया है। ट्रैकिंग एसएमएस इस नंबर पर भेजा गया है:',
      submitAnotherBtn: 'अन्य प्रश्न दर्ज करें',
      issueCategory: 'समस्या की श्रेणी',
      farmerNameLabel: 'किसान का नाम',
      farmerMobileLabel: 'मोबाइल नंबर',
      describeIssue: 'अपनी समस्या या प्रश्न का विवरण दें',
      describePlaceholder: 'खरीद, स्लॉट या भुगतान संबंधी समस्या का विवरण लिखें...',
      submitTicketBtn: 'सहायता टिकट भेजें',
      submittingTicketBtn: 'दर्ज हो रहा है...',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न (FAQ एवं नियम)',
      faqSubtitle: 'स्लॉट नीतियों, गुणवत्ता मानकों और बैंक हस्तांतरण पर स्पष्ट उत्तर',
      tabSlots: '📅 स्लॉट व पास',
      tabQuality: '🌾 गुणवत्ता व नमी',
      tabPayment: '💰 बैंक व भुगतान',
      tabAgronomy: '🌱 बीज व फसल सलाह'
    }
  };

  const curStrings = strings[language as 'en' | 'te' | 'hi'] || strings.en;

  const helplineCards = [
    {
      title: language === 'te' ? 'కిసాన్ కాల్ సెంటర్ (భారత ప్రభుత్వం)' : language === 'hi' ? 'किसान कॉल सेंटर (भारत सरकार)' : 'Kisan Call Centre (Govt of India)',
      tel: '1800-180-1551',
      desc: language === 'te' ? '22 భారతీయ భాషలు • సోమవారం నుండి ఆదివారం (06:00 AM – 10:00 PM)' : language === 'hi' ? '22 भारतीय भाषाएं • सोम से रवि (06:00 AM – 10:00 PM)' : '22 Indian languages • Mon to Sun (06:00 AM – 10:00 PM)',
      badge: language === 'te' ? 'జాతీయ టోల్-ఫ్రీ' : language === 'hi' ? 'राष्ट्रीय टोल-फ्री' : 'National Toll-Free',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: PhoneCall
    },
    {
      title: language === 'te' ? 'AgriSlot MSP సేకరణ విభాగం' : language === 'hi' ? 'AgriSlot एमएसपी खरीद सहायता' : 'AgriSlot MSP Procurement Desk',
      tel: '1800-425-0012',
      desc: language === 'te' ? 'ప్రత్యక్ష స్లాట్ సహాయం, టోకెన్ ధృవీకరణ & కేంద్ర కేటాయింపు' : language === 'hi' ? 'लाइव स्लॉट सहायता, टोकन सत्यापन व खरीद केंद्र आवंटन' : 'Live Slot Assistance, Token Verification & Center Allotment',
      badge: language === 'te' ? '24/7 అందుబాటు' : language === 'hi' ? '24/7 समर्पित' : '24/7 Dedicated',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: ShieldCheck
    },
    {
      title: language === 'te' ? 'తూకం & తేమ వివాద పరిష్కారం' : language === 'hi' ? 'वेब्रिज व नमी विवाद निवारण' : 'Weighbridge & Moisture Grievance',
      tel: '1967',
      desc: language === 'te' ? 'పౌర సరఫరాల శాఖ వివాద పరిష్కార విభాగం' : language === 'hi' ? 'राज्य खाद्य व नागरिक आपूर्ति निवारण' : 'State Food & Civil Supplies Dispute Redressal',
      badge: language === 'te' ? 'అత్యవసర హెల్ప్‌లైన్' : language === 'hi' ? 'आपातकालीन हेल्पलाइन' : 'Emergency Helpline',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Scale
    }
  ];

  const faqs = {
    SLOTS: [
      {
        q: language === 'te' ? 'ఒక నిర్దిష్ట సమయానికి గరిష్టంగా ఎన్ని స్లాట్లు బుక్ చేసుకోవచ్చు?' : language === 'hi' ? 'एक समय अंतराल के लिए अधिकतम कितने स्लॉट बुक किए जा सकते हैं?' : 'How many slots can be booked for a single time window?',
        a: language === 'te' ? 'మండిలో ట్రాఫిక్ జామ్‌లు మరియు వేచి ఉండే సమయాన్ని నివారించడానికి, AgriSlot ప్రతి 30 నిమిషాల సమయ విండోకు ఖచ్చితంగా గరిష్టంగా 3 రైతు స్లాట్లను మాత్రమే అనుమతిస్తుంది. స్లాట్ FULL (3/3) అని చూపిస్తే, దయచేసి పక్క సమయాన్ని ఎంచుకోండి.' : language === 'hi' ? 'मंडी में भीड़ और कतारों को समाप्त करने के लिए, AgriSlot प्रत्येक 30 मिनट के अंतराल में अधिकतम 3 स्लॉट की अनुमति देता है। यदि स्लॉट FULL (3/3) है, तो कृपया अगला समय चुनें।' : 'To eliminate traffic jams and weighbridge queues, AgriSlot strictly limits each 30-minute time window to a maximum of 3 farmer slots. If a slot shows FULL (3/3), please select an adjacent time window.'
      },
      {
        q: language === 'te' ? 'సేకరణ కేంద్రానికి వెళ్ళేటప్పుడు ఏ పత్రాలు అవసరం?' : language === 'hi' ? 'खरीद केंद्र पर कौन-से दस्तावेज़ अनिवार्य हैं?' : 'What documents are mandatory at the procurement center?',
        a: language === 'te' ? 'దయచేసి వెంట తీసుకురండి: (1) అధికారిక AgriSlot QR టోకెన్ పాస్, (2) పట్టాదార్ పాస్‌బుక్ / 1-B రికార్డు, (3) ఆధార్ కార్డు కాపీ, (4) డైరెక్ట్ MSP బదిలీ కోసం బ్యాంక్ పాస్‌బుక్ / UPI ID.' : language === 'hi' ? 'कृपया साथ लाएं: (1) AgriSlot QR टोकन पास, (2) पट्टा पासबुक / 1-B रिकॉर्ड, (3) आधार कार्ड, (4) प्रत्यक्ष एमएसपी भुगतान हेतु बैंक पासबुक या UPI।' : 'Please carry: (1) Official AgriSlot QR Token Pass (on your smartphone or printed), (2) Pattadar Passbook / 1-B Record, (3) Aadhaar Card copy, (4) Bank Passbook / UPI ID for direct MSP transfer.'
      },
      {
        q: language === 'te' ? 'నేను బుక్ చేసిన స్లాట్‌ను రద్దు లేదా రీషెడ్యూల్ చేయవచ్చా?' : language === 'hi' ? 'क्या मैं अपना बुक किया हुआ स्लॉट रीशेड्यूल या रद्द कर सकता हूँ?' : 'Can I reschedule or cancel my booked slot?',
        a: language === 'te' ? 'అవును, మీరు మీ రాక సమయానికి 2 గంటల ముందు వరకు "🗓️ బుకింగ్ క్యాలెండర్" ట్యాబ్ నుండి మీ స్లాట్‌ను ఎప్పుడైనా రీషెడ్యూల్ లేదా రద్దు చేసుకోవచ్చు.' : language === 'hi' ? 'हाँ, आप अपने निर्धारित समय से 2 घंटे पहले तक "🗓️ बुकिंग कैलेंडर" टैब से अपना स्लॉट कभी भी रीशेड्यूल या रद्द कर सकते हैं।' : 'Yes, you can reschedule or cancel your slot anytime from the "🗓️ Booking Calendar" tab up to 2 hours before your scheduled arrival time.'
      }
    ],
    QUALITY: [
      {
        q: language === 'te' ? 'వరి ధాన్యానికి అనుమతించదగిన గరిష్ట తేమ శాతం ఎంత?' : language === 'hi' ? 'धान के लिए अधिकतम स्वीकार्य नमी स्तर क्या है?' : 'What is the maximum acceptable moisture level for Paddy (Dhan)?',
        a: language === 'te' ? 'ప్రభుత్వ FAQ ప్రమాణాల ప్రకారం వరికి గరిష్టంగా 14.0% మరియు గోధుమలకు 12.0% తేమ అనుమతించబడుతుంది. మండికి బయలుదేరే ముందు మా ప్రొడ్యూస్ స్కానర్ టూల్ ఉపయోగించి తేమను తనిఖీ చేయండి.' : language === 'hi' ? 'सरकारी एफएक्यू मानकों के अनुसार धान के लिए अधिकतम 14.0% और गेहूं के लिए 12.0% नमी स्वीकार्य है।' : 'Government FAQ standard specifies a maximum of 14.0% moisture for Paddy and 12.0% for Wheat. Use the Produce Scanner tool before leaving your farm to check your moisture level and avoid dockage.'
      },
      {
        q: language === 'te' ? 'నా పంట తేమ శాతం ఎక్కువగా ఉంటే ఏమి జరుగుతుంది?' : language === 'hi' ? 'यदि नमी मानक से अधिक हो तो क्या होगा?' : 'What happens if my produce moisture exceeds FAQ standards?',
        a: language === 'te' ? 'తేమ 1-2% ఎక్కువగా ఉంటే ప్రభుత్వ నిబంధనల ప్రకారం తగ్గింపు (దాదాపు ₹40/క్వింటాల్) వర్తిస్తుంది. రాకముందు 1-2 రోజులు టార్పాలిన్ పై ఆరబెట్టడం ద్వారా ఈ కోతను నివారించవచ్చు.' : language === 'hi' ? 'यदि नमी 1-2% अधिक हो तो मानक कटौती लागू होती है। केंद्र आने से पूर्व 1-2 दिन सुखाकर कटौती से बचा जा सकता है।' : 'If moisture exceeds the standard by 1-2%, standard mandi deduction (approx. ₹40/Qtl per 1% excess moisture) applies. Sun-drying on tarpaulin for 1-2 days before arrival avoids this deduction.'
      }
    ],
    PAYMENT: [
      {
        q: language === 'te' ? 'MSP డబ్బు నా బ్యాంక్ ఖాతాకు చేరడానికి ఎంత సమయం పడుతుంది?' : language === 'hi' ? 'एमएसपी की राशि बैंक खाते में आने में कितना समय लगता है?' : 'How long does it take for MSP money to reach my bank account?',
        a: language === 'te' ? 'సేకరణ కేంద్రంలో అధికారి బరువు మరియు నాణ్యత ధృవీకరించిన తర్వాత, DBT లేదా UPI ద్వారా 24 నుండి 48 గంటల్లో నేరుగా మీ ఖాతాకు బదిలీ అవుతుంది.' : language === 'hi' ? 'खरीद केंद्र पर वजन व नमी सत्यापन के बाद 24 से 48 घंटों में डीबीटी/यूपीआई द्वारा राशि सीधे बैंक खाते में आ जाती है।' : 'Once the procurement center officer verifies weight and moisture, payment is transferred directly via DBT (Direct Benefit Transfer) or UPI within 24 to 48 hours directly into your linked bank account.'
      },
      {
        q: language === 'te' ? 'నా బ్యాంక్ వివరాలు లేదా UPI IDని ఎలా అప్‌డేట్ చేయాలి?' : language === 'hi' ? 'मैं अपना बैंक खाता या UPI विवरण कैसे बदल सकता हूँ?' : 'How do I update my bank account or UPI ID?',
        a: language === 'te' ? 'సైడ్‌బార్ నుండి "రైతు ప్రొఫైల్ (Farmer Profile)" పై క్లిక్ చేసి మీ బ్యాంక్ ఖాతా లేదా UPI ID ని సవరించుకోవచ్చు.' : language === 'hi' ? 'साइडबार से "किसान प्रोफ़ाइल" पर जाकर अपना बैंक या UPI विवरण अपडेट कर सकते हैं।' : 'Navigate to "Farmer Profile" from the sidebar and click "Edit My Details" to enter your updated Bank Account or UPI handle.'
      }
    ],
    AGRONOMY: [
      {
        q: language === 'te' ? 'విత్తనాలు & ఎరువుల AI సిఫార్సు ఎలా పనిచేస్తుంది?' : language === 'hi' ? 'बीज एवं उर्वरक एआई सिफारिश कैसे कार्य करती है?' : 'How does the Seeds & Fertilizer AI recommendation work?',
        a: language === 'te' ? 'మా AI ఇంజిన్ మీ నేల రకం, pH, సాగు విస్తీర్ణం మరియు మునుపటి పంట ఆధారంగా ICAR మార్గదర్శకాల ప్రకారం ఖచ్చితమైన విత్తనాల పరిమాణం మరియు ఎరువుల మోతాదును లెక్కిస్తుంది.' : language === 'hi' ? 'हमारा एआई इंजन आईसीएआर मानकों के अनुसार आपकी मिट्टी, मौसम और रकबे का विश्लेषण कर सटीक बीज व खाद की मात्रा सुझाता है।' : 'Our AI engine analyzes your soil classification, soil pH, sowing season, farm acreage, and preceding crop rotation (e.g. legume nitrogen credits) according to ICAR benchmarks to calculate exact seed quantities and split fertilizer bag requirements.'
      },
      {
        q: language === 'te' ? 'క్రాప్ డాక్టర్ AI ఫోటో తీసేటప్పుడు ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?' : language === 'hi' ? 'क्रॉप डॉक्टर एआई फोटो लेते समय क्या सावधानी रखें?' : 'What is the Crop Doctor AI photo guideline?',
        a: language === 'te' ? 'సహజ సూర్యకాంతిలో వ్యాధి సోకిన ఆకు లేదా కాండం యొక్క స్పష్టమైన దగ్గరి ఫోటోను తీయండి. ఇతర వస్తువులు లేదా వ్యక్తుల ముఖాలు లేకుండా చూడండి.' : language === 'hi' ? 'प्राकृतिक रोशनी में प्रभावित पत्ते या तने की स्पष्ट और करीबी तस्वीर लें।' : 'Capture a clear, close-up photograph of the affected plant leaf or stem in natural sunlight. Avoid taking photos of non-plant objects or human faces for accurate diagnosis.'
      }
    ]
  };

  // Flattened FAQs for global search
  const allFaqItems = useMemo(() => [
    ...faqs.SLOTS.map(f => ({ ...f, category: 'SLOTS', categoryLabel: curStrings.tabSlots })),
    ...faqs.QUALITY.map(f => ({ ...f, category: 'QUALITY', categoryLabel: curStrings.tabQuality })),
    ...faqs.PAYMENT.map(f => ({ ...f, category: 'PAYMENT', categoryLabel: curStrings.tabPayment })),
    ...faqs.AGRONOMY.map(f => ({ ...f, category: 'AGRONOMY', categoryLabel: curStrings.tabAgronomy }))
  ], [faqs, curStrings]);

  // Filtered FAQs based on search query
  const searchedFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allFaqItems.filter(item => 
      item.q.toLowerCase().includes(q) || 
      item.a.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q)
    );
  }, [searchQuery, allFaqItems]);

  // Filtered Helplines based on search query
  const searchedHelplines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return helplineCards.filter(h => 
      h.title.toLowerCase().includes(q) || 
      h.desc.toLowerCase().includes(q) || 
      h.tel.toLowerCase().includes(q) ||
      h.badge.toLowerCase().includes(q)
    );
  }, [searchQuery, helplineCards]);

  const popularTags = [
    { label: language === 'te' ? '3-స్లాట్ల పరిమితి' : language === 'hi' ? '3-स्लॉट सीमा' : '3-Slot Limit', query: '3-slot' },
    { label: language === 'te' ? 'తేమ నిబంధనలు (14%)' : language === 'hi' ? 'नमी मानक (14%)' : 'Moisture (14%)', query: 'moisture' },
    { label: language === 'te' ? 'MSP చెల్లింపు (DBT)' : language === 'hi' ? 'एमएसपी भुगतान (DBT)' : 'Direct Payment (DBT)', query: 'payment' },
    { label: language === 'te' ? 'స్లాట్ రీషెడ్యూల్' : language === 'hi' ? 'स्लॉट रीशेड्यूल' : 'Reschedule Slot', query: 'reschedule' },
    { label: language === 'te' ? 'క్రాప్ డాక్టర్ AI' : language === 'hi' ? 'क्रॉप डॉक्टर' : 'Crop Doctor', query: 'Crop Doctor' },
    { label: language === 'te' ? 'టోల్-ఫ్రీ నంబర్' : language === 'hi' ? 'टोल-फ्री हेल्पलाइन' : 'Toll-Free Helpline', query: '1800' }
  ];

  const totalResultsCount = searchedFaqs.length + searchedHelplines.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 pb-24 text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 flex items-center justify-center transition shadow-xs cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {curStrings.badge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 mt-0.5">
              {curStrings.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {curStrings.subtitle}
            </p>
          </div>
        </div>

        {onBookSlot && (
          <button
            onClick={onBookSlot}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <span>{curStrings.bookSlotBtn}</span>
          </button>
        )}
      </div>

      {/* 🔍 Global Search Bar in Help Centre */}
      <div className="card-clean p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white shadow-xl shadow-emerald-950/20 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black font-outfit text-emerald-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <span>{curStrings.searchTitle}</span>
          </h2>
          <p className="text-xs text-emerald-200/80 font-medium">
            {curStrings.searchSubtitle}
          </p>
        </div>

        {/* Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={curStrings.searchPlaceholder}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-emerald-200/50 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 backdrop-blur-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Popular Search Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-400" />
            {curStrings.popularTopics}
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => setSearchQuery(tag.query)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                searchQuery.toLowerCase() === tag.query.toLowerCase()
                  ? 'bg-emerald-400 text-emerald-950 border-emerald-400 font-bold'
                  : 'bg-white/10 text-emerald-100 border-white/15 hover:bg-white/20 hover:border-emerald-400'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🎯 Live Search Results Area (When Search Query is Active) */}
      {searchQuery.trim() ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-outfit text-slate-900">
                {curStrings.searchResultsFor} "{searchQuery}"
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {totalResultsCount} {curStrings.matchesFound}
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
            >
              {curStrings.clearSearch}
            </button>
          </div>

          {totalResultsCount === 0 ? (
            <div className="card-clean p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">{curStrings.noResultsTitle} "{searchQuery}"</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {curStrings.noResultsDesc}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href="tel:18001801551"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{curStrings.callHelplineBtn}</span>
                </a>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  {curStrings.resetSearch}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Matching Helplines */}
              {searchedHelplines.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>{curStrings.matchingHelplines}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchedHelplines.map((card, idx) => {
                      const IconComp = card.icon;
                      return (
                        <a
                          key={idx}
                          href={`tel:${card.tel.replace(/[^0-9]/g, '')}`}
                          className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                                {card.badge}
                              </span>
                              <IconComp className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition">
                              {card.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {card.desc}
                            </p>
                          </div>
                          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm font-black font-outfit text-emerald-700">
                              {card.tel}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {curStrings.callNow}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching FAQs */}
              {searchedFaqs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>{curStrings.matchingFaqs}</span>
                  </h3>
                  <div className="space-y-3">
                    {searchedFaqs.map((item, idx) => {
                      const isExpanded = expandedSearchResult === idx;
                      return (
                        <div 
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
                        >
                          <div 
                            onClick={() => setExpandedSearchResult(isExpanded ? null : idx)}
                            className="flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                                Q
                              </span>
                              <span>{item.q}</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
                              {item.categoryLabel}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 leading-relaxed pl-7 font-medium border-t border-slate-100 pt-2 bg-slate-50/50 p-3 rounded-xl">
                            {item.a}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      ) : null}

      {/* 1. Emergency Helpline Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {helplineCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <a
              key={idx}
              href={`tel:${card.tel.replace(/[^0-9]/g, '')}`}
              className="card-clean p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug font-medium">
                    {card.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base sm:text-lg font-black font-outfit text-emerald-700">
                  {card.tel}
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition">
                  {curStrings.tapToCall}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* 2. Grid: Local District Officer Locator & Instant Support Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Local KVK & RBK District Directory (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black font-outfit text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>{curStrings.officeLocatorTitle}</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {curStrings.officialDirectory}
              </span>
            </div>

            {/* Filter by State and District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{curStrings.selectState}</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={s.state} value={s.state}>{s.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{curStrings.selectDistrict}</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* District Officer Cards */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-extrabold text-xs text-slate-900">
                    District Agriculture Officer (DAO) - {selectedDistrict}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {curStrings.activeOfficer}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>District Collectorate Complex, Agriculture Wing, {selectedDistrict}, {selectedState}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Contact: +91 94400 12345 • Email: dao.{selectedDistrict.toLowerCase().replace(/[^a-z0-9]/g, '')}@agri.gov.in</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-extrabold text-xs text-slate-900">
                    Krishi Vigyan Kendra (KVK / ICAR Research Center)
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    Soil Testing & Seeds
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ICAR Agricultural Research Station, Highway Junction, {selectedDistrict}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>KVK Helpline: +91 98480 99881 • Free Soil Testing & Seed Certification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Instant Grievance / Support Ticket (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black font-outfit text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>{curStrings.submitTicketTitle}</span>
              </h2>
            </div>

            {generatedTicket ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-950">{curStrings.ticketSuccessTitle}</h3>
                  <div className="text-lg font-black font-outfit text-emerald-700 mt-1">
                    {generatedTicket.id}
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 font-medium leading-relaxed">
                    {curStrings.ticketSuccessDesc} <strong>{farmerMobile}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  {curStrings.submitAnotherBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3.5">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{curStrings.issueCategory}</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="SLOT_RESCHEDULE">📅 {language === 'te' ? 'స్లాట్ రీషెడ్యూల్ / రద్దు' : language === 'hi' ? 'स्लॉट रीशेड्यूलिंग / रद्दीकरण' : 'Slot Rescheduling / Cancellation'}</option>
                    <option value="WEIGHBRIDGE_DELAY">⚖️ {language === 'te' ? 'వేబ్రిడ్జ్ లోడింగ్ / ఆలస్యం' : language === 'hi' ? 'वेब्रिज अनलोडिंग में देरी' : 'Weighbridge Unloading Congestion'}</option>
                    <option value="MOISTURE_DISPUTE">💧 {language === 'te' ? 'తేమ పరీక్ష / తగ్గింపు వివాదం' : language === 'hi' ? 'नमी जांच / कटौती विवाद' : 'Moisture Testing / Dockage Query'}</option>
                    <option value="PAYMENT_DELAY">💰 {language === 'te' ? 'బ్యాంక్ ఖాతా & ప్రత్యక్ష MSP చెల్లింపు' : language === 'hi' ? 'बैंक खाता एवं प्रत्यक्ष एमएसपी भुगतान' : 'Bank Account & Direct MSP Payment'}</option>
                    <option value="GENERAL">❓ {language === 'te' ? 'సాధారణ రైతు సహాయం' : language === 'hi' ? 'सामान्य किसान सहायता' : 'General Farmer Assistance'}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{curStrings.farmerNameLabel}</label>
                    <input
                      type="text"
                      required
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Ramesh Reddy"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{curStrings.farmerMobileLabel}</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={farmerMobile}
                      onChange={(e) => setFarmerMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{curStrings.describeIssue}</label>
                  <textarea
                    required
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder={curStrings.describePlaceholder}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{ticketSubmitting ? curStrings.submittingTicketBtn : curStrings.submitTicketBtn}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Interactive FAQ Hub */}
      <div className="card-clean p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black font-outfit text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>{curStrings.faqTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {curStrings.faqSubtitle}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            {(['SLOTS', 'QUALITY', 'PAYMENT', 'AGRONOMY'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFaqTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFaqTab === tab 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'SLOTS' && curStrings.tabSlots}
                {tab === 'QUALITY' && curStrings.tabQuality}
                {tab === 'PAYMENT' && curStrings.tabPayment}
                {tab === 'AGRONOMY' && curStrings.tabAgronomy}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs List */}
        <div className="space-y-3">
          {faqs[activeFaqTab].map((item, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      Q
                    </span>
                    <span>{item.q}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed pl-11 font-medium border-t border-slate-200/50 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
