import React from 'react';
import { ArrowLeft, Sparkles, Smartphone, QrCode, Bot, ShieldCheck, BarChart3, Clock, Languages } from 'lucide-react';

export const Features: React.FC<{ onBack: () => void; onBook: () => void }> = ({ onBack, onBook }) => {
  const featureList = [
    {
      title: 'AI Multi-Factor Slot Recommendations',
      desc: 'Dynamic algorithm considering center backlog, distance, crop type, unloading bay capacity, and road congestion.',
      icon: Sparkles
    },
    {
      title: 'Multilingual KisanAI Chatbot with Voice',
      desc: 'Native Telugu, Hindi, and English voice input & output assistance for token queries, document checklists, and center rules.',
      icon: Bot
    },
    {
      title: 'Real-Time Live Queue Polling',
      desc: 'Know your exact position in the physical queue. Get notifications when the current token advances.',
      icon: Clock
    },
    {
      title: 'Produce Quality Pre-Screening',
      desc: 'Visual computer vision heuristics detecting grain discoloration, foreign matter, and moisture level indicators.',
      icon: ShieldCheck
    },
    {
      title: 'Tamper-Proof Digital QR Tokens',
      desc: 'High-contrast digital token containing farmer ID, slot timestamp, crop type, and verified center code.',
      icon: QrCode
    },
    {
      title: 'Staff & Admin Live Operations Dashboard',
      desc: 'Weighbridge processing status, queue calling, daily capacity adjustments, and turnaround analytics.',
      icon: BarChart3
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-20 text-emerald-100">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-emerald-300/80 hover:text-emerald-300 transition cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">
          Comprehensive Platform Features
        </h1>
        <p className="text-sm text-emerald-200/70 mt-2">
          Designed specifically for rural connectivity, accessibility, and high procurement throughput
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featureList.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="card-clean p-6 rounded-2xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1 font-outfit">{f.title}</h3>
                <p className="text-xs text-emerald-200/70 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
