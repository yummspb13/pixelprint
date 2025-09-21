"use client";
import { useRef } from 'react';

interface PDFGeneratorProps {
  children: React.ReactNode;
  filename?: string;
}

export default function PDFGenerator({ children, filename = "invoice.pdf" }: PDFGeneratorProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      // Показываем инструкции через toast (если доступен)
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        alert(`PDF Generation Instructions:
        
1. Margins: Set to 15mm on all sides
2. Headers & Footers: ❌ Uncheck this option  
3. Background graphics: ✅ Check this option (for logo and colors)
4. Paper size: A4

Click OK to continue to print dialog.`);
      }

      // Создаем новый window для печати
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Failed to open print window. Please check your browser settings.');
        return;
      }

      // Получаем HTML содержимое
      const content = contentRef.current.innerHTML;
      
      // Создаем HTML документ для печати
      const printDocument = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
                padding: 20px;
              }
              
              .font-playfair {
                font-family: 'Playfair Display', serif;
              }
              
              .text-px-fg {
                color: #1a1a1a;
              }
              
              .text-px-muted {
                color: #666;
              }
              
              .bg-gradient-to-r {
                background: linear-gradient(to right, #06b6d4, #ec4899);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              
              .border-px-cyan {
                border-color: #06b6d4;
              }
              
              .space-y-8 > * + * {
                margin-top: 2rem;
              }
              
              .space-y-6 > * + * {
                margin-top: 1.5rem;
              }
              
              .space-y-4 > * + * {
                margin-top: 1rem;
              }
              
              .space-y-2 > * + * {
                margin-top: 0.5rem;
              }
              
              .space-y-1 > * + * {
                margin-top: 0.25rem;
              }
              
              .grid {
                display: grid;
              }
              
              .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
              
              .gap-8 {
                gap: 2rem;
              }
              
              .flex {
                display: flex;
              }
              
              .justify-between {
                justify-content: space-between;
              }
              
              .justify-end {
                justify-content: flex-end;
              }
              
              .items-start {
                align-items: flex-start;
              }
              
              .items-center {
                align-items: center;
              }
              
              .text-left {
                text-align: left;
              }
              
              .text-center {
                text-align: center;
              }
              
              .text-right {
                text-align: right;
              }
              
              .font-bold {
                font-weight: 700;
              }
              
              .font-semibold {
                font-weight: 600;
              }
              
              .text-sm {
                font-size: 0.875rem;
              }
              
              .text-lg {
                font-size: 1.125rem;
              }
              
              .text-2xl {
                font-size: 1.5rem;
              }
              
              .text-3xl {
                font-size: 1.875rem;
              }
              
              .text-4xl {
                font-size: 2.25rem;
              }
              
              .mb-2 {
                margin-bottom: 0.5rem;
              }
              
              .mb-8 {
                margin-bottom: 2rem;
              }
              
              .py-2 {
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
              }
              
              .py-3 {
                padding-top: 0.75rem;
                padding-bottom: 0.75rem;
              }
              
              .pt-2 {
                padding-top: 0.5rem;
              }
              
              .pt-4 {
                padding-top: 1rem;
              }
              
              .pt-6 {
                padding-top: 1.5rem;
              }
              
              .p-8 {
                padding: 2rem;
              }
              
              .w-full {
                width: 100%;
              }
              
              .w-64 {
                width: 16rem;
              }
              
              .border-collapse {
                border-collapse: collapse;
              }
              
              .border-b {
                border-bottom: 1px solid #e5e7eb;
              }
              
              .border-b-2 {
                border-bottom: 2px solid #06b6d4;
              }
              
              .border-t {
                border-top: 1px solid #e5e7eb;
              }
              
              .whitespace-pre-line {
                white-space: pre-line;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
              }
              
              th, td {
                padding: 0.5rem;
                text-align: left;
              }
              
              th {
                font-weight: 600;
                border-bottom: 2px solid #06b6d4;
              }
              
              tr {
                border-bottom: 1px solid #e5e7eb;
              }
              
              .text-green-600 {
                color: #059669;
              }
              
              @media print {
                @page {
                  margin: 15mm;
                  size: A4;
                }
                
                body {
                  padding: 0;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                .no-print {
                  display: none !important;
                }
                
                /* Убеждаемся что фон отображается */
                .bg-gradient-to-r {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                /* Стили для логотипа и градиентов */
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `;

      // Записываем HTML в новое окно
      printWindow.document.write(printDocument);
      printWindow.document.close();

      // Ждем загрузки и печатаем
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div>
      <div ref={contentRef} className="no-print">
        {children}
      </div>
      <button
        onClick={generatePDF}
        className="bg-gradient-to-r from-px-cyan to-px-magenta text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        data-pdf-button
      >
        Download PDF
      </button>
    </div>
  );
}
