const fs = require('fs');
const path = require('path');

// Принудительно компилируем Tailwind CSS
const tailwindConfig = require('./tailwind.config.ts');

// Создаем временный CSS файл с принудительной компиляцией
const tempCss = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS переменные для темной темы */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
  
  /* Pixel Print цветовая схема */
  --px-bg: #fafafa;
  --px-fg: #1a1a1a;
  --px-muted: #6b7280;
  --px-cyan: #00AEEF;
  --px-magenta: #EC008C;
  --px-yellow: #eab308;
  --px-key: #1a1a1a;
}

/* Предотвращение горизонтальной прокрутки */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Плавная прокрутка к якорям */
html {
  scroll-behavior: smooth;
}

/* анимация для beams */
@keyframes beam-float {
  from { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(0,-10px,0) scale(1.02); }
  to { transform: translate3d(0,0,0) scale(1); }
}
.animate-beam-slow   { animation: beam-float 14s ease-in-out infinite; }
.animate-beam-slower { animation: beam-float 18s ease-in-out infinite; }

/* анимация для градиентного текста */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease-in-out infinite;
}

/* Принудительно добавляем основные классы */
.bg-px-cyan { background-color: var(--px-cyan) !important; }
.text-px-fg { color: var(--px-fg) !important; }
.text-px-muted { color: var(--px-muted) !important; }
.font-playfair { font-family: 'Playfair Display', serif !important; }
`;

// Записываем временный CSS файл
fs.writeFileSync('./temp-globals.css', tempCss);

console.log('✅ Временный CSS файл создан');
