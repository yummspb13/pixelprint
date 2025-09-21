"use client";

import React from 'react';

interface ThreeDLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function ThreeDLoader({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: ThreeDLoaderProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28', 
    lg: 'w-36 h-36',
    xl: 'w-44 h-44'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* 3D контейнер */}
      <div className={`${sizeClasses[size]} relative`} style={{ perspective: '1000px' }}>
        {/* Основной куб */}
        <div 
          className="absolute inset-0 transform-gpu animate-spin"
          style={{ 
            animationDuration: '3s',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Передняя грань */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-px-cyan to-px-magenta rounded-lg"
            style={{ transform: 'translateZ(20px)' }}
          ></div>
          
          {/* Задняя грань */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-px-magenta to-px-yellow rounded-lg"
            style={{ transform: 'translateZ(-20px) rotateY(180deg)' }}
          ></div>
          
          {/* Левая грань */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-px-yellow to-px-cyan rounded-lg"
            style={{ transform: 'rotateY(-90deg) translateZ(20px)' }}
          ></div>
          
          {/* Правая грань */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-px-cyan to-px-magenta rounded-lg"
            style={{ transform: 'rotateY(90deg) translateZ(20px)' }}
          ></div>
          
          {/* Верхняя грань */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-px-magenta to-px-yellow rounded-lg"
            style={{ transform: 'rotateX(90deg) translateZ(20px)' }}
          ></div>
          
          {/* Нижняя грань */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-px-yellow to-px-cyan rounded-lg"
            style={{ transform: 'rotateX(-90deg) translateZ(20px)' }}
          ></div>
        </div>
        
        {/* Пульсирующие частицы вокруг куба */}
        {[...Array(6)].map((_, i) => {
          const angle = (i * 60) * (Math.PI / 180);
          const radius = size === 'sm' ? 30 : size === 'md' ? 42 : size === 'lg' ? 54 : 66;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-pulse"
              style={{
                left: `calc(50% + ${x}px - 6px)`,
                top: `calc(50% + ${y}px - 6px)`,
                backgroundColor: i % 3 === 0 ? '#00AEEF' : i % 3 === 1 ? '#EC008C' : '#FFF200',
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            ></div>
          );
        })}
      </div>

      {/* Текст с 3D эффектом */}
      <div className="text-center">
        <h3 
          className="text-2xl font-bold mb-2"
          style={{
            background: 'linear-gradient(45deg, #00AEEF, #EC008C, #FFF200)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 3s ease-in-out infinite'
          }}
        >
          {text}
        </h3>
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: i === 0 ? '#00AEEF' : i === 1 ? '#EC008C' : '#FFF200',
                animationDelay: `${i * 0.3}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
