/**
 * Migration script to restructure pricing data from individual parameters
 * to full parameter combinations
 * 
 * This script:
 * 1. Reads all existing price rows for all services
 * 2. Groups rows by service and extracts unique parameter values
 * 3. Creates cartesian product of all parameter combinations
 * 4. Creates new rows with full combinations
 * 5. Marks old rows as inactive (isActive = false)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ParameterValues {
  [key: string]: Set<string>;
}

interface Combination {
  attrs: Record<string, string>;
  tiers?: Array<{ qty: number; unit: number }>;
}

/**
 * Generate cartesian product of parameter combinations
 */
function generateCombinations(paramValues: ParameterValues): Record<string, string>[] {
  const paramNames = Object.keys(paramValues);
  
  if (paramNames.length === 0) {
    return [];
  }
  
  // Get all values for each parameter
  const paramArrays = paramNames.map(name => Array.from(paramValues[name]));
  
  // Generate cartesian product
  function cartesianProduct<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map(item => [item]);
    
    const [first, ...rest] = arrays;
    const restProduct = cartesianProduct(rest);
    
    const result: T[][] = [];
    for (const item of first) {
      for (const combination of restProduct) {
        result.push([item, ...combination]);
      }
    }
    return result;
  }
  
  const combinations = cartesianProduct(paramArrays);
  
  // Convert to objects
  return combinations.map(combo => {
    const result: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      result[name] = combo[index];
    });
    return result;
  });
}

/**
 * Find main parameter (the one with _isMain flag or the most options)
 */
function findMainParameter(
  rows: Array<{ attrs: any; tiers: any[] }>
): string | null {
  // Check for _isMain flag
  for (const row of rows) {
    const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
    if (attrs._isMain === 'true') {
      // Find which parameter is in this row
      for (const key of Object.keys(attrs)) {
        if (key !== '_isMain') {
          return key;
        }
      }
    }
  }
  
  // If no _isMain, find parameter with most unique values
  const paramCounts: Record<string, Set<string>> = {};
  
  for (const row of rows) {
    const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
    for (const [key, value] of Object.entries(attrs)) {
      if (key !== '_isMain') {
        if (!paramCounts[key]) {
          paramCounts[key] = new Set();
        }
        paramCounts[key].add(value as string);
      }
    }
  }
  
  let maxParam: string | null = null;
  let maxCount = 0;
  
  for (const [param, values] of Object.entries(paramCounts)) {
    if (values.size > maxCount) {
      maxCount = values.size;
      maxParam = param;
    }
  }
  
  return maxParam;
}

/**
 * Get tiers from a row that matches specific parameter values
 */
function getTiersForParams(
  rows: Array<{ attrs: any; tiers: any[] }>,
  paramValues: Record<string, string>
): Array<{ qty: number; unit: number }> {
  for (const row of rows) {
    const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
    const attrsForMatch = { ...attrs };
    delete attrsForMatch._isMain;
    
    // Check if this row matches the parameter values
    let matches = true;
    for (const [key, value] of Object.entries(paramValues)) {
      if (attrsForMatch[key] !== value) {
        matches = false;
        break;
      }
    }
    
    if (matches && row.tiers && row.tiers.length > 0) {
      return row.tiers.map(t => ({ qty: t.qty, unit: t.unit }));
    }
  }
  
  return [];
}

async function migrateService(serviceSlug: string) {
  console.log(`\n🔄 Processing service: ${serviceSlug}`);
  
  // Get service
  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    include: {
      rows: {
        where: { isActive: true },
        include: { tiers: true }
      }
    }
  });
  
  if (!service) {
    console.log(`⚠️ Service ${serviceSlug} not found, skipping`);
    return;
  }
  
  if (service.rows.length === 0) {
    console.log(`ℹ️ Service ${serviceSlug} has no rows, skipping`);
    return;
  }
  
  console.log(`📊 Found ${service.rows.length} active rows`);
  
  // Extract unique parameter values
  const paramValues: ParameterValues = {};
  
  for (const row of service.rows) {
    const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
    
    for (const [key, value] of Object.entries(attrs)) {
      // Skip system fields
      if (key === '_isMain' || !value) continue;
      
      if (!paramValues[key]) {
        paramValues[key] = new Set();
      }
      paramValues[key].add(value as string);
    }
  }
  
  console.log(`📋 Found parameters:`, Object.keys(paramValues));
  console.log(`📋 Parameter values:`, Object.fromEntries(
    Object.entries(paramValues).map(([k, v]) => [k, Array.from(v)])
  ));
  
  // Check if already migrated (rows have multiple parameters in attrs)
  let alreadyMigrated = true;
  for (const row of service.rows) {
    const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
    const attrsCount = Object.keys(attrs).filter(k => k !== '_isMain').length;
    if (attrsCount === 1) {
      alreadyMigrated = false;
      break;
    }
  }
  
  if (alreadyMigrated) {
    console.log(`✅ Service ${serviceSlug} already appears to be migrated (rows have multiple params), skipping`);
    return;
  }
  
  // Generate all combinations
  const combinations = generateCombinations(paramValues);
  console.log(`🔢 Generated ${combinations.length} combinations`);
  
  if (combinations.length === 0) {
    console.log(`⚠️ No combinations generated, skipping`);
    return;
  }
  
  // Find main parameter for tier inheritance
  const mainParam = findMainParameter(service.rows);
  console.log(`🎯 Main parameter: ${mainParam || 'none'}`);
  
  // Create new rows with combinations
  let created = 0;
  let errors = 0;
  
  for (const combination of combinations) {
    try {
      // Try to get tiers from existing rows
      // First try to get from main parameter row
      let tiers: Array<{ qty: number; unit: number }> = [];
      
      if (mainParam && combination[mainParam]) {
        // Try to find row with this main param value
        const mainParamValue = combination[mainParam];
        tiers = getTiersForParams(service.rows, { [mainParam]: mainParamValue });
      }
      
      // If no tiers found, try any row
      if (tiers.length === 0) {
        for (const row of service.rows) {
          if (row.tiers && row.tiers.length > 0) {
            tiers = row.tiers.map(t => ({ qty: t.qty, unit: t.unit }));
            break;
          }
        }
      }
      
      // Create new row with combination
      const newRow = await prisma.priceRow.create({
        data: {
          serviceId: service.id,
          attrs: combination,
          ruleKind: 'tiers',
          unit: null,
          setup: null,
          fixed: null,
          isActive: true
        }
      });
      
      // Create tiers if we found any
      if (tiers.length > 0) {
        await prisma.tier.createMany({
          data: tiers.map(tier => ({
            rowId: newRow.id,
            qty: tier.qty,
            unit: tier.unit
          }))
        });
        console.log(`  ✅ Created combination with ${tiers.length} tiers:`, combination);
      } else {
        console.log(`  ⚠️ Created combination without tiers (needs manual setup):`, combination);
      }
      
      created++;
    } catch (error: any) {
      console.error(`  ❌ Error creating combination:`, error.message);
      errors++;
    }
  }
  
  // Mark old rows as inactive
  if (created > 0) {
    const oldRowIds = service.rows.map(r => r.id);
    await prisma.priceRow.updateMany({
      where: { id: { in: oldRowIds } },
      data: { isActive: false }
    });
    console.log(`📝 Marked ${oldRowIds.length} old rows as inactive`);
  }
  
  console.log(`✅ Migration complete for ${serviceSlug}: ${created} new rows created, ${errors} errors`);
}

async function main() {
  console.log('🚀 Starting migration to parameter combinations...\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Get all services
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true, name: true }
    });
    
    console.log(`📦 Found ${services.length} active services\n`);
    
    // Migrate each service
    for (const service of services) {
      await migrateService(service.slug);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
// Support both ESM and CommonJS
const isMainModule = typeof require !== 'undefined' && require.main === module;
if (isMainModule) {
  main().catch(console.error);
}

export { migrateService, main };

