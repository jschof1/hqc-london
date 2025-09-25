// Test the depth counting logic on the actual services template
const servicesTemplate = `{{#each services.categories}}
            <div class="bg-navy/70 border border-gold rounded-xl p-6">
              <h3 class="font-semibold text-gold text-lg mb-4">{{name}}</h3>
              <ul class="space-y-2">
                {{#each this.services}}
                <li class="text-white/80 text-sm flex items-start gap-2">
                  <i class="fas fa-check text-gold text-xs mt-1 flex-shrink-0"></i>
                  <span>{{this}}</span>
                </li>
                {{/each}}
              </ul>
            </div>
            {{/each}}`;

console.log('=== TESTING DEPTH COUNTING ON SERVICES TEMPLATE ===');
console.log('Template length:', servicesTemplate.length);

// Find all {{#each}} and {{/each}} tags
const eachMatches = [...servicesTemplate.matchAll(/\{\{#each/g)];
const endEachMatches = [...servicesTemplate.matchAll(/\{\{\/each\}/g)];

console.log('\n{{#each}} tags found:', eachMatches.length);
eachMatches.forEach((match, index) => {
  console.log(`{{#each ${index} at position:`, match.index, 'content:', servicesTemplate.substring(match.index, match.index + 50));
});

console.log('\n{{/each}} tags found:', endEachMatches.length);
endEachMatches.forEach((match, index) => {
  console.log(`{{/each ${index} at position:`, match.index, 'content:', servicesTemplate.substring(match.index, match.index + 20));
});

// Test the depth counting logic
console.log('\n=== TESTING DEPTH COUNTING ===');
let depth = 1;
let currentIndex = 7; // After "{{#each"
let endIndex = -1;

while (depth > 0 && currentIndex < servicesTemplate.length) {
  const nextEach = servicesTemplate.indexOf('{{#each', currentIndex);
  const nextEndEach = servicesTemplate.indexOf('{{/each}}', currentIndex);
  
  console.log(`Current position: ${currentIndex}, depth: ${depth}`);
  console.log(`Next {{#each at: ${nextEach}, Next {{/each}} at: ${nextEndEach}`);
  
  if (nextEndEach === -1) {
    console.log('No more {{/each}} found');
    break;
  }
  
  if (nextEach !== -1 && nextEach < nextEndEach) {
    depth++;
    currentIndex = nextEach + 7;
    console.log(`Found nested {{#each}, depth increased to ${depth}`);
  } else {
    depth--;
    if (depth === 0) {
      endIndex = nextEndEach;
      console.log(`Found matching {{/each}} at position ${endIndex}`);
    }
    currentIndex = nextEndEach + 9;
    console.log(`Found {{/each}}, depth decreased to ${depth}`);
  }
}

console.log('\nFinal result:');
console.log('End index:', endIndex);
if (endIndex !== -1) {
  console.log('Block content length:', endIndex - 7);
  console.log('Block content preview:', servicesTemplate.substring(7, endIndex).substring(0, 200) + '...');
}
