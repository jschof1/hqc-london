type EnquiryType = 'residential' | 'commercial' | 'property' | 'complex' | 'unconfirmed';
type ServiceFamily = 'regular cleaning' | 'signature cleaning' | 'deep clean' | 'move in'
  | 'end of tenancy' | 'post construction' | 'office' | 'commercial' | 'communal'
  | 'property portfolio' | 'airbnb' | 'wellness' | 'move in out' | 'assessment' | 'unconfirmed';
type ServiceDefinition = {
  readonly family: ServiceFamily;
  readonly type: EnquiryType;
  readonly aliases: readonly string[];
};

const services: readonly ServiceDefinition[] = [
  { family: 'regular cleaning', type: 'residential', aliases: [
    'Essential Clean™ suitability', 'essential-clean', 'essential', 'Essentials Clean™', 'essentials',
  ] },
  { family: 'signature cleaning', type: 'residential', aliases: ['Signature Clean™', 'signature'] },
  { family: 'wellness', type: 'residential', aliases: ['WellClean™', 'wellclean'] },
  { family: 'deep clean', type: 'residential', aliases: ['Deep Clean™', 'deep-clean', 'deep-cleaning'] },
  { family: 'deep clean', type: 'commercial', aliases: [
    'Commercial Deep Cleaning', 'Commercial Deep-Clean Project', 'commercial-deep', 'commercial-deep-cleaning',
  ] },
  { family: 'move in', type: 'residential', aliases: ['Move-In Reset™', 'move-in', 'move-in-cleaning'] },
  { family: 'end of tenancy', type: 'residential', aliases: ['End of Tenancy™', 'end-of-tenancy', 'end-of-tenancy-cleaning'] },
  { family: 'post construction', type: 'unconfirmed', aliases: [
    'Post-Construction™', 'Post-Construction Project', 'post-construction', 'post-construction-cleaning',
  ] },
  { family: 'office', type: 'commercial', aliases: ['Office Cleaning', 'Office or Workplace Project', 'office', 'office-cleaning'] },
  { family: 'commercial', type: 'commercial', aliases: ['Commercial Cleaning', 'commercial', 'commercial-cleaning'] },
  { family: 'communal', type: 'commercial', aliases: [
    'Communal Area Cleaning', 'Communal Site Assessment', 'communal', 'communal-area', 'communal-area-cleaning',
  ] },
  { family: 'property portfolio', type: 'property', aliases: [
    'Agency or Portfolio Support', 'Multi-Site or Portfolio Project', 'portfolio', 'multi-site',
  ] },
  { family: 'airbnb', type: 'property', aliases: ['Airbnb Turnover', 'airbnb'] },
  { family: 'move in out', type: 'unconfirmed', aliases: [
    'Move In/Out Reset™', 'move-in-out', 'Move-In and Void Property Cleaning', 'void', 'move-in-void',
  ] },
  { family: 'assessment', type: 'unconfirmed', aliases: [
    'Other residential requirement', 'Other professional requirement', 'Other Complex Requirement',
    'Large or Executive Property', 'large-property', 'complex-property',
  ] },
];
const routedServices = new Map([
  ['residential', new Set([
    'Essential Clean™ suitability', 'Deep Clean™', 'Move-In Reset™', 'End of Tenancy™',
    'Post-Construction™', 'Other residential requirement',
    'essential-clean', 'essential', 'deep-clean', 'deep-cleaning', 'move-in', 'move-in-cleaning',
    'end-of-tenancy', 'end-of-tenancy-cleaning', 'post-construction', 'post-construction-cleaning',
  ].map(value => value.toLowerCase()))],
  ['commercial', new Set([
    'Office Cleaning', 'Commercial Cleaning', 'Commercial Deep Cleaning', 'Communal Area Cleaning',
    'Agency or Portfolio Support', 'Move-In and Void Property Cleaning', 'Other professional requirement',
    'office', 'office-cleaning', 'commercial', 'commercial-cleaning', 'commercial-deep',
    'commercial-deep-cleaning', 'communal', 'communal-area', 'communal-area-cleaning', 'portfolio', 'void', 'move-in-void',
  ].map(value => value.toLowerCase()))],
  ['complex', new Set([
    'Large or Executive Property', 'Office or Workplace Project', 'Commercial Deep-Clean Project',
    'Communal Site Assessment', 'Post-Construction Project', 'Multi-Site or Portfolio Project', 'Other Complex Requirement',
    'office', 'commercial-deep', 'communal', 'large-property', 'complex-property', 'post-construction', 'portfolio', 'multi-site',
  ].map(value => value.toLowerCase()))],
]);
const residentialBuildings = new Set([
  'townhouse', 'penthouse', 'apartment', 'mews', 'mansion', 'flat', 'house', 'estate',
  'flat / apartment', 'estate / mansion',
]);
const commercialBuildings = new Set(['office', 'commercial', 'office / commercial', 'office building', 'commercial property']);
const enquiryTypes: readonly string[] = ['residential', 'commercial', 'property', 'complex'];

export function websiteEnquiryTags(body: Readonly<Record<string, string>>): string[] {
  if (!['quote', 'quick-form', 'discount'].includes(body.form_type)) return [];

  const selected = (body.service || '').trim().toLowerCase();
  const service = services.find(entry => entry.aliases.some(alias => alias.toLowerCase() === selected));
  let type: EnquiryType = 'unconfirmed';
  let family: ServiceFamily = service?.family || 'unconfirmed';

  if (body.form_type === 'quote') {
    if (body.source === 'request_a_quote' && enquiryTypes.includes(body.enquiry_type)) {
      if (routedServices.get(body.route)?.has(selected)) {
        type = body.enquiry_type as EnquiryType;
      } else {
        if (body.route === 'complex') type = 'complex';
        family = 'unconfirmed';
      }
    } else if (body.source === 'website_detailed_quote_page') {
      type = service?.type || 'unconfirmed';
    }
  } else if (body.form_type === 'discount') {
    if (body.enquiry_type === 'residential' || body.enquiry_type === 'commercial') type = body.enquiry_type;
    family = 'unconfirmed';
  } else {
    const building = (body.property_type || '').trim().toLowerCase();
    if (service?.type === 'residential' && residentialBuildings.has(building)) type = 'residential';
    if (service?.type === 'commercial' && commercialBuildings.has(building)) type = 'commercial';
  }

  return [
    'hqc - source - website',
    ...(body.form_type === 'discount' ? ['hqc - source - discount offer'] : []),
    `hqc - type - ${type}`, `hqc - service - ${family}`,
  ];
}
