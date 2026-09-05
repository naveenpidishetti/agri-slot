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
  Radio
} from 'lucide-react';

interface SlotBookingWizardProps {
  onBack: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

const DEFAULT_CROPS: Crop[] = [
  { id: 'crop-paddy', name: 'Paddy (వరి / Rice)', code: 'PAD-01', category: 'Cereal', msp_price_per_quintal: 2300, max_moisture_percent: 14.0 },
  { id: 'crop-wheat', name: 'Wheat (గోధుమలు / Gehun)', code: 'WHT-02', category: 'Cereal', msp_price_per_quintal: 2275, max_moisture_percent: 12.0 },
  { id: 'crop-cotton', name: 'Cotton (పత్తి / Kapas)', code: 'COT-04', category: 'Fiber', msp_price_per_quintal: 7020, max_moisture_percent: 8.0 },
  { id: 'crop-maize', name: 'Maize (మొక్కజొన్న / Makka)', code: 'MAZ-03', category: 'Coarse Cereal', msp_price_per_quintal: 2090, max_moisture_percent: 14.0 },
  { id: 'crop-chilli', name: 'Chilli (మిర్చి / Mirchi)', code: 'CHL-08', category: 'Spices', msp_price_per_quintal: 18200, max_moisture_percent: 10.0 },
  { id: 'crop-turmeric', name: 'Turmeric (పసుపు / Haldi)', code: 'TUR-07', category: 'Spices', msp_price_per_quintal: 13500, max_moisture_percent: 10.0 },
  { id: 'crop-soybean', name: 'Soybean (సోయాబీన్)', code: 'SOY-05', category: 'Oilseed', msp_price_per_quintal: 4892, max_moisture_percent: 10.0 },
  { id: 'crop-groundnut', name: 'Groundnut (వేరుశనగ / పల్లీలు)', code: 'GND-09', category: 'Oilseed', msp_price_per_quintal: 6783, max_moisture_percent: 8.0 },
  { id: 'crop-mustard', name: 'Mustard (ఆవాలు / Sarson)', code: 'MST-10', category: 'Oilseed', msp_price_per_quintal: 5650, max_moisture_percent: 8.0 },
  { id: 'crop-onion', name: 'Onion (ఉల్లిపాయ / Pyaz)', code: 'ONN-19', category: 'Horticulture', msp_price_per_quintal: 2450, max_moisture_percent: 14.0 },
  { id: 'crop-tomato', name: 'Tomato (టమోటా / Tamatar)', code: 'TMT-20', category: 'Horticulture', msp_price_per_quintal: 1850, max_moisture_percent: 14.0 },
  { id: 'crop-potato', name: 'Potato (బంగాళాదుంప / Aloo)', code: 'POT-21', category: 'Horticulture', msp_price_per_quintal: 1650, max_moisture_percent: 14.0 },
  { id: 'crop-sugarcane', name: 'Sugarcane (చెరకు / Ganna)', code: 'SGC-16', category: 'Commercial', msp_price_per_quintal: 340, max_moisture_percent: 18.0 }
];

export const SlotBookingWizard: React.FC<SlotBookingWizardProps> = ({ onBack, onBookingSuccess }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const tr: any = t;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  // 🎙️ VOICE ASSISTANT STATE & REFS
  // =========================================================================
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string>('Voice Assistant Active. Speak your choices anytime.');

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
    
    // Choose appropriate locale
    if (languageRef.current === 'te') {
      utterance.lang = 'te-IN';
    } else if (languageRef.current === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
      // Resume listening after speaking ends
      startListening();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  }, [stopSpeech]);

  // =========================================================================
  // 🎙️ STEP VOICE PROMPT ANNOUNCER
  // =========================================================================
  const triggerStepVoicePrompt = useCallback((stepNumber: number) => {
    if (!isVoiceActiveRef.current) return;

    let text = '';
    const lang = languageRef.current;

    switch (stepNumber) {
      case 1:
        text = lang === 'te'
          ? 'నమస్కారం! పంటల స్లాట్ బుకింగ్‌కు స్వాగతం. మీరు ఏ పంట విక్రయించాలనుకుంటున్నారు? వరి, పత్తి, గోధుమలు, మిర్చి లేదా పసుపు అని చెప్పండి.'
          : lang === 'hi'
          ? 'नमस्ते! मंडी स्लॉट बुकिंग में आपका स्वागत है। आप कौन सी फसल बेचना चाहते हैं? कृपया धान, कपास, गेहूं, मक्का या मिर्च बोलें।'
          : 'Welcome to Mandi Slot Booking. Which crop would you like to sell? You can say Paddy, Cotton, Wheat, Maize, Chilli, or Turmeric.';
        break;

      case 2:
        text = lang === 'te'
          ? `ఎంచుకున్న పంట ${selectedCropRef.current?.name || 'వరి'}. దయచేసి మీ పంట పరిమాణాన్ని క్వింటాళ్లలో చెప్పండి. ఉదాహరణకు 50 క్వింటాళ్లు లేదా 100 క్వింటాళ్లు.`
          : lang === 'hi'
          ? `चुनी गई फसल ${selectedCropRef.current?.name || 'धान'} है। कृपया अपनी फसल की मात्रा क्विंटल में बताएं, जैसे 50 क्विंटल या 100 क्विंटल।`
          : `Selected crop is ${selectedCropRef.current?.name || 'Paddy'}. Please speak your harvest quantity in quintals, for example 50 quintals or 100 quintals.`;
        break;

      case 3:
        text = lang === 'te'
          ? `మీ ఫారమ్ స్థానం ${locationRef.current.district}, ${locationRef.current.state}. కొనసాగించడానికి నెక్స్ట్ అని చెప్పండి.`
          : lang === 'hi'
          ? `आपका जिला ${locationRef.current.district}, ${locationRef.current.state} है। आगे बढ़ने के लिए नेक्स्ट बोलें।`
          : `Your farm location is set to ${locationRef.current.district}, ${locationRef.current.state}. Say Next to continue.`;
        break;

      case 4:
        text = lang === 'te'
          ? 'మీ డిజిటల్ గేట్ పాస్ టోకెన్ మీ ఈమెయిల్‌కు పంపబడుతుంది. AI సిఫార్సు కోసం నెక్స్ట్ అని చెప్పండి.'
          : lang === 'hi'
          ? 'आपका डिजिटल गेट पास टोकन आपके ईमेल पर भेजा जाएगा। एआई मंडी सुझाव के लिए नेक्स्ट बोलें।'
          : 'Your digital QR gate pass will be sent to your email. Say Next to get AI Mandi recommendation.';
        break;

      case 5:
        text = lang === 'te'
          ? `మేము సిఫార్సు చేస్తున్న మార్కెట్ కేంద్రం ${selectedCenterRef.current?.name || 'APMC సెంటర్'}. స్లాట్ ఎంపికకు నెక్స్ట్ అని చెప్పండి.`
          : lang === 'hi'
          ? `अनुशंसित मंडी केंद्र ${selectedCenterRef.current?.name || 'एपीएमसी केंद्र'} है। स्लॉट चुनने के लिए नेक्स्ट बोलें।`
          : `We recommend ${selectedCenterRef.current?.name || 'APMC Procurement Center'}. Say Next to choose your arrival time slot.`;
        break;

      case 6:
        text = lang === 'te'
          ? `తేదీ ${selectedDateRef.current}. అందుబాటులో ఉన్న సమయ స్లాట్ ${selectedSlotRef.current}. కొనసాగించడానికి కన్ఫర్మ్ స్లాట్ లేదా నెక్స్ట్ అని చెప్పండి.`
          : lang === 'hi'
          ? `तारीख ${selectedDateRef.current} है। उपलब्ध समय स्लॉट ${selectedSlotRef.current} है। आगे बढ़ने के लिए नेक्स्ट बोलें।`
          : `Arrival date is ${selectedDateRef.current}. Selected slot is ${selectedSlotRef.current}. Say Next or Confirm to review.`;
        break;

      case 7:
        text = lang === 'te'
          ? `దయచేసి మీ బుకింగ్ వివరాలు సరిచూసుకోండి. ${selectedCropRef.current?.name}, ${quantityRef.current} క్వింటాళ్లు. టోకెన్ పొందడానికి కన్ఫర్మ్ బుకింగ్ అని చెప్పండి.`
          : lang === 'hi'
          ? `कृपया अपनी बुकिंग जांचें। ${selectedCropRef.current?.name}, ${quantityRef.current} क्विंटल। टोकन बनाने के लिए कन्फर्म बुकिंग बोलें।`
          : `Please review your booking details: ${selectedCropRef.current?.name}, ${quantityRef.current} Quintals. Say Confirm Booking to generate your token.`;
        break;

      default:
        break;
    }

    setVoiceFeedback(text);
    speakText(text);
  }, [speakText]);

  // Announce when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerStepVoicePrompt(step);
    }, 400);
    return () => clearTimeout(timer);
  }, [step, triggerStepVoicePrompt]);

  // =========================================================================
  // 🧠 VOICE COMMAND PROCESSOR & MATCHING
  // =========================================================================
  const handleVoiceCommand = useCallback((rawTranscript: string) => {
    const text = rawTranscript.toLowerCase().trim();
    if (!text || isProcessingVoiceRef.current) return;

    setVoiceTranscript(rawTranscript);

    // Global Navigation Commands
    if (text.includes('next') || text.includes('continue') || text.includes('proceed') || text.includes('తర్వాత') || text.includes('ముందుకు') || text.includes('आगे') || text.includes('సరే')) {
      const current = stepRef.current;
      if (current === 1 && selectedCropRef.current) {
        setStep(2);
      } else if (current === 2) {
        setStep(3);
      } else if (current === 3) {
        setStep(4);
      } else if (current === 4) {
        handleFetchAiRecommendation();
      } else if (current === 5 && selectedCenterRef.current) {
        setStep(6);
      } else if (current === 6 && selectedSlotRef.current) {
        setStep(7);
      } else if (current === 7) {
        handleConfirmBooking();
      }
      return;
    }

    if (text.includes('back') || text.includes('previous') || text.includes('వెనుకకు') || text.includes('పీచే')) {
      setStep(prev => Math.max(1, prev - 1));
      return;
    }

    if (text.includes('repeat') || text.includes('again') || text.includes('మళ్లీ చెప్పు') || text.includes('ఫిర్ సే')) {
      triggerStepVoicePrompt(stepRef.current);
      return;
    }

    // Step-Specific Matching
    const currentStep = stepRef.current;

    // --- STEP 1: CROP MATCHING ---
    if (currentStep === 1) {
      const cropList = cropsRef.current;
      let matchedCrop: Crop | null = null;

      if (text.includes('paddy') || text.includes('rice') || text.includes('వరి') || text.includes('dhan') || text.includes('వరి పంట') || text.includes('ధాన్యం')) {
        matchedCrop = cropList.find(c => c.id === 'crop-paddy') || cropList[0];
      } else if (text.includes('cotton') || text.includes('పత్తి') || text.includes('kapas')) {
        matchedCrop = cropList.find(c => c.id === 'crop-cotton') || null;
      } else if (text.includes('wheat') || text.includes('గోధుమ') || text.includes('gehun')) {
        matchedCrop = cropList.find(c => c.id === 'crop-wheat') || null;
      } else if (text.includes('maize') || text.includes('corn') || text.includes('మొక్కజొన్న') || text.includes('makka')) {
        matchedCrop = cropList.find(c => c.id === 'crop-maize') || null;
      } else if (text.includes('chilli') || text.includes('mirchi') || text.includes('మిర్చి')) {
        matchedCrop = cropList.find(c => c.id === 'crop-chilli') || null;
      } else if (text.includes('turmeric') || text.includes('పసుపు') || text.includes('haldi')) {
        matchedCrop = cropList.find(c => c.id === 'crop-turmeric') || null;
      } else if (text.includes('soybean') || text.includes('సోయా')) {
        matchedCrop = cropList.find(c => c.id === 'crop-soybean') || null;
      } else if (text.includes('groundnut') || text.includes('peanut') || text.includes('వేరుశనగ') || text.includes('పల్లీలు')) {
        matchedCrop = cropList.find(c => c.id === 'crop-groundnut') || null;
      } else if (text.includes('mustard') || text.includes('ఆవాలు') || text.includes('sarson')) {
        matchedCrop = cropList.find(c => c.id === 'crop-mustard') || null;
      } else if (text.includes('onion') || text.includes('ఉల్లిపాయ') || text.includes('pyaz')) {
        matchedCrop = cropList.find(c => c.id === 'crop-onion') || null;
      } else if (text.includes('tomato') || text.includes('టమోటా') || text.includes('tamatar')) {
        matchedCrop = cropList.find(c => c.id === 'crop-tomato') || null;
      } else if (text.includes('potato') || text.includes('బంగాళాదుంప') || text.includes('aloo')) {
        matchedCrop = cropList.find(c => c.id === 'crop-potato') || null;
      } else if (text.includes('sugarcane') || text.includes('చెరకు') || text.includes('ganna')) {
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
      // Extract numbers like "50 quintals", "100", "వంద", "యాభై"
      let parsedNum: number | null = null;
      const numMatch = text.match(/\d+/);

      if (numMatch) {
        parsedNum = parseInt(numMatch[0], 10);
      } else if (text.includes('hundred') || text.includes('వంద') || text.includes('सौ')) {
        parsedNum = 100;
      } else if (text.includes('fifty') || text.includes('యాభై') || text.includes('पचास')) {
        parsedNum = 50;
      } else if (text.includes('twenty') || text.includes('ఇరవై') || text.includes('बीस')) {
        parsedNum = 20;
      } else if (text.includes('forty') || text.includes('నలభై') || text.includes('चालीस')) {
        parsedNum = 40;
      } else if (text.includes('sixty') || text.includes('అరవై') || text.includes('साठ')) {
        parsedNum = 60;
      } else if (text.includes('eighty') || text.includes('ఎనభై') || text.includes('अस्सी')) {
        parsedNum = 80;
      } else if (text.includes('two hundred') || text.includes('రెండు వందలు') || text.includes('दो सौ')) {
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

    // --- STEP 3: LOCATION ---
    if (currentStep === 3) {
      if (text.includes('next') || text.includes('ok') || text.includes('confirm') || text.includes('సరే')) {
        setStep(4);
      }
      return;
    }

    // --- STEP 4: EMAIL ---
    if (currentStep === 4) {
      if (text.includes('next') || text.includes('send') || text.includes('ai') || text.includes('match') || text.includes('సరే')) {
        handleFetchAiRecommendation();
      }
      return;
    }

    // --- STEP 5: CENTER SELECTION ---
    if (currentStep === 5) {
      if (text.includes('first') || text.includes('recommended') || text.includes('select') || text.includes('center') || text.includes('warangal') || text.includes('సరే')) {
        if (centersRef.current.length > 0) {
          setSelectedCenter(centersRef.current[0]);
          speakText(`Selected ${centersRef.current[0].name}. Moving to time slot.`, () => {
            setStep(6);
          });
        }
      }
      return;
    }

    // --- STEP 6: TIME SLOT SELECTION ---
    if (currentStep === 6) {
      if (text.includes('morning') || text.includes('11') || text.includes('10') || text.includes('slot') || text.includes('confirm') || text.includes('next')) {
        speakText(`Selected slot ${selectedSlotRef.current}. Moving to confirmation.`, () => {
          setStep(7);
        });
      }
      return;
    }

    // --- STEP 7: CONFIRM BOOKING ---
    if (currentStep === 7) {
      if (text.includes('confirm') || text.includes('book') || text.includes('yes') || text.includes('submit') || text.includes('ఖరారు') || text.includes('బుక్')) {
        handleConfirmBooking();
      }
      return;
    }
  }, [speakText]);

  // =========================================================================
  // 🎙️ WEB SPEECH RECOGNITION (STT) LIFECYCLE
  // =========================================================================
  const startListening = useCallback(() => {
    if (!isVoiceActiveRef.current || isSpeakingRef.current) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;

      if (languageRef.current === 'te') {
        recognition.lang = 'te-IN';
      } else if (languageRef.current === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
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
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition error:', e.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart if voice is still active and not speaking
        if (isVoiceActiveRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (err) {
              // Ignore restart error
            }
          }, 300);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not initialize SpeechRecognition', e);
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

  // =========================================================================
  // ACTIONS: AI RECOMMENDATION & CONFIRM BOOKING
  // =========================================================================
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
          {/* Voice Assistant Toggle Button */}
          <button
            onClick={() => {
              const nextState = !isVoiceActive;
              setIsVoiceActive(nextState);
              if (!nextState) stopSpeech();
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

      {/* 🎙️ LIVE VOICE ASSISTANT INTERACTIVE STATUS BANNER */}
      {isVoiceActive && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/20 relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-all ${
                  isSpeaking
                    ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 scale-105 ring-4 ring-emerald-400/40 animate-pulse'
                    : isListening
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 ring-2 ring-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isSpeaking ? (
                    <Volume2 className="w-6 h-6 animate-bounce" />
                  ) : isListening ? (
                    <Mic className="w-6 h-6 text-white animate-pulse" />
                  ) : (
                    <Bot className="w-6 h-6" />
                  )}
                </div>
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                    Kisan Voice Assistant (మొత్తం వాయిస్ అసిస్టెంట్)
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isSpeaking
                      ? 'bg-teal-500/30 text-teal-200 border border-teal-400/40'
                      : isListening
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSpeaking ? '🗣️ Speaking Prompt...' : isListening ? '🎙️ Listening to You...' : 'Idle'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium mt-1 line-clamp-2 max-w-xl">
                  {voiceTranscript ? `🎙️ You said: "${voiceTranscript}"` : voiceFeedback}
                </p>
              </div>
            </div>

            {/* Quick Actions for Voice */}
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
                title="Stop current voice audio"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute</span>
              </button>
            </div>

          </div>

          {/* Soundwave animation strip */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold text-emerald-300">
              💡 {step === 1 ? 'Say crop name: "Paddy", "Cotton", "Wheat", "వరి"' : step === 2 ? 'Say quantity: "50 Quintals", "100", "వంద"' : step === 7 ? 'Say: "Confirm Booking" or "ఖరారు చేయండి"' : 'Say: "Next", "Back", or "Continue"'}
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

        {/* Mobile Linear Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
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
        <div className="card-clean p-6 sm:p-8 space-y-6 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                <span>🌾</span>
                <span>{tr.selectCropTitle || 'Select Crop for Mandi Procurement'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {tr.selectCropDesc || 'Choose or speak the crop you want to sell at official MSP rates.'}
              </p>
            </div>

            {/* Quick voice hint chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['Paddy (వరి)', 'Cotton (పత్తి)', 'Wheat (గోధుమలు)', 'Maize (మొక్కజొన్న)'].map((cHint) => (
                <button
                  key={cHint}
                  onClick={() => handleVoiceCommand(cHint.split(' ')[0])}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Mic className="w-3 h-3 text-emerald-600" />
                  <span>{cHint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {crops.map((c) => {
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
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md shadow-emerald-500/10 scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mb-2">
                    {c.category}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 font-outfit">{c.name}</h3>
                  <div className="mt-2 text-xs flex items-center justify-between text-slate-600 font-semibold">
                    <span>MSP Rate:</span>
                    <span className="text-emerald-700 font-extrabold text-sm">₹{c.msp_price_per_quintal} / Q</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Max Moisture: {c.max_moisture_percent}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              {selectedCrop ? (
                <span className="text-emerald-700 font-bold">Selected: {selectedCrop.name}</span>
              ) : (
                <span className="text-amber-600 font-semibold">Speak or click a crop to proceed</span>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedCrop) setStep(2);
                else setError('Please select a crop first');
              }}
              disabled={!selectedCrop}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
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
        <div className="card-clean p-6 sm:p-8 space-y-6 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                <span>⚖️</span>
                <span>{tr.enterQuantityTitle || 'Enter Harvest Quantity (Quintals)'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {selectedCrop?.name} • 1 Quintal = 100 kg • Speak e.g. "50 Quintals" or "100"
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[50, 100, 200].map((qHint) => (
                <button
                  key={qHint}
                  onClick={() => handleVoiceCommand(`${qHint} quintals`)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Mic className="w-3 h-3 text-emerald-600" />
                  <span>{qHint} Q</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-4">
            <div className="text-4xl sm:text-5xl font-black text-emerald-700 font-outfit">
              {quantity} <span className="text-2xl text-slate-600 font-bold">Quintals</span>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Total Weight: {(quantity * 100).toLocaleString('en-IN')} kg ({quantity * 2} standard 50kg bags)
            </div>

            {/* Quick Quantity Presets */}
            <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
              {[20, 40, 60, 80, 100, 150, 200].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuantity(q);
                    speakText(`${q} Quintals selected.`);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            <div className="w-full max-w-md pt-4">
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 5)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-1">
                <span>5 Q</span>
                <span>250 Q</span>
                <span>500 Q</span>
              </div>
            </div>

            {/* Direct Number Input */}
            <div className="flex items-center gap-2 pt-2">
              <label className="text-xs font-bold text-slate-600">Manual Entry:</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-center font-bold text-sm text-slate-900 bg-white"
              />
              <span className="text-xs font-bold text-slate-500">Quintals</span>
            </div>
          </div>

          {/* MSP Estimated Value Summary */}
          {selectedCrop && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  ₹
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-semibold">Estimated MSP Payout</div>
                  <div className="text-lg font-black text-emerald-800">
                    ₹{((selectedCrop.msp_price_per_quintal || 0) * quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                @ ₹{selectedCrop.msp_price_per_quintal}/Q
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
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
        <div className="card-clean p-6 sm:p-8 space-y-6 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
              <span>📍</span>
              <span>{tr.selectLocationTitle || 'Select Farm Location & District'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              We cover all 28 States and 8 Union Territories with official APMC / FCI procurement centers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State / Union Territory
              </label>
              <select
                value={location.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
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
                className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
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
                className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>
              Found <strong>{centers.length}</strong> official procurement centers operating in <strong>{location.district}</strong>, {location.state}. Say <strong>"Next"</strong> to proceed.
            </span>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
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
        <div className="card-clean p-6 sm:p-8 space-y-6 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant Delivery Highlights:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-emerald-800">
                <li>Gate Entry QR Code Pass for zero-queue security check</li>
                <li>Live Queue Position & Assigned Weighbridge Counter</li>
                <li>Official Government MSP Settlement Receipt copy</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              onClick={handleFetchAiRecommendation}
              disabled={loading || !farmerEmail.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>{loading ? 'Analyzing AI Recommendation...' : 'Get AI Mandi Match'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: PROCUREMENT CENTER SELECTION & AI RECOMMENDATION */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="card-clean p-6 sm:p-8 space-y-6 border border-emerald-200 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
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
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-emerald-900 flex items-center gap-2">
                  <span>AI Optimal Mandi Match</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    Fastest Weighbridge
                  </span>
                </div>
                <p className="text-slate-700 mt-1 font-medium">
                  {aiRec.reason || `Recommended based on low congestion and proximity to ${location.village}.`}
                </p>
              </div>
            </div>
          )}

          {/* Centers List */}
          <div className="space-y-3">
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
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 font-outfit">{c.name}</h3>
                      {isAiPick && (
                        <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Pick
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.location_area || location.district}
                      </span>
                      <span>•</span>
                      <span>Capacity: {c.daily_capacity_quintals || 500} Q/day</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">Distance</div>
                      <div className="text-xs font-black text-emerald-700">~{c.distance_km || 8.5} km</div>
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

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              onClick={() => {
                if (selectedCenter) setStep(6);
                else setError('Please select a center');
              }}
              disabled={!selectedCenter}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
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
        <div className="card-clean p-6 sm:p-8 space-y-6 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
              <span>⏰</span>
              <span>{tr.selectSlotTitle || 'Choose Date & Preferred Time Slot'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Every 30-minute window has a strict limit of <strong>3 slots</strong> to eliminate truck congestion.
            </p>
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
              className="w-full sm:w-64 p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
            />
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Available 30-Minute Windows ({selectedDate})
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              ).map((slotInfo) => {
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
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
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

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              onClick={() => {
                if (selectedSlot) setStep(7);
                else setError('Please select a time slot');
              }}
              disabled={!selectedSlot}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
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
        <div className="card-clean p-6 sm:p-8 space-y-6 border border-emerald-200 bg-white">
          <div>
            <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
              <span>📋</span>
              <span>{tr.reviewTitle || 'Review & Confirm Slot Booking'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Please verify your appointment summary before final submission. Say <strong>"Confirm Booking"</strong> to generate your gate pass.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Crop Details</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{selectedCrop?.name}</div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  MSP: ₹{selectedCrop?.msp_price_per_quintal} / Q
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quantity & Value</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{quantity} Quintals ({(quantity * 100).toLocaleString('en-IN')} kg)</div>
                <div className="text-xs font-black text-emerald-700 mt-0.5">
                  Total MSP: ₹{((selectedCrop?.msp_price_per_quintal || 0) * quantity).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandi Procurement Center</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{selectedCenter?.name}</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {location.village}, {location.district}, {location.state}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date & Time Slot</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{selectedDate}</div>
                <div className="text-xs font-bold text-emerald-700 mt-0.5">{selectedSlot}</div>
              </div>

            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>QR Token Sent To: {farmerEmail}</span>
              </div>
              <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded-md">SMS + Email</span>
            </div>
          </div>

          <AICaptionDisclaimer />

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setStep(6)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr.back || 'Back'}</span>
            </button>

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>{loading ? 'Confirming & Generating QR Token...' : 'Confirm & Generate Digital Token'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
