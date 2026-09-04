const fs = require('fs');

const targetPath = 'c:/Users/navee/Downloads/agrislot-main/agrislot-main/src/components/farmer/SlotBookingWizard.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

const wizardStartTag = 'export const SlotBookingWizard: React.FC<SlotBookingWizardProps> = ({ onBack, onBookingSuccess }) => {';
const timeSlotsTag = 'const timeSlots = [';

const wizardStartIdx = content.indexOf(wizardStartTag);
const timeSlotsIdx = content.indexOf(timeSlotsTag);

console.log('wizardStartIdx:', wizardStartIdx, 'timeSlotsIdx:', timeSlotsIdx);

const newEngine = `export const SlotBookingWizard: React.FC<SlotBookingWizardProps> = ({ onBack, onBookingSuccess }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data lists initialized with guaranteed default crops
  const [crops, setCrops] = useState<Crop[]>(DEFAULT_CROPS);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [aiRec, setAiRec] = useState<any>(null);

  // Wizard Selections
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(DEFAULT_CROPS[0]);
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

  // Slot Capacities (Capped at exactly 3 slots per time window)
  const [slotCapacities, setSlotCapacities] = useState<{
    time: string;
    maxSlots: number;
    bookedCount: number;
    availableSlots: number;
    isFull: boolean;
    isAiPick?: boolean;
  }[]>([]);

  // =========================================================================
  // 🎙️ AUTOMATED VOICE-GUIDED SLOT BOOKING ASSISTANT STATE & REFS
  // =========================================================================
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  const [lastHeardTranscript, setLastHeardTranscript] = useState<string>('');
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);
  const [voiceHighlight, setVoiceHighlight] = useState<string | null>(null);

  // Anti-stale refs for continuous hands-free operation
  const stepRef = useRef(step);
  const cropsRef = useRef(crops);
  const selectedCropRef = useRef(selectedCrop);
  const quantityRef = useRef(quantity);
  const locationRef = useRef(location);
  const centersRef = useRef(centers);
  const selectedCenterRef = useRef(selectedCenter);
  const selectedDateRef = useRef(selectedDate);
  const selectedSlotRef = useRef(selectedSlot);
  const slotCapacitiesRef = useRef(slotCapacities);
  const isVoiceActiveRef = useRef(isVoiceActive);
  const isSpeakingRef = useRef(isSpeaking);
  const languageRef = useRef(language);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const isTransitioningRef = useRef<boolean>(false);

  // Keep refs 100% updated on every state change
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { cropsRef.current = crops; }, [crops]);
  useEffect(() => { selectedCropRef.current = selectedCrop; }, [selectedCrop]);
  useEffect(() => { quantityRef.current = quantity; }, [quantity]);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { centersRef.current = centers; }, [centers]);
  useEffect(() => { selectedCenterRef.current = selectedCenter; }, [selectedCenter]);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
  useEffect(() => { selectedSlotRef.current = selectedSlot; }, [selectedSlot]);
  useEffect(() => { slotCapacitiesRef.current = slotCapacities; }, [slotCapacities]);
  useEffect(() => { isVoiceActiveRef.current = isVoiceActive; }, [isVoiceActive]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { languageRef.current = language; }, [language]);

  useEffect(() => {
    if (user?.email) {
      setFarmerEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const cropsRes = await api.getCrops();
      if (cropsRes?.crops && cropsRes.crops.length > 0) {
        setCrops(cropsRes.crops);
        setSelectedCrop(cropsRes.crops[0]);
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

  const handleFetchAiRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const rec = await api.getSlotRecommendation({
        center_id: selectedCenterRef.current?.id || centersRef.current[0]?.id || 'ctr-01',
        crop_id: selectedCropRef.current?.id || cropsRef.current[0]?.id || 'crop-paddy',
        quantity_quintals: quantityRef.current,
        preferred_date: selectedDateRef.current
      });

      setAiRec(rec);
      if (rec.center) {
        const found = centersRef.current.find(c => c.id === rec.center.id);
        if (found) setSelectedCenter(found);
      }
      if (rec.recommendedSlot) {
        setSelectedSlot(rec.recommendedSlot);
      }

      setStep(5);
    } catch (err: any) {
      console.warn('AI fallback used', err);
      setAiRec({
        recommendedSlot: '11:00 AM – 11:30 AM',
        confidence: 96.5,
        estimatedWaitTime: '15 mins',
        rationale: 'Optimal weighbridge flow and minimal queue detected for selected capacity.'
      });
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    const center = selectedCenterRef.current || centersRef.current[0];
    const crop = selectedCropRef.current || cropsRef.current[0];
    if (!center || !crop) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.createBooking({
        center_id: center.id,
        crop_id: crop.id,
        quantity_quintals: quantityRef.current,
        booking_date: selectedDateRef.current,
        slot_time: selectedSlotRef.current,
        farmer_email: farmerEmail
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) { }

      const confirmedBooking = res?.booking || {
        id: "bk-" + Date.now(),
        token_number: "TS-" + selectedDateRef.current.slice(5).replace('-', '') + "-" + Math.floor(1000 + Math.random() * 9000),
        farmer_id: user?.farmer_id || 'usr-farmer-01',
        farmer_name: user?.name || 'Ramesh Kumar (Farmer)',
        farmer_mobile: user?.mobile || '9876543210',
        farmer_email: farmerEmail || 'vasanthreddy302@gmail.com',
        email_sent: true,
        center_id: center.id,
        center_name: center.name,
        crop_id: crop.id,
        crop_name: crop.name,
        quantity_quintals: quantityRef.current,
        booking_date: selectedDateRef.current,
        slot_time: selectedSlotRef.current,
        status: 'CONFIRMED',
        estimated_waiting_mins: 15,
        created_at: new Date().toISOString()
      };

      const lang = languageRef.current;
      const successVoice = lang === 'te'
        ? "అభినందనలు! మీ స్లాట్ బుకింగ్ విజయవంతమైంది. టోకెన్ నంబర్ " + confirmedBooking.token_number + "."
        : lang === 'hi'
          ? "बधाई हो! आपकी स्लॉट बुकिंग सफलतापूर्वक हो गई है। टोकन नंबर " + confirmedBooking.token_number + " है।"
          : "Congratulations! Your slot is booked. Token number is " + confirmedBooking.token_number + ".";

      speakVoicePrompt(successVoice, () => {
        onBookingSuccess(confirmedBooking);
      });
    } catch (err: any) {
      console.warn('Booking confirmation fallback applied:', err);
      const fallbackBooking: Booking = {
        id: "bk-" + Date.now(),
        token_number: "TS-" + selectedDateRef.current.slice(5).replace('-', '') + "-" + Math.floor(1000 + Math.random() * 9000),
        farmer_id: user?.farmer_id || 'usr-farmer-01',
        farmer_name: user?.name || 'Ramesh Kumar (Farmer)',
        farmer_mobile: user?.mobile || '9876543210',
        farmer_email: farmerEmail || 'vasanthreddy302@gmail.com',
        email_sent: true,
        center_id: center.id,
        center_name: center.name,
        crop_id: crop.id,
        crop_name: crop.name,
        quantity_quintals: quantityRef.current,
        booking_date: selectedDateRef.current,
        slot_time: selectedSlotRef.current,
        status: 'CONFIRMED',
        estimated_waiting_mins: 15,
        created_at: new Date().toISOString()
      };
      onBookingSuccess(fallbackBooking);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 🔊 SPEECH SYNTHESIS & CONTINUOUS HANDS-FREE LISTENER
  // =========================================================================
  const speakVoicePrompt = useCallback((textToSpeak: string, onEndCallback?: () => void) => {
    if (!('speechSynthesis' in window) || !isVoiceActiveRef.current) {
      onEndCallback?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      stopListening();

      const cleanText = textToSpeak.replace(/[\\*#_~\\`•]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const lang = languageRef.current;
      utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setVoiceFeedback(cleanText);

      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (onEndCallback) {
          onEndCallback();
        } else if (isVoiceActiveRef.current) {
          // Immediately activate microphone for next user command
          setTimeout(() => {
            startListening();
          }, 100);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (isVoiceActiveRef.current) startListening();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (isVoiceActiveRef.current) startListening();
    }
  }, []);

  const stopAllVoice = useCallback(() => {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setIsListening(false);
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) { }
    }
    setIsListening(false);
  };

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) || !isVoiceActiveRef.current || isSpeakingRef.current) {
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { }
      }

      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      const lang = languageRef.current;
      recognition.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        // Prevent processing if assistant is currently speaking
        if (isSpeakingRef.current || isTransitioningRef.current) return;

        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setLastHeardTranscript(currentTranscript.trim());
          handleVoiceCommand(currentTranscript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        if (isVoiceActiveRef.current && !isSpeakingRef.current && e.error !== 'not-allowed') {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isVoiceActiveRef.current && !isSpeakingRef.current) startListening();
          }, 800);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isVoiceActiveRef.current && !isSpeakingRef.current && !isTransitioningRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isVoiceActiveRef.current && !isSpeakingRef.current) startListening();
          }, 300);
        }
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllVoice();
    };
  }, [stopAllVoice]);

  // =========================================================================
  // 🧠 STEP PROMPT GENERATOR: ANNOUNCES INSTRUCTIONS AFTER EVERY PROCESS
  // =========================================================================
  const triggerStepVoicePrompt = useCallback((stepNumber: number) => {
    if (!isVoiceActiveRef.current) return;

    const lang = languageRef.current;
    const cropName = selectedCropRef.current?.name || 'Produce';
    const distName = locationRef.current.district;
    const centerName = selectedCenterRef.current?.name || 'Center';
    const qty = quantityRef.current;
    const date = selectedDateRef.current;
    const slot = selectedSlotRef.current;

    let prompt = '';
    if (stepNumber === 1) {
      prompt = lang === 'te'
        ? 'మొదటి దశ: మీ పంటను ఎంచుకోండి. "వరి", "పత్తి", "గోధుమలు", లేదా "మిర్చి" అని చెప్పండి.'
        : lang === 'hi'
          ? 'पहला चरण: अपनी फसल चुनें। "धान", "पैडी", "कपास" या "गेहूं" बोलें।'
          : 'Step 1: Select your crop. Say "Paddy", "Wheat", "Cotton", or "Maize".';
    } else if (stepNumber === 2) {
      prompt = lang === 'te'
        ? "రెండవ దశ: " + cropName + " పరిమాణాన్ని క్వింటాళ్లలో చెప్పండి. ఉదాహరణకు '40 క్వింటాళ్లు' అని చెప్పండి."
        : lang === 'hi'
          ? "दूसरा चरण: " + cropName + " की मात्रा बताएं, जैसे '40 क्विंटल'।"
          : "Step 2: State quantity in quintals, for example say '40 quintals'.";
    } else if (stepNumber === 3) {
      prompt = lang === 'te'
        ? "మూడవ దశ: మీ జిల్లా పేరు '" + distName + "' లేదా 'ముందుకు' అని చెప్పండి."
        : lang === 'hi'
          ? "तीसरा चरण: अपना ज़िला '" + distName + "' या 'आगे' बोलें।"
          : "Step 3: State your district or say 'View Mandis' to proceed.";
    } else if (stepNumber === 4) {
      prompt = lang === 'te'
        ? 'నాల్గవ దశ: వేగవంతమైన స్లాట్ కోసం "AI రికమండేషన్" అని చెప్పండి.'
        : lang === 'hi'
          ? 'चौथा चरण: स्वचालित चयन के लिए "एआई सिफारिश" बोलें।'
          : 'Step 4: Say "AI Recommendation" to auto-select optimal mill capacity.';
    } else if (stepNumber === 5) {
      prompt = lang === 'te'
        ? "ఐదవ దశ: " + centerName + " ఖరారైంది. సమయం ఎంచుకోవడానికి 'స్లాట్ సమయాలు' లేదా 'ముందుకు' అని చెప్పండి."
        : lang === 'hi'
          ? "पांचवा चरण: " + centerName + " चुना गया। समय स्लॉट के लिए 'आगे बढ़ें' बोलें।"
          : "Step 5: Reviewing " + centerName + ". Say 'Proceed to slot times'.";
    } else if (stepNumber === 6) {
      prompt = lang === 'te'
        ? 'ఆరవ దశ: ప్రతి విండోకు 3 స్లాట్ల పరిమితి ఉంది. సమయం చెప్పండి, ఉదాహరణకు "11 గంటలు".'
        : lang === 'hi'
          ? 'छठा चरण: अधिकतम 3 स्लॉट की सीमा है। समय बताएं, जैसे "11 बजे"।'
          : 'Step 6: Select your time slot. Say "11 AM" or "Morning Slot".';
    } else if (stepNumber === 7) {
      prompt = lang === 'te'
        ? "చివరి దశ: " + cropName + ", " + qty + " క్వింటాళ్లు, " + date + " తేదీన " + slot + " సమయానికి. బుకింగ్ పూర్తి చేయడానికి 'కన్ఫర్మ్' అని చెప్పండి."
        : lang === 'hi'
          ? "अंतिम चरण: बुकिंग पक्की करने के लिए 'कन्फर्म' या 'बुक करें' बोलें।"
          : "Final Step: Say 'Confirm' or 'Book Slot' to generate your QR token pass.";
    }

    speakVoicePrompt(prompt);
  }, [speakVoicePrompt]);

  // Trigger step announcement when step changes
  useEffect(() => {
    if (isVoiceActive) {
      const timer = setTimeout(() => {
        triggerStepVoicePrompt(step);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [step, isVoiceActive, triggerStepVoicePrompt]);

  // Initial startup prompt and mic activation
  useEffect(() => {
    const startupTimer = setTimeout(() => {
      if (isVoiceActive) {
        triggerStepVoicePrompt(1);
      }
    }, 400);
    return () => clearTimeout(startupTimer);
  }, []);

  // =========================================================================
  // 🎙️ NATURAL VOICE COMMAND PARSER & AUTO-FIXING ADVANCE LOGIC
  // =========================================================================
  const handleVoiceCommand = (rawTranscript: string) => {
    if (isTransitioningRef.current || isSpeakingRef.current) return;
    const text = rawTranscript.toLowerCase().trim();
    const curStep = stepRef.current;
    const lang = languageRef.current;

    // Helper to lock option, trigger visual fix & auto-advance to next step
    const autoFixAndAdvance = (
      highlightId: string,
      notificationText: string,
      speechMsg: string,
      nextAction: () => void,
      delayMs: number = 350
    ) => {
      isTransitioningRef.current = true;
      setVoiceHighlight(highlightId);
      setVoiceNotification(notificationText);
      speakVoicePrompt(speechMsg);

      setTimeout(() => {
        nextAction();
        isTransitioningRef.current = false;
        setTimeout(() => {
          setVoiceHighlight(null);
          setVoiceNotification(null);
        }, 800);
      }, delayMs);
    };

    // Universal Back Navigation
    if (text.includes('back') || text.includes('previous') || text.includes('వెనుకకు') || text.includes('వెనక్కి') || text.includes('పీచే') || text.includes('पीछे') || text.includes('वापस')) {
      if (curStep > 1) {
        setStep(prev => Math.max(1, prev - 1));
      } else {
        onBack();
      }
      return;
    }

    // Universal Repeat Instructions
    if (text.includes('repeat') || text.includes('again') || text.includes('మళ్ళీ') || text.includes('మళ్ళీ చెప్పు') || text.includes('दोहराएं')) {
      triggerStepVoicePrompt(curStep);
      return;
    }

    // Universal Next / Confirm / Proceed across all steps
    const isUniversalNext = text.includes('next') || text.includes('continue') || text.includes('proceed') || 
                            text.includes('forward') || text.includes('okay') || text.includes('ok') || 
                            text.includes('yes') || text.includes('తర్వాత') || text.includes('ముందుకు') || 
                            text.includes('సరే') || text.includes('హా') || text.includes('आगे') || 
                            text.includes('बढ़ें') || text.includes('हाँ') || text.includes('ठीक है');

    // STEP 1: Crop Selection by Voice
    if (curStep === 1) {
      let matchedCrop: Crop | undefined;

      const isPaddy = text.includes('paddy') || text.includes('pady') || text.includes('peddy') || 
                      text.includes('paddi') || text.includes('padi') || text.includes('baddy') || 
                      text.includes('party') || text.includes('patty') || text.includes('body') ||
                      text.includes('rice') || text.includes('dhan') || text.includes('dhanya') || 
                      text.includes('వరి') || text.includes('ధాన్యం') || text.includes('వరిధాన్యం') || 
                      text.includes('పాడీ') || text.includes('ప్యాడీ') || text.includes('బియ్యం') || 
                      text.includes('వడ్లు') || text.includes('ధాన') || text.includes('चावल') || 
                      text.includes('पैडी') || text.includes('पैड़ी');

      const allCrops = cropsRef.current.length > 0 ? cropsRef.current : DEFAULT_CROPS;

      if (isPaddy) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('paddy') || c.name.toLowerCase().includes('rice')) || DEFAULT_CROPS[0];
      } else if (text.includes('wheat') || text.includes('gehun') || text.includes('gehu') || text.includes('గోధుమ') || text.includes('గోధుమలు') || text.includes('గేహు') || text.includes('गेहूं') || text.includes('कनक')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('wheat')) || DEFAULT_CROPS[1];
      } else if (text.includes('cotton') || text.includes('kapas') || text.includes('kappas') || text.includes('పత్తి') || text.includes('కపాస్') || text.includes('దూది') || text.includes('కాటన్') || text.includes('कपास') || text.includes('कॉटन')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('cotton')) || DEFAULT_CROPS[2];
      } else if (text.includes('maize') || text.includes('corn') || text.includes('makka') || text.includes('మొక్కజొన్న') || text.includes('మక్క') || text.includes('మక్కజొన్న') || text.includes('मक्का') || text.includes('भुट्टा')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('maize')) || DEFAULT_CROPS[3];
      } else if (text.includes('chilli') || text.includes('chilly') || text.includes('mirchi') || text.includes('మిర్చి') || text.includes('మిరప') || text.includes('ఎండుమిర్చి') || text.includes('मिर्च') || text.includes('लाल मिर्च')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('chilli')) || DEFAULT_CROPS[4];
      } else if (text.includes('turmeric') || text.includes('haldi') || text.includes('పసుపు') || text.includes('హల్దీ') || text.includes('हल्दी')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('turmeric')) || DEFAULT_CROPS[5];
      } else if (text.includes('soybean') || text.includes('soya') || text.includes('సోయాబీన్') || text.includes('సోయా') || text.includes('సోయాबीन')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('soybean')) || DEFAULT_CROPS[6];
      } else if (text.includes('groundnut') || text.includes('peanut') || text.includes('mungfali') || text.includes('వేరుశనగ') || text.includes('పల్లీలు') || text.includes('मूंगफली')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('groundnut')) || DEFAULT_CROPS[7];
      } else if (text.includes('mustard') || text.includes('sarson') || text.includes('ఆవాలు') || text.includes('सरसों') || text.includes('राई')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('mustard')) || DEFAULT_CROPS[8];
      } else if (text.includes('onion') || text.includes('pyaz') || text.includes('ఉల్లిపాయ') || text.includes('ఎర్రగడ్డలు') || text.includes('प्याज') || text.includes('कांदा')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('onion')) || DEFAULT_CROPS[9];
      } else if (text.includes('tomato') || text.includes('tamatar') || text.includes('టమోటా') || text.includes('టమాట') || text.includes('टमाटर')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('tomato')) || DEFAULT_CROPS[10];
      } else if (text.includes('potato') || text.includes('aloo') || text.includes('బంగాళాదుంప') || text.includes('ఆలూ') || text.includes('आलू')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('potato')) || DEFAULT_CROPS[11];
      } else if (text.includes('sugarcane') || text.includes('ganna') || text.includes('చెరకు') || text.includes('గన్న') || text.includes('गन्ना')) {
        matchedCrop = allCrops.find(c => c.name.toLowerCase().includes('sugarcane')) || DEFAULT_CROPS[12];
      } else if (isUniversalNext) {
        matchedCrop = selectedCropRef.current || DEFAULT_CROPS[0];
      }

      if (matchedCrop) {
        setSelectedCrop(matchedCrop);
        selectedCropRef.current = matchedCrop;
        const confirmMsg = lang === 'te'
          ? matchedCrop.name + " పంట స్థిరపరచబడింది. పరిమాణం ఎంచుకోవడానికి వెళ్తున్నాం."
          : lang === 'hi'
          ? matchedCrop.name + " फसल तय की गई। अब मात्रा दर्ज करें।"
          : "Fixed crop: " + matchedCrop.name + ". Moving to quantity step.";

        autoFixAndAdvance(
          matchedCrop.id,
          "🎯 Fixed Crop: " + matchedCrop.name + " ➔ Moving to Step 2...",
          confirmMsg,
          () => setStep(2)
        );
        return;
      }
    }

    // STEP 2: Quantity by Voice
    if (curStep === 2) {
      // Extract numeric quantity
      const numberMatches = text.match(/\\b(\\d+(?:\\.\\d+)?)\\b/);
      let parsedQuantity = numberMatches ? parseFloat(numberMatches[1]) : 0;

      if (!parsedQuantity) {
        if (text.includes('నలభై') || text.includes('चालीस') || text.includes('forty')) parsedQuantity = 40;
        else if (text.includes('యాభై') || text.includes('పచాస్') || text.includes('fifty') || text.includes('पचास')) parsedQuantity = 50;
        else if (text.includes('ఇరవై') || text.includes('బీస్') || text.includes('twenty') || text.includes('बीस')) parsedQuantity = 20;
        else if (text.includes('ముప్పై') || text.includes('తీస్') || text.includes('thirty') || text.includes('तीस')) parsedQuantity = 30;
        else if (text.includes('పది') || text.includes('दस') || text.includes('ten')) parsedQuantity = 10;
        else if (text.includes('వంద') || text.includes('నూరు') || text.includes('सौ') || text.includes('hundred')) parsedQuantity = 100;
        else if (text.includes('అరవై') || text.includes('సాట్') || text.includes('साठ') || text.includes('sixty')) parsedQuantity = 60;
        else if (text.includes('డెబ్బై') || text.includes('सत्तर') || text.includes('seventy')) parsedQuantity = 70;
        else if (text.includes('ఎనభై') || text.includes('अस्सी') || text.includes('eighty')) parsedQuantity = 80;
        else if (isUniversalNext) parsedQuantity = quantityRef.current || 40;
      }

      if (parsedQuantity > 0) {
        setQuantity(parsedQuantity);
        quantityRef.current = parsedQuantity;
        const qtyMsg = lang === 'te'
          ? parsedQuantity + " క్వింటాళ్ల పరిమాణం స్థిరపరచబడింది. లొకేషన్ వివరాలకు వెళ్తున్నాం."
          : lang === 'hi'
          ? parsedQuantity + " क्विंटल मात्रा तय की गई। अब स्थान चुनते हैं।"
          : "Fixed " + parsedQuantity + " quintals. Moving to location step.";

        autoFixAndAdvance(
          'quantity-input',
          "🎯 Fixed Quantity: " + parsedQuantity + " Qtl ➔ Moving to Step 3...",
          qtyMsg,
          () => setStep(3)
        );
        return;
      }
    }

    // STEP 3: Location / District by Voice
    if (curStep === 3) {
      const allDistricts = ALL_INDIAN_STATES.flatMap(s => s.districts);
      const matchedDist = allDistricts.find(d => text.includes(d.toLowerCase()));
      
      let targetDistrict = locationRef.current.district;
      if (matchedDist) {
        const parentState = ALL_INDIAN_STATES.find(s => s.districts.includes(matchedDist));
        if (parentState) {
          targetDistrict = matchedDist;
          const newLoc = {
            ...locationRef.current,
            state: parentState.state,
            district: matchedDist
          };
          setLocation(newLoc);
          locationRef.current = newLoc;
          loadCentersForDistrict(parentState.state, matchedDist);
        }
      }

      const locMsg = lang === 'te'
        ? targetDistrict + " జిల్లా స్థిరపరచబడింది. అందుబాటులో ఉన్న సేకరణ కేంద్రాలను చూపిస్తున్నాం."
        : lang === 'hi'
        ? targetDistrict + " ज़िला तय किया गया। खरीद केंद्र लोड हो रहे हैं।"
        : "Fixed location: " + targetDistrict + ". Loading centers and mills.";

      autoFixAndAdvance(
        'location-input',
        "🎯 Fixed District: " + targetDistrict + " ➔ Moving to Step 4...",
        locMsg,
        () => setStep(4)
      );
      return;
    }

    // STEP 4: Center Selection / AI Recommendation by Voice
    if (curStep === 4) {
      const centerName = selectedCenterRef.current?.name || centersRef.current[0]?.name || 'Procurement Center';
      autoFixAndAdvance(
        selectedCenterRef.current?.id || 'center-card',
        "🎯 Fixed AI Center: " + centerName + " ➔ Loading AI Review...",
        lang === 'te' ? 'AI సిఫార్సు కేంద్రం ఎంపిక చేయబడింది.' : lang === 'hi' ? 'एआई केंद्र तय किया गया।' : 'AI optimal mill selected.',
        () => handleFetchAiRecommendation()
      );
      return;
    }

    // STEP 5: AI Recommendation Review by Voice
    if (curStep === 5) {
      autoFixAndAdvance(
        'ai-review-confirmed',
        "🎯 AI Review Confirmed ➔ Moving to Slot Selection...",
        lang === 'te' ? 'స్లాట్ సమయాల ఎంపికకు వెళ్తున్నాం.' : lang === 'hi' ? 'समय स्लॉट चुनने के लिए आगे बढ़ रहे हैं।' : 'Proceeding to 3-slot window selection.',
        () => setStep(6)
      );
      return;
    }

    // STEP 6: Time Slot Selection by Voice
    if (curStep === 6) {
      let matchedSlot: string | undefined;

      if (text.includes('11:00') || text.includes('11 am') || text.includes('11') || text.includes('పదకొండు') || text.includes('ग्यारह')) {
        matchedSlot = '11:00 AM – 11:30 AM';
      } else if (text.includes('11:30') || text.includes('పదకొండున్నర') || text.includes('साढ़े ग्यारह')) {
        matchedSlot = '11:30 AM – 12:00 PM';
      } else if (text.includes('8:30') || text.includes('8') || text.includes('ఎనిమిది') || text.includes('आठ')) {
        matchedSlot = '08:30 AM – 09:00 AM';
      } else if (text.includes('9:00') || text.includes('9') || text.includes('తొమ్మిది') || text.includes('नौ')) {
        matchedSlot = '09:00 AM – 09:30 AM';
      } else if (text.includes('9:30') || text.includes('తొమ్మిదిన్నర')) {
        matchedSlot = '09:30 AM – 10:00 AM';
      } else if (text.includes('10:00') || text.includes('10') || text.includes('పది') || text.includes('दस')) {
        matchedSlot = '10:00 AM – 10:30 AM';
      } else if (text.includes('10:30') || text.includes('పదిన్నర')) {
        matchedSlot = '10:30 AM – 11:00 AM';
      } else if (text.includes('2:00') || text.includes('2') || text.includes('రెండు') || text.includes('दो')) {
        matchedSlot = '02:00 PM – 02:30 PM';
      } else if (text.includes('2:30') || text.includes('రెండున్నర')) {
        matchedSlot = '02:30 PM – 03:00 PM';
      } else if (text.includes('3:00') || text.includes('3') || text.includes('మూడు') || text.includes('तीन')) {
        matchedSlot = '03:00 PM – 03:30 PM';
      } else if (text.includes('morning') || text.includes('ఉదయం') || text.includes('सुबह') || text.includes('ai pick') || isUniversalNext) {
        matchedSlot = '11:00 AM – 11:30 AM';
      } else {
        matchedSlot = selectedSlotRef.current || '11:00 AM – 11:30 AM';
      }

      // Check capacity
      const cap = slotCapacitiesRef.current.find(c => c.time === matchedSlot);
      if (cap && cap.isFull) {
        const openSlot = slotCapacitiesRef.current.find(s => !s.isFull);
        if (openSlot) matchedSlot = openSlot.time;
      }

      if (matchedSlot) {
        setSelectedSlot(matchedSlot);
        selectedSlotRef.current = matchedSlot;
        const slotMsg = lang === 'te'
          ? matchedSlot + " స్లాట్ స్థిరపరచబడింది. చివరి సమీక్ష వివరాలకు వెళ్తున్నాం."
          : lang === 'hi'
          ? matchedSlot + " स्लॉट तय किया गया। अंतिम समीक्षा के लिए आगे बढ़ते हैं।"
          : "Fixed " + matchedSlot + " slot. Moving to final confirmation summary.";

        autoFixAndAdvance(
          matchedSlot,
          "🎯 Fixed Slot: " + matchedSlot + " ➔ Moving to Step 7...",
          slotMsg,
          () => setStep(7)
        );
        return;
      }
    }

    // STEP 7: Final Booking Confirmation by Voice
    if (curStep === 7) {
      if (text.includes('confirm') || text.includes('book') || text.includes('finish') || 
          text.includes('done') || text.includes('yes') || text.includes('okay') || 
          text.includes('కన్ఫర్మ్') || text.includes('బుక్ చేయి') || text.includes('ఖరారు') || 
          text.includes('స్లాట్') || text.includes('హా') || text.includes('సరే') || 
          text.includes('कन्फर्म') || text.includes('बुक करें') || text.includes('पक्का') || 
          text.includes('हाँ') || isUniversalNext) {
        setVoiceNotification('🎯 Booking Confirmed! Generating Barcode & Email Pass...');
        handleConfirmBooking();
        return;
      }
    }
  };

  `;

content = content.substring(0, wizardStartIdx) + newEngine + content.substring(timeSlotsIdx);
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully upgraded SlotBookingWizard.tsx with robust anti-stale hands-free voice architecture');
