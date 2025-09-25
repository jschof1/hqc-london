const testString = `{{#each this.services}}
<li>{{this}}</li>
{{/each}}`;

console.log('Testing nested regex...');
console.log('Test string:', testString);

// Test the regex pattern
const regex = /\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
const matches = [...testString.matchAll(regex)];

console.log('Matches found:', matches.length);
matches.forEach((match, index) => {
  console.log(`Match ${index}:`, {
    fullMatch: match[0],
    property: match[1],
    content: match[2]
  });
});

// Test with actual template content
const templateContent = `              <ul class="space-y-2">
                {{#each this.services}}
                <li class="text-white/80 text-sm flex items-start gap-2">
                  <i class="fas fa-check text-gold text-xs mt-1 flex-shrink-0"></i>
                  <span>{{this}}</span>
                </li>
                {{/each}}
              </ul>`;

console.log('\nTesting with actual template content...');
const templateMatches = [...templateContent.matchAll(regex)];
console.log('Template matches found:', templateMatches.length);
templateMatches.forEach((match, index) => {
  console.log(`Template match ${index}:`, {
    fullMatch: match[0].substring(0, 100) + '...',
    property: match[1],
    content: match[2].substring(0, 100) + '...'
  });
});
