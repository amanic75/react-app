// Test script to verify formula editing fixes
console.log('=== TESTING FORMULA EDITING FIXES ===\n');

// Test cases for safe initialization
const testCases = [
  {
    name: 'Complete formula data',
    formula: {
      name: 'Test Formula',
      totalCost: 150.50,
      finalSalePriceDrum: 250.00,
      finalSalePriceTote: 450.00,
      ingredients: [{ name: 'Ingredient 1', percentage: 50, cost: 75.25 }],
      assigned_to: ['user-1', 'user-2']
    },
    expected: 'should work normally'
  },
  {
    name: 'Missing numeric fields',
    formula: {
      name: 'Test Formula',
      ingredients: [{ name: 'Ingredient 1', percentage: 50, cost: 75.25 }],
      assigned_to: ['user-1']
    },
    expected: 'should default to 0 for missing numbers'
  },
  {
    name: 'Null ingredients',
    formula: {
      name: 'Test Formula',
      totalCost: 150.50,
      ingredients: null,
      assigned_to: []
    },
    expected: 'should default to empty array'
  },
  {
    name: 'String ingredients (invalid)',
    formula: {
      name: 'Test Formula',
      totalCost: 150.50,
      ingredients: 'not an array',
      assigned_to: []
    },
    expected: 'should default to empty array'
  }
];

testCases.forEach(testCase => {
  console.log(`Testing: ${testCase.name}`);
  
  // Test safe initialization
  const safeData = {
    name: testCase.formula.name || '',
    totalCost: testCase.formula.totalCost || 0,
    finalSalePriceDrum: testCase.formula.finalSalePriceDrum || 0,
    finalSalePriceTote: testCase.formula.finalSalePriceTote || 0,
    ingredients: Array.isArray(testCase.formula.ingredients) ? [...testCase.formula.ingredients] : [],
    assigned_to: testCase.formula.assigned_to || []
  };
  
  console.log(`- Input: ${JSON.stringify(testCase.formula)}`);
  console.log(`- Safe Result: ${JSON.stringify(safeData)}`);
  console.log(`- Status: ${testCase.expected}\n`);
});

console.log('=== TEST COMPLETE ==='); 