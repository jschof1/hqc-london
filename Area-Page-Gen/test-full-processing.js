const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function testFullProcessing() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== TESTING FULL TEMPLATE PROCESSING ===');
  
  // Process the template
  const processed = generator.processTemplate(template, mayfairData);
  
  // Check specific sections
  console.log('Checking if services section was processed...');
  
  // Look for the services section
  const servicesMatch = processed.match(/Services We Provide in Mayfair[\s\S]*?<\/section>/);
  if (servicesMatch) {
    const servicesSection = servicesMatch[0];
    console.log('Services section found, length:', servicesSection.length);
    
    // Check if it contains actual service names
    const hasServiceNames = servicesSection.includes('Weekly, bi-weekly') || 
                           servicesSection.includes('Antique furniture') ||
                           servicesSection.includes('Pre-event deep cleaning');
    
    console.log('Contains actual service names:', hasServiceNames);
    
    if (!hasServiceNames) {
      console.log('Services section still contains template tags:');
      const hasTemplateTags = servicesSection.includes('{{#each') || servicesSection.includes('{{this}}');
      console.log('Has template tags:', hasTemplateTags);
      
      if (hasTemplateTags) {
        console.log('Template section preview:');
        console.log(servicesSection.substring(0, 1000));
      }
    }
  } else {
    console.log('Services section not found in processed template');
  }
}

testFullProcessing().catch(console.error);
