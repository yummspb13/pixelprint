// Test script to verify ServiceEditor logic
console.log('Testing ServiceEditor tier parsing logic...');

// Simulate database rows structure
const mockRows = [
  {
    id: 1,
    attrs: { Color: 'BW', _isMain: 'true', _includeVat: 'true' },
    tiers: [{ id: 1, qty: 100, unit: 0.22 }, { id: 2, qty: 200, unit: 0.17 }],
    isActive: true
  },
  {
    id: 2,
    attrs: { Color: 'Color', _isMain: 'true', _includeVat: 'true' },
    tiers: [{ id: 3, qty: 100, unit: 0.30 }, { id: 4, qty: 200, unit: 0.25 }],
    isActive: true
  },
  {
    id: 3,
    attrs: { Color: 'BW', Sides: 'Single Sided (S/S)', _isMain: 'true', _includeVat: 'true' },
    tiers: [{ id: 5, qty: 100, unit: 0.22 }, { id: 6, qty: 200, unit: 0.17 }],
    isActive: true
  },
  {
    id: 4,
    attrs: { Color: 'Color', Sides: 'Single Sided (S/S)', _isMain: 'true', _includeVat: 'true' },
    tiers: [{ id: 7, qty: 100, unit: 0.30 }, { id: 8, qty: 200, unit: 0.25 }],
    isActive: true
  }
];

// Test 1: Single parameter rows should have tiers
console.log('\n=== Test 1: Single parameter rows ===');
const singleParamRows = mockRows.filter(r => {
  const attrs = r.attrs;
  const paramCount = Object.keys(attrs).filter(k => 
    !['_isMain', '_includeVat'].includes(k) && attrs[k]
  ).length;
  return paramCount === 1;
});
console.log('Single param rows:', singleParamRows.length);
singleParamRows.forEach(r => {
  console.log(`  Row ${r.id}: ${JSON.stringify(r.attrs)}, tiers: ${r.tiers.length}`);
});

// Test 2: Combination rows
console.log('\n=== Test 2: Combination rows ===');
const comboRows = mockRows.filter(r => {
  const attrs = r.attrs;
  const paramCount = Object.keys(attrs).filter(k => 
    !['_isMain', '_includeVat'].includes(k) && attrs[k]
  ).length;
  return paramCount > 1;
});
console.log('Combo rows:', comboRows.length);
comboRows.forEach(r => {
  console.log(`  Row ${r.id}: ${JSON.stringify(r.attrs)}, tiers: ${r.tiers.length}`);
});

// Test 3: Expected behavior
console.log('\n=== Test 3: Expected behavior ===');
console.log('For "Color" parameter:');
console.log('  - BW option should have tiers from row 1 (single param)');
console.log('  - Color option should have tiers from row 2 (single param)');
console.log('For "Sides" parameter:');
console.log('  - Single Sided option should have tiers from rows 3 and 4 (combinations)');
console.log('  - But currently: tiers from combinations are NOT added to options');

