const fs = require('fs').promises;
const path = require('path');

// Load the generator class
const AreaPageGenerator = require('./scripts/generate-area-pages.js');

async function testNestedProcessingSimple() {
  const generator = new AreaPageGenerator();
  
  // Load data and template
  const [areaData, template] = await Promise.all([
    generator.loadAreaData(),
    generator.loadTemplate()
  ]);
  
  const mayfairData = areaData.mayfair;
  
  console.log('=== TESTING NESTED PROCESSING SIMPLE ===');
  
  // Test the nested processing on a simple template
  const testTemplate = `{{#each services.categories}}
<div class="category">
  <h3>{{name}}</h3>
  <ul>
    {{#each this.services}}
    <li>{{this}}</li>
    {{/each}}
  </ul>
</div>
{{/each}}`;
  
  console.log('Test template:');
  console.log(testTemplate);
  
  // Process the template
  const result = generator.processTemplate(testTemplate, mayfairData);
  
  console.log('\nResult:');
  console.log(result);
  
  console.log('\nContains "Weekly, bi-weekly":', result.includes('Weekly, bi-weekly'));
  console.log('Contains "Antique furniture":', result.includes('Antique furniture'));
}

testNestedProcessingSimple().catch(console.error);
