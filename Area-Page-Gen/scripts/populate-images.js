// Unsplash API Configuration
const UNSPLASH_ACCESS_KEY = '9LXDDGlaugPL-wa3s3wDSs5 iNZOfdy8WW5DSLqg8-e0';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Image mapping configuration - maps placeholder URLs to search terms and orientations
const imageMap = {
  // Hero fallback image
  'https://placehold.co/1600x900/': {
    search: 'luxury home interior living room',
    orientation: 'landscape',
    category: 'hero'
  },
  
  // Client avatars (48x48)
  'https://placehold.co/48x48/': {
    search: 'professional person portrait',
    orientation: 'squarish', 
    category: 'avatar'
  },
  
  // Service tier images (120x120)
  'https://placehold.co/120x120/': {
    search: 'luxury cleaning service modern home',
    orientation: 'squarish',
    category: 'service'
  },
  
  // Feature images (80x80)
  'https://placehold.co/80x80/': {
    search: 'luxury home cleaning wellness',
    orientation: 'squarish',
    category: 'feature'
  },
  
  // Feature icons (28x28)
  'https://placehold.co/28x28/': {
    search: 'luxury home cleaning icon',
    orientation: 'squarish',
    category: 'icon'
  },
  
  // Service area map (400x300)
  'https://placehold.co/400x300/': {
    search: 'london map belgravia chelsea kensington',
    orientation: 'landscape',
    category: 'map'
  },
  
  // Area cityscapes (600x160)
  'https://placehold.co/600x160/': {
    search: 'london luxury neighborhood architecture',
    orientation: 'landscape',
    category: 'cityscape'
  },
  
  // Mobile area images (150x80)
  'https://placehold.co/150x80/': {
    search: 'london luxury homes architecture',
    orientation: 'landscape',
    category: 'area-mobile'
  },
  
  // Founder portrait (400x500)
  'https://placehold.co/400x500/': {
    search: 'professional business owner portrait',
    orientation: 'portrait',
    category: 'founder'
  },
  
  // Team photos (300x144)
  'https://placehold.co/300x144/': {
    search: 'professional cleaning team luxury service',
    orientation: 'landscape',
    category: 'team'
  },
  
  // Process steps (64x64)
  'https://placehold.co/64x64/': {
    search: 'luxury service professional cleaning',
    orientation: 'squarish',
    category: 'process'
  },
  
  // Texture backgrounds (100x100)
  'https://placehold.co/100x100/': {
    search: 'luxury texture marble fabric',
    orientation: 'squarish',
    category: 'texture'
  },
  
  // Before/after case studies (1600x900)
  // This will be handled separately for before/after pairs
  
  // Detail shots (400x112)
  'https://placehold.co/400x112/': {
    search: 'luxury home detail cleaning result',
    orientation: 'landscape',
    category: 'detail'
  },
  
  // CTA background (1920x1080)
  'https://placehold.co/1920x1080/': {
    search: 'luxury london window view interior',
    orientation: 'landscape',
    category: 'cta-bg'
  },
  
  // Instagram grid (64x64) - will use cleaning results
  // These will be handled with a specific search for cleaning results
};

// Specific searches for different contexts
const contextualSearches = {
  avatar: ['professional woman portrait', 'professional man portrait', 'business person headshot'],
  service: ['luxury cleaning essentials', 'premium home cleaning', 'professional cleaning service'],
  feature: ['wellness home products', 'luxury home care', 'premium cleaning supplies'],
  cityscape: ['belgravia london architecture', 'chelsea london luxury homes', 'kensington london streets'],
  team: ['professional cleaning team', 'luxury service team', 'cleaning professionals working'],
  process: ['consultation meeting', 'home walkthrough', 'professional cleaning', 'quality check'],
  guarantees: ['satisfaction guarantee', 'insurance certificate', 'quality assurance'],
  beforeafter: ['messy room before cleaning', 'clean luxury room after'],
  instagram: ['clean kitchen result', 'organized bedroom', 'sparkling bathroom', 'pristine living room', 'luxury home interior', 'clean home details']
};

// Cache for fetched images to avoid duplicate API calls
const imageCache = new Map();

// Function to fetch image from Unsplash
async function fetchUnsplashImage(searchTerm, width, height, orientation = 'landscape') {
  const cacheKey = `${searchTerm}-${width}x${height}-${orientation}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  try {
    const url = new URL(`${UNSPLASH_API_URL}/photos/random`);
    url.searchParams.append('query', searchTerm);
    url.searchParams.append('orientation', orientation);
    url.searchParams.append('count', '1');
    url.searchParams.append('client_id', UNSPLASH_ACCESS_KEY);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const photo = data[0];
      // Construct URL with specific dimensions
      const imageUrl = `${photo.urls.raw}&w=${width}&h=${height}&fit=crop&crop=faces,center`;
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    throw new Error('No image returned from Unsplash');
  } catch (error) {
    console.error('Error fetching image:', error);
    // Return a fallback URL if Unsplash fails
    return `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=${width}&h=${height}&fit=crop&crop=center`;
  }
}

// Function to extract dimensions from placeholder URL
function extractDimensions(placeholderUrl) {
  const match = placeholderUrl.match(/(\d+)x(\d+)/);
  if (match) {
    return {
      width: parseInt(match[1]),
      height: parseInt(match[2])
    };
  }
  return { width: 400, height: 300 }; // fallback
}

// Function to determine search term based on context
function getSearchTermForContext(img, placeholderUrl, index) {
  const alt = img.alt.toLowerCase();
  const className = img.className.toLowerCase();
  const parentContext = img.closest('section, article, div')?.textContent?.toLowerCase() || '';
  
  // Avatar images
  if (placeholderUrl.includes('48x48')) {
    const avatarSearches = contextualSearches.avatar;
    return avatarSearches[index % avatarSearches.length];
  }
  
  // Service tier images
  if (placeholderUrl.includes('120x120')) {
    const serviceSearches = contextualSearches.service;
    return serviceSearches[index % serviceSearches.length];
  }
  
  // Feature images
  if (placeholderUrl.includes('80x80')) {
    return contextualSearches.feature[index % contextualSearches.feature.length];
  }
  
  // Area images
  if (placeholderUrl.includes('600x160') || placeholderUrl.includes('150x80')) {
    return contextualSearches.cityscape[index % contextualSearches.cityscape.length];
  }
  
  // Team images
  if (placeholderUrl.includes('300x144')) {
    return contextualSearches.team[index % contextualSearches.team.length];
  }
  
  // Process images
  if (placeholderUrl.includes('64x64') && parentContext.includes('process')) {
    return contextualSearches.process[index % contextualSearches.process.length];
  }
  
  // Guarantee images
  if (placeholderUrl.includes('64x64') && parentContext.includes('assurance')) {
    return contextualSearches.guarantees[index % contextualSearches.guarantees.length];
  }
  
  // Instagram images
  if (placeholderUrl.includes('64x64') && parentContext.includes('instagram')) {
    return contextualSearches.instagram[index % contextualSearches.instagram.length];
  }
  
  // Before/after images
  if (placeholderUrl.includes('1600x900')) {
    const beforeAfterSearches = contextualSearches.beforeafter;
    return beforeAfterSearches[index % beforeAfterSearches.length];
  }
  
  // Founder image
  if (placeholderUrl.includes('400x500')) {
    return 'professional business owner portrait luxury service';
  }
  
  // Map image
  if (placeholderUrl.includes('400x300')) {
    return 'london map luxury neighborhoods';
  }
  
  // Hero fallback
  if (placeholderUrl.includes('1600x900')) {
    return 'luxury home interior modern living room';
  }
  
  // CTA background
  if (placeholderUrl.includes('1920x1080')) {
    return 'luxury london window view interior apartment';
  }
  
  // Detail shots
  if (placeholderUrl.includes('400x112')) {
    return 'luxury home cleaning details result';
  }
  
  // Texture backgrounds
  if (placeholderUrl.includes('100x100')) {
    return 'luxury texture pattern marble';
  }
  
  // Default fallback
  return 'luxury home cleaning service professional';
}

// Function to determine orientation from dimensions
function getOrientationFromDimensions(width, height) {
  if (width === height) return 'squarish';
  if (width > height) return 'landscape';
  return 'portrait';
}

// Main function to replace all placeholder images
async function replaceAllPlaceholderImages() {
  console.log('Starting image replacement...');
  
  // Find all images with placeholder URLs
  const placeholderImages = document.querySelectorAll('img[src*="placehold.co"]');
  
  console.log(`Found ${placeholderImages.length} placeholder images to replace`);
  
  // Process images in batches to avoid rate limiting
  const batchSize = 5;
  const batches = [];
  
  for (let i = 0; i < placeholderImages.length; i += batchSize) {
    batches.push(Array.from(placeholderImages).slice(i, i + batchSize));
  }
  
  let totalReplaced = 0;
  
  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`Processing batch ${batchIndex + 1} of ${batches.length}`);
    
    const promises = batch.map(async (img, indexInBatch) => {
      const globalIndex = batchIndex * batchSize + indexInBatch;
      const placeholderUrl = img.src;
      const dimensions = extractDimensions(placeholderUrl);
      const orientation = getOrientationFromDimensions(dimensions.width, dimensions.height);
      const searchTerm = getSearchTermForContext(img, placeholderUrl, globalIndex);
      
      try {
        const newImageUrl = await fetchUnsplashImage(
          searchTerm,
          dimensions.width,
          dimensions.height,
          orientation
        );
        
        // Update the image source
        img.src = newImageUrl;
        
        // Add loading and error handling
        img.loading = 'lazy';
        img.onload = () => {
          console.log(`✓ Image ${globalIndex + 1} loaded: ${searchTerm}`);
        };
        img.onerror = () => {
          console.error(`✗ Failed to load image ${globalIndex + 1}: ${searchTerm}`);
          // Fallback to a generic luxury home image
          img.src = `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=${dimensions.width}&h=${dimensions.height}&fit=crop&crop=center`;
        };
        
        totalReplaced++;
        return true;
      } catch (error) {
        console.error(`Error replacing image ${globalIndex + 1}:`, error);
        return false;
      }
    });
    
    await Promise.all(promises);
    
    // Add delay between batches to respect rate limits
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Image replacement complete! ${totalReplaced} out of ${placeholderImages.length} images replaced successfully.`);
  
  return totalReplaced;
}

// Function to replace images when DOM is ready
function initImageReplacement() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceAllPlaceholderImages);
  } else {
    replaceAllPlaceholderImages();
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.replaceAllPlaceholderImages = replaceAllPlaceholderImages;
  window.initImageReplacement = initImageReplacement;
}

// Auto-initialize if script is loaded
initImageReplacement();
