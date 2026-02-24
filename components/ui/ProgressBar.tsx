"use client";

import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "success" | "warning" | "danger";
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  size = "md",
  variant = "default",
  animated = true,
  className = "",
}: ProgressBarProps) {
  // Guard against undefined/null values
  const safeValue = value ?? 0;
  const safeMax = max ?? 1;
  const percentage = Math.min((safeValue / safeMax) * 100, 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variantClasses = {
    default: "bg-purple-500",
    gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  // Auto-select variant based on percentage
  const autoVariant = percentage > 50 
    ? variant 
    : percentage > 20 
      ? "warning" 
      : "danger";

  const finalVariant = variant === "default" ? autoVariant : variant;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-[13px] font-medium text-[#131314]">{label}</span>
          )}
          {showValue && (
            <span className="text-[13px] text-[#58585a]">
              {safeValue.toLocaleString()} / {safeMax.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantClasses[finalVariant]} ${
            animated ? "progress-bar-animated" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Credit-specific progress bar
interface CreditProgressProps {
  used: number;
  total: number;
  plan?: string;
}

export function CreditProgress({ used, total, plan }: CreditProgressProps) {
  const remaining = Math.max(total - used, 0);
  const percentage = (remaining / total) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-[20px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#131314]">Credits Remaining</h3>
          {plan && (
            <span className="text-[12px] text-[#58585a] capitalize">{plan} Plan</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[#131314]">{remaining}</span>
          <span className="text-[#58585a] text-[14px]"> / {total}</span>
        </div>
      </div>
      
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 50 
              ? "bg-gradient-to-r from-purple-500 to-pink-500" 
              : percentage > 20 
                ? "bg-amber-500" 
                : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px] text-[#58585a]">
          {used} credits used
        </span>
        <span className={`text-[12px] font-medium ${
          percentage > 50 ? "text-green-600" : percentage > 20 ? "text-amber-600" : "text-red-600"
        }`}>
          {Math.round(percentage)}% remaining
        </span>
      </div>
    </div>
  );
}
