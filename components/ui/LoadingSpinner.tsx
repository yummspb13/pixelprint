"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16', 
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Основной спиннер с градиентом */}
      <div className="relative">
        {/* Внешнее кольцо */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
        
        {/* Вращающееся кольцо с градиентом */}
        <div className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-px-cyan border-r-px-magenta animate-spin`}></div>
        
        {/* Внутреннее кольцо */}
        <div className={`${sizeClasses[size]} absolute top-1 left-1 rounded-full border-2 border-transparent border-b-px-yellow border-l-px-cyan animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        
        {/* Центральная точка */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Текст загрузки с анимацией */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-px-fg mb-1">{text}</h3>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-px-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-px-magenta rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-px-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
