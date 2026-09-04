const fs = require('fs');

const targetPath = 'c:/Users/navee/Downloads/agrislot-main/agrislot-main/src/components/farmer/SlotBookingWizard.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

const startTag = 'const handleVoiceCommand = (rawTranscript: string) => {';
const endTag = 'const availableDistricts = ALL_INDIAN_STATES.find';

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newParser = `const handleVoiceCommand = (rawTranscript: string) => {
    if (isTransitioningRef.current) return;
    const text = rawTranscript.toLowerCase().trim();

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
      if (step > 1) {
        setStep(prev => Math.max(1, prev - 1));
      } else {
        onBack();
      }
      return;
    }

    // Universal Repeat Instructions
    if (text.includes('repeat') || text.includes('again') || text.includes('మళ్ళీ') || text.includes('మళ్ళీ చెప్పు') || text.includes('दोहराएं')) {
      triggerStepVoicePrompt(step);
      return;
    }

    // Universal Next / Confirm / Proceed across all steps
    const isUniversalNext = text.includes('next') || text.includes('continue') || text.includes('proceed') || 
                            text.includes('forward') || text.includes('okay') || text.includes('ok') || 
                            text.includes('yes') || text.includes('తర్వాత') || text.includes('ముందుకు') || 
                            text.includes('సరే') || text.includes('హా') || text.includes('आगे') || 
                            text.includes('बढ़ें') || text.includes('हाँ') || text.includes('ठीक है');

    // STEP 1: Crop Selection by Voice
    if (step === 1) {
      let matchedCrop: Crop | undefined;

      const isPaddy = text.includes('paddy') || text.includes('pady') || text.includes('peddy') || 
                      text.includes('paddi') || text.includes('padi') || text.includes('baddy') || 
                      text.includes('party') || text.includes('patty') || text.includes('body') ||
                      text.includes('rice') || text.includes('dhan') || text.includes('dhanya') || 
                      text.includes('వరి') || text.includes('ధాన్యం') || text.includes('వరిధాన్యం') || 
                      text.includes('పాడీ') || text.includes('ప్యాడీ') || text.includes('బియ్యం') || 
                      text.includes('వడ్లు') || text.includes('ధాన') || text.includes('चावल') || 
                      text.includes('पैडी') || text.includes('पैड़ी');

      if (isPaddy) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('paddy') || c.name.toLowerCase().includes('rice')) || DEFAULT_CROPS[0];
      } else if (text.includes('wheat') || text.includes('gehun') || text.includes('gehu') || text.includes('గోధుమ') || text.includes('గోధుమలు') || text.includes('గేహు') || text.includes('गेहूं') || text.includes('कनक')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('wheat')) || DEFAULT_CROPS[1];
      } else if (text.includes('cotton') || text.includes('kapas') || text.includes('kappas') || text.includes('పత్తి') || text.includes('కపాస్') || text.includes('దూది') || text.includes('కాటన్') || text.includes('कपास') || text.includes('कॉटन')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('cotton')) || DEFAULT_CROPS[2];
      } else if (text.includes('maize') || text.includes('corn') || text.includes('makka') || text.includes('మొక్కజొన్న') || text.includes('మక్క') || text.includes('మక్కజొన్న') || text.includes('मक्का') || text.includes('भुट्टा')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('maize')) || DEFAULT_CROPS[3];
      } else if (text.includes('chilli') || text.includes('chilly') || text.includes('mirchi') || text.includes('మిర్చి') || text.includes('మిరప') || text.includes('ఎండుమిర్చి') || text.includes('मिर्च') || text.includes('लाल मिर्च')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('chilli')) || DEFAULT_CROPS[4];
      } else if (text.includes('turmeric') || text.includes('haldi') || text.includes('పసుపు') || text.includes('హల్దీ') || text.includes('हल्दी')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('turmeric')) || DEFAULT_CROPS[5];
      } else if (text.includes('soybean') || text.includes('soya') || text.includes('సోయాబీన్') || text.includes('సోయా') || text.includes('సోయాबीन')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('soybean')) || DEFAULT_CROPS[6];
      } else if (text.includes('groundnut') || text.includes('peanut') || text.includes('mungfali') || text.includes('వేరుశనగ') || text.includes('పల్లీలు') || text.includes('मूंगफली')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('groundnut')) || DEFAULT_CROPS[7];
      } else if (text.includes('mustard') || text.includes('sarson') || text.includes('ఆవాలు') || text.includes('सरसों') || text.includes('राई')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('mustard')) || DEFAULT_CROPS[8];
      } else if (text.includes('onion') || text.includes('pyaz') || text.includes('ఉల్లిపాయ') || text.includes('ఎర్రగడ్డలు') || text.includes('प्याज') || text.includes('कांदा')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('onion')) || DEFAULT_CROPS[9];
      } else if (text.includes('tomato') || text.includes('tamatar') || text.includes('టమోటా') || text.includes('టమాట') || text.includes('टमाटर')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('tomato')) || DEFAULT_CROPS[10];
      } else if (text.includes('potato') || text.includes('aloo') || text.includes('బంగాళాదుంప') || text.includes('ఆలూ') || text.includes('आलू')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('potato')) || DEFAULT_CROPS[11];
      } else if (text.includes('sugarcane') || text.includes('ganna') || text.includes('చెరకు') || text.includes('గన్న') || text.includes('गन्ना')) {
        matchedCrop = crops.find(c => c.name.toLowerCase().includes('sugarcane')) || DEFAULT_CROPS[12];
      } else if (isUniversalNext) {
        matchedCrop = selectedCrop || DEFAULT_CROPS[0];
      }

      if (matchedCrop) {
        setSelectedCrop(matchedCrop);
        const confirmMsg = language === 'te'
          ? \`\${matchedCrop.name} పంట స్థిరపరచబడింది. పరిమాణం ఎంచుకోవడానికి వెళ్తున్నాం.\`
          : language === 'hi'
          ? \`\${matchedCrop.name} फसल तय की गई। अब मात्रा दर्ज करें।\`
          : \`Fixed crop: \${matchedCrop.name}. Moving to quantity step.\`;

        autoFixAndAdvance(
          matchedCrop.id,
          \`🎯 Fixed Crop: \${matchedCrop.name} ➔ Moving to Step 2...\`,
          confirmMsg,
          () => setStep(2)
        );
        return;
      }
    }

    // STEP 2: Quantity by Voice
    if (step === 2) {
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
        else if (isUniversalNext) parsedQuantity = quantity || 40;
      }

      if (parsedQuantity > 0) {
        setQuantity(parsedQuantity);
        const qtyMsg = language === 'te'
          ? \`\${parsedQuantity} క్వింటాళ్ల పరిమాణం స్థిరపరచబడింది. లొకేషన్ వివరాలకు వెళ్తున్నాం.\`
          : language === 'hi'
          ? \`\${parsedQuantity} क्विंटल मात्रा तय की गई। अब स्थान चुनते हैं।\`
          : \`Fixed \${parsedQuantity} quintals. Moving to location step.\`;

        autoFixAndAdvance(
          'quantity-input',
          \`🎯 Fixed Quantity: \${parsedQuantity} Qtl ➔ Moving to Step 3...\`,
          qtyMsg,
          () => setStep(3)
        );
        return;
      }
    }

    // STEP 3: Location / District by Voice
    if (step === 3) {
      const allDistricts = ALL_INDIAN_STATES.flatMap(s => s.districts);
      const matchedDist = allDistricts.find(d => text.includes(d.toLowerCase()));
      
      let targetDistrict = location.district;
      if (matchedDist) {
        const parentState = ALL_INDIAN_STATES.find(s => s.districts.includes(matchedDist));
        if (parentState) {
          targetDistrict = matchedDist;
          setLocation({
            ...location,
            state: parentState.state,
            district: matchedDist
          });
          loadCentersForDistrict(parentState.state, matchedDist);
        }
      }

      const locMsg = language === 'te'
        ? \`\${targetDistrict} జిల్లా స్థిరపరచబడింది. అందుబాటులో ఉన్న సేకరణ కేంద్రాలను చూపిస్తున్నాం.\`
        : language === 'hi'
        ? \`\${targetDistrict} ज़िला तय किया गया। खरीद केंद्र लोड हो रहे हैं।\`
        : \`Fixed location: \${targetDistrict}. Loading centers and mills.\`;

      autoFixAndAdvance(
        'location-input',
        \`🎯 Fixed District: \${targetDistrict} ➔ Moving to Step 4...\`,
        locMsg,
        () => setStep(4)
      );
      return;
    }

    // STEP 4: Center Selection / AI Recommendation by Voice
    if (step === 4) {
      const centerName = selectedCenter?.name || centers[0]?.name || 'Procurement Center';
      autoFixAndAdvance(
        selectedCenter?.id || 'center-card',
        \`🎯 Fixed AI Center: \${centerName} ➔ Loading AI Review...\`,
        language === 'te' ? 'AI సిఫార్సు కేంద్రం ఎంపిక చేయబడింది.' : language === 'hi' ? 'एआई केंद्र तय किया गया।' : 'AI optimal mill selected.',
        () => handleFetchAiRecommendation()
      );
      return;
    }

    // STEP 5: AI Recommendation Review by Voice
    if (step === 5) {
      autoFixAndAdvance(
        'ai-review-confirmed',
        \`🎯 AI Review Confirmed ➔ Moving to Slot Selection...\`,
        language === 'te' ? 'స్లాట్ సమయాల ఎంపికకు వెళ్తున్నాం.' : language === 'hi' ? 'समय स्लॉट चुनने के लिए आगे बढ़ रहे हैं।' : 'Proceeding to 3-slot window selection.',
        () => setStep(6)
      );
      return;
    }

    // STEP 6: Time Slot Selection by Voice
    if (step === 6) {
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
        matchedSlot = selectedSlot || '11:00 AM – 11:30 AM';
      }

      // Check capacity
      const cap = slotCapacities.find(c => c.time === matchedSlot);
      if (cap && cap.isFull) {
        const openSlot = slotCapacities.find(s => !s.isFull);
        if (openSlot) matchedSlot = openSlot.time;
      }

      if (matchedSlot) {
        setSelectedSlot(matchedSlot);
        const slotMsg = language === 'te'
          ? \`\${matchedSlot} స్లాట్ స్థిరపరచబడింది. చివరి సమీక్ష వివరాలకు వెళ్తున్నాం.\`
          : language === 'hi'
          ? \`\${matchedSlot} स्लॉट तय किया गया। अंतिम समीक्षा के लिए आगे बढ़ते हैं।\`
          : \`Fixed \${matchedSlot} slot. Moving to final confirmation summary.\`;

        autoFixAndAdvance(
          matchedSlot,
          \`🎯 Fixed Slot: \${matchedSlot} ➔ Moving to Step 7...\`,
          slotMsg,
          () => setStep(7)
        );
        return;
      }
    }

    // STEP 7: Final Booking Confirmation by Voice
    if (step === 7) {
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

  content = content.substring(0, startIdx) + newParser + content.substring(endIdx);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully updated SlotBookingWizard.tsx voice parser across all 7 steps');
}
