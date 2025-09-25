const testTemplate = `{{#each this.services}}
<li>{{this}}</li>
{{/each}}`;

console.log('Testing regex pattern...');
console.log('Template:', testTemplate);

// Test the regex pattern
const regex = /\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
const matches = [...testTemplate.matchAll(regex)];

console.log('Matches found:', matches.length);
matches.forEach((match, index) => {
  console.log(`Match ${index}:`, {
    fullMatch: match[0],
    property: match[1],
    content: match[2]
  });
});

// Test with actual data
const testData = {
  services: [
    "Weekly, bi-weekly, or monthly cleaning schedules",
    "Deep cleaning of reception rooms and entertaining spaces"
  ]
};

console.log('\nTesting replacement...');
let processed = testTemplate.replace(/\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, prop, blockContent) => {
  console.log('Processing:', { match, prop, blockContent });
  const nestedArray = testData[prop];
  if (!Array.isArray(nestedArray)) return '';
  
  return nestedArray.map(nestedItem => {
    let nestedContent = blockContent;
    nestedContent = nestedContent.replace(/\{\{this\}\}/g, typeof nestedItem === 'string' ? nestedItem : '');
    return nestedContent;
  }).join('');
});

console.log('Final result:', processed);
