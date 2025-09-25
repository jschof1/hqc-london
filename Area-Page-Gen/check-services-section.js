const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function checkServicesSection() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== CHECKING SERVICES SECTION ===');
  
  // Process the full template
  const result = generator.processTemplate(template, mayfairData);
  
  // Find the services section
  const servicesMatch = result.match(/Services We Provide in Mayfair[\s\S]*?<\/section>/);
  if (servicesMatch) {
    const servicesSection = servicesMatch[0];
    console.log('Services section found, length:', servicesSection.length);
    
    // Check if it contains actual service names
    const hasServiceNames = servicesSection.includes('Weekly, bi-weekly') || 
                           servicesSection.includes('Antique furniture') ||
                           servicesSection.includes('Pre-event deep cleaning');
    
    console.log('Contains actual service names:', hasServiceNames);
    
    if (hasServiceNames) {
      console.log('SUCCESS! Services section is properly populated');
      console.log('First 1000 chars of services section:');
      console.log(servicesSection.substring(0, 1000));
    } else {
      console.log('Services section still has issues');
      console.log('First 1000 chars of services section:');
      console.log(servicesSection.substring(0, 1000));
    }
  } else {
    console.log('Services section not found in processed template');
  }
}

checkServicesSection().catch(console.error);
