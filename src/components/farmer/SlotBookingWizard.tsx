import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Sparkles,
  Info,
  AlertCircle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  Lock,
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
  const { language, t } = useLanguage();
  const tr = t;

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

  // Voice Assistant Engine State
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string>('Welcome to Kisan Voice Assistant');

  // References to keep state access fresh inside callbacks & event listeners
  const recognitionRef = useRef<any>(null);
  const isVoiceActiveRef = useRef<boolean>(isVoiceActive);
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const stepRef = useRef<number>(step);
  const languageRef = useRef<string>(language);
  const selectedCropRef = useRef<Crop | null>(selectedCrop);
  const quantityRef = useRef<number>(quantity);
  const locationRef = useRef(location);
  const selectedCenterRef = useRef<ProcurementCenter | null>(selectedCenter);
  const selectedDateRef = useRef<string>(selectedDate);
  const selectedSlotRef = useRef<string>(selectedSlot);
  const cropsRef = useRef<Crop[]>(crops);
  const centersRef = useRef<ProcurementCenter[]>(centers);
  const restartTimerRef = useRef<any>(null);

  // Sync refs
  useEffect(() => { isVoiceActiveRef.current = isVoiceActive; }, [isVoiceActive]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { selectedCropRef.current = selectedCrop; }, [selectedCrop]);
  useEffect(() => { quantityRef.current = quantity; }, [quantity]);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { selectedCenterRef.current = selectedCenter; }, [selectedCenter]);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { selectedSlotRef.current = selectedSlot; }, [selectedSlot]);
  useEffect(() => { cropsRef.current = crops; }, [crops]);
  useEffect(() => { centersRef.current = centers; }, [centers]);

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

  // =========================================================================
  // 🌐 BCP-47 LANGUAGE HELPER
  // =========================================================================
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
    if (!isVoiceActiveRef.current || !('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      stopSpeech();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getBCP47Tag(languageRef.current);
      utterance.rate = 0.98;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsListening(false);
      };

      const handleEnd = () => {
        setIsSpeaking(false);
        if (onEndCallback) onEndCallback();
        if (isVoiceActiveRef.current) {
          setTimeout(() => {
            startListening();
          }, 200);
        }
      };

      utterance.onend = handleEnd;
      utterance.onerror = handleEnd;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
      if (onEndCallback) onEndCallback();
    }
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
        if (lang === 'te') text = 'పంటల స్లాట్ బుకింగ్‌కు స్వాగతం. మీరు ఏ పంట విక్రయించాలనుకుంటున్నారు? వరి, పత్తి, గోధుమలు, మిర్చి లేదా పసుపు అని చెప్పండి.';
        else if (lang === 'hi') text = 'नमस्ते! मंडी स्लॉट बुकिंग में आपका स्वागत है। आप कौन सी फसल बेचना चाहते हैं? धान, कपास, गेहूं, मक्का या मिर्च बोलें।';
        else if (lang === 'ta') text = 'வணக்கம்! மண்டி முன்பதிவுக்கு வரவேற்கிறோம். எந்தப் பயிரை விற்க விரும்புகிறீர்கள்? நெல், பருத்தி, கோதுமை என்று சொல்லுங்கள்.';
        else if (lang === 'kn') text = 'ನಮಸ್ಕಾರ! ಮಂಡಿ ಬುಕಿಂಗ್‌ಗೆ ಸುಸ್ವಾಗತ. ನೀವು ಯಾವ ಬೆಳೆಯನ್ನು ಮಾರಾಟ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ? ಭತ್ತ, ಹತ್ತಿ ಅಥವಾ ಗೋಧಿ ಎಂದು ಹೇಳಿ.';
        else text = 'Welcome to Mandi Slot Booking. Which crop would you like to sell? Say Paddy, Cotton, Wheat, Maize, Chilli, or Turmeric.';
        break;

      case 2:
        if (lang === 'te') text = `ఎంచుకున్న పంట ${selectedCropRef.current?.name || 'వరి'}. పంట పరిమాణాన్ని క్వింటాళ్లలో చెప్పండి, ఉదాహరణకు 25 లేదా 50 క్వింటాళ్లు.`;
        else if (lang === 'hi') text = `चुनी गई फसल ${selectedCropRef.current?.name || 'धान'} है। कृपया फसल की मात्रा बताएं, जैसे 25 या 50 क्विंटल।`;
        else text = `Selected crop is ${selectedCropRef.current?.name || 'Paddy'}. Please speak quantity in quintals, for example 25 or 50 quintals.`;
        break;

      case 3:
        if (lang === 'te') text = `మీ ఫారమ్ స్థానం ${locationRef.current.district}, ${locationRef.current.state}. కొనసాగించడానికి నెక్స్ట్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `आपका जिला ${locationRef.current.district} है। आगे बढ़ने के लिए नेक्स्ट बोलें।`;
        else text = `Your location is ${locationRef.current.district}, ${locationRef.current.state}. Say Next to proceed.`;
        break;

      case 4:
        if (lang === 'te') text = 'డిజిటల్ టోకెన్ పాస్ మీ ఈమెయిల్‌కు పంపబడుతుంది. AI మార్కెట్ సూచన కోసం నెక్స్ట్ అని చెప్పండి.';
        else if (lang === 'hi') text = 'गेट पास टोकन आपके ईमेल पर भेजा जाएगा। एआई सुझाव के लिए नेक्स्ट बोलें।';
        else text = 'Your digital gate pass will be sent to your email. Say Next to get AI Mandi match.';
        break;

      case 5:
        if (lang === 'te') text = `సిఫార్సు చేసిన మార్కెట్ ${selectedCenterRef.current?.name || 'APMC సెంటర్'}. స్లాట్ ఎంపికకు నెక్స్ట్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `अनुशंसित केंद्र ${selectedCenterRef.current?.name || 'एपीएमसी केंद्र'} है। स्लॉट चुनने के लिए नेक्स्ट बोलें।`;
        else text = `Selected center is ${selectedCenterRef.current?.name || 'APMC Center'}. Say Next to choose time slot.`;
        break;

      case 6:
        if (lang === 'te') text = `తేదీ ${selectedDateRef.current}, స్లాట్ ${selectedSlotRef.current}. రివ్యూ కోసం నెక్స్ట్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `तारीख ${selectedDateRef.current}, स्लॉट ${selectedSlotRef.current} है। आगे बढ़ने के लिए नेक्स्ट बोलें।`;
        else text = `Date is ${selectedDateRef.current}, slot is ${selectedSlotRef.current}. Say Next to review.`;
        break;

      case 7:
        if (lang === 'te') text = `బుకింగ్ వివరాలు: ${selectedCropRef.current?.name}, ${quantityRef.current} క్వింటాళ్లు. టోకెన్ కోసం కన్ఫర్మ్ బుకింగ్ అని చెప్పండి.`;
        else if (lang === 'hi') text = `कृपया बुकिंग जांचें। ${selectedCropRef.current?.name}, ${quantityRef.current} क्विंटल। कन्फर्म बुकिंग बोलें।`;
        else text = `Review your booking: ${selectedCropRef.current?.name}, ${quantityRef.current} Quintals. Say Confirm Booking to finish.`;
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
  // 🧠 COMPREHENSIVE MULTILINGUAL VOICE COMMAND INTERPRETER
  // =========================================================================
  const handleVoiceCommand = useCallback((rawTranscript: string) => {
    const text = rawTranscript.toLowerCase().trim();
    if (!text) return;

    setVoiceTranscript(rawTranscript);

    // 1. Universal Navigation Commands
    if (
      text.includes('next') || text.includes('continue') || text.includes('proceed') || text.includes('forward') ||
      text.includes('తర్వాత') || text.includes('ముందుకు') || text.includes('సరే') || text.includes('తరవాత') ||
      text.includes('आगे') || text.includes('ठीक है') || text.includes('बढ़ो') || text.includes('अगला') ||
      text.includes('அடுத்து') || text.includes('ಮುಂದೆ') || text.includes('पुढे') || text.includes('ਅੱਗੇ') || text.includes('পরবর্তী')
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
      text.includes('వెనుకకు') || text.includes('పీచే') || text.includes('వెనక్కి') ||
      text.includes('पीछे') || text.includes('वापस') ||
      text.includes('பின்னால்') || text.includes('ಹಿಂದೆ') || text.includes('मागे')
    ) {
      setStep(prev => Math.max(1, prev - 1));
      return;
    }

    if (
      text.includes('repeat') || text.includes('again') ||
      text.includes('మళ్లీ చెప్పు') || text.includes('మరోసారి') ||
      text.includes('फिर से') || text.includes('दोबारा') || text.includes('திரும்ப சொல்')
    ) {
      triggerStepVoicePrompt(stepRef.current);
      return;
    }

    const currentStep = stepRef.current;

    // --- STEP 1: CROP RECOGNITION ---
    if (currentStep === 1) {
      const cropList = cropsRef.current;
      let matchedCrop: Crop | null = null;

      if (
        text.includes('paddy') || text.includes('rice') || text.includes('vari') || text.includes('dhan') || text.includes('chawal') ||
        text.includes('వరి') || text.includes('వడ్లు') || text.includes('బియ్యం') || text.includes('धान') || text.includes('चावल') ||
        text.includes('நெல்') || text.includes('அரிசி') || text.includes('ಭತ್ತ') || text.includes('भात') || text.includes('ਝੋਨਾ') || text.includes('ধান')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-paddy' || c.name.toLowerCase().includes('paddy')) || cropList[0];
      } else if (
        text.includes('cotton') || text.includes('patti') || text.includes('kapas') || text.includes('ru') ||
        text.includes('పత్తి') || text.includes('కపాస్') || text.includes('कपास') || text.includes('रुई') ||
        text.includes('பருத்தி') || text.includes('ಹತ್ತಿ') || text.includes('कापूस') || text.includes('ਕਪਾਹ') || text.includes('তুলা')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-cotton' || c.name.toLowerCase().includes('cotton')) || null;
      } else if (
        text.includes('wheat') || text.includes('godhuma') || text.includes('gehu') || text.includes('godhi') ||
        text.includes('గోధుమ') || text.includes('గోధుమలు') || text.includes('गेहूं') || text.includes('कणक') ||
        text.includes('கோதுமை') || text.includes('ಗೋಧಿ') || text.includes('गहू') || text.includes('ਕਣਕ') || text.includes('গম')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-wheat' || c.name.toLowerCase().includes('wheat')) || null;
      } else if (
        text.includes('maize') || text.includes('corn') || text.includes('mokkajonna') || text.includes('makka') || text.includes('bhutta') ||
        text.includes('మొక్కజొన్న') || text.includes('జొన్న') || text.includes('मक्का') || text.includes('भुट्टा') ||
        text.includes('சோளம்') || text.includes('ಮೆಕ್ಕೆಜೋಳ') || text.includes('मका') || text.includes('ਮੱਕੀ') || text.includes('ভুট্টা')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-maize' || c.name.toLowerCase().includes('maize')) || null;
      } else if (
        text.includes('chilli') || text.includes('mirchi') || text.includes('mirch') || text.includes('milagai') ||
        text.includes('మిర్చి') || text.includes('మిరపకాయ') || text.includes('మిరప') || text.includes('मिर्च') || text.includes('मिर्ची') ||
        text.includes('மிளகாய்') || text.includes('ಮೆಣಸಿನಕಾಯಿ') || text.includes('मिरची') || text.includes('ਮਿਰਚ') || text.includes('লঙ্কা')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-chilli' || c.name.toLowerCase().includes('chilli')) || null;
      } else if (
        text.includes('turmeric') || text.includes('pasupu') || text.includes('haldi') || text.includes('manjal') ||
        text.includes('పసుపు') || text.includes('हल्दी') || text.includes('மஞ்சள்') || text.includes('ಅರಿಶಿನ') || text.includes('हळद')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-turmeric' || c.name.toLowerCase().includes('turmeric')) || null;
      } else if (
        text.includes('groundnut') || text.includes('peanut') || text.includes('verusenaga') || text.includes('pallilu') ||
        text.includes('వేరుశనగ') || text.includes('పల్లీలు') || text.includes('मूंगफली') || text.includes('வேர்க்கடலை')
      ) {
        matchedCrop = cropList.find(c => c.id === 'crop-groundnut' || c.name.toLowerCase().includes('groundnut')) || null;
      } else if (text.includes('soybean') || text.includes('సోయా') || text.includes('सोयाबीन')) {
        matchedCrop = cropList.find(c => c.id === 'crop-soybean' || c.name.toLowerCase().includes('soybean')) || null;
      } else if (text.includes('onion') || text.includes('ullipaya') || text.includes('pyaz') || text.includes('ఉల్లిపాయ') || text.includes('प्याज')) {
        matchedCrop = cropList.find(c => c.id === 'crop-onion' || c.name.toLowerCase().includes('onion')) || null;
      } else if (text.includes('tomato') || text.includes('tamata') || text.includes('tamatar') || text.includes('టమోటా') || text.includes('टमाटर')) {
        matchedCrop = cropList.find(c => c.id === 'crop-tomato' || c.name.toLowerCase().includes('tomato')) || null;
      } else if (text.includes('sugarcane') || text.includes('cheraku') || text.includes('ganna') || text.includes('చెరకు') || text.includes('गन्ना')) {
        matchedCrop = cropList.find(c => c.id === 'crop-sugarcane' || c.name.toLowerCase().includes('sugarcane')) || null;
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
      } else if (text.includes('five hundred') || text.includes('ఐదు వందలు') || text.includes('पांच सौ')) {
        parsedNum = 500;
      } else if (text.includes('two hundred') || text.includes('రెండు వందలు') || text.includes('दो सौ') || text.includes('இருநூறு')) {
        parsedNum = 200;
      } else if (text.includes('hundred') || text.includes('one hundred') || text.includes('వంద') || text.includes('నూరు') || text.includes('सौ') || text.includes('நூறு') || text.includes('ನೂರು')) {
        parsedNum = 100;
      } else if (text.includes('eighty') || text.includes('ఎనభై') || text.includes('अस्सी') || text.includes('எண்பது')) {
        parsedNum = 80;
      } else if (text.includes('seventy') || text.includes('డెబ్బై') || text.includes('सत्तर')) {
        parsedNum = 70;
      } else if (text.includes('sixty') || text.includes('అరవై') || text.includes('साठ') || text.includes('அறுபது')) {
        parsedNum = 60;
      } else if (text.includes('fifty') || text.includes('యాభై') || text.includes('పచాస్') || text.includes('पचास') || text.includes('ஐம்பது') || text.includes('ಐವತ್ತು')) {
        parsedNum = 50;
      } else if (text.includes('forty') || text.includes('నలభై') || text.includes('चालीस') || text.includes('நாற்பது')) {
        parsedNum = 40;
      } else if (text.includes('thirty') || text.includes('ముప్పై') || text.includes('तीस')) {
        parsedNum = 30;
      } else if (text.includes('twenty five') || text.includes('ఇరవై ఐదు') || text.includes('पच्चीस')) {
        parsedNum = 25;
      } else if (text.includes('twenty') || text.includes('ఇరవై') || text.includes('बीस') || text.includes('இருபது') || text.includes('ಇಪ್ಪತ್ತು')) {
        parsedNum = 20;
      } else if (text.includes('fifteen') || text.includes('పదిహేను') || text.includes('पंद्रह')) {
        parsedNum = 15;
      } else if (text.includes('ten') || text.includes('పది') || text.includes('दस') || text.includes('பத்து') || text.includes('ಹತ್ತು')) {
        parsedNum = 10;
      }

      if (parsedNum && parsedNum > 0 && parsedNum <= 1000) {
        setQuantity(parsedNum);
        setVoiceFeedback(`Set quantity to ${parsedNum} Quintals`);
        speakText(`${parsedNum} Quintals confirmed. Moving to location step.`, () => {
          setStep(3);
        });
      }
      return;
    }

    // --- STEP 5: APMC CENTER SELECTION ---
    if (currentStep === 5) {
      if (text.includes('first') || text.includes('warangal') || text.includes('center') || text.includes('select') || text.includes('ఎంచుకో') || text.includes('पहला')) {
        if (centersRef.current.length > 0) {
          setSelectedCenter(centersRef.current[0]);
          speakText(`Selected ${centersRef.current[0].name}. Moving to date and slot selection.`, () => {
            setStep(6);
          });
        }
      }
      return;
    }

    // --- STEP 6: TIME SLOT SELECTION ---
    if (currentStep === 6) {
      if (text.includes('morning') || text.includes('ఉదయం') || text.includes('सुबह')) {
        setSlotTimeFilter('morning');
        speakText('Showing morning time slots.');
      } else if (text.includes('afternoon') || text.includes('మధ్యాహ్నం') || text.includes('दोपहर')) {
        setSlotTimeFilter('afternoon');
        speakText('Showing afternoon time slots.');
      } else if (text.includes('11') || text.includes('10') || text.includes('slot') || text.includes('select') || text.includes('స్లాట్')) {
        speakText(`Selected slot ${selectedSlotRef.current}. Moving to final review.`, () => {
          setStep(7);
        });
      }
      return;
    }

    // --- STEP 7: CONFIRM BOOKING ---
    if (currentStep === 7) {
      if (
        text.includes('confirm') || text.includes('book') || text.includes('submit') || text.includes('yes') ||
        text.includes('ఖరారు') || text.includes('బుక్ చేయి') || text.includes('కన్ఫర్మ్') ||
        text.includes('कन्फर्म') || text.includes('पक्का') || text.includes('बुक करो') || text.includes('உறுதி') || text.includes('ದೃಢೀಕರಿಸಿ')
      ) {
        handleConfirmBooking();
      }
      return;
    }
  }, [speakText, triggerStepVoicePrompt]);

  // =========================================================================
  // 🎙️ SPEECH RECOGNITION (STT) ENGINE WITH AUTO-RECOVERY
  // =========================================================================
  const startListening = useCallback(() => {
    if (!isVoiceActiveRef.current || isSpeakingRef.current) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('Speech Recognition is not supported on this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
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
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicPermission('denied');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Clean auto-restart on mobile pauses
        if (isVoiceActiveRef.current && !isSpeakingRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            try {
              if (isVoiceActiveRef.current && !isSpeakingRef.current) {
                recognition.start();
              }
            } catch (err) {
              // Ignore restart collision
            }
          }, 300);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not start speech recognition', e);
    }
  }, [handleVoiceCommand]);

  // Request explicit microphone permission
  const requestMicrophonePermission = async () => {
    try {
      setMicPermission('requesting');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
        stream.getTracks().forEach(track => track.stop());
        setIsVoiceActive(true);
        startListening();
        speakText(
          languageRef.current === 'te'
            ? 'మైక్రోఫోన్ ప్రారంభించబడింది. వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది.'
            : languageRef.current === 'hi'
            ? 'माइक शुरू हो गया है। वాయిస్ అసిస్టెంట్ तैयार है।'
            : 'Microphone enabled. Kisan Voice Assistant is ready.'
        );
      } else {
        setMicPermission('granted');
        setIsVoiceActive(true);
        startListening();
      }
    } catch (err: any) {
      console.warn('Microphone permission denied:', err);
      setMicPermission('denied');
    }
  };

  useEffect(() => {
    if (isVoiceActive) {
      startListening();
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      stopSpeech();
      setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
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

      speakText('Congratulations! Your Mandi slot is confirmed and your QR Token Pass has been generated.');
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

      {/* Top Header - Ultra Clean Phone Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => {
            stopSpeech();
            onBack();
          }}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Voice Assistant Toggle - Compact Pill */}
          <button
            onClick={() => {
              const nextState = !isVoiceActive;
              setIsVoiceActive(nextState);
              if (!nextState) stopSpeech();
              else requestMicrophonePermission();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              isVoiceActive
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 ring-2 ring-emerald-400/40'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isVoiceActive ? (
              <>
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>Voice Active</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Muted</span>
              </>
            )}
          </button>

          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            {step}/7
          </span>
        </div>
      </div>

      {/* 🔐 MICROPHONE PERMISSION BANNER (IF DENIED) */}
      {micPermission === 'denied' && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Enable microphone in browser to speak commands.</span>
          </div>

          <button
            onClick={requestMicrophonePermission}
            className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex-shrink-0 active:scale-95 cursor-pointer"
          >
            Enable Mic
          </button>
        </div>
      )}

      {/* 🎙️ COMPACT VOICE STATUS BAR (SLEEK HUD) */}
      {isVoiceActive && (
        <div className="p-3 rounded-2xl bg-slate-950 text-white border border-emerald-500/30 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={requestMicrophonePermission}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white transition-all flex-shrink-0 ${
                isSpeaking
                  ? 'bg-teal-500 ring-2 ring-teal-300 animate-pulse'
                  : isListening
                  ? 'bg-emerald-500 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="min-w-0">
              <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <span>{isSpeaking ? '🗣️ Speaking...' : isListening ? '🎙️ Listening (Speak now)...' : 'Mic Ready'}</span>
                <span className="text-[9px] text-slate-400 font-normal">({getBCP47Tag(language)})</span>
              </div>
              <p className="text-xs text-slate-200 truncate font-medium">
                {voiceTranscript ? `"${voiceTranscript}"` : voiceFeedback}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => triggerStepVoicePrompt(step)}
              title="Repeat instructions"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={stopSpeech}
              title="Mute audio"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-xl font-black font-outfit text-slate-900 flex items-center gap-1.5">
                <span>🌾</span>
                <span>Select Crop for Mandi Procurement</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Speak or choose your crop below.
              </p>
            </div>
          </div>

          {/* Quick Voice Suggestion Chips for Step 1 */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-slate-400">💡 Speak:</span>
            {['Paddy (వరి)', 'Cotton (పత్తి)', 'Wheat (గోధుమలు)', 'Maize (మొక్కజొన్న)', 'Chilli (మిర్చి)'].map((cHint) => (
              <button
                key={cHint}
                type="button"
                onClick={() => handleVoiceCommand(cHint.split(' ')[0])}
                className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Mic className="w-2.5 h-2.5 text-emerald-600" />
                <span>{cHint}</span>
              </button>
            ))}
          </div>

          {/* Clean Search Bar & Category Filter Pills for Mobile */}
          <div className="space-y-2 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder="Search crop name (e.g. Paddy, Cotton, పత్తి, మిర్చి)..."
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto p-1">
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
                      speakText(`Selected ${c.name}. Moving to quantity step.`, () => {
                        setStep(2);
                      });
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

          {/* Quick Voice Suggestion Chips for Step 2 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400">💡 Speak:</span>
            {['25 Quintals (ఇరవై ఐదు)', '50 Quintals (యాభై)', '100 Quintals (వంద)'].map((qHint) => (
              <button
                key={qHint}
                type="button"
                onClick={() => handleVoiceCommand(qHint.split(' ')[0])}
                className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Mic className="w-2.5 h-2.5 text-emerald-600" />
                <span>{qHint}</span>
              </button>
            ))}
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
                speakText('Location auto-detected to Warangal, Telangana.');
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
                    speakText(`Selected ${c.name}. Moving to date and slot selection.`, () => {
                      setStep(6);
                    });
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
                      speakText(`Selected slot ${slotInfo.time}. Ready to review.`);
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
              Say <strong>"Confirm Booking"</strong> or tap the button below.
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
            else {
              stopSpeech();
              onBack();
            }
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
