# Area Page Generator System

This system allows you to easily generate SEO-optimized, area-specific cleaning service pages from a JSON data structure and HTML template.

## 🏗️ System Architecture

```
├── data/
│   └── area-data.json          # JSON data for all areas
├── templates/
│   └── area-template.html      # HTML template with placeholders
├── scripts/
│   └── generate-area-pages.js  # Node.js generator script
├── areas/                      # Generated HTML pages (output)
│   ├── mayfair.html
│   ├── kensington.html
│   └── [other-areas].html
```

## 📊 JSON Data Structure

Each area in `area-data.json` follows this comprehensive structure:

```json
{
  "area-key": {
    "name": "Area Name",
    "postcodes": ["SW1", "W1K"],
    "region": "Central London",
    "heroImage": "path/to/image.jpg",
    "heroImageAlt": "Alt text for SEO",
    "metaDescription": "SEO meta description",
    "pageTitle": "Page title for SEO",
    "heroHeading": "Main page heading",
    "heroSubheading": "Subheading text",
    
    "aboutArea": {
      "heading": "Section heading",
      "content": ["Paragraph 1", "Paragraph 2", "..."]
    },
    
    "serviceAreas": {
      "heading": "Service areas heading",
      "areas": [
        {
          "name": "Sub-area name",
          "description": "Description of this area"
        }
      ]
    },
    
    "whyChooseUs": {
      "heading": "Why choose us heading",
      "points": [
        {
          "title": "Point title",
          "description": "Point description"
        }
      ]
    },
    
    "services": {
      "heading": "Services heading",
      "categories": [
        {
          "name": "Category name",
          "services": ["Service 1", "Service 2"]
        }
      ]
    },
    
    "testimonials": [
      {
        "quote": "Customer quote",
        "author": "Customer name",
        "rating": 5
      }
    ],
    
    "localInfo": {
      "transportLinks": ["Transport info"],
      "nearbyAttractions": ["Attractions"],
      "shoppingAndDining": ["Shopping & dining"]
    },
    
    "pricing": {
      "heading": "Pricing heading",
      "note": "Pricing note",
      "packages": [
        {
          "name": "Package name",
          "price": "From £XX",
          "duration": "X hours",
          "features": ["Feature 1", "Feature 2"]
        }
      ]
    },
    
    "faqs": [
      {
        "question": "FAQ question",
        "answer": "FAQ answer"
      }
    ],
    
    "contact": {
      "heading": "Contact heading",
      "phone": "Phone number",
      "email": "Email address",
      "whatsapp": "WhatsApp number",
      "hours": "Operating hours",
      "emergencyNote": "Emergency service note"
    }
  }
}
```

## 🚀 Usage

### Prerequisites
- Node.js installed on your system
- All files in the correct directory structure

### Commands

#### Generate All Area Pages
```bash
node scripts/generate-area-pages.js all
```

#### Generate Single Area Page
```bash
node scripts/generate-area-pages.js single mayfair
node scripts/generate-area-pages.js single kensington
```

#### List Available Areas
```bash
node scripts/generate-area-pages.js list
```

#### Validate Data Structure
```bash
node scripts/generate-area-pages.js validate
```

#### Show Help
```bash
node scripts/generate-area-pages.js
```

## 📝 Adding New Areas

1. **Add to JSON Data**: Add a new area object to `data/area-data.json`
2. **Use a descriptive key**: The key will become the filename (e.g., `"chelsea"` → `chelsea.html`)
3. **Fill all required fields**: Use the validation command to check completeness
4. **Generate the page**: Run the generator for your new area

### Example: Adding Chelsea
```json
{
  "chelsea": {
    "name": "Chelsea",
    "postcodes": ["SW3", "SW10"],
    "region": "West London",
    "heroImage": "assets/images/chelsea.jpg",
    "heroImageAlt": "Chelsea riverside luxury properties and historic charm",
    "metaDescription": "Professional cleaning services in Chelsea...",
    // ... rest of the structure
  }
}
```

Then generate:
```bash
node scripts/generate-area-pages.js single chelsea
```

## 🎨 Template Customization

The template (`templates/area-template.html`) uses a simple templating system:

### Variable Replacement
- `{{variable}}` - Simple variable replacement
- `{{object.property}}` - Nested object access

### Array Iteration
```html
{{#each arrayName}}
  <div>{{propertyName}}</div>
{{/each}}
```

### Special Helpers
- `{{#repeat count}}★{{/repeat}}` - Repeat content (for star ratings)
- `{{postcodes}}` - Automatically joins array with commas

## 🔍 SEO Optimization Features

Each generated page includes:

- **Custom meta descriptions** (160 characters max recommended)
- **Optimized page titles** with area and service keywords
- **Structured content** with proper H1, H2, H3 hierarchy
- **Local SEO elements** (postcodes, transport links, local attractions)
- **Schema.org ready structure** (can be enhanced with JSON-LD)
- **Mobile-responsive design**
- **Fast loading** with optimized CSS and JavaScript

## 📊 Content Guidelines

### Meta Descriptions
- Keep under 160 characters
- Include primary keywords (area name, "cleaning services", "London")
- Make compelling and actionable

### Headings
- H1: Main page title with area name
- H2: Section headings
- H3: Subsection headings

### Content Length
- Aim for 1,500+ words per page for SEO value
- Include local information and area-specific details
- Use natural keyword density (1-2%)

### Local Keywords to Include
- Area name + "cleaning services"
- Postcode variations
- Local landmarks and attractions
- Property types common to the area
- Transportation links

## 🛠️ Technical Details

### Dependencies
- Node.js (built-in modules only: `fs`, `path`)
- No external npm packages required

### File Structure
- **JSON data**: Centralized in single file for easy management
- **Template**: Single HTML template with placeholder system
- **Output**: Clean HTML files ready for deployment

### Performance
- Static HTML generation (fast loading)
- Minimal JavaScript (only for interactive elements)
- CSS inlined for critical styles
- Lazy loading for images

## 🔧 Troubleshooting

### Common Issues

**"Area not found in data"**
- Check the area key exists in `area-data.json`
- Ensure proper JSON syntax

**"Template not found"**
- Verify `templates/area-template.html` exists
- Check file permissions

**Missing content in generated page**
- Run validation: `node scripts/generate-area-pages.js validate`
- Check for typos in property names
- Ensure all required fields are present

### Validation
Always run validation before generating pages:
```bash
node scripts/generate-area-pages.js validate
```

This will check for missing required fields and help ensure complete page generation.

## 📈 Future Enhancements

Potential improvements:
- **Image optimization**: Automatic image resizing and WebP conversion
- **Sitemap generation**: Auto-generate XML sitemap for all areas
- **JSON-LD schema**: Add structured data for better SEO
- **Bulk image management**: Automatic image downloading and optimization
- **CSS/JS minification**: Compress output files
- **Multi-language support**: Generate pages in multiple languages

## 🎯 Example Workflow

1. **Plan new area**: Research postcodes, landmarks, property types
2. **Gather content**: Write area-specific copy (1,500+ words)
3. **Collect images**: High-quality, properly licensed images
4. **Add to JSON**: Following the established structure
5. **Validate data**: `node scripts/generate-area-pages.js validate`
6. **Generate page**: `node scripts/generate-area-pages.js single area-name`
7. **Review output**: Check generated HTML for accuracy
8. **Deploy**: Upload to website hosting

This system makes it easy to scale your service pages across all of London while maintaining consistent quality and SEO optimization.

