import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AICaptionDisclaimerProps {
  featureName?: string;
  className?: string;
  compact?: boolean;
}

export const AICaptionDisclaimer: React.FC<AICaptionDisclaimerProps> = ({ 
  featureName = 'AI',
  className = '',
  compact = false
}) => {
  if (compact) {
    return (
      <div className={`p-2.5 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-900 text-[10px] flex items-start gap-2 shadow-2xs ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-tight">
          <span className="font-extrabold text-amber-950">AI Notice: </span>
          <span className="text-amber-800 font-medium">
            AI can make mistakes. Cross-verify critical dosages & slot forecasts with your local Agriculture Officer or KVK helpline (<a href="tel:18001801551" className="font-bold underline text-amber-950">1800-180-1551</a>).
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs ${className}`}>
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <span className="font-extrabold text-amber-950">
          ⚠️ AI Advisory Notice:
        </span>
        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
          {featureName} insights, pesticide dosages, and price forecasts are AI-generated and may make mistakes. Please verify critical chemical applications, treatment plans, and market transactions with your local Agricultural Officer, Krishi Vigyan Kendra (KVK), or Kisan Helpline (<a href="tel:18001801551" className="font-bold underline text-amber-950">1800-180-1551</a>) before taking field action.
        </p>
      </div>
    </div>
  );
};

export default AICaptionDisclaimer;
