// Test script to verify ingredients array handling
console.log('=== TESTING INGREDIENTS ARRAY HANDLING ===\n');

// Test cases
const testCases = [
  {
    name: 'Normal array',
    ingredients: [{ name: 'Test', percentage: 50, cost: 10 }],
    expected: 'should work'
  },
  {
    name: 'Null ingredients',
    ingredients: null,
    expected: 'should default to empty array'
  },
  {
    name: 'Undefined ingredients',
    ingredients: undefined,
    expected: 'should default to empty array'
  },
  {
    name: 'String ingredients (invalid)',
    ingredients: 'not an array',
    expected: 'should default to empty array'
  },
  {
    name: 'Empty array',
    ingredients: [],
    expected: 'should work'
  }
];

testCases.forEach(testCase => {
  console.log(`Testing: ${testCase.name}`);
  
  // Test the Array.isArray check
  const isArray = Array.isArray(testCase.ingredients);
  const safeIngredients = Array.isArray(testCase.ingredients) ? testCase.ingredients : [];
  
  console.log(`- Input: ${JSON.stringify(testCase.ingredients)}`);
  console.log(`- Is Array: ${isArray}`);
  console.log(`- Safe Result: ${JSON.stringify(safeIngredients)}`);
  console.log(`- Length: ${safeIngredients.length}`);
  console.log(`- Status: ${testCase.expected}\n`);
});

console.log('=== TEST COMPLETE ==='); 