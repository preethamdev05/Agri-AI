import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 to 1
  colorClass?: string;
  label?: string;
  showValue?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  colorClass = "bg-primary", 
  label,
  showValue = true 
}) => {
  const percentage = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  // Enhanced gradient mapping for different confidence types
  const gradientMap: Record<string, string> = {
    'bg-emerald-500': 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    'bg-amber-500': 'bg-gradient-to-r from-amber-500 to-amber-400',
    'bg-blue-500': 'bg-gradient-to-r from-blue-500 to-blue-400',
    'bg-primary': 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  };

  const gradientClass = gradientMap[colorClass] || colorClass;

  return (
    <div className="w-full space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-sm font-bold text-foreground tabular-nums">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/30">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full shadow-lg ${gradientClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            boxShadow: colorClass.includes('emerald') 
              ? '0 4px 12px rgba(16, 185, 129, 0.3)'
              : colorClass.includes('amber')
              ? '0 4px 12px rgba(245, 158, 11, 0.3)'
              : '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;