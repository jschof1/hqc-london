# Quick Start Guide - Area Page Generator

## 🚀 Generate Your First Area Page in 3 Steps

### Step 1: Check Available Areas
```bash
npm run list
```
or
```bash
node scripts/generate-area-pages.js list
```

### Step 2: Generate a Single Area Page
```bash
# Generate Mayfair page
npm run generate:single mayfair

# Generate Kensington page  
npm run generate:single kensington

# Generate Chelsea page
npm run generate:single chelsea
```

### Step 3: View Your Generated Page
Open `areas/[area-name].html` in your browser to see the generated page.

## 📁 What Gets Generated

Each area page includes:
- **SEO-optimized HTML** with proper meta tags
- **1,500+ words** of area-specific content
- **Local information** (transport, attractions, dining)
- **Service details** tailored to the area
- **Customer testimonials** 
- **Pricing packages**
- **FAQ section**
- **Contact form** with area-specific details

## 🛠️ Available Commands

```bash
# Generate all area pages at once
npm run generate:all

# Generate single area page
npm run generate:single <area-name>

# List all available areas
npm run list

# Validate data structure
npm run validate

# Show help
npm run help
```

## 📝 Adding New Areas

1. **Edit** `data/area-data.json`
2. **Add new area object** with all required fields
3. **Validate** the data: `npm run validate`
4. **Generate** the page: `npm run generate:single new-area-name`

### Required Fields for New Areas:
- `name`, `postcodes`, `region`
- `heroImage`, `heroImageAlt`, `metaDescription`, `pageTitle`
- `heroHeading`, `heroSubheading`
- `aboutArea`, `serviceAreas`, `whyChooseUs`
- `services`, `testimonials`, `localInfo`
- `pricing`, `faqs`, `contact`

## 🎯 SEO Features

Each generated page includes:
- **Unique meta descriptions** (160 characters max)
- **Area-specific titles** with location keywords
- **Structured content** with proper H1, H2, H3 hierarchy
- **Local keywords** naturally integrated
- **Long-form content** (1,500+ words)
- **Internal linking** opportunities
- **Mobile-responsive** design

## 📊 Example Generated Content

For **Mayfair**, the system generates:
- Page title: "Professional Cleaning Services in Mayfair, London — High Quality Clean"
- Meta description: "Premium luxury cleaning services in Mayfair, London's most exclusive district..."
- 6 service categories with 24 individual services
- 3 testimonials from Mayfair clients
- 15+ FAQ items specific to Mayfair
- Local transport, attractions, and dining information

## 🔍 Content Guidelines

### Area Descriptions
- Include historical context and character
- Mention specific neighborhoods/landmarks
- Highlight unique property types
- Address target demographic

### Services
- Tailor to area characteristics
- Include property-specific services
- Mention local challenges/requirements
- Add premium touches for upscale areas

### Testimonials
- Use area-specific locations
- Reflect local clientele
- Include property types mentioned
- Maintain professional tone

## 💡 Pro Tips

1. **Research thoroughly** - Include accurate local information
2. **Use local keywords** - Area name + service combinations
3. **Vary content** - Each area should feel unique
4. **Update regularly** - Keep local information current
5. **Test output** - Always check generated pages in browser

## 🚨 Common Issues

**"Area not found"** → Check spelling in area-data.json
**Missing content** → Run `npm run validate` to check structure
**Template errors** → Verify all placeholders have data
**JSON errors** → Use a JSON validator to check syntax

## 📈 Next Steps

After generating your area pages:
1. **Review content** for accuracy and tone
2. **Add to website** navigation and sitemap
3. **Optimize images** referenced in heroImage fields
4. **Set up tracking** (Google Analytics, Search Console)
5. **Monitor performance** and rankings

## 🎨 Customization

To modify the design:
- Edit `templates/area-template.html`
- Regenerate all pages: `npm run generate:all`

To add new data fields:
- Update JSON structure in `data/area-data.json`
- Add placeholders to template
- Update validation in generator script

---

**Need help?** Check the full documentation in `AREA-GENERATOR-README.md`

