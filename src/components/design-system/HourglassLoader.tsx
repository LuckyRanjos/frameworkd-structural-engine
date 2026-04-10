import React from 'react';

interface HourglassLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  centerText?: boolean;
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

/**
 * Hourglass Loader Component
 * Beautiful, gentle spinning hourglass animation using pure CSS
 * 
 * Usage:
 * <HourglassLoader size="md" />
 * 
 * <HourglassLoader size="lg" text="Loading your analysis..." centerText />
 */
export const HourglassLoader: React.FC<HourglassLoaderProps> = ({
  size = 'md',
  text,
  centerText = false,
}) => {
  return (
    <div className={centerText ? 'flex flex-col items-center justify-center gap-4' : ''}>
      <div className={`hourglass-loader ${sizeMap[size]}`}>
        <div className="hourglass">
          {/* Sand particles */}
          <div className="sand"></div>
          <div className="sand"></div>
          <div className="sand"></div>
          
          {/* Bottom sand chamber */}
          <div className="hourglass-bottom"></div>
          
          {/* Glass frame border */}
          <div className="hourglass-frame"></div>
        </div>
      </div>
      
      {text && (
        <p className="text-neutral-600 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export default HourglassLoader;
