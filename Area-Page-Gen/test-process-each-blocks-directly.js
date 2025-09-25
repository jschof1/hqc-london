const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function testProcessEachBlocksDirectly() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== TESTING PROCESS EACH BLOCKS DIRECTLY ===');
  
  // Extract just the services section from the template
  const servicesMatch = template.match(/\{\{#each services\.categories\}\}([\s\S]*?)\{\{\/each\}\}/);
  if (!servicesMatch) {
    console.log('Services section not found in template');
    return;
  }
  
  const servicesTemplate = `{{#each services.categories}}${servicesMatch[1]}{{/each}}`;
  
  console.log('Services template length:', servicesTemplate.length);
  console.log('Services template preview:', servicesTemplate.substring(0, 200) + '...');
  
  // Call processEachBlocks directly
  console.log('\nCalling processEachBlocks...');
  const result = generator.processEachBlocks(servicesTemplate, mayfairData);
  
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

testProcessEachBlocksDirectly().catch(console.error);
