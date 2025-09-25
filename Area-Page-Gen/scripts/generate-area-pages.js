/**
 * Area Page Generator
 * Generates individual area-specific pages from JSON data and HTML template
 */

const fs = require('fs').promises;
const path = require('path');

class AreaPageGenerator {
  constructor() {
    this.templatePath = path.join(__dirname, '..', 'templates', 'area-template.html');
    this.dataPath = path.join(__dirname, '..', 'data', 'area-data.json');
    this.outputDir = path.join(__dirname, '..', 'areas');
  }

  /**
   * Load and parse the area data JSON
   */
  async loadAreaData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading area data:', error);
      throw error;
    }
  }

  /**
   * Load the HTML template
   */
  async loadTemplate() {
    try {
      return await fs.readFile(this.templatePath, 'utf8');
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }

  /**
   * Simple template engine - replaces {{variable}} and {{#each}} blocks
   */
  processTemplate(template, data) {
    let processed = template;

    // Handle {{#each}} blocks FIRST (before simple variable replacement)
    // Use a more sophisticated approach that handles nested blocks
    processed = this.processEachBlocks(processed, data);

    // Handle {{#repeat}} blocks for star ratings
    processed = processed.replace(/\{\{#repeat\s+(\w+)\}\}([\s\S]*?)\{\{\/repeat\}\}/g, (match, countPath, blockContent) => {
      const count = this.getNestedValue(data, countPath) || 0;
      return blockContent.repeat(count);
    });

    // Replace simple variables {{variable}} AFTER loops
    processed = processed.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      return this.getNestedValue(data, path) || match;
    });

    // Convert postcodes array to string
    if (data.postcodes && Array.isArray(data.postcodes)) {
      processed = processed.replace(/\{\{postcodes\}\}/g, data.postcodes.join(', '));
    }

    return processed;
  }


  /**
   * Process {{#each}} blocks with proper nesting support
   */
  processEachBlocks(template, data) {
    let processed = template;
    
    // Find all {{#each}} blocks and process them
    const eachRegex = /\{\{#each\s+(\w+(?:\.\w+)*)\}\}/g;
    let match;
    
    while ((match = eachRegex.exec(processed)) !== null) {
      const startIndex = match.index;
      const arrayPath = match[1];
      
      // Find the matching {{/each}} by counting nested blocks
      let depth = 1;
      let currentIndex = match.index + match[0].length;
      let endIndex = -1;
      
      while (depth > 0 && currentIndex < processed.length) {
        const nextEach = processed.indexOf('{{#each', currentIndex);
        const nextEndEach = processed.indexOf('{{/each}}', currentIndex);
        
        if (nextEndEach === -1) break;
        
        if (nextEach !== -1 && nextEach < nextEndEach) {
          depth++;
          currentIndex = nextEach + 7;
        } else {
          depth--;
          if (depth === 0) {
            endIndex = nextEndEach;
          }
          currentIndex = nextEndEach + 9;
        }
      }
      
      if (endIndex === -1) {
        console.warn(`No matching {{/each}} found for {{#each ${arrayPath}}}`);
        continue;
      }
      
      const blockContent = processed.substring(match.index + match[0].length, endIndex);
      const array = this.getNestedValue(data, arrayPath);
      
      if (!Array.isArray(array)) {
        processed = processed.substring(0, startIndex) + processed.substring(endIndex + 9);
        continue;
      }
      
      const replacement = array.map(item => {
        let itemContent = blockContent;
        
        // Replace {{this}} with the current item value (for primitive arrays only)
        if (typeof item === 'string') {
          itemContent = itemContent.replace(/\{\{this\}\}/g, item);
        }
        
        // Replace object properties
        if (typeof item === 'object') {
          itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
            return item[prop] || match;
          });
        }
        
        // Handle nested {{#each this.property}} within object context
        if (typeof item === 'object') {
          itemContent = itemContent.replace(/\{\{#each\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (nestedMatch, prop, nestedBlockContent) => {
            const nestedArray = item[prop];
            if (!Array.isArray(nestedArray)) return '';
            
            return nestedArray.map(nestedItem => {
              let nestedContent = nestedBlockContent;
              nestedContent = nestedContent.replace(/\{\{this\}\}/g, typeof nestedItem === 'string' ? nestedItem : '');
              return nestedContent;
            }).join('');
          });
        }
        
        return itemContent;
      }).join('');
      
      processed = processed.substring(0, startIndex) + replacement + processed.substring(endIndex + 9);
      
      // Reset regex lastIndex since we modified the string
      eachRegex.lastIndex = 0;
    }
    
    return processed;
  }

  /**
   * Get nested object value by dot notation path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDirectory() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
      throw error;
    }
  }

  /**
   * Generate a single area page
   */
  async generateAreaPage(areaKey, areaData, template) {
    try {
      const processedHtml = this.processTemplate(template, areaData);
      const filename = `${areaKey}.html`;
      const filepath = path.join(this.outputDir, filename);
      
      await fs.writeFile(filepath, processedHtml, 'utf8');
      console.log(`✅ Generated: ${filename}`);
      
      return filepath;
    } catch (error) {
      console.error(`❌ Error generating page for ${areaKey}:`, error);
      throw error;
    }
  }

  /**
   * Generate all area pages
   */
  async generateAllPages() {
    try {
      console.log('🚀 Starting area page generation...');
      
      // Load data and template
      const [areaData, template] = await Promise.all([
        this.loadAreaData(),
        this.loadTemplate()
      ]);

      // Ensure output directory exists
      await this.ensureOutputDirectory();

      // Generate pages for each area
      const generatedFiles = [];
      for (const [areaKey, data] of Object.entries(areaData)) {
        const filepath = await this.generateAreaPage(areaKey, data, template);
        generatedFiles.push(filepath);
      }

      console.log(`\n🎉 Successfully generated ${generatedFiles.length} area pages:`);
      generatedFiles.forEach(file => {
        console.log(`   📄 ${path.basename(file)}`);
      });

      return generatedFiles;
    } catch (error) {
      console.error('❌ Generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a single area page by key
   */
  async generateSinglePage(areaKey) {
    try {
      console.log(`🚀 Generating page for ${areaKey}...`);
      
      const [areaData, template] = await Promise.all([
        this.loadAreaData(),
        this.loadTemplate()
      ]);

      if (!areaData[areaKey]) {
        throw new Error(`Area "${areaKey}" not found in data`);
      }

      await this.ensureOutputDirectory();
      const filepath = await this.generateAreaPage(areaKey, areaData[areaKey], template);
      
      console.log(`\n🎉 Successfully generated: ${path.basename(filepath)}`);
      return filepath;
    } catch (error) {
      console.error('❌ Generation failed:', error);
      throw error;
    }
  }

  /**
   * List available areas
   */
  async listAreas() {
    try {
      const areaData = await this.loadAreaData();
      const areas = Object.keys(areaData);
      
      console.log('📋 Available areas:');
      areas.forEach((area, index) => {
        const data = areaData[area];
        console.log(`   ${index + 1}. ${area} (${data.name}) - ${data.region}`);
      });
      
      return areas;
    } catch (error) {
      console.error('❌ Error listing areas:', error);
      throw error;
    }
  }

  /**
   * Validate area data structure
   */
  async validateData() {
    try {
      const areaData = await this.loadAreaData();
      const requiredFields = [
        'name', 'postcodes', 'region', 'heroImage', 'heroImageAlt',
        'metaDescription', 'pageTitle', 'heroHeading', 'heroSubheading',
        'aboutArea', 'serviceAreas', 'whyChooseUs', 'services',
        'testimonials', 'localInfo', 'pricing', 'faqs', 'contact'
      ];

      console.log('🔍 Validating area data structure...');
      let isValid = true;

      for (const [areaKey, data] of Object.entries(areaData)) {
        console.log(`\n   Checking ${areaKey}:`);
        
        for (const field of requiredFields) {
          if (!data[field]) {
            console.log(`     ❌ Missing: ${field}`);
            isValid = false;
          } else {
            console.log(`     ✅ Has: ${field}`);
          }
        }
      }

      if (isValid) {
        console.log('\n🎉 All data structures are valid!');
      } else {
        console.log('\n⚠️  Some required fields are missing.');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const generator = new AreaPageGenerator();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'all':
        await generator.generateAllPages();
        break;
      
      case 'single':
        const areaKey = args[1];
        if (!areaKey) {
          console.log('❌ Please specify an area key. Usage: node generate-area-pages.js single <area-key>');
          process.exit(1);
        }
        await generator.generateSinglePage(areaKey);
        break;
      
      case 'list':
        await generator.listAreas();
        break;
      
      case 'validate':
        await generator.validateData();
        break;
      
      default:
        console.log(`
🏠 Area Page Generator

Usage:
  node generate-area-pages.js <command> [options]

Commands:
  all                    Generate all area pages
  single <area-key>      Generate a single area page
  list                   List available areas
  validate               Validate data structure

Examples:
  node generate-area-pages.js all
  node generate-area-pages.js single mayfair
  node generate-area-pages.js list
  node generate-area-pages.js validate
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = AreaPageGenerator;

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}

