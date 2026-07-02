import type { BuyerRouteKey } from './routes';

export type ServicePageSlug =
  | 'property-and-facilities-cleaning'
  | 'home-cleaning'
  | 'end-of-tenancy-cleaning'
  | 'post-renovation-cleaning'
  | 'developer-handover-cleaning'
  | 'end-of-tenancy-cleaning-wandsworth'
  | 'estate-and-lettings-agents-cleaning'
  | 'void-and-post-tenancy-cleaning'
  | 'block-management-cleaning'
  | 'commercial-and-wellness-cleaning';

export interface ServicePageEntry {
  slug: ServicePageSlug;
  routeKey: BuyerRouteKey;
  title: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  audience: string;
  problem: string;
  positioning: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  priority: number;
}

export const servicePages: ServicePageEntry[] = [
  {
    slug: 'property-and-facilities-cleaning',
    routeKey: 'propertyAndFacilities',
    title: 'Property Team Support',
    seoTitle: 'Property Team Cleaning Support London | HQC',
    metaDescription:
      'Commercial and property-team cleaning support in London for agents, landlords, property managers and developers. Void, handover, communal and portfolio cleaning scopes.',
    h1: 'Commercial cleaning support for London property teams',
    audience: 'Agents, landlords, property managers, block managers and developers',
    problem:
      'Managed properties need to be ready for viewings, handovers, residents or next occupants, often with multiple contacts and tight timing.',
    positioning:
      'A secondary commercial/property-team route for managed properties, voids, handovers, communal areas and repeat portfolio work.',
    primaryCtaText: 'Discuss Property Team Support',
    primaryCtaUrl: '/quote/',
    priority: 3,
  },
  {
    slug: 'home-cleaning',
    routeKey: 'homes',
    title: 'Home Cleaning',
    seoTitle: 'Home Cleaning London | Regular, Deep & Move-Out Cleaning | HQC',
    metaDescription:
      'Home cleaning in London with Essentials Clean, Signature Clean and WellClean Premium tiers for calm, precision and consistent presentation.',
    h1: 'Home cleaning in London for calm, precision and consistency',
    audience: 'Households, busy professionals, families, tenants, landlords and homeowners',
    problem:
      'A home needs regular upkeep, a first reset, or a deeper renewal without the owner managing every detail or accepting standards that drift.',
    positioning:
      'Premium home cleaning organised around Essentials Clean™, Signature Clean™ and WellClean™ Premium so the quote reflects the standard, finish and feeling you want at home.',
    primaryCtaText: 'Request Your Personalised Quote',
    primaryCtaUrl: '/quote/',
    priority: 1,
  },
  {
    slug: 'end-of-tenancy-cleaning',
    routeKey: 'homes',
    title: 'End of Tenancy Cleaning',
    seoTitle: 'End of Tenancy Cleaning London | Move-Out Cleaning | HQC',
    metaDescription:
      'Detailed end of tenancy cleaning in London for tenants, landlords, agents and property managers preparing a property for check-out or handover.',
    h1: 'End of tenancy cleaning in London for move-outs and handovers',
    audience: 'Tenants, landlords, agents and property managers',
    problem:
      'The property needs a detailed clean before check-out, handover, move-in or re-let without overpromising deposit outcomes.',
    positioning:
      'Detailed end-of-tenancy and move-out cleaning to an agreed scope, with careful attention to kitchens, bathrooms, floors and presentation.',
    primaryCtaText: 'Get an End of Tenancy Quote',
    primaryCtaUrl: '/quote/',
    priority: 3,
  },
  {
    slug: 'post-renovation-cleaning',
    routeKey: 'homes',
    title: 'Post-Renovation Cleaning',
    seoTitle: 'Post-Renovation Cleaning London | After-Builders Cleaning | HQC',
    metaDescription:
      'Post-renovation and after-builders cleaning in London for homes and managed properties that need fine dust removed and presentation restored.',
    h1: 'Post-renovation cleaning in London for fine dust, finishes and handover readiness',
    audience: 'Homeowners, landlords, developers, agents and property managers',
    problem:
      'Building dust, residue and disturbed finishes need careful cleaning before the property is viewed, occupied or handed over.',
    positioning:
      'Fine-detail post-works cleaning for homes and properties where surfaces, fittings and final presentation matter.',
    primaryCtaText: 'Discuss Post-Renovation Cleaning',
    primaryCtaUrl: '/quote/',
    priority: 4,
  },
  {
    slug: 'developer-handover-cleaning',
    routeKey: 'propertyAndFacilities',
    title: 'Developer Handover Cleaning',
    seoTitle: 'Developer Handover Cleaning London | New-Build & Snagging Cleans | HQC',
    metaDescription:
      'Developer handover cleaning in London for new-build homes, communal areas and managed properties before walkthroughs, sign-off or occupation.',
    h1: 'Developer handover cleaning in London for new-builds, snagging and final presentation',
    audience: 'Developers, contractors, property managers, agents and managed-property teams',
    problem:
      'New-build, refurbishment or snagging work can leave fine dust, marks and disturbed presentation before walkthroughs, sign-off or occupation.',
    positioning:
      'Handover-focused cleaning for finished spaces, communal areas and managed properties that need a clear final clean before the next stakeholder sees them.',
    primaryCtaText: 'Discuss Developer Handover Cleaning',
    primaryCtaUrl: '/quote/',
    priority: 5,
  },
  {
    slug: 'end-of-tenancy-cleaning-wandsworth',
    routeKey: 'homes',
    title: 'End of Tenancy Cleaning Wandsworth',
    seoTitle: 'End of Tenancy Cleaning Wandsworth | Move-Out Cleaning SW18 | HQC',
    metaDescription:
      'End of tenancy cleaning in Wandsworth and SW18 for tenants, landlords and agents preparing homes for check-out, handover or move-in.',
    h1: 'End of tenancy cleaning in Wandsworth for move-outs and handovers',
    audience: 'Wandsworth tenants, landlords, homeowners, agents and property managers',
    problem:
      'A local move-out or handover needs a detailed clean with clear scope, practical add-ons and careful deposit language.',
    positioning:
      'Location-specific tenancy cleaning for Wandsworth properties, using practical check-out and handover language.',
    primaryCtaText: 'Get a Wandsworth Tenancy Cleaning Quote',
    primaryCtaUrl: '/quote/',
    priority: 6,
  },
  {
    slug: 'estate-and-lettings-agents-cleaning',
    routeKey: 'propertyAndFacilities',
    title: 'Estate and Lettings Agents Cleaning',
    seoTitle: 'Estate & Lettings Agent Cleaning London | HQC',
    metaDescription:
      'Cleaning support for London estate and lettings agents preparing homes for viewings, photography, tenancy changeovers and handovers.',
    h1: 'Cleaning support for London estate and lettings agents',
    audience: 'Estate agents, lettings agents, landlords and property managers',
    problem:
      'Agent-managed properties often need fast, presentable cleaning before photography, viewings, inventory, handover or re-let.',
    positioning:
      'Cleaning-led property support for agents who need clear scopes, careful access arrangements and ready-looking spaces.',
    primaryCtaText: 'Speak to Us About Agent Cleaning',
    primaryCtaUrl: '/quote/',
    priority: 7,
  },
  {
    slug: 'void-and-post-tenancy-cleaning',
    routeKey: 'propertyAndFacilities',
    title: 'Void and Post-Tenancy Cleaning',
    seoTitle: 'Void & Post-Tenancy Cleaning London | HQC',
    metaDescription:
      'Void and post-tenancy cleaning in London for landlords, agents and property managers preparing empty properties for next steps.',
    h1: 'Void and post-tenancy cleaning in London for re-let readiness',
    audience: 'Landlords, agents, property managers and portfolio owners',
    problem:
      'An empty or recently vacated property needs cleaning before re-let, sale, maintenance, photography or new occupancy.',
    positioning:
      'Practical vacant-property cleaning for the transition between tenancy, works, marketing and handover.',
    primaryCtaText: 'Discuss Void Property Cleaning',
    primaryCtaUrl: '/quote/',
    priority: 8,
  },
  {
    slug: 'block-management-cleaning',
    routeKey: 'propertyAndFacilities',
    title: 'Block Management Cleaning',
    seoTitle: 'Block Management Cleaning London | Communal Area Cleaning | HQC',
    metaDescription:
      'Block management cleaning in London for communal entrances, lobbies, corridors, stairwells, lifts and resident-facing shared areas.',
    h1: 'Block management cleaning in London for communal areas and managed buildings',
    audience: 'Block managers, managing agents, landlords and property teams',
    problem:
      'Shared areas need consistent cleaning because residents, visitors and managing agents notice missed details quickly.',
    positioning:
      'Communal area cleaning for entrances, lobbies, corridors, stairwells, lifts and shared spaces in managed buildings.',
    primaryCtaText: 'Discuss Block Cleaning',
    primaryCtaUrl: '/quote/',
    priority: 9,
  },
  {
    slug: 'commercial-and-wellness-cleaning',
    routeKey: 'commercialAndWellness',
    title: 'Commercial Cleaning',
    seoTitle: 'Commercial & Wellness Cleaning London | Offices, Studios & Client-Facing Spaces | HQC',
    metaDescription:
      'Commercial and wellness cleaning in London for boutique offices, studios, gyms, clinics, spas, saunas, cold plunges and client-facing spaces needing consistent hygiene-led presentation.',
    h1: 'Commercial cleaning for London offices, studios and wellness spaces',
    audience: 'Boutique offices, wellness studios, spas, saunas, cold plunges, gyms, clinics and client-facing premises',
    problem:
      'Staff, visitors and clients notice hygiene, high-touch areas and presentation before they trust the space, especially where wellness facilities are part of the experience.',
    positioning:
      'Commercial cleaning for client-facing spaces and wellness operators, with careful scoping around hygiene, access, opening hours, spa-style touchpoints and the standard clients expect to feel.',
    primaryCtaText: 'Request a Commercial Cleaning Quote',
    primaryCtaUrl: '/quote/',
    priority: 2,
  },
];

export const servicePageBySlug = Object.fromEntries(
  servicePages.map((page) => [page.slug, page]),
) as Record<ServicePageSlug, ServicePageEntry>;
