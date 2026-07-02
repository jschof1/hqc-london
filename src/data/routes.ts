export type BuyerRouteKey = 'propertyAndFacilities' | 'homes' | 'commercialAndWellness';
export type BuyerRouteSlug =
  | 'property-and-facilities-cleaning'
  | 'home-cleaning'
  | 'commercial-and-wellness-cleaning';

export interface BuyerRoute {
  key: BuyerRouteKey;
  title: string;
  slug: BuyerRouteSlug;
  audience: string;
  buyerProblem: string;
  ctaText: string;
  ctaUrl: string;
  priority: number;
}

export const buyerRoutes: BuyerRoute[] = [
  {
    key: 'propertyAndFacilities',
    title: 'Property Cleaning Support',
    slug: 'property-and-facilities-cleaning',
    audience: 'Agents, landlords, property managers, block managers, and developers',
    buyerProblem:
      'Managed properties need cleaning support that keeps viewings, handovers, residents, and next occupants moving without repeated supplier chasing.',
    ctaText: 'Explore Property Cleaning',
    ctaUrl: '/property-and-facilities-cleaning/',
    priority: 1,
  },
  {
    key: 'homes',
    title: 'Home Cleaning',
    slug: 'home-cleaning',
    audience: 'Households, busy professionals, families, tenants, landlords, and homeowners',
    buyerProblem:
      'Homes need reliable cleaning, careful handling, and agreed standards for regular upkeep, end-of-tenancy cleans, deeper resets, or post-renovation work.',
    ctaText: 'Explore Home Cleaning',
    ctaUrl: '/home-cleaning/',
    priority: 2,
  },
  {
    key: 'commercialAndWellness',
    title: 'Commercial Cleaning',
    slug: 'commercial-and-wellness-cleaning',
    audience: 'Boutique offices, studios, clinics, gyms, and client-facing spaces',
    buyerProblem:
      'Client-facing premises need consistent hygiene, careful access, and presentation-led cleaning that fits around staff, clients, and opening hours.',
    ctaText: 'Explore Commercial Cleaning',
    ctaUrl: '/commercial-and-wellness-cleaning/',
    priority: 3,
  },
];

export const routeBySlug = Object.fromEntries(
  buyerRoutes.map((route) => [route.slug, route]),
) as Partial<Record<string, BuyerRoute>>;

export function getBuyerRouteBySlug(slug: string): BuyerRoute | undefined {
  return routeBySlug[slug];
}
