"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Running structural analysis...",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-8 ${className}`}>
      {/* Hourglass Animation */}
      <div className="relative">
        {/* Hourglass Container */}
        <div className="hourglass-container">
          {/* Top Chamber */}
          <div className="hourglass-top">
            <div className="sand-top"></div>
          </div>

          {/* Middle Frame */}
          <div className="hourglass-frame">
            <div className="hourglass-neck"></div>
          </div>

          {/* Bottom Chamber */}
          <div className="hourglass-bottom">
            <div className="sand-bottom"></div>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-amber-100 opacity-20 blur-xl animate-pulse"></div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-neutral-700 animate-pulse">
          {message}
        </p>
        <p className="text-sm text-neutral-500">
          This may take a moment...
        </p>
      </div>
    </div>
  );
};

export default LoadingState;