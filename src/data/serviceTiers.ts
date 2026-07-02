export interface ServiceTier {
  id: 'essentials' | 'signature' | 'wellclean-premium';
  name: string;
  tagline: string;
  emotionalOutcome: string;
  targetClient: string;
  indicativeRange: string;
  quoteLanguage: string;
  inclusions: string[];
  exclusionsOrAddOns: string[];
  ctaText: string;
}

export const serviceTiers: ServiceTier[] = [
  {
    id: 'essentials',
    name: 'Essentials Clean™',
    tagline: 'A pristine reset for everyday peace of mind',
    emotionalOutcome: 'Peace of mind and daily calm',
    targetClient: 'Busy professionals, small properties, routine needs',
    indicativeRange: '£100-£170 (studio) to £285+ (4-bed+)',
    quoteLanguage:
      'Indicative range only. The final quote depends on size, condition, frequency, access and any add-ons agreed before the clean.',
    inclusions: [
      'Standard home cleaning',
      'Kitchen & bathroom hygiene',
      'Dusting, hoovering, bins',
      'Light refresh of main spaces',
    ],
    exclusionsOrAddOns: [
      'Interior windows',
      'Linen changing',
      'Deep degreasing',
      'Scented finishing',
    ],
    ctaText: 'Request Essentials quote',
  },
  {
    id: 'signature',
    name: 'Signature Clean™',
    tagline: 'Our most requested – deeper detail, care, and attention. Tailored to your lifestyle',
    emotionalOutcome: 'Pride in your space, the hotel-fresh feeling',
    targetClient: 'Larger homes, families, premium expectations',
    indicativeRange: '£175-£200 (studio) to £320+ (4-bed+)',
    quoteLanguage:
      'A bespoke quote confirms the rooms, lifestyle details and finishing touches that matter most before a recurring or one-off clean is agreed.',
    inclusions: [
      'Everything in Essentials Clean™',
      'Interior windows',
      'Linen changed (on request)',
      'Kitchen appliance fronts',
      'Spot-cleaning marks on walls',
      'Light switches/door handles',
      'Scented finishing touches',
    ],
    exclusionsOrAddOns: [
      'Deep degreasing beyond light maintenance',
      'Oven interiors and heavy appliance interiors',
      'Carpet or upholstery treatment',
      'Post-renovation dust removal',
    ],
    ctaText: 'Request Signature quote',
  },
  {
    id: 'wellclean-premium',
    name: 'WellClean™ Premium',
    tagline: 'Not just clean: emotional calm, scent, reset, and design-aligned care',
    emotionalOutcome: 'Wellness you can feel, deep renewal and purity',
    targetClient: 'Wellness studios, spa clients, luxury homes',
    indicativeRange: '£250-£270 (studio) to £375+ (4-bed+)',
    quoteLanguage:
      'Quoted by scope for homes and wellness-led spaces where the finish, method and briefing need to be more considered.',
    inclusions: [
      'Everything in Signature Clean™',
      'Deep degreasing (kitchen/bath)',
      'Eco-conscious disinfecting',
      'Premium aromatherapy finishing',
      'Mattress edge vacuuming',
      'Detailing of skirting & fixtures',
      'High dusting (safe level)',
      'Steam or chemical-free options',
      'Spa-grade sanitisation',
      'Personalised cleaner briefing',
    ],
    exclusionsOrAddOns: [
      'Specialist restoration work',
      'Unsafe high-level access',
      'Contractor repair work',
      'Clinical or regulated decontamination services',
    ],
    ctaText: 'Request WellClean quote',
  },
];

export const serviceTierOptions = serviceTiers.map((tier) => ({
  id: tier.id,
  label: tier.name,
  description: tier.emotionalOutcome,
}));
