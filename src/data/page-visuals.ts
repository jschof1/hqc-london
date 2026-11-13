export type PageVisual = {
  hero: string;
  heroAlt: string;
  /** hqc is true only for photos listed in confirmedHqcPhotoIds; anything else is shown as illustrative. */
  gallery: { src: string; alt: string; hqc?: boolean }[];
  outcomes: string[];
  scope: string[];
  note: string;
};

// Single provenance switch (round 5, review B1). A photo is presented as "HQC work" only when
// its photo-review ID is listed here, i.e. Pedro has confirmed it is his own job and that it may
// be published. Every other image renders as an illustrative image with a caption.
// Awaiting Pedro: p-ae4372f37d (bedroom), p-2267193ade (living area), p-1ef63f3b16 (shutters).
export const confirmedHqcPhotoIds: string[] = [];
export const isConfirmedHqcPhoto = (photoId: string) => confirmedHqcPhotoIds.includes(photoId);

// Earlier HQC library photographs Pedro marked "keep" (brightness-only enhancement). The inventory
// says "project and permission to be confirmed", so they are illustrative until confirmed above.
const libraryPhoto = (photoId: string, src: string, alt: string) => ({ src, alt, photoId, hqc: isConfirmedHqcPhoto(photoId) });
export const libraryPhotos = {
  bedroom: libraryPhoto('p-ae4372f37d', '/images/phase8-nov6/old-living-room-wide-1536.webp', 'Bedroom with a double bed, bedside lamps and full-height curtains.'),
  livingArea: libraryPhoto('p-2267193ade', '/images/phase8-nov6/old-living-room-1536.webp', 'Living area with a dining table, sofa and wide windows.'),
  shutters: libraryPhoto('p-1ef63f3b16', '/images/phase8-nov6/old-approved-window-cleaning-1079.webp', 'Person dusting white window shutters with a long-handled duster.')
};
const hqcLibraryGallery = [libraryPhotos.bedroom, libraryPhotos.livingArea, libraryPhotos.shutters];

const homeGallery = hqcLibraryGallery;

// Round 3 (B1): Pedro marked the earlier library photos WA0024, WA0027 and WA0033 "skip",
// so they are not shown. These replacements are his "keep" choices matched to his notes.
// The inventory classifies them as archived site images or stock, not HQC project photos,
// so they are deliberately not flagged hqc and the gallery renders as illustrative.
const keepPhotos = {
  ensuite: { src: '/images/luxury-home/luxurious-kensington-ensuite.png', alt: 'Bathroom with a double vanity and large mirrors.' }, // p-51ee039643 managed properties, portfolios and projects
  livingRoom: { src: '/images/luxury-home/richmond-living-room.png', alt: 'Living room with a fireplace, sofas and a bay window.' }, // p-5ace2161c5 managed properties, portfolios and projects
  hallway: { src: '/images/luxury-home/mayfair-home-hallway.png', alt: 'Hallway with a herringbone floor and blue panelled walls.' }, // p-71604da63b estate and letting agents
  townhouse: { src: '/images/luxury-home/belgravia-stonework.png', alt: 'Georgian townhouse entrance with railings and front steps.' }, // p-302026958a estate and letting agents
  bathroom: { src: '/images/phase8-nov6/keep-p-ea4f54d324.jpg', alt: 'Bright bathroom with a freestanding bath and basin.' }, // p-ea4f54d324 post construction/renovation (Unsplash stock)
  mews: { src: '/images/luxury-home/Chelsea_Mews_house_in_London_with_spotless_wind.png', alt: 'Brick mews house with window boxes and a black front door.' }, // p-1a211e6792 move in/out (retitled)
  armchair: { src: '/images/phase8-nov6/keep-p-de8736bfb6.jpg', alt: 'Living room with a yellow armchair and a floor lamp.' } // p-de8736bfb6 letting agents (Unsplash stock)
};

const communalSpace = { src: '/images/phase8-nov6/communal-lift-lobby-800.webp', alt: 'Shared apartment-block entrance with lift doors and a cleaning trolley.' };
const propertyGallery = [communalSpace, keepPhotos.ensuite, keepPhotos.hallway];

// Round 4 (H1/H2): pages whose hero used a skip-marked photo now use a keep photo as the hero,
// and their gallery excludes that hero so the same image is not shown twice.
const heroFromKeep = (photo: { src: string; alt: string }) => ({ hero: photo.src, heroAlt: photo.alt });

const commercialGallery = [
  { src: '/images/generated/hqc-office-hero.png', alt: 'Meeting room with a long table and a view of the City of London.' },
  { src: '/images/generated/hqc-workplace-detail.png', alt: 'Office kitchen and breakout area with an island and bar stools.' },
  { src: '/images/generated/hqc-kitchen-detail.png', alt: 'Kitchen with a stone worktop, sink and flowers.' }
];

const restorationGallery = hqcLibraryGallery;

const defaultVisual: PageVisual = {
  hero: '/images/luxury-home/hyde-park-apartment.webp',
  heroAlt: 'Period living room with a bay window, fireplace and bookshelves.',
  gallery: homeGallery,
  outcomes: ['A clearly defined result', 'The right service route', 'A practical next step'],
  scope: ['Condition and size', 'Access and timing', 'The finish and handover required'],
  note: 'Every enquiry is reviewed against the result, property and delivery conditions before work is confirmed.'
};

const visualBySlug: Record<string, Partial<PageVisual>> = {
  'property-facilities-cleaning-london': {
    hero: '/images/generated/hqc-property-hero.webp',
    heroAlt: 'Empty flat hallway with wooden floors and open doors.',
    gallery: propertyGallery,
    outcomes: ['One accountable cleaning route', 'Repeatable scopes across properties', 'Clear reporting and handover'],
    scope: ['Portfolio and site requirements', 'Keys, access and parking', 'Frequency, reporting and escalation']
  },
  'communal-area-cleaning-london': {
    hero: '/images/phase8-nov6/complex-a-1600.webp',
    heroAlt: 'Cleaner in a teal uniform wiping a communal stair handrail.',
    gallery: propertyGallery,
    outcomes: ['Presentable shared entrances', 'Reliable recurring attendance', 'Issues reported to the managing team'],
    scope: ['Entrances, stairs and landings', 'Lifts, touchpoints and shared facilities', 'Bin stores and agreed external areas']
  },
  'estate-letting-agent-cleaning-london': {
    ...heroFromKeep(keepPhotos.townhouse),
    gallery: [keepPhotos.armchair, keepPhotos.hallway, communalSpace],
    outcomes: ['Properties ready for viewings', 'Faster instruction-to-handover route', 'One contact for repeat requirements'],
    scope: ['Void and move-in cleans', 'End of tenancy requirements', 'Access, inventories and deadline coordination']
  },
  'move-in-void-property-cleaning-london': {
    ...heroFromKeep(keepPhotos.hallway),
    gallery: [keepPhotos.armchair, keepPhotos.townhouse, keepPhotos.ensuite],
    outcomes: ['A clean baseline before occupation', 'A handover-ready property', 'Condition concerns identified early'],
    scope: ['Empty-room and fitted-surface cleaning', 'Kitchen and bathroom reset', 'Inside cupboards and agreed appliances']
  },
  'end-of-tenancy-cleaning-london': {
    ...heroFromKeep(keepPhotos.armchair),
    gallery: [keepPhotos.hallway, keepPhotos.townhouse, keepPhotos.livingRoom],
    outcomes: ['A documented handover standard', 'Attention to inventory-sensitive areas', 'A realistic scope for the condition'],
    scope: ['Kitchen, bathrooms and living areas', 'Inside agreed cupboards and appliances', 'Access, parking and key deadlines']
  },
  'post-construction-cleaning-london': {
    ...heroFromKeep(keepPhotos.bathroom),
    gallery: [keepPhotos.ensuite, communalSpace, keepPhotos.hallway],
    outcomes: ['Dust removed in planned stages', 'Finishes prepared for inspection', 'A defined snagging and handover point'],
    scope: ['Build dust and surface residue', 'High-level and detailed finishing', 'Programme, other trades and safe access']
  },
  'portfolio-cleaning-support-london': {
    hero: '/images/generated/hqc-property-hero.webp',
    heroAlt: 'Empty flat hallway with wooden floors and open doors.',
    gallery: [keepPhotos.ensuite, keepPhotos.hallway, keepPhotos.townhouse],
    outcomes: ['Consistent instructions across sites', 'Centralised communication', 'A clearer mobilisation process'],
    scope: ['Property list and service types', 'Local access arrangements', 'Reporting, approvals and invoicing needs']
  },
  'commercial-cleaning-london': {
    hero: '/images/generated/hqc-office-hero.png',
    heroAlt: 'Meeting room with a long table and a view of the City of London.',
    gallery: commercialGallery,
    outcomes: ['A programme that fits operations', 'Visible standards and accountability', 'A route for periodic deeper work'],
    scope: ['Occupancy and operating hours', 'Washrooms, kitchens and work areas', 'Security, keys and site procedures']
  },
  'office-cleaning-london': {
    hero: '/images/generated/hqc-workplace-detail.png',
    heroAlt: 'Office kitchen and breakout area with an island and bar stools.',
    gallery: commercialGallery,
    outcomes: ['Work-ready spaces', 'Reliable recurring attendance', 'A clearly managed service scope'],
    scope: ['Desks and shared workspaces', 'Washrooms and staff kitchens', 'Floors, waste and agreed touchpoints']
  },
  'commercial-deep-cleaning-london': {
    hero: '/images/generated/hqc-workplace-detail.png',
    heroAlt: 'Office kitchen and breakout area with an island and bar stools.',
    gallery: commercialGallery,
    outcomes: ['A planned operational reset', 'Detailed attention beyond routine visits', 'A handover aligned to reopening'],
    scope: ['Current condition and build-up', 'Equipment, access and specialist needs', 'Shutdown windows and reinstatement']
  },
  'home-cleaning-london': {
    hero: '/images/generated/hqc-home-hero.webp',
    heroAlt: 'Living room with a corner sofa and tall windows.',
    gallery: homeGallery,
    outcomes: ['The right level of cleaning', 'A clear recurring or one-off route', 'Care around your home and routines'],
    scope: ['Maintenance or restoration need', 'Property condition and priorities', 'Access, products and household requirements']
  },
  'essential-clean-london': {
    hero: '/images/luxury-home/richmond-living-room.webp',
    heroAlt: 'Living room with a fireplace, chandelier and sofas.',
    gallery: homeGallery,
    outcomes: ['A consistently maintained home', 'Weekly or fortnightly rhythm', 'A repeatable agreed checklist'],
    scope: ['Suitability for maintenance cleaning', 'Rooms and recurring priorities', 'Access, pets and household preferences'],
    note: 'Essential Clean is for suitable maintenance-ready homes. Heavy build-up or restoration work is quoted separately.'
  },
  'deep-cleaning-london': {
    hero: '/images/generated/hqc-kitchen-detail.png',
    heroAlt: 'Kitchen with a stone worktop, sink and flowers.',
    gallery: restorationGallery,
    outcomes: ['A reset beyond routine maintenance', 'Priorities agreed before arrival', 'A finish matched to the actual condition'],
    scope: ['Build-up and problem areas', 'Inside agreed fixtures and appliances', 'Time, labour and specialist treatment needs']
  },
  'move-in-cleaning-london': {
    ...heroFromKeep(keepPhotos.mews),
    gallery: [keepPhotos.armchair, keepPhotos.hallway, keepPhotos.livingRoom],
    outcomes: ['A clean start before belongings arrive', 'Kitchen and bathroom confidence', 'A clear completion point before move day'],
    scope: ['Move date and access window', 'Empty or partly furnished condition', 'Cupboards, appliances and priority areas']
  },
  'complex-property-cleaning-london': {
    hero: '/images/luxury-home/mayfair-home-hallway.png',
    heroAlt: 'Hallway with a herringbone floor and blue panelled walls.',
    gallery: homeGallery,
    outcomes: ['A considered delivery plan', 'Specialist requirements identified', 'Sequenced work and accountable handover'],
    scope: ['Plans, materials and floor area', 'Specialist surfaces and contractors', 'Security, programme and representative sign-off']
  },
  'about-high-quality-clean': {
    hero: '/images/instock/london-property-living-room.webp',
    heroAlt: 'Open-plan living area with sofas, a patterned rug and an olive tree.',
    gallery: propertyGallery,
    outcomes: ['A founder-led standard', 'Clear communication', 'Service designed around the required outcome'],
    scope: ['What the client needs to achieve', 'What the site requires', 'How the result will be checked']
  },
  'why-choose-hqc': {
    hero: '/images/instock/IMG-20250812-WA0014.jpg',
    heroAlt: 'Roof terrace with outdoor seating overlooking London.',
    gallery: restorationGallery,
    outcomes: ['Scope before promises', 'Labour matched to the requirement', 'A visible result at handover'],
    scope: ['Real property information', 'Clear inclusions and exclusions', 'The route for questions or changes']
  },
  'how-we-work': {
    hero: '/images/generated/hqc-office-hero.png',
    heroAlt: 'Meeting room with a long table and a view of the City of London.',
    gallery: commercialGallery,
    outcomes: ['Enquiry routed correctly', 'Scope agreed before delivery', 'Result checked at handover'],
    scope: ['1. Understand the outcome', '2. Assess and quote', '3. Plan, deliver and review']
  },
  'cleaning-prices-london': {
    hero: '/images/luxury-home/Belgravia_bathroom_with_beautiful_stone.png',
    heroAlt: 'Bathroom with marble walls and a freestanding stone bath.',
    gallery: homeGallery,
    outcomes: ['A price tied to real labour', 'Fewer surprises on the day', 'Clear assumptions and exclusions'],
    scope: ['Size and current condition', 'Access, timing and parking', 'Special surfaces, equipment and required finish']
  },
  'reviews-case-studies': {
    hero: '/images/generated/hqc-restoration-interior.png',
    heroAlt: 'Period living room with a bay window and a fireplace.',
    gallery: restorationGallery,
    outcomes: ['See the condition before work', 'Understand the requested outcome', 'Review the visible result'],
    scope: ['Permissioned project imagery', 'Relevant service context', 'Client privacy where required']
  },
  'areas-we-cover': {
    hero: '/images/london.jpg',
    heroAlt: 'London Eye and the River Thames at sunset.',
    gallery: [
      { src: '/images/areas/mayfair.webp', alt: 'Mayfair street in London' },
      { src: '/images/areas/chelsea.webp', alt: 'Chelsea residential street' },
      { src: '/images/areas/wandsworth-town.webp', alt: 'Wandsworth in South West London' }
    ],
    outcomes: ['Postcode checked with service type', 'Practical team availability confirmed', 'No blanket promise beyond capacity'],
    scope: ['Your postcode', 'The service and frequency', 'Timing and access requirements']
  },
  'cleaning-services-east-london': {
    hero: '/images/instock/london-property-living-room.webp',
    heroAlt: 'Open-plan living area with sofas, a patterned rug and an olive tree.',
    gallery: [
      { src: '/images/instock/london-property-living-room.webp', alt: 'Open-plan living area with sofas, a patterned rug and an olive tree.' },
      { src: '/images/generated/hqc-office-hero.png', alt: 'Meeting room with a long table and a view of the City of London.' },
      communalSpace
    ],
    outcomes: ['One East London service hub', 'Availability checked before commitment', 'Home, workplace and property routes'],
    scope: ['East London postcode', 'Required outcome', 'Site access and preferred timing']
  }
};

export function getPageVisual(slug: string): PageVisual {
  return { ...defaultVisual, ...visualBySlug[slug] };
}
