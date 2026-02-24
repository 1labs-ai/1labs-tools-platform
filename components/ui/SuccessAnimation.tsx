"use client";

import React, { useEffect, useState } from "react";

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  message?: string;
  subMessage?: string;
}

export function SuccessAnimation({ 
  show, 
  onComplete, 
  message = "Generated Successfully!", 
  subMessage 
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setAnimating(true);
      
      const timer = setTimeout(() => {
        setAnimating(false);
        setTimeout(() => {
          setVisible(false);
          onComplete?.();
        }, 300);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        animating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div 
        className={`bg-white rounded-[24px] p-8 shadow-2xl text-center transform transition-all duration-500 ${
          animating ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Animated checkmark */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <svg 
            className="w-20 h-20" 
            viewBox="0 0 100 100"
          >
            {/* Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              className="success-circle"
            />
            {/* Checkmark */}
            <path
              d="M30 50 L45 65 L70 35"
              fill="none"
              stroke="#22c55e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="success-check"
            />
          </svg>
          
          {/* Confetti particles */}
          <div className="confetti-container absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="confetti-particle"
                style={{
                  "--delay": `${i * 0.1}s`,
                  "--angle": `${i * 30}deg`,
                  "--color": ["#7C3AED", "#EC4899", "#22c55e", "#facc15"][i % 4],
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-[#131314] mb-1">{message}</h3>
        {subMessage && (
          <p className="text-[#58585a] text-[14px]">{subMessage}</p>
        )}
      </div>
    </div>
  );
}

// Inline loading spinner with pulse
export function LoadingSpinner({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <svg 
      className={`animate-spin ${sizes[size]} ${className}`} 
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Bouncing dots loader
export function DotsLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-current rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
