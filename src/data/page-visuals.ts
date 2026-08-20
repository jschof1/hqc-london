export type PageVisual = {
  hero: string;
  heroAlt: string;
  gallery: { src: string; alt: string }[];
  outcomes: string[];
  scope: string[];
  note: string;
};

const homeGallery = [
  { src: '/images/instock/london-property-living-room.webp', alt: 'Bright, carefully prepared London living room' },
  { src: '/images/luxury-home/Mayfair_penthouse_kitchen_with_beautiful_marble.png', alt: 'Finished marble kitchen in a London home' },
  { src: '/images/instock/IMG-20250813-WA0012.jpg', alt: 'Clean and ready London bathroom' }
];

const propertyGallery = [
  { src: '/images/instock/IMG-20250813-WA0024.jpg', alt: 'Vacant London property prepared for handover' },
  { src: '/images/instock/IMG-20250813-WA0027.jpg', alt: 'Clean empty room ready for occupation' },
  { src: '/images/instock/IMG-20250813-WA0033.jpg', alt: 'Finished kitchen following property cleaning' }
];

const commercialGallery = [
  { src: '/images/generated/hqc-office-hero.png', alt: 'Illustrative London meeting room prepared for the working day' },
  { src: '/images/generated/hqc-workplace-detail.png', alt: 'Illustrative London workplace kitchen and breakout area prepared for use' },
  { src: '/images/generated/hqc-kitchen-detail.png', alt: 'Illustrative kitchen detail prepared to a careful cleaning standard' }
];

const restorationGallery = [
  { src: '/images/generated/hqc-restoration-interior.png', alt: 'Illustrative London living space prepared with careful attention to detail' },
  { src: '/images/generated/hqc-kitchen-detail.png', alt: 'Illustrative London kitchen prepared to a detailed clean standard' },
  { src: '/images/generated/hqc-home-hero.png', alt: 'Illustrative London home prepared for a cleaning enquiry' }
];

const defaultVisual: PageVisual = {
  hero: '/images/luxury-home/hyde-park-apartment.webp',
  heroAlt: 'Carefully presented London interior',
  gallery: homeGallery,
  outcomes: ['A clearly defined result', 'The right service route', 'A practical next step'],
  scope: ['Condition and size', 'Access and timing', 'The finish and handover required'],
  note: 'Every enquiry is reviewed against the result, property and delivery conditions before work is confirmed.'
};

const visualBySlug: Record<string, Partial<PageVisual>> = {
  'property-facilities-cleaning-london': {
    hero: '/images/generated/hqc-property-hero.png',
    heroAlt: 'Illustrative London property prepared for a professional handover',
    gallery: propertyGallery,
    outcomes: ['One accountable cleaning route', 'Repeatable scopes across properties', 'Clear reporting and handover'],
    scope: ['Portfolio and site requirements', 'Keys, access and parking', 'Frequency, reporting and escalation']
  },
  'communal-area-cleaning-london': {
    hero: '/images/instock/IMG-20250813-WA0032.jpg',
    heroAlt: 'Bright communal landing prepared by a cleaning team',
    gallery: propertyGallery,
    outcomes: ['Presentable shared entrances', 'Reliable recurring attendance', 'Issues reported to the managing team'],
    scope: ['Entrances, stairs and landings', 'Lifts, touchpoints and shared facilities', 'Bin stores and agreed external areas']
  },
  'estate-letting-agent-cleaning-london': {
    hero: '/images/instock/IMG-20250813-WA0026.jpg',
    heroAlt: 'Vacant London property cleaned for marketing and handover',
    gallery: propertyGallery,
    outcomes: ['Properties ready for viewings', 'Faster instruction-to-handover route', 'One contact for repeat requirements'],
    scope: ['Void and move-in cleans', 'End of tenancy requirements', 'Access, inventories and deadline coordination']
  },
  'move-in-void-property-cleaning-london': {
    hero: '/images/instock/IMG-20250813-WA0030.jpg',
    heroAlt: 'Empty property cleaned before a new occupant moves in',
    gallery: propertyGallery,
    outcomes: ['A clean baseline before occupation', 'A handover-ready property', 'Condition concerns identified early'],
    scope: ['Empty-room and fitted-surface cleaning', 'Kitchen and bathroom reset', 'Inside cupboards and agreed appliances']
  },
  'end-of-tenancy-cleaning-london': {
    hero: '/images/instock/IMG-20250813-WA0027.jpg',
    heroAlt: 'Empty London room prepared for end-of-tenancy handover',
    gallery: propertyGallery,
    outcomes: ['A documented handover standard', 'Attention to inventory-sensitive areas', 'A realistic scope for the condition'],
    scope: ['Kitchen, bathrooms and living areas', 'Inside agreed cupboards and appliances', 'Access, parking and key deadlines']
  },
  'post-construction-cleaning-london': {
    hero: '/images/instock/IMG-20250813-WA0033.jpg',
    heroAlt: 'Newly completed kitchen after a post-construction clean',
    gallery: propertyGallery,
    outcomes: ['Dust removed in planned stages', 'Finishes prepared for inspection', 'A defined snagging and handover point'],
    scope: ['Build dust and surface residue', 'High-level and detailed finishing', 'Programme, other trades and safe access']
  },
  'portfolio-cleaning-support-london': {
    hero: '/images/instock/IMG-20250813-WA0024.jpg',
    heroAlt: 'London property prepared for a portfolio client',
    gallery: propertyGallery,
    outcomes: ['Consistent instructions across sites', 'Centralised communication', 'A clearer mobilisation process'],
    scope: ['Property list and service types', 'Local access arrangements', 'Reporting, approvals and invoicing needs']
  },
  'commercial-cleaning-london': {
    hero: '/images/generated/hqc-office-hero.png',
    heroAlt: 'Illustrative London commercial meeting space prepared for the working day',
    gallery: commercialGallery,
    outcomes: ['A programme that fits operations', 'Visible standards and accountability', 'A route for periodic deeper work'],
    scope: ['Occupancy and operating hours', 'Washrooms, kitchens and work areas', 'Security, keys and site procedures']
  },
  'office-cleaning-london': {
    hero: '/images/generated/hqc-office-hero.png',
    heroAlt: 'Illustrative London office meeting room prepared for the working day',
    gallery: commercialGallery,
    outcomes: ['Work-ready spaces', 'Reliable recurring attendance', 'A clearly managed service scope'],
    scope: ['Desks and shared workspaces', 'Washrooms and staff kitchens', 'Floors, waste and agreed touchpoints']
  },
  'commercial-deep-cleaning-london': {
    hero: '/images/generated/hqc-workplace-detail.png',
    heroAlt: 'Illustrative London workplace prepared through detailed cleaning',
    gallery: commercialGallery,
    outcomes: ['A planned operational reset', 'Detailed attention beyond routine visits', 'A handover aligned to reopening'],
    scope: ['Current condition and build-up', 'Equipment, access and specialist needs', 'Shutdown windows and reinstatement']
  },
  'home-cleaning-london': {
    hero: '/images/generated/hqc-home-hero.png',
    heroAlt: 'Illustrative London living room prepared for a home-cleaning enquiry',
    gallery: homeGallery,
    outcomes: ['The right level of cleaning', 'A clear recurring or one-off route', 'Care around your home and routines'],
    scope: ['Maintenance or restoration need', 'Property condition and priorities', 'Access, products and household requirements']
  },
  'essential-clean-london': {
    hero: '/images/luxury-home/richmond-living-room.webp',
    heroAlt: 'Bright London living room suitable for regular maintenance cleaning',
    gallery: homeGallery,
    outcomes: ['A consistently maintained home', 'Weekly or fortnightly rhythm', 'A repeatable agreed checklist'],
    scope: ['Suitability for maintenance cleaning', 'Rooms and recurring priorities', 'Access, pets and household preferences'],
    note: 'Essential Clean is for suitable maintenance-ready homes. Heavy build-up or restoration work is quoted separately.'
  },
  'deep-cleaning-london': {
    hero: '/images/generated/hqc-kitchen-detail.png',
    heroAlt: 'Illustrative London kitchen prepared through detailed cleaning',
    gallery: restorationGallery,
    outcomes: ['A reset beyond routine maintenance', 'Priorities agreed before arrival', 'A finish matched to the actual condition'],
    scope: ['Build-up and problem areas', 'Inside agreed fixtures and appliances', 'Time, labour and specialist treatment needs']
  },
  'move-in-cleaning-london': {
    hero: '/images/instock/IMG-20250813-WA0015.jpg',
    heroAlt: 'Clean empty room ready for a household to move in',
    gallery: propertyGallery,
    outcomes: ['A clean start before belongings arrive', 'Kitchen and bathroom confidence', 'A clear completion point before move day'],
    scope: ['Move date and access window', 'Empty or partly furnished condition', 'Cupboards, appliances and priority areas']
  },
  'complex-property-cleaning-london': {
    hero: '/images/luxury-home/mayfair-home-hallway.png',
    heroAlt: 'Detailed London interior requiring a considered cleaning plan',
    gallery: homeGallery,
    outcomes: ['A considered delivery plan', 'Specialist requirements identified', 'Sequenced work and accountable handover'],
    scope: ['Plans, materials and floor area', 'Specialist surfaces and contractors', 'Security, programme and representative sign-off']
  },
  'about-high-quality-clean': {
    hero: '/images/pedro-founder.webp',
    heroAlt: 'Pedro Ndombasi, founder of High Quality Clean',
    gallery: [
      { src: '/images/pedro.png', alt: 'Pedro from High Quality Clean' },
      ...homeGallery.slice(0, 2)
    ],
    outcomes: ['A founder-led standard', 'Clear communication', 'Service designed around the required outcome'],
    scope: ['What the client needs to achieve', 'What the site requires', 'How the result will be checked']
  },
  'why-choose-hqc': {
    hero: '/images/instock/IMG-20250812-WA0014.jpg',
    heroAlt: 'London property cared for by High Quality Clean',
    gallery: restorationGallery,
    outcomes: ['Scope before promises', 'Labour matched to the requirement', 'A visible result at handover'],
    scope: ['Real property information', 'Clear inclusions and exclusions', 'The route for questions or changes']
  },
  'how-we-work': {
    hero: '/images/generated/hqc-office-hero.png',
    heroAlt: 'Illustrative London workplace prepared for a planned cleaning programme',
    gallery: commercialGallery,
    outcomes: ['Enquiry routed correctly', 'Scope agreed before delivery', 'Result checked at handover'],
    scope: ['1. Understand the outcome', '2. Assess and quote', '3. Plan, deliver and review']
  },
  'cleaning-prices-london': {
    hero: '/images/luxury-home/Belgravia_bathroom_with_beautiful_stone.png',
    heroAlt: 'Detailed bathroom whose materials and condition affect cleaning scope',
    gallery: homeGallery,
    outcomes: ['A price tied to real labour', 'Fewer surprises on the day', 'Clear assumptions and exclusions'],
    scope: ['Size and current condition', 'Access, timing and parking', 'Special surfaces, equipment and required finish']
  },
  'reviews-case-studies': {
    hero: '/images/generated/hqc-restoration-interior.png',
    heroAlt: 'Illustrative London interior prepared to a detailed cleaning standard',
    gallery: restorationGallery,
    outcomes: ['See the condition before work', 'Understand the requested outcome', 'Review the visible result'],
    scope: ['Permissioned project imagery', 'Relevant service context', 'Client privacy where required']
  },
  'areas-we-cover': {
    hero: '/images/london.jpg',
    heroAlt: 'London skyline across the HQC service area',
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
    heroAlt: 'Prepared London living room representing a home cleaning enquiry',
    gallery: [
      { src: '/images/instock/london-property-living-room.webp', alt: 'Prepared London living room' },
      { src: '/images/generated/hqc-office-hero.png', alt: 'Illustrative London office prepared for the working day' },
      { src: '/images/luxury-home/richmond-living-room.webp', alt: 'London home cleaning result' }
    ],
    outcomes: ['One East London service hub', 'Availability checked before commitment', 'Home, workplace and property routes'],
    scope: ['East London postcode', 'Required outcome', 'Site access and preferred timing']
  }
};

export function getPageVisual(slug: string): PageVisual {
  return { ...defaultVisual, ...visualBySlug[slug] };
}
