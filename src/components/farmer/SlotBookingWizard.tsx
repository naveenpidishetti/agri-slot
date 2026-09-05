import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { ALL_INDIAN_STATES, getCentersForDistrict } from '../../data/indiaData';
import { Crop, ProcurementCenter, Booking } from '../../types';
import { AICaptionDisclaimer } from '../common/AICaptionDisclaimer';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Scale,
  Mail,
  Building2,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  RotateCcw,
  Radio,
  ShieldCheck,
  Lock,
  Search,
  Compass,
  Sun,
  Moon,
  X
} from 'lucide-react';

interface SlotBookingWizardProps {
  onBack: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

const DEFAULT_CROPS: Crop[] = [
  { id: 'crop-paddy', name: 'Paddy (వరి / धान / Rice)', code: 'PAD-01', category: 'Cereal', msp_price_per_quintal: 2300, max_moisture_percent: 14.0 },
  { id: 'crop-wheat', name: 'Wheat (గోధుమలు / गेहूं)', code: 'WHT-02', category: 'Cereal', msp_price_per_quintal: 2275, max_moisture_percent: 12.0 },
  { id: 'crop-cotton', name: 'Cotton (పత్తి / कपास)', code: 'COT-04', category: 'Fiber', msp_price_per_quintal: 7020, max_moisture_percent: 8.0 },
  { id: 'crop-maize', name: 'Maize (మొక్కజొన్న / मक्का)', code: 'MAZ-03', category: 'Coarse Cereal', msp_price_per_quintal: 2090, max_moisture_percent: 14.0 },
  { id: 'crop-chilli', name: 'Chilli (మిర్చి / मिर्च)', code: 'CHL-08', category: 'Spices', msp_price_per_quintal: 18200, max_moisture_percent: 10.0 },
  { id: 'crop-turmeric', name: 'Turmeric (పసుపు / हल्दी)', code: 'TUR-07', category: 'Spices', msp_price_per_quintal: 13500, max_moisture_percent: 10.0 },
  { id: 'crop-soybean', name: 'Soybean (సోయాబీన్ / सोयाबीन)', code: 'SOY-05', category: 'Oilseed', msp_price_per_quintal: 4892, max_moisture_percent: 10.0 },
  { id: 'crop-groundnut', name: 'Groundnut (వేరుశనగ / मूंगफली)', code: 'GND-09', category: 'Oilseed', msp_price_per_quintal: 6783, max_moisture_percent: 8.0 },
  { id: 'crop-mustard', name: 'Mustard (ఆవాలు / सरसों)', code: 'MST-10', category: 'Oilseed', msp_price_per_quintal: 5650, max_moisture_percent: 8.0 },
  { id: 'crop-onion', name: 'Onion (ఉల్లిపాయ / प्याज)', code: 'ONN-19', category: 'Horticulture', msp_price_per_quintal: 2450, max_moisture_percent: 14.0 },
  { id: 'crop-tomato', name: 'Tomato (టమోటా / टमाटर)', code: 'TMT-20', category: 'Horticulture', msp_price_per_quintal: 1850, max_moisture_percent: 14.0 },
  { id: 'crop-potato', name: 'Potato (బంగాళాదుంప / आलू)', code: 'POT-21', category: 'Horticulture', msp_price_per_quintal: 1650, max_moisture_percent: 14.0 },
  { id: 'crop-sugarcane', name: 'Sugarcane (చెరకు / गन्ना)', code: 'SGC-16', category: 'Commercial', msp_price_per_quintal: 340, max_moisture_percent: 18.0 }
];

export const SlotBookingWizard: React.FC<SlotBookingWizardProps> = ({ onBack, onBookingSuccess }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const tr: any = t;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean UI Filters
  const [cropCategory, setCropCategory] = useState<string>('all');
  const [cropSearch, setCropSearch] = useState<string>('');
  const [slotTimeFilter, setSlotTimeFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Data lists
  const [crops, setCrops] = useState<Crop[]>(DEFAULT_CROPS);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [aiRec, setAiRec] = useState<any>(null);

  // Wizard Selections
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [quantity, setQuantity] = useState<number>(40);
  const [location, setLocation] = useState({
    state: user?.state || 'Telangana',
    district: user?.district || 'Warangal Urban',
    village: user?.village || 'Warangal'
  });
  const [farmerEmail, setFarmerEmail] = useState<string>(user?.email || 'vasanthreddy302@gmail.com');
  const [selectedCenter, setSelectedCenter] = useState<ProcurementCenter | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM – 11:30 AM');

  // Slot Capacities (Capped at 3 slots per window)
  const [slotCapacities, setSlotCapacities] = useState<{
    time: string;
    maxSlots: number;
    bookedCount: number;
    availableSlots: number;
    isFull: boolean;
    isAiPick?: boolean;
  }[]>([]);

  // =========================================================================
  // 🎙️ VOICE ASSISTANT & PERMISSION STATE
  // =========================================================================
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'requesting'>('prompt');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string>('Voice Assistant Ready. Speak your choices anytime.');

  const stepRef = useRef(step);
  const cropsRef = useRef(crops);
  const selectedCropRef = useRef(selectedCrop);
  const quantityRef = useRef(quantity);
  const locationRef = useRef(location);
  const centersRef = useRef(centers);
  const selectedCenterRef = useRef(selectedCenter);
  const selectedDateRef = useRef(selectedDate);
  const selectedSlotRef = useRef(selectedSlot);
  const isVoiceActiveRef = useRef(isVoiceActive);
  const isSpeakingRef = useRef(isSpeaking);
  const languageRef = useRef(language);
  const recognitionRef = useRef<any>(null);
  const isProcessingVoiceRef = useRef<boolean>(false);

  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { cropsRef.current = crops; }, [crops]);
  useEffect(() => { selectedCropRef.current = selectedCrop; }, [selectedCrop]);
  useEffect(() => { quantityRef.current = quantity; }, [quantity]);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { centersRef.current = centers; }, [centers]);
  useEffect(() => { selectedCenterRef.current = selectedCenter; }, [selectedCenter]);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { selectedSlotRef.current = selectedSlot; }, [selectedSlot]);
  useEffect(() => { isVoiceActiveRef.current = isVoiceActive; }, [isVoiceActive]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { languageRef.current = language; }, [language]);

  useEffect(() => {
    if (user?.email) {
      setFarmerEmail(user.email);
    }
  }, [user]);

  // Load Initial Data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const cropsRes = await api.getCrops();
      if (cropsRes?.crops && cropsRes.crops.length > 0) {
        setCrops(cropsRes.crops);
      }
      loadCentersForDistrict(location.state, location.district);
    } catch (err) {
      console.error('Failed loading wizard data', err);
      loadCentersForDistrict(location.state, location.district);
    }
  };

  const loadCentersForDistrict = (stateName: string, districtName: string) => {
    const districtCenters = getCentersForDistrict(stateName, districtName);
    setCenters(districtCenters as any);
    if (districtCenters.length > 0) {
      setSelectedCenter(districtCenters[0] as any);
    }
  };

  const handleStateChange = (stateName: string) => {
    const stateObj = ALL_INDIAN_STATES.find(s => s.state === stateName);
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
        const currentSlotInfo = res.slots.find(s => s.time === selectedSlot);
        if (currentSlotInfo && currentSlotInfo.isFull) {
          const firstOpen = res.slots.find(s => !s.isFull);
          if (firstOpen) setSelectedSlot(firstOpen.time);
        }
      }
    } catch (e) {
      console.warn('Could not load dynamic slot capacity', e);
    }
  };

  // =========================================================================
  // 🔐 EXPLICIT MICROPHONE PERMISSION REQUEST HANDLER
  // =========================================================================
  const requestMicrophonePermission = async () => {
    try {
      setMicPermission('requesting');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission successfully granted!
        setMicPermission('granted');
        // Stop audio tracks immediately after obtaining permission
        stream.getTracks().forEach(track => track.stop());
        setIsVoiceActive(true);
        startListening();
        speakText(
          languageRef.current === 'te' 
            ? 'మైక్రోఫోన్ అనుమతి మంజూరు చేయబడింది. వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది.'
            : languageRef.current === 'hi'
            ? 'माइक अनुमति स्वीकृत हो गई है। वॉयस असिस्टेंट तैयार है।'
            : 'Microphone permission granted. Kisan Voice Assistant is active.'
        );
      } else {
        setMicPermission('granted');
        startListening();
      }
    } catch (err: any) {
      console.warn('Microphone permission denied or prompt closed:', err);
      setMicPermission('denied');
    }
  };

  // Check initial permission status if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as any })
        .then((permissionStatus) => {
          setMicPermission(permissionStatus.state as any);
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state as any);
          };
        })
        .catch(() => {
          // Ignore if permission query not supported
        });
    }
  }, []);

  // Helper to map active language to standard BCP-47 tag
  const getBCP47Tag = (lang: string) => {
    switch (lang) {
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      case 'ta': return 'ta-IN';
      case 'kn': return 'kn-IN';
      case 'mr': return 'mr-IN';
      case 'pa': return 'pa-IN';
      case 'bn': return 'bn-IN';
      default: return 'en-IN';
    }
  };

  // =========================================================================
  // 🔊 SPEECH SYNTHESIS (TTS)
  // =========================================================================
  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback((text: string, onEndCallback?: () => void) => {
    if (!isVoiceActiveRef.current || !('speechSynthesis' in window)) return;
    
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getBCP47Tag(languageRef.current);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
      startListening();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  }, [stopSpeech]);

  // =========================================================================
  // 🎙️ MULTI-LANGUAGE STEP VOICE PROMPT ANNOUNCER
  // =========================================================================
  const triggerStepVoicePrompt = useCallback((stepNumber: number) => {
    if (!isVoiceActiveRef.current) return;

    let text = '';
    const lang = languageRef.current;

    switch (stepNumber) {
      case 1:
        if (lang === 'te') text = 'నమస్కారం! పంటల స్లాట్ బుకింగ్‌కు స్వాగతం. మీరు ఏ పంట విక్రయించాలనుకుంటున్నారు? వరి, పత్తి, గోధుమలు, మిర్చి లేదా పసుపు అని చెప్పండి.';
        else if (lang === 'hi') text = 'नमस्ते! मंडी स्लॉट बुकिंग में आपका स्वागत है। आप कौन सी फसल बेचना चाहते हैं? धान, कपास, गेहूं, मक्का या मिर्च बोलें।';
        else if (lang === 'ta') text = 'வணக்கம்! மண்டி ஸ்லாட் முன்பதிவுக்கு வரவேற்கிறோம். எந்தப் பயிரை விற்க விரும்புகிறீர்கள்? நெல், பருத்தி, கோதுமை அல்லது சோளம் என்று சொல்லுங்கள்.';
        else if (lang === 'kn') text = 'ನಮಸ್ಕಾರ! ಮಂಡಿ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್‌ಗೆ ಸುಸ್ವಾಗತ. ನೀವು ಯಾವ ಬೆಳೆಯನ್ನು ಮಾರಾಟ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ? ಭತ್ತ, ಹತ್ತಿ, ಗೋಧಿ ಅಥವಾ ಮೆಕ್ಕೆಜೋಳ ಎಂದು ಹೇಳಿ.';
        else if (lang === 'mr') text = 'नमस्कार! मंडी स्लॉट बुकिंगमध्ये आपले स्वागत आहे. आपण कोणते पीक विकू इच्छिता? भात, कापूस, गहू किंवा मका बोला.';
        else if (lang === 'pa') text = 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੰਡੀ ਸਲਾਟ ਬੁਕਿੰਗ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਤੁਸੀਂ ਕਿਹੜੀ ਫ਼ਸਲ ਵੇਚਣਾ ਚਾਹੁੰਦੇ ਹੋ? ਝੋਨਾ, ਕਪਾਹ, ਕਣਕ ਜਾਂ ਮੱਕੀ ਬੋਲੋ।';
        else if (lang === 'bn') text = 'নমস্কার! মান্ডি স্লট বুকিংয়ে স্বাগতম। আপনি কোন ফসল বিক্রি করতে চান? ধান, গম, তুলা বা ভুট্টা বলুন।';
        else text = 'Welcome to Mandi Slot Booking. Which crop would you like to sell? You can say Paddy, Cotton, Wheat, Maize, Chilli, or Turmeric.';
        break;

      case 2:
        if (lang === 'te') text = `ఎంచుకున్న పంట ${selectedCropRef.current?.name || 'వరి'}. దయచేసి మీ పంట పరిమాణాన్ని క్వింటాళ్లలో చెప్పండి. ఉదాహరణకు 50 క్వింటాళ్లు లేదా 100 క్వింటాళ్లు.`;
        else if (lang === 'hi') text = `चुनी गई फसल ${selectedCropRef.current?.name || 'धान'} है। कृपया अपनी फसल की मात्रा क्विंटल में बताएं, जैसे 50 क्विंटल या 100 क्विंटल।`;
        else if (lang === 'ta') text = `தேர்ந்தெடுக்கப்பட்ட பயிர் ${selectedCropRef.current?.name || 'நெல்'}. அறுவடை அளவை குவிண்டாலில் சொல்லுங்கள், எ.கா. 50 குவிண்டால்.`;
        else if (lang === 'kn') text = `ಆಯ್ಕೆಮಾಡಿದ ಬೆಳೆ ${selectedCropRef.current?.name || 'ಭತ್ತ'}. ಇಳುವರಿ ಪ್ರಮಾಣವನ್ನು ಕ್ವಿಂಟಾಲ್‌ನಲ್ಲಿ ತಿಳಿಸಿ, ಉದಾಹರಣೆಗೆ 50 ಕ್ವಿಂಟಾಲ್.`;
        else if (lang === 'mr') text = `निवडलेले पीक ${selectedCropRef.current?.name || 'भात'}. कृपया पिकाचे प्रमाण क्विंटलमध्ये सांगा, उदा. ५० क्विंटल.`;
        else text = `Selected crop is ${selectedCropRef.current?.name || 'Paddy'}. Please speak your harvest quantity in quintals, for example 50 quintals or 100 quintals.`;
        break;

      case 3:
        if (lang === 'te') text = `మీ ఫారమ్ స్థానం ${locationRef.current.district}, ${locationRef.current.state}. కొనసాగించడానికి నెక్స్ట్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `आपका जिला ${locationRef.current.district}, ${locationRef.current.state} है। आगे बढ़ने के लिए नेक्स्ट बोलें।`;
        else text = `Your farm location is ${locationRef.current.district}, ${locationRef.current.state}. Say Next to continue.`;
        break;

      case 4:
        if (lang === 'te') text = 'మీ డిజిటల్ గేట్ పాస్ టోకెన్ మీ ఈమెయిల్‌కు పంపబడుతుంది. AI సిఫార్సు కోసం నెక్స్ట్ అని చెప్పండి.';
        else if (lang === 'hi') text = 'आपका डिजिटल गेट पास टोकन आपके ईमेल पर भेजा जाएगा। एआई मंडी सुझाव के लिए नेक्स्ट बोलें।';
        else text = 'Your digital QR gate pass will be sent to your email. Say Next to get AI Mandi match.';
        break;

      case 5:
        if (lang === 'te') text = `మేము సిఫార్సు చేస్తున్న మార్కెట్ కేంద్రం ${selectedCenterRef.current?.name || 'APMC సెంటర్'}. స్లాట్ ఎంపికకు నెక్స్ట్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `अनुशंसित मंडी केंद्र ${selectedCenterRef.current?.name || 'एपीएमसी केंद्र'} है। स्लॉट चुनने के लिए नेक्स्ट बोलें।`;
        else text = `We recommend ${selectedCenterRef.current?.name || 'APMC Procurement Center'}. Say Next to choose your arrival time slot.`;
        break;

      case 6:
        if (lang === 'te') text = `తేదీ ${selectedDateRef.current}. అందుబాటులో ఉన్న సమయ స్లాట్ ${selectedSlotRef.current}. కొనసాగించడానికి నెక్స్ట్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `तारीख ${selectedDateRef.current} है। उपलब्ध समय स्लॉट ${selectedSlotRef.current} है। आगे बढ़ने के लिए नेक्स्ट बोलें।`;
        else text = `Arrival date is ${selectedDateRef.current}. Selected slot is ${selectedSlotRef.current}. Say Next to review.`;
        break;

      case 7:
        if (lang === 'te') text = `దయచేసి మీ బుకింగ్ వివరాలు సరిచూసుకోండి. ${selectedCropRef.current?.name}, ${quantityRef.current} క్వింటాళ్లు. టోకెన్ పొందడానికి కన్ఫర్మ్ బుకింగ్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `कृपया अपनी बुकिंग जांचें। ${selectedCropRef.current?.name}, ${quantityRef.current} क्विंटल। टोकन बनाने के लिए कन्फर्म बुकिंग बोलें।`;
        else text = `Please review your booking details: ${selectedCropRef.current?.name}, ${quantityRef.current} Quintals. Say Confirm Booking to generate your token pass.`;
        break;

      default:
        break;
    }

    setVoiceFeedback(text);
    speakText(text);
  }, [speakText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerStepVoicePrompt(step);
    }, 450);
    return () => clearTimeout(timer);
  }, [step, triggerStepVoicePrompt]);

  // =========================================================================
  // 🧠 MULTI-LANGUAGE VOICE COMMAND INTERPRETER
  // =========================================================================
  const handleVoiceCommand = useCallback((rawTranscript: string) => {
    const text = rawTranscript.toLowerCase().trim();
    if (!text || isProcessingVoiceRef.current) return;

    setVoiceTranscript(rawTranscript);

    // 1. Navigation Commands across All Languages
    if (
      text.includes('next') || text.includes('continue') || text.includes('proceed') ||
      text.includes('తర్వాత') || text.includes('ముందుకు') || text.includes('आगे') ||
      text.includes('அடுத்து') || text.includes('ಮುಂದೆ') || text.includes('पुढे') ||
      text.includes('ਅੱਗੇ') || text.includes('পরবর্তী') || text.includes('సరే') || text.includes('ठीक है')
    ) {
      const current = stepRef.current;
      if (current === 1 && selectedCropRef.current) setStep(2);
      else if (current === 2) setStep(3);
      else if (current === 3) setStep(4);
      else if (current === 4) handleFetchAiRecommendation();
      else if (current === 5 && selectedCenterRef.current) setStep(6);
      else if (current === 6 && selectedSlotRef.current) setStep(7);
      else if (current === 7) handleConfirmBooking();
      return;
    }

    if (
      text.includes('back') || text.includes('previous') ||
      text.includes('వెనుకకు') || text.includes('పీచే') ||
      text.includes('பின்னால்') || text.includes('ಹಿಂದೆ') ||
      text.includes('मागे') || text.includes('ਪਿੱਛੇ') || text.includes('পিছনে')
    ) {
      setStep(prev => Math.max(1, prev - 1));
      return;
    }

    if (text.includes('repeat') || text.includes('again') || text.includes('మళ్లీ చెప్పు') || text.includes('फिर से')) {
      triggerStepVoicePrompt(stepRef.current);
      return;
    }

    const currentStep = stepRef.current;

    // --- STEP 1: CROP SELECTION ---
    if (currentStep === 1) {
      const cropList = cropsRef.current;
      let matchedCrop: Crop | null = null;

      // Paddy / Rice in multiple languages
      if (
        text.includes('paddy') || text.includes('rice') || text.includes('వరి') || 
        text.includes('dhan') || text.includes('धान') || text.includes('நெல்') || 
        text.includes('ಭತ್ತ') || text.includes('भात') || text.includes('ਝੋਨਾ') || text.includes('ধান')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-paddy') || cropList[0];
      } else if (
        text.includes('cotton') || text.includes('పత్తి') || text.includes('कपास') || 
        text.includes('பருத்தி') || text.includes('ಹತ್ತಿ') || text.includes('कापूस') || 
        text.includes('ਕਪਾਹ') || text.includes('তুলা')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-cotton') || null;
      } else if (
        text.includes('wheat') || text.includes('గోధుమ') || text.includes('गेहूं') || 
        text.includes('கோதுமை') || text.includes('ಗೋಧಿ') || text.includes('गहू') || 
        text.includes('ਕਣਕ') || text.includes('গম')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-wheat') || null;
      } else if (
        text.includes('maize') || text.includes('corn') || text.includes('మొక్కజొన్న') || 
        text.includes('मक्का') || text.includes('சோளம்') || text.includes('ಮೆಕ್ಕೆಜೋಳ') || 
        text.includes('मका') || text.includes('ਮੱਕੀ') || text.includes('ভুট্টা')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-maize') || null;
      } else if (
        text.includes('chilli') || text.includes('mirchi') || text.includes('మిర్చి') || 
        text.includes('मिर्च') || text.includes('மிளகாய்') || text.includes('ಮೆಣಸಿನಕಾಯಿ') || 
        text.includes('मिरची') || text.includes('ਮਿਰਚ') || text.includes('লঙ্কা')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-chilli') || null;
      } else if (
        text.includes('turmeric') || text.includes('పసుపు') || text.includes('हल्दी') || 
        text.includes('மஞ்சள்') || text.includes('ಅರಿಶಿನ') || text.includes('हळद') || 
        text.includes('ਹਲਦੀ') || text.includes('হলুদ')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-turmeric') || null;
      } else if (text.includes('soybean') || text.includes('సోయా') || text.includes('सोयाबीन')) {
        matchedCrop = cropList.find(c => c.id === 'crop-soybean') || null;
      } else if (
        text.includes('groundnut') || text.includes('peanut') || text.includes('వేరుశనగ') || 
        text.includes('పల్లీలు') || text.includes('मूंगफली') || text.includes('வேர்க்கடலை') || text.includes('ಕಡಲೆಕಾಯಿ')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-groundnut') || null;
      } else if (text.includes('mustard') || text.includes('ఆవాలు') || text.includes('सरसों')) {
        matchedCrop = cropList.find(c => c.id === 'crop-mustard') || null;
      } else if (text.includes('onion') || text.includes('ఉల్లిపాయ') || text.includes('प्याज') || text.includes('வெங்காயம்') || text.includes('ಈರುಳ್ಳಿ')) {
        matchedCrop = cropList.find(c => c.id === 'crop-onion') || null;
      } else if (text.includes('tomato') || text.includes('టమోటా') || text.includes('टमाटर') || text.includes('தக்காளி') || text.includes('ಟೊಮೆಟೊ')) {
        matchedCrop = cropList.find(c => c.id === 'crop-tomato') || null;
      } else if (text.includes('potato') || text.includes('బంగాళాదుంప') || text.includes('आलू') || text.includes('உருளைக்கிழங்கு') || text.includes('ಆಲೂಗಡ್ಡೆ')) {
        matchedCrop = cropList.find(c => c.id === 'crop-potato') || null;
      } else if (text.includes('sugarcane') || text.includes('చెరకు') || text.includes('गन्ना') || text.includes('கரும்பு') || text.includes('ಕಬ್ಬು')) {
        matchedCrop = cropList.find(c => c.id === 'crop-sugarcane') || null;
      }

      if (matchedCrop) {
        setSelectedCrop(matchedCrop);
        setVoiceFeedback(`Selected ${matchedCrop.name}`);
        speakText(`Selected ${matchedCrop.name}. Moving to quantity step.`, () => {
          setStep(2);
        });
      }
      return;
    }

    // --- STEP 2: QUANTITY EXTRACTION ---
    if (currentStep === 2) {
      let parsedNum: number | null = null;
      const numMatch = text.match(/\d+/);

      if (numMatch) {
        parsedNum = parseInt(numMatch[0], 10);
      } else if (
        text.includes('hundred') || text.includes('వంద') || text.includes('सौ') || 
        text.includes('நூறு') || text.includes('ನೂರು') || text.includes('शंभर') || text.includes('ਸੌ') || text.includes('একশ')
      ) {
        parsedNum = 100;
      } else if (
        text.includes('fifty') || text.includes('యాభై') || text.includes('पचास') || 
        text.includes('ஐம்பது') || text.includes('ಐವತ್ತು') || text.includes('पन्नास') || text.includes('ਪੰਜਾਹ') || text.includes('পঞ্চাশ')
      ) {
        parsedNum = 50;
      } else if (text.includes('twenty') || text.includes('ఇరవై') || text.includes('बीस') || text.includes('இருபது') || text.includes('ಇಪ್ಪತ್ತು')) {
        parsedNum = 20;
      } else if (text.includes('forty') || text.includes('నలభై') || text.includes('चालीस') || text.includes('நாற்பது') || text.includes('ನಲವತ್ತು')) {
        parsedNum = 40;
      } else if (text.includes('sixty') || text.includes('అరవై') || text.includes('साठ') || text.includes('அறுபது') || text.includes('ಅರವತ್ತು')) {
        parsedNum = 60;
      } else if (text.includes('eighty') || text.includes('ఎనభై') || text.includes('अस्सी') || text.includes('எண்பது') || text.includes('ಎಂಬತ್ತು')) {
        parsedNum = 80;
      } else if (text.includes('two hundred') || text.includes('రెండు వందలు') || text.includes('दो सौ') || text.includes('இருநூறு') || text.includes('ಇನ್ನೂರು')) {
        parsedNum = 200;
      }

      if (parsedNum && parsedNum > 0 && parsedNum <= 1000) {
        setQuantity(parsedNum);
        setVoiceFeedback(`Set quantity to ${parsedNum} Quintals`);
        speakText(`${parsedNum} Quintals confirmed. Moving to location details.`, () => {
          setStep(3);
        });
      }
      return;
    }

    // --- STEP 5: APMC PROCUREMENT CENTER ---
    if (currentStep === 5) {
      if (text.includes('first') || text.includes('select') || text.includes('center') || text.includes('warangal') || text.includes('ఎంచుకో')) {
        if (centersRef.current.length > 0) {
          setSelectedCenter(centersRef.current[0]);
          speakText(`Selected ${centersRef.current[0].name}. Moving to date and slot selection.`, () => {
            setStep(6);
          });
        }
      }
      return;
    }

    // --- STEP 6: TIME SLOT ---
    if (currentStep === 6) {
      if (text.includes('morning') || text.includes('11') || text.includes('10') || text.includes('slot') || text.includes('confirm') || text.includes('స్లాట్')) {
        speakText(`Selected slot ${selectedSlotRef.current}. Moving to final review.`, () => {
          setStep(7);
        });
      }
      return;
    }

    // --- STEP 7: CONFIRM BOOKING ---
    if (currentStep === 7) {
      if (
        text.includes('confirm') || text.includes('book') || text.includes('yes') || text.includes('submit') || 
        text.includes('ఖరారు') || text.includes('బుక్') || text.includes('कन्फर्म') || text.includes('उறுதி') || text.includes('ದೃಢೀಕರಿಸಿ')
      ) {
        handleConfirmBooking();
      }
      return;
    }
  }, [speakText]);

  // =========================================================================
  // 🎙️ SPEECH RECOGNITION (STT) ENGINE
  // =========================================================================
  const startListening = useCallback(() => {
    if (!isVoiceActiveRef.current || isSpeakingRef.current) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('Speech Recognition is not available on this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getBCP47Tag(languageRef.current);

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermission('granted');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const spoken = (finalTranscript || interimTranscript).trim();
        if (spoken) {
          setVoiceTranscript(spoken);
          if (finalTranscript) {
            handleVoiceCommand(finalTranscript);
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setMicPermission('denied');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isVoiceActiveRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (err) {
              // Ignore restart collision
            }
          }, 250);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not start speech recognition', e);
    }
  }, [handleVoiceCommand]);

  useEffect(() => {
    if (isVoiceActive) {
      startListening();
    } else {
      if (recognitionRef.current) recognitionRef.current.abort();
      stopSpeech();
      setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      stopSpeech();
    };
  }, [isVoiceActive, startListening, stopSpeech]);

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
      if (rec.recommendedCenter) {
        setSelectedCenter(rec.recommendedCenter);
      }
      if (rec.recommendedSlot) {
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

      speakText('Congratulations! Your Mandi slot is confirmed and your QR Token Pass has been generated.');
      onBookingSuccess(res.booking);
    } catch (err: any) {
      setError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: tr.stepCrop || 'Select Crop' },
    { num: 2, title: tr.stepQuantity || 'Quantity' },
    { num: 3, title: tr.stepLocation || 'Location' },
    { num: 4, title: tr.stepEmail || 'Email Alert' },
    { num: 5, title: tr.stepCenter || 'Mandi Center' },
    { num: 6, title: tr.stepSlot || 'Time Slot' },
    { num: 7, title: tr.stepReview || 'Confirm' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-900">

      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            stopSpeech();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tr.backToDashboard || 'Back to Dashboard'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Voice Assistant Toggle */}
          <button
            onClick={() => {
              const nextState = !isVoiceActive;
              setIsVoiceActive(nextState);
              if (!nextState) stopSpeech();
              else requestMicrophonePermission();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs ${
              isVoiceActive
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isVoiceActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Voice Active</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Voice Muted</span>
              </>
            )}
          </button>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {tr.step || 'Step'} {step} / 7
          </span>
        </div>
      </div>

      {/* 🔐 EXPLICIT MICROPHONE PERMISSION BANNER (IF NEEDED) */}
      {micPermission === 'denied' && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-shake">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                Microphone Permission Blocked / Needed
              </div>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Please allow microphone access in your browser to enable hands-free voice slot booking.
              </p>
            </div>
          </div>

          <button
            onClick={requestMicrophonePermission}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <Mic className="w-4 h-4" />
            <span>Grant Mic Permission</span>
          </button>
        </div>
      )}

      {/* 🎙️ LIVE VOICE ASSISTANT INTERACTIVE STATUS BANNER */}
      {isVoiceActive && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/20 relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <button
                  onClick={requestMicrophonePermission}
                  title="Click to speak or verify mic"
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 scale-105 ring-4 ring-emerald-400/40 animate-pulse'
                      : isListening
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 ring-2 ring-emerald-300 scale-105'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-6 h-6 animate-bounce" />
                  ) : isListening ? (
                    <Mic className="w-6 h-6 text-white animate-pulse" />
                  ) : (
                    <MicOff className="w-6 h-6 text-slate-400" />
                  )}
                </button>
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                    Kisan Voice Assistant • {getBCP47Tag(language)}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isSpeaking
                      ? 'bg-teal-500/30 text-teal-200 border border-teal-400/40'
                      : isListening
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSpeaking ? '🗣️ Speaking Instructions...' : isListening ? '🎙️ Listening to You...' : 'Mic Ready'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium mt-1 line-clamp-2 max-w-xl">
                  {voiceTranscript ? `🎙️ You said: "${voiceTranscript}"` : voiceFeedback}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
              <button
                onClick={() => triggerStepVoicePrompt(step)}
                title="Repeat step instructions"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat</span>
              </button>

              <button
                onClick={stopSpeech}
                title="Stop audio"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute</span>
              </button>
            </div>

          </div>

          {/* Soundwave animation */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold text-emerald-300">
              💡 {step === 1 ? 'Say: "Paddy", "Cotton", "వరి", "धान", "நெல்", "Wheat"' : step === 2 ? 'Say: "50 Quintals", "100", "వంద", "सौ"' : step === 7 ? 'Say: "Confirm Booking", "ఖరారు చేయండి"' : 'Say: "Next", "Back", "సరే"'}
            </span>
            <div className="flex items-center gap-1 h-3">
              <span className={`w-1 bg-emerald-400 rounded-full transition-all ${isSpeaking || isListening ? 'h-3 animate-pulse' : 'h-1'}`} />
              <span className={`w-1 bg-teal-400 rounded-full transition-all ${isSpeaking || isListening ? 'h-4 animate-bounce' : 'h-1'}`} />
              <span className={`w-1 bg-emerald-300 rounded-full transition-all ${isSpeaking || isListening ? 'h-2 animate-pulse' : 'h-1'}`} />
              <span className={`w-1 bg-teal-300 rounded-full transition-all ${isSpeaking || isListening ? 'h-3.5 animate-bounce' : 'h-1'}`} />
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar & Steps Tabs */}
      <div className="card-clean p-4 border border-emerald-200 shadow-xs bg-white">
        {/* Desktop Stepper */}
        <div className="hidden sm:flex items-center justify-between mb-3">
          {stepsList.map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                s.num === step
                  ? 'text-emerald-700 font-extrabold scale-105'
                  : s.num < step
                  ? 'text-slate-700 font-semibold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  s.num === step
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                    : s.num < step
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {s.num < step ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
              </div>
              <span className="text-xs">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Mobile Stepper Header & Pill Navigation */}
        <div className="sm:hidden space-y-2 mb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                {step}
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Step {step} of 7</div>
                <div className="text-xs font-black text-slate-900">{stepsList[step - 1]?.title}</div>
              </div>
            </div>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {Math.round((step / 7) * 100)}%
            </span>
          </div>

          {/* Mobile Scrollable Step Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {stepsList.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                disabled={s.num > step}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                  s.num === step
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                    : s.num < step
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <span>{s.num < step ? '✓' : s.num}.</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-semibold animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SELECT CROP */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="card-clean p-4 sm:p-8 space-y-4 sm:space-y-5 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                <span>🌾</span>
                <span>{tr.selectCropTitle || 'Select Crop for Mandi Procurement'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {tr.selectCropDesc || 'Speak or choose the crop you want to sell at official MSP rates.'}
              </p>
            </div>

            {/* Quick voice hint chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['Paddy (వరి / धान)', 'Cotton (పత్తి / कपास)', 'Wheat (గోధుమలు / गेहूं)', 'Maize (మొక్కజొన్న)'].map((cHint) => (
                <button
                  key={cHint}
                  type="button"
                  onClick={() => handleVoiceCommand(cHint.split(' ')[0])}
                  className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Mic className="w-3 h-3 text-emerald-600" />
                  <span>{cHint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clean Search Bar & Category Filter Pills for Mobile */}
          <div className="space-y-2.5 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder="Search crop name (e.g. Paddy, Cotton, Wheat, పత్తి, మిర్చి)..."
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
                { id: 'all', label: 'All Crops (అన్నీ)' },
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
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 max-h-[480px] overflow-y-auto p-1">
            {crops
              .filter((c) => {
                const matchesCat =
                  cropCategory === 'all' ||
                  c.category.toLowerCase().includes(cropCategory.toLowerCase());
                const matchesQuery =
                  cropSearch.trim() === '' ||
                  c.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
                  c.code.toLowerCase().includes(cropSearch.toLowerCase());
                return matchesCat && matchesQuery;
              })
              .map((c) => {
                const isSelected = selectedCrop?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCrop(c);
                      speakText(`Selected ${c.name}. Moving to quantity step.`, () => {
                        setStep(2);
                      });
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/90 shadow-md shadow-emerald-500/10 scale-[1.02] ring-2 ring-emerald-400/50'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/80 active:scale-98'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1.5">
                        {c.category}
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 font-outfit line-clamp-2">{c.name}</h3>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="text-[11px] sm:text-xs flex items-center justify-between text-slate-600 font-semibold flex-wrap">
                        <span>MSP:</span>
                        <span className="text-emerald-700 font-black text-xs sm:text-sm">₹{c.msp_price_per_quintal}/Q</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Moisture: ≤{c.max_moisture_percent}%
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <div className="text-xs text-slate-500 font-medium truncate">
              {selectedCrop ? (
                <span className="text-emerald-700 font-bold">Selected: {selectedCrop.name}</span>
              ) : (
                <span className="text-amber-600 font-semibold">Tap a crop card to continue</span>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedCrop) setStep(2);
                else setError('Please select a crop first');
              }}
              disabled={!selectedCrop}
              className="px-5 sm:px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 flex-shrink-0"
            >
              <span>{tr.continue || 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: QUANTITY */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="card-clean p-4 sm:p-8 space-y-5 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                <span>⚖️</span>
                <span>{tr.enterQuantityTitle || 'Enter Harvest Quantity (Quintals)'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {selectedCrop?.name} • 1 Quintal = 100 kg • Speak e.g. "50 Quintals", "100 Q", or "వంద"
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[50, 100, 200].map((qHint) => (
                <button
                  key={qHint}
                  type="button"
                  onClick={() => handleVoiceCommand(`${qHint} quintals`)}
                  className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Mic className="w-3 h-3 text-emerald-600" />
                  <span>{qHint} Q</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-4">
            
            {/* Quick +/- Stepper Buttons & Large Number */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center w-full">
              <button
                type="button"
                onClick={() => {
                  const n = Math.max(5, quantity - 5);
                  setQuantity(n);
                  speakText(`${n} Quintals.`);
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 font-black text-2xl flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                title="Decrease 5 Quintals"
              >
                -
              </button>

              <div className="text-center px-2">
                <div className="text-3xl sm:text-5xl font-black text-emerald-700 font-outfit">
                  {quantity} <span className="text-base sm:text-2xl text-slate-600 font-bold">Quintals</span>
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">
                  {(quantity * 100).toLocaleString('en-IN')} kg • ~{quantity * 2} standard bags
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const n = quantity + 5;
                  setQuantity(n);
                  speakText(`${n} Quintals.`);
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 font-black text-2xl flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                title="Increase 5 Quintals"
              >
                +
              </button>
            </div>

            {/* Quick Quantity Presets */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center pt-2">
              {[10, 25, 50, 75, 100, 150, 200, 300].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setQuantity(q);
                    speakText(`${q} Quintals selected.`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    quantity === q
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {q} Q
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <div className="w-full max-w-md pt-2 px-2">
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 5)}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-1">
                <span>5 Q</span>
                <span>250 Q</span>
                <span>500 Q</span>
              </div>
            </div>

            {/* Direct Number Input */}
            <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
              <label className="text-xs font-bold text-slate-600">Manual Entry:</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-center font-bold text-base text-slate-900 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-500">Quintals</span>
            </div>
          </div>

          {/* MSP Estimated Value Summary */}
          {selectedCrop && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                  ₹
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-semibold">Estimated MSP Payout</div>
                  <div className="text-base sm:text-lg font-black text-emerald-800">
                    ₹{((selectedCrop.msp_price_per_quintal || 0) * quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                @ ₹{selectedCrop.msp_price_per_quintal}/Q
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>{tr.continue || 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: LOCATION (STATE & DISTRICT) */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="card-clean p-4 sm:p-8 space-y-5 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                <span>📍</span>
                <span>{tr.selectLocationTitle || 'Select Farm Location & District'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                We cover all 28 States and 8 Union Territories with official APMC / FCI procurement centers.
              </p>
            </div>

            {/* Auto detect location button */}
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  setIsDetectingLocation(true);
                  navigator.geolocation.getCurrentPosition(
                    () => {
                      setIsDetectingLocation(false);
                      speakText(`Current location active in ${location.district}`);
                    },
                    () => {
                      setIsDetectingLocation(false);
                    }
                  );
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Compass className={`w-3.5 h-3.5 text-emerald-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Locating...' : 'Auto-Detect GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State / Union Territory
              </label>
              <select
                value={location.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-xs"
              >
                {ALL_INDIAN_STATES.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                District / Mandi Division
              </label>
              <select
                value={location.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-xs"
              >
                {(ALL_INDIAN_STATES.find((s) => s.state === location.state)?.districts || ['District Hub']).map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Village / Mandal / Town
              </label>
              <input
                type="text"
                value={location.village}
                onChange={(e) => setLocation({ ...location, village: e.target.value })}
                placeholder="e.g. Hasanparthy, Warangal"
                className="w-full p-3.5 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>
              Found <strong>{centers.length}</strong> official procurement centers operating in <strong>{location.district}</strong>, {location.state}.
            </span>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>{tr.continue || 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: FARMER EMAIL FOR TOKEN DISPATCH */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="card-clean p-4 sm:p-8 space-y-5 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
              <span>📧</span>
              <span>{tr.farmerEmailTitle || 'Digital QR Token & Email Confirmation'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              We send your official Mandi Gate Pass, QR Token & Schedule SMS to this email address.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Farmer Contact Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={farmerEmail}
                  onChange={(e) => setFarmerEmail(e.target.value)}
                  placeholder="e.g. vasanthreddy302@gmail.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant Delivery Highlights:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-emerald-800 text-[11px] sm:text-xs">
                <li>Gate Entry QR Code Pass for zero-queue security check</li>
                <li>Live Queue Position & Assigned Weighbridge Counter</li>
                <li>Official Government MSP Settlement Receipt copy</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleFetchAiRecommendation}
              disabled={loading || !farmerEmail.trim()}
              className="px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>{loading ? 'Analyzing...' : 'Get AI Mandi Match'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: PROCUREMENT CENTER SELECTION & AI RECOMMENDATION */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="card-clean p-4 sm:p-8 space-y-5 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                <span>🏢</span>
                <span>{tr.selectCenterTitle || 'Select APMC Procurement Center'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {location.district}, {location.state}
              </p>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          {aiRec && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-emerald-900 flex items-center gap-2 flex-wrap">
                  <span>AI Optimal Mandi Match</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    Fastest Weighbridge
                  </span>
                </div>
                <p className="text-slate-700 mt-1 font-medium text-[11px] sm:text-xs">
                  {aiRec.reason || `Recommended based on low congestion and proximity to ${location.village}.`}
                </p>
              </div>
            </div>
          )}

          {/* Centers List */}
          <div className="space-y-2.5 sm:space-y-3">
            {centers.map((c: any) => {
              const isSelected = selectedCenter?.id === c.id;
              const isAiPick = aiRec?.recommendedCenter?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCenter(c);
                    speakText(`Selected ${c.name}. Moving to date and slot selection.`, () => {
                      setStep(6);
                    });
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/90 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-400/40'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 active:scale-99'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 font-outfit">{c.name}</h3>
                      {isAiPick && (
                        <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Pick
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.location_area || location.district}
                      </span>
                      <span>•</span>
                      <span>Capacity: {c.daily_capacity_quintals || 500} Q/day</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-500">Distance</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-700">~{c.distance_km || 8.5} km</div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedCenter) setStep(6);
                else setError('Please select a center');
              }}
              disabled={!selectedCenter}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>{tr.continue || 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: DATE & TIME SLOT SELECTION (MAX 3 SLOTS CAP) */}
      {/* ========================================================================= */}
      {step === 6 && (
        <div className="card-clean p-4 sm:p-8 space-y-5 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                <span>⏰</span>
                <span>{tr.selectSlotTitle || 'Choose Date & Preferred Time Slot'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Every 30-minute window has a strict limit of <strong>3 slots</strong> to eliminate truck congestion.
              </p>
            </div>

            {/* Morning / Afternoon filter chips */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSlotTimeFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  slotTimeFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Windows
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Arrival Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-64 p-3.5 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-xs"
            />
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Available 30-Minute Windows ({selectedDate})
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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
                        speakText(`Selected slot ${slotInfo.time}. Ready to review.`);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-98 ${
                        isFull
                          ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-300'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black text-slate-900 font-outfit flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{slotInfo.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {isFull ? (
                            <span className="text-rose-600 font-bold">Full (3/3 Booked)</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">
                              {slotInfo.availableSlots} of {slotInfo.maxSlots} spots available
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
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
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedSlot) setStep(7);
                else setError('Please select a time slot');
              }}
              disabled={!selectedSlot}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <span>{tr.continue || 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: REVIEW & CONFIRM BOOKING */}
      {/* ========================================================================= */}
      {step === 7 && (
        <div className="card-clean p-4 sm:p-8 space-y-5 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-lg sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
              <span>📋</span>
              <span>{tr.reviewTitle || 'Review & Confirm Slot Booking'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Please verify your appointment summary before final submission. Say <strong>"Confirm Booking"</strong> to generate your gate pass.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Crop Details</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{selectedCrop?.name}</div>
                <div className="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-0.5">
                  MSP: ₹{selectedCrop?.msp_price_per_quintal} / Q
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quantity & Value</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{quantity} Quintals ({(quantity * 100).toLocaleString('en-IN')} kg)</div>
                <div className="text-[11px] sm:text-xs font-black text-emerald-700 mt-0.5">
                  Total MSP: ₹{((selectedCrop?.msp_price_per_quintal || 0) * quantity).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandi Procurement Center</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{selectedCenter?.name}</div>
                <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">
                  {location.village}, {location.district}, {location.state}
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date & Time Slot</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{selectedDate}</div>
                <div className="text-[11px] sm:text-xs font-bold text-emerald-700 mt-0.5">{selectedSlot}</div>
              </div>

            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">QR Token Sent To: {farmerEmail}</span>
              </div>
              <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded-md">SMS + Email</span>
            </div>
          </div>

          <AICaptionDisclaimer />

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setStep(6)}
              className="px-4 sm:px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>{loading ? 'Confirming...' : 'Confirm & Generate Digital Token'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📱 STICKY MOBILE ACTION BAR FOR ONE-THUMB STEPPING */}
      {/* ========================================================================= */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl px-4 py-2.5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else {
              stopSpeech();
              onBack();
            }
          }}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
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
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
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
