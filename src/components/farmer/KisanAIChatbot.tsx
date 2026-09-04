import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Sparkles,
  Play,
  Square
} from 'lucide-react';
import { AICaptionDisclaimer } from '../common/AICaptionDisclaimer';

interface KisanAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  isSpeaking?: boolean;
}

export const KisanAIChatbot: React.FC<KisanAIChatbotProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const getInitialGreeting = (lang: string) => {
    if (lang === 'te') {
      return 'నమస్కారం! నేను మీ అగ్రిస్లాట్ కిసాన్ వాయిస్ సహాయకుడిని (KisanAI). స్లాట్ సమయం, టోకెన్ స్థితి, క్యూ వివరాలు, రేట్లు లేదా అవసరమైన పత్రాల గురించి నాతో మాట్లాడండి.';
    }
    if (lang === 'hi') {
      return 'नमस्ते! मैं आपका एग्रीस्लॉट किसान वॉयस सहायक (KisanAI) हूँ। आप मुझसे अपनी टोकन स्थिति, कतार विवरण, मंडी भाव या आवश्यक दस्तावेज़ों के बारे में पूछ सकते हैं।';
    }
    return 'Hello! I am your AgriSlot Kisan Voice Assistant (KisanAI). Ask me about your slot time, live queue, MSP prices, token pass, or required documents.';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: getInitialGreeting(language),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Sync initial message with language change if user hasn't started a full chat session yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [{
          id: 'init-1',
          sender: 'assistant',
          text: getInitialGreeting(language),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [language]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Stop any previous speech
    
    if (currentlySpeakingId === msgId) {
      setCurrentlySpeakingId(null);
      return;
    }

    try {
      const cleanText = text.replace(/[*#_~`•]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      if (msgId) setCurrentlySpeakingId(msgId);

      utterance.onend = () => {
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = () => {
        setCurrentlySpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setCurrentlySpeakingId(null);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query, language, user?.id);
      const assistantId = `msg-${Date.now() + 1}`;
      const assistantMsg: Message = {
        id: assistantId,
        sender: 'assistant',
        text: res.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Automatically speak out loud if auto-speak is enabled
      if (autoSpeak) {
        speakText(res.message, assistantId);
      }
    } catch (err) {
      const errorReply = language === 'te'
        ? 'క్షమించండి, నెట్‌వర్క్ సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
        : language === 'hi'
        ? 'क्षमा करें, नेटवर्क में समस्या आई। कृपया पुनः प्रयास करें।'
        : 'Sorry, I had trouble connecting. Please try again.';

      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: errorReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported on this browser. You can still type your questions.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;

      if (!isListening) {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          handleSend(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } catch (err) {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  const quickQuestions = language === 'te' ? [
    'నా స్లాట్ సమయం ఎప్పుడు?',
    'నా టోకెన్ మరియు క్యూ స్థానం ఎంత?',
    'వరి (పాడీ) ప్రస్తుత మద్దతు ధర ఎంత?',
    'తీసుకురావలసిన పత్రాలు ఏమిటి?'
  ] : language === 'hi' ? [
    'मेरा स्लॉट समय कब है?',
    'मेरे आगे कितने किसान हैं?',
    'गेहूं और धान का एमएसपी रेट क्या है?',
    'आवश्यक दस्तावेज़ क्या हैं?'
  ] : [
    'When should I arrive for my slot?',
    'What is my live queue position?',
    'What is the current MSP rate for Paddy & Wheat?',
    'What documents are required at the center?'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white/98 backdrop-blur-2xl border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-slate-900">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>KisanAI Voice Mitra</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-emerald"></span>
            </div>
            <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
              Multilingual Speech & Speaker AI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Speaker Toggle */}
          <button
            onClick={() => {
              if (autoSpeak) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              autoSpeak 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title={autoSpeak ? 'Voice Response: ON' : 'Voice Response: OFF'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice Status Strip with Soundwave Bars */}
      {isListening && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-bold flex items-center justify-between px-4 animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-red-600 animate-bounce" />
            <span>Listening to voice... ({language.toUpperCase()})</span>
          </div>
          <div className="flex items-end gap-1 h-5">
            <div className="w-1 bg-red-600 rounded-full sound-bar-1" />
            <div className="w-1 bg-red-600 rounded-full sound-bar-2" />
            <div className="w-1 bg-red-600 rounded-full sound-bar-3" />
            <div className="w-1 bg-red-600 rounded-full sound-bar-4" />
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
        <div className="mb-2">
          <AICaptionDisclaimer featureName="Kisan AI Chat Assistant" compact={true} />
        </div>
        {messages.map((m) => {
          const isAssistant = m.sender === 'assistant';
          const isCurrentlySpeaking = currentlySpeakingId === m.id;

          return (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed relative group ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                }`}
              >
                <div>{m.text}</div>

                {/* Speaker Button on Assistant Bubbles */}
                {isAssistant && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => speakText(m.text, m.id)}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                        isCurrentlySpeaking 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-xs' 
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {isCurrentlySpeaking ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>Stop Voice</span>
                          <div className="flex items-end gap-0.5 h-3 ml-1">
                            <div className="w-0.5 bg-white rounded-full sound-bar-1" />
                            <div className="w-0.5 bg-white rounded-full sound-bar-2" />
                            <div className="w-0.5 bg-white rounded-full sound-bar-3" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-600" />
                          <span>Listen (Speaker)</span>
                        </>
                      )}
                    </button>
                    <span className="text-[9px] text-slate-400">{m.time}</span>
                  </div>
                )}
              </div>
              {!isAssistant && (
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">{m.time}</span>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white text-slate-700 text-xs w-max border border-slate-200 shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>KisanAI is thinking & analyzing voice query...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Pills */}
      <div className="p-2.5 border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar bg-slate-100/70">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-[11px] text-slate-700 hover:text-emerald-800 border border-slate-200 font-semibold transition hover:border-emerald-300 cursor-pointer shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3.5 border-t border-slate-200 bg-white">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="flex items-center gap-2"
        >
          {/* Microphone Voice Speak Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-3 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
              isListening 
                ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-md shadow-red-500/25' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs'
            }`}
            title="Click and Speak into Microphone"
          >
            {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-emerald-600 animate-pulse" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'te' ? 'ఇక్కడ మాట్లాడండి లేదా రాయండి...' : 
              language === 'hi' ? 'यहाँ बोलें या प्रश्न लिखें...' : 
              'Speak with mic or type your question...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white shadow-inner"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all duration-200 shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
