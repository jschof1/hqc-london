export type BuyerRouteKey = 'propertyAndFacilities' | 'homes' | 'commercialAndWellness';

export interface BuyerRoute {
  key: BuyerRouteKey;
  title: string;
  slug: string;
  audience: string;
  buyerProblem: string;
  ctaText: string;
  ctaUrl: string;
  priority: number;
}

export const buyerRoutes: BuyerRoute[] = [
  {
    key: 'propertyAndFacilities',
    title: 'Property and Facilities Cleaning',
    slug: 'property-and-facilities-cleaning',
    audience: 'Agents, landlords, property managers, block managers, and developers',
    buyerProblem:
      'Managed properties need to be clean, presentable, and ready for viewings, handovers, residents, or next occupants without constant chasing.',
    ctaText: 'Discuss Property Cleaning Support',
    ctaUrl: '/quote/',
    priority: 1,
  },
  {
    key: 'commercialAndWellness',
    title: 'Commercial and Wellness Cleaning',
    slug: 'commercial-and-wellness-cleaning',
    audience: 'Boutique offices, studios, clinics, gyms, and client-facing spaces',
    buyerProblem:
      'Client-facing premises need consistent hygiene, careful access, and presentation-led cleaning that works around the way the space is used.',
    ctaText: 'Discuss Commercial Cleaning',
    ctaUrl: '/quote/',
    priority: 2,
  },
  {
    key: 'homes',
    title: 'Homes',
    slug: 'home-cleaning',
    audience: 'Households, busy professionals, families, tenants, landlords, and homeowners',
    buyerProblem:
      'Homes need reliable cleaning, careful handling, and agreed standards for regular upkeep, move-outs, deep cleans, or post-renovation resets.',
    ctaText: 'Get a Home Cleaning Quote',
    ctaUrl: '/quote/',
    priority: 3,
  },
];

export const routeBySlug = Object.fromEntries(
  buyerRoutes.map((route) => [route.slug, route]),
) as Record<BuyerRoute['slug'], BuyerRoute>;
