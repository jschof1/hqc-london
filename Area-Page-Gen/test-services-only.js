const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function testServicesOnly() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== TESTING SERVICES SECTION ONLY ===');
  
  // Extract just the services section from the template
  const servicesMatch = template.match(/\{\{#each services\.categories\}\}([\s\S]*?)\{\{\/each\}\}/);
  if (!servicesMatch) {
    console.log('Services section not found in template');
    return;
  }
  
  const servicesTemplate = `{{#each services.categories}}${servicesMatch[1]}{{/each}}`;
  console.log('Services template length:', servicesTemplate.length);
  
  // Process just this section
  const processed = generator.processTemplate(servicesTemplate, mayfairData);
  
  console.log('Processed length:', processed.length);
  console.log('Contains "Regular Domestic Cleaning":', processed.includes('Regular Domestic Cleaning'));
  console.log('Contains "Weekly, bi-weekly":', processed.includes('Weekly, bi-weekly'));
  console.log('Contains template tags:', processed.includes('{{#each') || processed.includes('{{this}}'));
  
  if (processed.includes('{{#each') || processed.includes('{{this}}')) {
    console.log('Still has template tags, showing first 1000 chars:');
    console.log(processed.substring(0, 1000));
  } else {
    console.log('Successfully processed! Showing first 1000 chars:');
    console.log(processed.substring(0, 1000));
  }
}

testServicesOnly().catch(console.error);
