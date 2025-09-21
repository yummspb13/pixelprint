"use client";

import React, { useEffect, useState } from 'react';

interface ParticleLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export default function ParticleLoader({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: ParticleLoaderProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32', 
    lg: 'w-40 h-40',
    xl: 'w-48 h-48'
  };

  const colors = ['#00AEEF', '#EC008C', '#FFF200'];

  useEffect(() => {
    // Создать частицы
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2
      });
    }
    setParticles(newParticles);

    // Анимация частиц
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        
        // Отскок от границ
        if (newX <= 0 || newX >= 100) {
          particle.vx *= -1;
          newX = Math.max(0, Math.min(100, newX));
        }
        if (newY <= 0 || newY >= 100) {
          particle.vy *= -1;
          newY = Math.max(0, Math.min(100, newY));
        }
        
        return {
          ...particle,
          x: newX,
          y: newY
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Контейнер с частицами */}
      <div className={`${sizeClasses[size]} relative overflow-hidden rounded-2xl bg-gradient-to-br from-px-cyan/10 via-px-magenta/10 to-px-yellow/10`}>
        {/* Центральный элемент */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full animate-pulse"></div>
        </div>
        
        {/* Частицы */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Волны */}
        <div className="absolute inset-0 rounded-2xl border-2 border-px-cyan/30 animate-pulse"></div>
        <div className="absolute inset-1 rounded-2xl border-2 border-px-magenta/30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute inset-2 rounded-2xl border-2 border-px-yellow/30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Текст */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-px-fg mb-2">{text}</h3>
        <div className="flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full animate-bounce"
              style={{
                backgroundColor: colors[i % colors.length],
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
