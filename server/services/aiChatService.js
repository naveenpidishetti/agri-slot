/**
 * AIChatService - Multilingual KisanAI Assistant powered by Featherless.ai
 * Responds to farmer inquiries about slots, queues, tokens, center timings, MSP, emerging AgriTech, and crop guidance.
 */
import { db } from '../config/db.js';
import { FeatherlessAIService } from './featherlessService.js';

export class AIChatService {
  static async handleMessage({ userId, message, language = 'en' }) {
    const user = db.findUserById(userId);
    const queueStatus = userId ? db.getFarmerActiveQueuePosition(userId) : null;
    const lang = (language || (user ? user.language : 'en')).toLowerCase();
    const query = message.trim();

    // Check farmer context
    const hasBooking = queueStatus && queueStatus.hasActiveBooking;
    const token = hasBooking ? queueStatus.tokenNumber : null;
    const centerName = hasBooking ? queueStatus.booking.center_name : 'Procurement Center';
    const slotTime = hasBooking ? queueStatus.booking.slot_time : null;
    const peopleAhead = hasBooking ? queueStatus.peopleAhead : 0;
    const estimatedWait = hasBooking ? queueStatus.estimatedWaitMins : 0;

    let reply = '';

    // 1. Try Featherless.ai API with Live Farmer Context
    try {
      const systemPrompt = `You are KisanAI Voice Mitra, an expert Indian agricultural and mandi procurement AI assistant on the AgriSlot platform.
You assist Indian farmers speaking ${lang === 'te' ? 'Telugu (తెలుగు)' : lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Live Context:
- Farmer Name: ${user?.name || 'Farmer'}
- Location: ${user?.village || 'Village'}, ${user?.district || 'Warangal'}, ${user?.state || 'Telangana'}
- Has Active Mandi Booking: ${hasBooking ? 'YES' : 'NO'}
${hasBooking ? `- Token Number: ${token}\n- Procurement Center/Mill: ${centerName}\n- Scheduled Slot: ${slotTime}\n- Farmers Ahead in Queue: ${peopleAhead}\n- Estimated Wait: ~${estimatedWait} mins` : '- No active booking.'}
- Government MSP Rates: Paddy ₹2,300/Qtl, Wheat ₹2,275/Qtl, Cotton ₹7,020/Qtl, Maize ₹2,090/Qtl, Soybean ₹4,892/Qtl.
- Emerging AgriTech: AI Kisan Drones (80% subsidy), IoT Soil Sensors (50% subsidy), Solar Cold Storage, Carbon credits.

Instructions:
Respond in ${lang === 'te' ? 'fluent Telugu (తెలుగు)' : lang === 'hi' ? 'fluent Hindi (हिंदी)' : 'concise, helpful English'}.
Keep responses clear, polite, and practical for rural farmers.`;

      const aiResponse = await FeatherlessAIService.generateChatCompletion({
        systemPrompt,
        userMessage: query,
        temperature: 0.5,
        maxTokens: 350
      });

      if (aiResponse) {
        reply = aiResponse;
      }
    } catch (err) {
      console.warn('[Featherless.ai Chat fallback]', err.message);
    }

    // 2. Fallback Heuristic Intelligence if Featherless API is unreachable
    if (!reply) {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('when') || lowerQuery.includes('time') || lowerQuery.includes('slot') || lowerQuery.includes('సమయం') || lowerQuery.includes('कब')) {
        if (lang === 'te') {
          reply = hasBooking
            ? `మీ స్లాట్ ${centerName} వద్ద ${slotTime} కు బుక్ చేయబడింది. దయచేసి మీ స్లాట్‌కు 15 నిమిషాల ముందుగా కేంద్రానికి చేరుకోండి.`
            : `మీకు ప్రస్తుత బుకింగ్ లేదు. 'స్లాట్ బుక్ చేయండి' బటన్ క్లిక్ చేసి సమయం ఎంచుకోండి.`;
        } else if (lang === 'hi') {
          reply = hasBooking
            ? `आपका स्लॉट ${centerName} पर ${slotTime} के लिए बुक है। कृपया 15 मिनट पहले केंद्र पर पहुंचें।`
            : `आपके पास कोई सक्रिय बुकिंग नहीं है। कृपया 'स्लॉट बुक करें' पर जाकर नया स्लॉट चुनें।`;
        } else {
          reply = hasBooking
            ? `Your slot is scheduled for ${slotTime} at ${centerName}. Please arrive approximately 15 minutes before your slot time with your Token (${token}).`
            : `You do not have an active booking yet. Click 'Book Slot' on the dashboard to reserve your time slot.`;
        }
      } else if (lowerQuery.includes('token') || lowerQuery.includes('queue') || lowerQuery.includes('ahead') || lowerQuery.includes('టోకెన్') || lowerQuery.includes('క్యూ')) {
        if (lang === 'te') {
          reply = hasBooking
            ? `మీ టోకెన్ నంబర్: ${token}. మీ ముందు ${peopleAhead} మంది రైతులు ఉన్నారు. సుమారు వేచి ఉండే సమయం: ${estimatedWait} నిమిషాలు.`
            : `మీకు ప్రస్తుత టోకెన్ లేదు. స్లాట్ బుక్ చేసిన తర్వాత డిజిటల్ టోకెన్ మరియు క్యూ నంబర్ వస్తుంది.`;
        } else if (lang === 'hi') {
          reply = hasBooking
            ? `आपका टोकन नंबर: ${token} है। आपके आगे ${peopleAhead} किसान हैं। अनुमानित प्रतीक्षा समय: ${estimatedWait} मिनट।`
            : `आपके पास कोई सक्रिय टोकन नहीं है। स्लॉट बुक करने के बाद तुरंत टोकन प्राप्त होगा।`;
        } else {
          reply = hasBooking
            ? `Your Token number is ${token}. There are currently ${peopleAhead} farmers ahead of you in the queue. Estimated waiting time is ${estimatedWait} minutes.`
            : `You don't have an active token right now. Once you book a slot, a digital QR token will be generated instantly.`;
        }
      } else {
        if (lang === 'te') {
          reply = `నమస్కారం! నేను అగ్రిస్లాట్ కిసాన్ వాయిస్ మిత్ర (Featherless.ai AI). స్లాట్ బుకింగ్, టోకెన్ స్థితి, మార్కెట్ రేట్లు, లేదా పంట సలహాల గురించి ఏదైనా అడగవచ్చు.`;
        } else if (lang === 'hi') {
          reply = `नमस्ते! मैं एग्रीस्लॉट किसान वॉयस मित्र (Featherless.ai AI) हूँ। आप मुझसे स्लॉट बुकिंग, कतार स्थिति, मंडी भाव या फसल सुरक्षा के बारे में पूछ सकते हैं।`;
        } else {
          reply = `Hello! I am your AgriSlot Kisan Voice Mitra powered by Featherless.ai. You can ask me about your slot time, live queue position, mandi price forecasts, crop doctor remedies, or required documents. How can I help you today?`;
        }
      }
    }

    // Record interaction in history
    db.chatMessages.push({
      id: `chat-${Date.now()}`,
      user_id: userId || 'guest',
      role: 'USER',
      message: query,
      language: lang,
      created_at: new Date().toISOString()
    });
    db.chatMessages.push({
      id: `chat-${Date.now() + 1}`,
      user_id: userId || 'guest',
      role: 'ASSISTANT',
      message: reply,
      language: lang,
      provider: 'featherless.ai',
      created_at: new Date().toISOString()
    });

    return {
      message: reply,
      language: lang,
      activeToken: token,
      provider: 'featherless.ai',
      timestamp: new Date().toISOString()
    };
  }
}
