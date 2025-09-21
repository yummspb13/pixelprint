"use client";

import React from 'react';

interface PixelLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function PixelLoader({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: PixelLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Основной контейнер */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Центральный круг с градиентом */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow animate-spin" style={{ animationDuration: '2s' }}></div>
        
        {/* Внутренний круг */}
        <div className="absolute inset-2 rounded-full bg-white"></div>
        
        {/* Пульсирующие точки по кругу */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const radius = size === 'sm' ? 24 : size === 'md' ? 36 : size === 'lg' ? 48 : 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta animate-pulse"
              style={{
                left: `calc(50% + ${x}px - 6px)`,
                top: `calc(50% + ${y}px - 6px)`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s'
              }}
            ></div>
          );
        })}
        
        {/* Центральная иконка */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Текст с анимацией */}
      <div className="text-center">
        <h3 className="text-xl font-bold bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient mb-2">
          {text}
        </h3>
        <div className="flex space-x-1 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: i === 0 ? '#00AEEF' : i === 1 ? '#EC008C' : '#FFF200',
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
