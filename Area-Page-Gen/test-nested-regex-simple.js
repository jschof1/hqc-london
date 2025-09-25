// Test the nested regex on the actual content
const testContent = `              <ul class="space-y-2">
                {{#each this.services}}
                <li class="text-white/80 text-sm flex items-start gap-2">
                  <i class="fas fa-check text-gold text-xs mt-1 flex-shrink-0"></i>
                  <span>{{this}}</span>
                </li>
                {{/each}}
              </ul>`;

console.log('Testing nested regex on actual content...');
console.log('Test content:');
console.log(testContent);

// Test the regex pattern
const regex = /\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
const matches = [...testContent.matchAll(regex)];

console.log('\nMatches found:', matches.length);
matches.forEach((match, index) => {
  console.log(`Match ${index}:`, {
    fullMatch: match[0].substring(0, 100) + '...',
    property: match[1],
    content: match[2].substring(0, 100) + '...'
  });
});

// Test with the actual data
const testData = {
  services: [
    "Weekly, bi-weekly, or monthly cleaning schedules",
    "Deep cleaning of reception rooms and entertaining spaces"
  ]
};

console.log('\nTesting replacement...');
let processed = testContent.replace(/\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, prop, blockContent) => {
  console.log('Processing:', { match: match.substring(0, 50) + '...', prop, blockContent: blockContent.substring(0, 50) + '...' });
  const nestedArray = testData[prop];
  if (!Array.isArray(nestedArray)) return '';
  
  return nestedArray.map(nestedItem => {
    let nestedContent = blockContent;
    nestedContent = nestedContent.replace(/\{\{this\}\}/g, typeof nestedItem === 'string' ? nestedItem : '');
    return nestedContent;
  }).join('');
});

console.log('\nFinal result:');
console.log(processed);
