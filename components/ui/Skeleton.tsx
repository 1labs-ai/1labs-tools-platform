"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = "", 
  variant = "rectangular",
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "rounded-[24px]",
  };

  const style: React.CSSProperties = {
    width: width ?? "100%",
    height: height ?? (variant === "text" ? "1rem" : variant === "circular" ? "3rem" : "auto"),
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{ 
              width: i === lines - 1 ? "75%" : "100%", 
              height: "1rem" 
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-[24px]">
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width={60} height={20} />
      </div>
      <Skeleton variant="text" width="70%" height={24} className="mb-2" />
      <Skeleton variant="text" lines={2} />
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-6">
      <Skeleton variant="text" width={100} height={16} className="mb-4" />
      <Skeleton variant="text" width={80} height={40} className="mb-1" />
      <Skeleton variant="text" width={60} height={14} />
    </div>
  );
}

export function GenerationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={16} className="mb-1" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  );
}
