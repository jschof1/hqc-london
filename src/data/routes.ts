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
    key: 'homes',
    title: 'Home Cleaning',
    slug: 'home-cleaning',
    audience: 'Households, busy professionals, families, tenants, landlords, and homeowners',
    buyerProblem:
      'Homes need reliable cleaning, careful handling, and agreed standards for regular upkeep, deeper resets, end-of-tenancy cleans, or post-renovation work.',
    ctaText: 'Explore Home Cleaning',
    ctaUrl: '/home-cleaning/',
    priority: 1,
  },
  {
    key: 'commercialAndWellness',
    title: 'Commercial Cleaning',
    slug: 'commercial-and-wellness-cleaning',
    audience: 'Boutique offices, wellness studios, clinics, gyms, and client-facing spaces',
    buyerProblem:
      'Commercial and wellness spaces need consistent hygiene, careful access, and presentation-led cleaning that fits around staff, clients, and opening hours.',
    ctaText: 'Explore Commercial Cleaning',
    ctaUrl: '/commercial-and-wellness-cleaning/',
    priority: 2,
  },
  {
    key: 'propertyAndFacilities',
    title: 'Property Team Support',
    slug: 'property-and-facilities-cleaning',
    audience: 'Agents, landlords, property managers, block managers, and developers',
    buyerProblem:
      'Managed properties can still use HQC for viewing, handover, resident, and next-occupant cleaning support as a secondary property-team route.',
    ctaText: 'View Property Team Support',
    ctaUrl: '/property-and-facilities-cleaning/',
    priority: 3,
  },
];

export const routeBySlug = Object.fromEntries(
  buyerRoutes.map((route) => [route.slug, route]),
) as Partial<Record<string, BuyerRoute>>;

export function getBuyerRouteBySlug(slug: string): BuyerRoute | undefined {
  return routeBySlug[slug];
}
