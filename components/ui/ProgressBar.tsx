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

  return (
    <div className="w-full space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          {label && <span>{label}</span>}
          {showValue && <span>{percentage}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={`h-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;