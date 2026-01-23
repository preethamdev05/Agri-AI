import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div 
      className={`animate-pulse rounded-md bg-muted/50 ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

export default Skeleton;
