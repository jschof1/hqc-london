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
    title: 'Property & Facilities Cleaning',
    slug: 'property-and-facilities-cleaning',
    audience: 'Agents, landlords, property managers, block managers, and developers',
    buyerProblem:
      'For property teams that need homes, shared spaces and handovers cleaned, presented and ready without repeated supplier chasing.',
    ctaText: 'Explore Property & Facilities',
    ctaUrl: '/property-and-facilities-cleaning/',
    priority: 1,
  },
  {
    key: 'homes',
    title: 'Home Cleaning',
    slug: 'home-cleaning',
    audience: 'Households, busy professionals, families, tenants, landlords, and homeowners',
    buyerProblem:
      'For London homes that need dependable regular cleaning, deeper resets, end-of-tenancy cleaning or careful post-renovation support.',
    ctaText: 'Explore Home Cleaning',
    ctaUrl: '/home-cleaning/',
    priority: 2,
  },
  {
    key: 'commercialAndWellness',
    title: 'Commercial & Wellness Cleaning',
    slug: 'commercial-and-wellness-cleaning',
    audience: 'Boutique offices, studios, clinics, gyms, and client-facing spaces',
    buyerProblem:
      'For client-facing premises where hygiene, opening hours, careful access and first impressions all shape the customer experience.',
    ctaText: 'Explore Commercial & Wellness',
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
