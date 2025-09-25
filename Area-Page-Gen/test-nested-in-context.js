const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function testNestedInContext() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== TESTING NESTED PROCESSING IN CONTEXT ===');
  
  // Extract just the services section from the template
  const servicesMatch = template.match(/\{\{#each services\.categories\}\}([\s\S]*?)\{\{\/each\}\}/);
  if (!servicesMatch) {
    console.log('Services section not found in template');
    return;
  }
  
  const servicesTemplate = `{{#each services.categories}}${servicesMatch[1]}{{/each}}`;
  
  // Manually process the outer loop to see what happens
  const array = mayfairData.services.categories;
  const blockContent = servicesMatch[1];
  
  console.log('Processing outer loop manually...');
  const result = array.map((item, index) => {
    console.log(`\n--- Processing item ${index}: ${item.name} ---`);
    let itemContent = blockContent;
    
    // Replace {{this}} with the current item value (for primitive arrays)
    itemContent = itemContent.replace(/\{\{this\}\}/g, typeof item === 'string' ? item : '');
    
    // Replace object properties
    if (typeof item === 'object') {
      itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
        const value = item[prop] || match;
        console.log(`Replacing {{${prop}}} with: ${value}`);
        return value;
      });
    }
    
    // Check if the itemContent contains the nested loop
    console.log('Item content contains {{#each this.services}}:', itemContent.includes('{{#each this.services}}'));
    
    // Handle nested {{#each this.property}} within object context
    if (typeof item === 'object') {
      const beforeNested = itemContent;
      itemContent = itemContent.replace(/\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (nestedMatch, prop, nestedBlockContent) => {
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
      
      console.log('Nested processing changed content:', beforeNested !== itemContent);
    }
    
    return itemContent;
  }).join('');
  
  console.log('\nFinal result length:', result.length);
  console.log('Contains "Weekly, bi-weekly":', result.includes('Weekly, bi-weekly'));
  console.log('Contains template tags:', result.includes('{{#each') || result.includes('{{this}}'));
  
  if (result.includes('Weekly, bi-weekly')) {
    console.log('SUCCESS! Nested processing worked!');
    console.log('First 1000 chars:', result.substring(0, 1000));
  }
}

testNestedInContext().catch(console.error);
