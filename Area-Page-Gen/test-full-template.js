const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function testFullTemplate() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== TESTING FULL TEMPLATE PROCESSING ===');
  
  console.log('Full template length:', template.length);
  console.log('Processing full template...');
  
  // Process the full template
  const result = generator.processTemplate(template, mayfairData);
  
  console.log('\nResult length:', result.length);
  console.log('Contains "Regular Domestic Cleaning":', result.includes('Regular Domestic Cleaning'));
  console.log('Contains "Weekly, bi-weekly":', result.includes('Weekly, bi-weekly'));
  console.log('Contains template tags:', result.includes('{{#each') || result.includes('{{this}}'));
  
  if (result.includes('Weekly, bi-weekly')) {
    console.log('SUCCESS!');
    console.log('First 1000 chars:', result.substring(0, 1000));
  } else {
    console.log('FAILED - showing first 1000 chars:');
    console.log(result.substring(0, 1000));
  }
}

testFullTemplate().catch(console.error);
