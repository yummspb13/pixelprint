import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Читаем CSV файл
    const csvPath = path.join(process.cwd(), 'advanced-prices.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Парсим CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    console.log('CSV Headers:', headers);
    
    // Группируем данные по услугам
    const servicesMap = new Map();
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue;
      
      const service = values[0];
      const category = values[1];
      const slug = values[2];
      const sides = values[3];
      const color = values[4] || '';
      const qty = parseInt(values[5]);
      const price = parseFloat(values[6]);
      const netPrice = parseFloat(values[7]);
      const vat = parseFloat(values[8]);
      const priceWithVat = parseFloat(values[9]);
      
      if (!servicesMap.has(slug)) {
        servicesMap.set(slug, {
          name: service,
          category: category,
          slug: slug,
          rows: []
        });
      }
      
      servicesMap.get(slug).rows.push({
        sides: sides,
        color: color,
        qty: qty,
        price: price,
        netPrice: netPrice,
        vat: vat,
        priceWithVat: priceWithVat
      });
    }
    
    console.log('Parsed services:', Array.from(servicesMap.keys()));
    
    // Очищаем существующие данные
    await prisma.tier.deleteMany();
    await prisma.priceRow.deleteMany();
    await prisma.service.deleteMany();
    
    // Создаем услуги и их конфигурации
    for (const [slug, serviceData] of servicesMap) {
      console.log(`Creating service: ${slug}`);
      
      // Создаем услугу
      const service = await prisma.service.create({
        data: {
          name: serviceData.name,
          category: serviceData.category,
          slug: slug,
          isActive: true,
          configuratorEnabled: true
        }
      });
      
      // Группируем строки по атрибутам (Sides и Color)
      const rowsByAttrs = new Map();
      
      for (const row of serviceData.rows) {
        const attrs: { Sides: any; Color?: any } = { Sides: row.sides };
        if (row.color) {
          attrs.Color = row.color;
        }
        const key = JSON.stringify(attrs);
        if (!rowsByAttrs.has(key)) {
          rowsByAttrs.set(key, { attrs, rows: [] });
        }
        rowsByAttrs.get(key).rows.push(row);
      }
      
      // Создаем строки цен
      for (const [attrsKey, { attrs, rows }] of rowsByAttrs) {
        // Сортируем по количеству
        rows.sort((a: any, b: any) => a.qty - b.qty);
        
        const priceRow = await prisma.priceRow.create({
          data: {
            serviceId: service.id,
            attrs: attrs,
            ruleKind: 'tiers',
            isActive: true
          }
        });
        
        // Создаем тиры
        for (const row of rows) {
          await prisma.tier.create({
            data: {
              rowId: priceRow.id,
              qty: row.qty,
              unit: row.price
            }
          });
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Imported ${servicesMap.size} services`,
      services: Array.from(servicesMap.keys())
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}