import { outcomePages, type OutcomePage } from './outcome-pages';

// Destinations for the in-body contextual CTAs in Pedro's approved copy
// (Batches 1-5). Labels stay exactly as approved; each one points to an
// existing page or the existing quote route with its established parameters.
const pageHref = (slug: string, which: 'primaryHref' | 'secondaryHref' = 'primaryHref') =>
  outcomePages.find((page) => page.slug === slug)?.[which] ?? '/request-a-quote/';

const essentialSuitability = pageHref('essential-clean-london', 'secondaryHref');

const destinations: Record<string, string> = {
  'About HQC': '/about-high-quality-clean/',
  'Arrange a Site Visit': pageHref('office-cleaning-london', 'secondaryHref'),
  'Check Areas We Cover': '/areas-we-cover/',
  'Check Essential Clean™ Suitability': essentialSuitability,
  'Check My Eligibility': essentialSuitability,
  'Check My Home': essentialSuitability,
  'Cleaning Services in East London': '/cleaning-services-east-london/',
  'Commercial Deep Cleaning': '/commercial-deep-cleaning-london/',
  'Communal Area Cleaning': '/communal-area-cleaning-london/',
  'Complex Property Cleaning': '/complex-property-cleaning-london/',
  'Discuss Commercial Cleaning': pageHref('commercial-cleaning-london'),
  'Discuss Portfolio Cleaning Support': pageHref('portfolio-cleaning-support-london'),
  'Discuss Your Property Requirements': pageHref('property-facilities-cleaning-london'),
  'End of Tenancy Cleaning': '/end-of-tenancy-cleaning-london/',
  'Estate & Lettings Agent Cleaning': '/estate-letting-agent-cleaning-london/',
  'Explore Essential Clean™': '/essential-clean-london/',
  'Explore Office Cleaning': '/office-cleaning-london/',
  'Explore Portfolio Cleaning Support': '/portfolio-cleaning-support-london/',
  'Explore Post-Construction™': '/post-construction-cleaning-london/',
  'Explore Property & Facilities Cleaning': '/property-facilities-cleaning-london/',
  'Explore Workplace Cleaning': '/commercial-cleaning-london/',
  'Find My Home Cleaning Service': '/home-cleaning-london/',
  'Find My Service': '/#find-my-service',
  'Find the Right Home Service': '/home-cleaning-london/',
  'How HQC Pricing Works': '/cleaning-prices-london/',
  'Learn About Deep Clean™': '/deep-cleaning-london/',
  'Move-In & Void Property Cleaning': '/move-in-void-property-cleaning-london/',
  'Office Cleaning': '/office-cleaning-london/',
  'Portfolio Cleaning Support': '/portfolio-cleaning-support-london/',
  'Post-Construction Cleaning': '/post-construction-cleaning-london/',
  'Private Client Move-In Reset™': '/move-in-cleaning-london/',
  'Property & Facilities Cleaning': '/property-facilities-cleaning-london/',
  'Property Move-In & Void Cleaning': '/move-in-void-property-cleaning-london/',
  'Read Client Success Stories': '/reviews-case-studies/',
  'Request a Complex Service Assessment': pageHref('complex-property-cleaning-london'),
  'Request a Deep-Clean Quote': pageHref('deep-cleaning-london'),
  'Request a Move-In Reset™ Quote': pageHref('move-in-cleaning-london'),
  'Request a Post-Construction Assessment': pageHref('post-construction-cleaning-london'),
  'Request a Site Assessment': pageHref('property-facilities-cleaning-london', 'secondaryHref'),
  'Request an End of Tenancy Quote': pageHref('end-of-tenancy-cleaning-london'),
  'Request an Office Cleaning Proposal': pageHref('office-cleaning-london'),
  'Why Choose HQC': '/why-choose-hqc/'
};

/** Resolve an approved CTA label, preferring the current page's own hero route. */
export function controlledCtaHref(label: string, page?: Pick<OutcomePage, 'primaryCta' | 'primaryHref' | 'secondaryCta' | 'secondaryHref'>) {
  if (page && label === page.primaryCta) return page.primaryHref;
  if (page && label === page.secondaryCta) return page.secondaryHref;
  return destinations[label] ?? '/request-a-quote/';
}

export const knownControlledCtaLabels = Object.keys(destinations);

// 28 Sep 2026 Release Pack section 15 changed these pages' hero CTA labels. Where the
// approved closing pair repeats an overridden hero label, the section 15 label is used.
const section15ClosingOverrides: Record<string, Record<string, string>> = {
  'essential-clean-london': { 'Check Essential Clean™ Suitability': 'Book an Essential Clean™' },
  'deep-cleaning-london': { 'Send Property Details': 'Tell Us About the Property Condition' },
  'why-choose-hqc': { 'Find the Right Service': 'Find My Service', 'Request a Quote': 'Read Client Success Stories' },
  'about-high-quality-clean': { 'Find Your Service': 'Meet Pedro and See How HQC Works' }
};

/** Approved closing Primary/Secondary pair for an outcome page, with section 15 applied. */
export function closingCtas(page: OutcomePage, closing?: { primary?: string; secondary?: string }) {
  const override = (label?: string) => (label ? section15ClosingOverrides[page.slug]?.[label] ?? label : undefined);
  const resolve = (label: string) => {
    if (label === page.primaryCta) return page.primaryHref;
    if (label === page.secondaryCta) return page.secondaryHref;
    // Page-specific closing labels (for example "Send Property Details") use the page's own enquiry route.
    return destinations[label] ?? page.primaryHref;
  };
  const primary = override(closing?.primary) ?? page.primaryCta;
  const secondary = override(closing?.secondary);
  return {
    primary: { label: primary, href: resolve(primary) },
    secondary: secondary && secondary !== primary ? { label: secondary, href: resolve(secondary) } : undefined
  };
}
