const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function testStepByStep() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== STEP BY STEP TESTING ===');
  
  // Extract just the services section from the template
  const servicesMatch = template.match(/\{\{#each services\.categories\}\}([\s\S]*?)\{\{\/each\}\}/);
  if (!servicesMatch) {
    console.log('Services section not found in template');
    return;
  }
  
  const servicesTemplate = `{{#each services.categories}}${servicesMatch[1]}{{/each}}`;
  
  // Test the outer loop processing manually
  const array = mayfairData.services.categories;
  const blockContent = servicesMatch[1];
  
  console.log('Processing outer loop...');
  const result = array.map((item, index) => {
    console.log(`\n--- Item ${index}: ${item.name} ---`);
    let itemContent = blockContent;
    
    // Step 1: Replace {{this}}
    itemContent = itemContent.replace(/\{\{this\}\}/g, typeof item === 'string' ? item : '');
    
    // Step 2: Replace object properties
    if (typeof item === 'object') {
      itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
        return item[prop] || match;
      });
    }
    
    // Step 3: Check if nested loop exists
    console.log('Contains {{#each this.services}}:', itemContent.includes('{{#each this.services}}'));
    
    // Step 4: Test the nested regex directly
    const nestedRegex = /\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    const nestedMatches = [...itemContent.matchAll(nestedRegex)];
    console.log('Nested regex matches:', nestedMatches.length);
    
    if (nestedMatches.length > 0) {
      console.log('Found nested matches, processing...');
      itemContent = itemContent.replace(nestedRegex, (nestedMatch, prop, nestedBlockContent) => {
        console.log(`Processing nested {{#each this.${prop}}}`);
        const nestedArray = item[prop];
        if (!Array.isArray(nestedArray)) {
          console.log(`Nested array not found for property: ${prop}`);
          return '';
        }
        console.log(`Found nested array with ${nestedArray.length} items`);
        
        return nestedArray.map(nestedItem => {
          let nestedContent = nestedBlockContent;
          nestedContent = nestedContent.replace(/\{\{this\}\}/g, typeof nestedItem === 'string' ? nestedItem : '');
          return nestedContent;
        }).join('');
      });
    } else {
      console.log('No nested matches found');
    }
    
    return itemContent;
  }).join('');
  
  console.log('\nFinal result:');
  console.log('Length:', result.length);
  console.log('Contains "Weekly, bi-weekly":', result.includes('Weekly, bi-weekly'));
  console.log('Contains template tags:', result.includes('{{#each') || result.includes('{{this}}'));
  
  if (result.includes('Weekly, bi-weekly')) {
    console.log('SUCCESS!');
  } else {
    console.log('FAILED - showing first 1000 chars:');
    console.log(result.substring(0, 1000));
  }
}

testStepByStep().catch(console.error);
