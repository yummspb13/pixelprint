"use client";

import React from 'react';

interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function WaveLoader({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: WaveLoaderProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28', 
    lg: 'w-36 h-36',
    xl: 'w-44 h-44'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Контейнер с волнами */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Внешняя волна */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-px-cyan animate-spin" style={{ animationDuration: '1.5s' }}></div>
        
        {/* Средняя волна */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-r-px-magenta animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        
        {/* Внутренняя волна */}
        <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-px-yellow animate-spin" style={{ animationDuration: '1s' }}></div>
        
        {/* Центральная область с пульсирующими элементами */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Пульсирующие круги */}
          <div className="absolute w-4 h-4 bg-px-cyan rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
          <div className="absolute w-4 h-4 bg-px-magenta rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute w-4 h-4 bg-px-yellow rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          
          {/* Центральная точка */}
          <div className="w-2 h-2 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Текст с эффектом печатания */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-px-fg mb-2">
          <span className="inline-block animate-pulse">{text}</span>
        </h3>
        <div className="flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-px-cyan rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
