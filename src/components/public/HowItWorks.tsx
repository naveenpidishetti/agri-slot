import React from 'react';
import { ArrowLeft, CheckCircle2, QrCode, Cpu, Truck, Clock } from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
  onBook: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBack, onBook }) => {
  const steps = [
    {
      num: '01',
      title: 'Farmer Registers & Selects Crop Details',
      desc: 'Enter your village name, crop type (Paddy, Wheat, Maize, Cotton, etc.), and approximate harvest quantity in quintals.',
      icon: CheckCircle2
    },
    {
      num: '02',
      title: 'AI Recommends the Optimal Center & Slot',
      desc: 'Our SlotRecommendationService calculates real-time center capacities, traffic congestion, and unloading bay wait times to recommend the fastest slot.',
      icon: Cpu
    },
    {
      num: '03',
      title: 'Instant QR Digital Token Generated',
      desc: 'Get a unique token (e.g. AGR-2026-00124) with a QR code and estimated arrival countdown saved directly on your phone.',
      icon: QrCode
    },
    {
      num: '04',
      title: 'Live Queue Tracking & Arrival',
      desc: 'Check live updates on how many farmers are currently being served. Arrive 15 minutes before your time slot.',
      icon: Clock
    },
    {
      num: '05',
      title: 'Quick Check-in, Weighing & Fast MSP Credit',
      desc: 'Procurement officers scan your token, inspect produce quality, verify weights on digital weighbridges, and record government MSP purchase.',
      icon: Truck
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-20 text-emerald-100">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-emerald-300/80 hover:text-emerald-300 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">
          How AgriSlot Eliminates Mandi Queues
        </h1>
        <p className="text-sm text-emerald-200/70 mt-2 max-w-xl mx-auto">
          A step-by-step breakdown of how digital smart slots transform agricultural procurement
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="card-clean p-6 rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-900/60 text-emerald-400 font-bold text-lg flex items-center justify-center font-outfit flex-shrink-0 border border-emerald-500/30">
                {step.num}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  {step.title}
                </h3>
                <p className="text-sm text-emerald-200/70 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <button 
          onClick={onBook}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm transition duration-300 shadow-xl shadow-emerald-500/25 hover:scale-[1.02] cursor-pointer"
        >
          Book Your Slot Now
        </button>
      </div>
    </div>
  );
};
