import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'AVAILABLE':
      case 'GRADE_A':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'CHECKED_IN':
      case 'FILLING FAST':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'PROCESSING':
      case 'IN_SERVICE':
      case 'GRADE_B':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'COMPLETED':
      case 'FINISHED':
        return 'bg-green-600/20 text-green-300 border-green-500/40';
      case 'CANCELLED':
      case 'REJECT':
      case 'FULL':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
